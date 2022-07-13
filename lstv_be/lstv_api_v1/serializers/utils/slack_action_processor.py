from lstv_be.settings import ISAAC_CONTEXT_BUSINESS_INQUIRY, ISAAC_CONTEXT_BUSINESS_INQUIRY_PRE_APPROVED


def build_slack_block(ic):
    ic_type = ic.get('context_type', None)
    if ic_type == ISAAC_CONTEXT_BUSINESS_INQUIRY_PRE_APPROVED:
        return [
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"{ic.get('business_role', '')} *`{ic.get('business_name', '')}`* just "
                            f"received a new consumer inquiry which was pre-approved auatomatically and sent to the business."
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"Name\n*`{ic.get('sender_name', '')}`*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"Email\n*`{ic.get('from_email', '')}`*"
                    },

                ]
            },

            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"Wedding Location\n*`{ic.get('wedding_location', '')}`*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"Wedding Date\n*`{ic.get('wedding_date', '')}`*"
                    }
                ]
            },

            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Message\n`{ic.get('message_content', '')}`"
                },

                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"Inquiry Sent From\n<{ic.get('sent_from_page', 'https://cnn.com')}|*{ic.get('sent_from_desc', '')}'s "
                                f"*>"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"Business Email\n*`{ic.get('business_email', '')}`*"
                    },
                ]
            },
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "Map",
                    "emoji": True,
                },
                "image_url": f"{ic.get('google_map_image_url', '')}",
                "alt_text": "where it's at!"
            },
            {
                "type": "actions",
                "block_id": f"{ic.get('context_type', '')}|{ic.get('context_id', '')})",
                "elements": [
                    {
                        "type": "button",
                        "action_id": "button-action",
                        "text": {
                            "type": "plain_text",
                            "text": "Open in Google Maps"
                        },
                        "url": f"{ic.get('google_map_url', '')}",
                    },
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{ic.get('sender_name', '')}'s* waas pre-approved to have his inquiry delivered without "
                            f"explicit LSTV approval thanks to a past record of `{ic.get('approvals', 0)}` approvals with "
                            f"no more than 10% overall rejections."
                }
            },
        ]
    if ic_type == ISAAC_CONTEXT_BUSINESS_INQUIRY:
        return [
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"{ic.get('business_role', '')} *`{ic.get('business_name', '')}`* just "
                            f"received a new consumer inquiry from someone with *less than 5 approved* "
                            f"business inquiries in his/her record."
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"Name\n*`{ic.get('sender_name', '')}`*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"Email\n*`{ic.get('from_email', '')}`*"
                    },

                ]
            },

            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"Wedding Location\n*`{ic.get('wedding_location', '')}`*"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"Wedding Date\n*`{ic.get('wedding_date', '')}`*"
                    }
                ]
            },

            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Message\n`{ic.get('message_content', '')}`"
                },

                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"Inquiry Sent From\n<{ic.get('sent_from_page', 'https://cnn.com')}|*{ic.get('sent_from_desc', '')}'s "
                                f"*>"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"Business Email\n*`{ic.get('business_email', '')}`*"
                    },
                ]
            },
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "Map",
                    "emoji": True,
                },
                "image_url": f"{ic.get('google_map_image_url', '')}",
                "alt_text": "where it's at!"
            },
            {
                "type": "actions",
                "block_id": f"{ic.get('context_type', '')}|{ic.get('context_id', '')})",
                "elements": [
                    {
                        "type": "button",
                        "action_id": "button-action",
                        "text": {
                            "type": "plain_text",
                            "text": "Open in Google Maps"
                        },
                        "url": f"{ic.get('google_map_url', '')}",
                    },
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*How would you like to proceed?*"
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "checkboxes",
                        "options": [
                            {
                                "text": {
                                    "type": "mrkdwn",
                                    "text": "Spam or malicious content"
                                },
                                "value": "reject-inquiry-reason-spam"
                            },
                            {
                                "text": {
                                    "type": "mrkdwn",
                                    "text": "Unrelated to business booking"
                                },
                                "value": "reject-inquiry-reason-unrelated"
                            },
                            {
                                "text": {
                                    "type": "mrkdwn",
                                    "text": "Inappropriate content or harassment"
                                },
                                "value": "reject-inquiry-reason-inappropriate"
                            }
                        ],
                        "action_id": f"reject-reason|{ic.get('context_type', '')}|{ic.get('context_id', '')}",
                    },
                    {
                        "type": "button",
                        "action_id": f"approve|{ic.get('context_type', '')}|{ic.get('context_id', '')}",
                        "text": {
                            "type": "plain_text",
                            "emoji": True,
                            "text": "Approve Business Inquiry"
                        },
                        "style": "primary",
                    },
                    {
                        "type": "button",
                        "action_id": f"reject|{ic.get('context_type', '')}|{ic.get('context_id', '')}",
                        "text": {

                            "type": "plain_text",
                            "emoji": True,
                            "text": "Reject"
                        },
                        "style": "danger",
                    },
                    {
                        "type": "button",
                        "action_id": f"reject-block|{ic.get('context_type', '')}|{ic.get('context_id', '')}",
                        "text": {
                            "type": "plain_text",
                            "emoji": True,
                            "text": "Reject + Block User"
                        },
                        "style": "danger",
                    },

                ]
            },

        ]


def prepare_slack_action(isaac_context):
    if isaac_context:
        return build_slack_block(isaac_context)

    else:
        raise Exception("isaac_context not provided to prepare_slack_action")
