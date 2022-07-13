from django.http import HttpResponse, JsonResponse
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from lstv_api_v1.models import *
from lstv_api_v1.globals import *
import slack
from lstv_api_v1.tasks.tasks import send_slack_interactive_response, report_video_encoding_complete
from lstv_api_v1.utils.utils import get_volatile_value
from lstv_api_v1.views.utils.webhooks_view_utils import process_slack_interactive, set_volatile_value
from lstv_be.settings import VERIFICATION_TOKEN


@csrf_exempt
@require_POST
def slack_webhook(request):
    client = slack.WebClient(token=settings.BOT_USER_ACCESS_TOKEN)
    json_dict = json.loads(request.body.decode('utf-8'))

    # response = client.users_list()
    # users = response["members"]
    # user_ids = list(map(lambda u: u["id"], users))
    # print(user_ids)

    if json_dict['token'] != settings.VERIFICATION_TOKEN:
        return HttpResponse(status=403)

    if 'type' in json_dict:
        if json_dict['type'] == 'url_verification':
            response_dict = {"challenge": json_dict['challenge']}
            return JsonResponse(response_dict, safe=False)

    if 'event' in json_dict:
        event_msg = json_dict['event']
        if ('subtype' in event_msg) and (event_msg['subtype'] == 'bot_message'):
            return HttpResponse(status=200)

    if event_msg['type'] == 'message' or event_msg['type'] == 'app_mention':
        user = event_msg.get('user', None)
        channel = event_msg['channel']
        response_msg = f":wave: Hi there <@{user}>, i'm LSTV2's Isaac and I look forward to enter service! " \
                       f"(message ref: {event_msg['channel']})"
        if user != settings.SLACK_BOT_USER_ID:
            try:
                client.chat_postMessage(channel=channel, text=response_msg, as_user=True)
                # client.chat_postMessage(channel="G01EBNJQT40", text="by the way: just got this " + response_msg,
                #                        as_user=True)

            except slack.errors.SlackApiError as e:
                pass

        return HttpResponse(status=200)
    return HttpResponse(status=200)


@require_POST
@csrf_exempt
def slack_webhook_interactive(request):
    json_dict = json.loads(request.body.decode('utf-8'))
    token = json_dict.get('token', None)
    message = json_dict.get('message', None)
    trigger_id = json_dict.get('trigger_id', None)
    response_url = json_dict.get('response_url', None)
    actions = json_dict.get('actions', None)

    # security: compare token

    if token == settings.VERIFICATION_TOKEN:

        # process slack interactive message

        for action in actions:
            response_payload = process_slack_interactive(action, json_dict)
            if response_payload:
                send_slack_interactive_response.delay(response_url, response_payload, trigger_id)

        return HttpResponse(status=200)
    else:
        return HttpResponse(status=401)


@require_POST
@csrf_exempt
def slack_webhook_interactive_select(request):
    return HttpResponse(status=200)


@require_POST
@csrf_exempt
def jwp_webhook(request):
    jd = json.loads(request.body.decode('utf-8'))
    if jd:
        event = jd.get('event', None)
        media_id = jd.get('media_id', None)

        if event == 'media_available' and media_id is not None:
            # update the current record for the upload
            set_volatile_value(f"video-status-{media_id}",
                               {"state": "initial", "initial_ready_at": datetime.now().replace(tzinfo=timezone.utc)},
                               2880)

        if event == 'conversions_complete' and media_id is not None:
            # update the current record for the upload
            value = get_volatile_value(f"video-status-{media_id}")
            if not value:
                value = {}
            value['completed_at'] = datetime.now().replace(tzinfo=timezone.utc)
            value['state'] = "complete"
            set_volatile_value(f"video-status-{media_id}", value, 2880)

            # if video source exists for this media ID -- update it too.
            # try:
            #     vs = VideoSource.get(media_id=media_id)
            #     if vs:
            #         if vs.thumbnail and vs.thumbnail.sta
            #except VideoSource.DoesNotExist:
            #    pass

            # notify the world...
            report_video_encoding_complete.delay(media_id)

    return HttpResponse(status=200)


@require_POST
@csrf_exempt
def sendgrid_hook(request):
    jd = json.loads(request.body.decode('utf-8'))
    if not jd or 'array' not in jd:
        return HttpResponse(status=400)
    for item in jd['array']:
        message = Message.objects.filter(processor_message_id=item['sg_message_id']).first()
        if not message:
            continue
        event = item['event']
        if event == 'delivered':
            message.delivered_at = now()
        if event == 'open':
            message.opened_at = now()
        if event == 'click':
            message.clicked_at = now()
        if event == 'spamreport':
            message.spam_at = now()
        if event == 'unsubscribe':
            message.unsubscribed_at = now()
        message.save()
    return HttpResponse(status=200)
