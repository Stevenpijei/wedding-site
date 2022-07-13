import os

import pytz
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS, IsAuthenticated
from rest_framework.decorators import *
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from lstv_api_v1.serializers.serializers_admin import AdminStatsSerializer
from lstv_api_v1.serializers.serializers_posts import *
from lstv_api_v1.serializers.serializers_general import *
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
import logging
import time

from lstv_api_v1.tasks.tasks import job_alert_cto
from lstv_api_v1.utils.utils import get_volatile_value, set_volatile_value
from lstv_be.settings import ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_REJECT_REASON, \
    ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_APPROVE, ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_REJECT, \
    ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_REJECT_BLOCK


def process_isaac_context(state_block, state_key, json_dict):
    if state_block:
        if state_block.get('context_type', None) == ISAAC_CONTEXT_BUSINESS_INQUIRY:
            message = Message.objects_all_states.filter(id=state_block['context_id']).first()
            now = datetime.now(tz=pytz.timezone('US/Eastern'))
            if not message:
                job_alert_cto(f"Slack interactive processor: Can't locate message", "process_isaac_context",
                              f"unable to locate message id {state_block['context_id']}")
            else:
                if state_block.get('action_type', None) == ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_REJECT_REASON:
                    new_state = {
                        "is_spam": 'reject-inquiry-reason-spam' in state_block['selected_checkboxes'],
                        "is_unrelated": 'reject-inquiry-reason-unrelated' in state_block['selected_checkboxes'],
                        "is_inappropriate": 'reject-inquiry-reason-inappropriate' in state_block['selected_checkboxes'],
                    }
                    set_volatile_value(state_key, new_state, 1440)
                if state_block.get('action_type', None) == ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_APPROVE:
                    message.state = ContentModelState.active
                    message.state_desc = [f"manual approval granted by {json_dict['user']['name']}"]
                    message.save()
                    message.deliver()
                    response_blocks = json_dict['message']['blocks'][:5]
                    response_blocks.append(
                        {
                            "type": "section",
                            "block_id": "S9NwL",
                            "text": {
                                "type": "mrkdwn",
                                "text": f":white_check_mark: Approved by <@{json_dict['user']['id']}> "
                                        f"on {str(now.strftime('%m/%d at %-I:%-M%p'))} and sent to the "
                                        f"business.",
                                "verbatim": False
                            }
                        }
                    )
                    return {
                        "replace_original": True,
                        "text": "test",
                        "blocks": response_blocks
                    }
                if state_block.get('action_type', None) == ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_REJECT \
                        or state_block.get('action_type', None) == ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_REJECT_BLOCK:
                    message.state = ContentModelState.deleted
                    why = state_block['state']
                    message.state_desc = [f"rejected by {json_dict['user']['name']} for spam:{why['is_spam']}  "
                                          f"unrelated:{why['is_unrelated']}  inappropriate:{why['is_inappropriate']}"]
                    message.save()

                    block_user = ""
                    if state_block.get('action_type', None) == ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_REJECT_BLOCK:
                        block_user = "\n\n:no_entry_sign: *Blocked* from sending new business inquiries."
                        message.from_user.is_inquiry_blocked = True
                        message.from_user.save()

                    response_blocks = json_dict['message']['blocks'][:5]
                    response_blocks.append(
                        {
                            "type": "section",
                            "block_id": "S9NwL",
                            "text": {
                                "type": "mrkdwn",
                                "text": f":no_entry: Rejected by <@{json_dict['user']['id']}> "
                                        f"at {str(now.strftime('%m/%d on %-I:%-M%p'))} and *not* sent to the "
                                        f"business.{block_user}",
                                "verbatim": False
                            }
                        }
                    )
                    return {
                        "replace_original": True,
                        "text": "test",
                        "blocks": response_blocks
                    }

                if state_block.get('action_type', None) == ISAAC_CONTEXT_BUSINESS_INQUIRY_ACTION_REJECT_BLOCK:
                    message.state_desc = [f"rejected + blocked by {json_dict['user']['name']}"]
                    message.save()
                    message.delete()

    return None


def process_slack_interactive(isaac_action, json_dict):
    # obtain the state for this interactive isaac slack block

    action_elements = isaac_action['action_id'].split("|")
    if len(action_elements) >= 3:
        state_key = f"{action_elements[1]}-{action_elements[2]}"

        state_block = {
            "action_type": action_elements[0],
            "context_type": action_elements[1],
            "context_id": action_elements[2],
            "selected_checkboxes": [],
            "state": get_volatile_value(state_key)
        }

        # checkbox support

        if isaac_action.get('selected_options', None):
            for selected in isaac_action['selected_options']:
                state_block['selected_checkboxes'].append(selected['value'])

        # fetch saved state for the user interaction

        return process_isaac_context(state_block, state_key, json_dict)
