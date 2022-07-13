import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lstv_be.settings")
import django
django.setup()
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

# @scheduler.scheduled_job('cron', day_of_week='mon-fri', hour=17)
# def scheduled_job():
#     """
#     test
#     :return:
#     """
#    print('This job is run every weekday at 5pm.')


@scheduler.scheduled_job('interval', minutes=10)
def timed_job():
    """
    use IP -> GEO to fill the video playback log with country, state/region and
    city.
    """
    print("scheduling ip -> geo conversion")
    do_video_playback_ip_to_geo_conversion.delay()


scheduler.start()
