from django.core.management.base import BaseCommand
from lstv_api_v1.utils.legacy_model_utils import *
from lstv_api_v1.tasks.tasks import job_stash_user_event, job_stash_video_playback_event


class Command(BaseCommand):
    def handle(self, *args, **options):
        #         _     _                    _                 _
        #        (_)   | |                  (_)               | |
        #  __   ___  __| | ___  ___   __   ___  _____      __ | | ___   __ _
        #  \ \ / / |/ _` |/ _ \/ _ \  \ \ / / |/ _ \ \ /\ / / | |/ _ \ / _` |
        #   \ V /| | (_| |  __/ (_) |  \ V /| |  __/\ V  V /  | | (_) | (_| |
        #    \_/ |_|\__,_|\___|\___/    \_/ |_|\___| \_/\_/   |_|\___/ \__, |
        #                                                               __/ |
        #                                                              |___/

        time_threshold = datetime.now().replace(tzinfo=timezone.utc) - timedelta(hours=1)
        video_views = VideoPlaybackLog.objects.filter(migrated_to_log_cluster=False,
                                                      ip__processed=True,
                                                      created_at__lt=time_threshold)
        for view in video_views:
            job_stash_video_playback_event.delay(view.id)






