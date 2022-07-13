from jwplatform.client import JWPlatformClient
from jwplatform.errors import BadRequestError, ForbiddenError

from lstv_be.settings import WEB_SERVER_URL


def upload_external_file_to_jwp(path, filename):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    client = JWPlatformClient('xvCju5huVVew-7X-TECgJ2InZUVwNlNtVlRaa0ozUTI5cVkwZHFjMmRTVDBGdWNXVTAn')
    try:
        res = client.Media.create(site_id="V72as4qu", body={"upload": {
            "method": "fetch",
            "download_url": path}})
        return res.json_body
    except (BadRequestError, ForbiddenError) as e:
        job_alert_cto(f"({WEB_SERVER_URL}) JWP/UPLOAD Issue", "upload_external_file_to_jwp", f"{e} for url: {path}")

        return None

    # res = client.Media.get(site_id='V72as4qu',  media_id='KbvO9tbB')


def get_video_status(media_id):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    client = JWPlatformClient('xvCju5huVVew-7X-TECgJ2InZUVwNlNtVlRaa0ozUTI5cVkwZHFjMmRTVDBGdWNXVTAn')
    try:
        res = client.Media.get(site_id='V72as4qu', media_id=media_id)
        return res.json_body
    except (BadRequestError, ForbiddenError) as e:
        print(e)
        job_alert_cto(f"({WEB_SERVER_URL}) JWP/GET video info issue", "get_video_status", f"{e} for media_id: {media_id}")
