from django.core.management.base import BaseCommand
from django.core import management
from lstv_api_v1.utils.utils import job_refresh_most_watched_30d_videos_x_days, \
    get_image_size_from_url
from lstv_api_v1.tasks.tasks import *
from django.contrib.auth.hashers import get_hasher


#  ██╗     ███████╗████████╗██╗   ██╗ ██╗    ███╗   ███╗ ██╗ ██████╗ ██████╗  █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
#  ██║     ██╔════╝╚══██╔══╝██║   ██║███║    ████╗ ████║ ██║██╔════╝ ██╔══██╗██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
#  ██║     ███████╗   ██║   ██║   ██║╚██║    ██╔████╔██║ ██║██║  ███╗██████╔╝███████║   ██║   ██║██║   ██║██╔██╗ ██║
#  ██║     ╚════██║   ██║   ╚██╗ ██╔╝ ██║    ██║╚██╔╝██║ ██║██║   ██║██╔══██╗██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
#  ███████╗███████║   ██║    ╚████╔╝  ██║    ██║ ╚═╝ ██║ ██║╚██████╔╝██║  ██║██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
#  ╚══════╝╚══════╝   ╚═╝     ╚═══╝   ╚═╝    ╚═╝     ╚═╝ ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝


def migrate_landing_page_video_setting():
    cursor = connections['migrate'].cursor()
    if settings.DEBUG:
        cursor.execute("select value from lstv_properties where `key` = 'home_page_video_post_id';")
    else:
        cursor.execute("select value from lstv_properties where key = 'home_page_video_post_id';")
    result = get_dict(cursor)
    cursor.close()
    legacy_post_id = result[0]['value']
    # # print(legacy_post_id)

    es = Video.objects.filter(post__legacy_post_id=legacy_post_id).first()
    if es:
        # # print(es.post.legacy_post_id)
        val = {"value": str(es.id)}
        setting = Setting.objects.filter(name=SETTING_MAIN_VIDEO_POST).first()
        if setting:
            setting.value = val
            setting.save()
        else:
            setting = Setting(category="landing_page",
                              name=SETTING_MAIN_VIDEO_POST,
                              value=val)
            setting.save()
    else:
        logging.getLogger('migration').error(
            "[NOK] Can't find event story/post {} from landing page video settings.".format(legacy_post_id))


class Command(BaseCommand):
    CEND = '\33[0m'
    CBOLD = '\33[1m'
    CITALIC = '\33[3m'
    CURL = '\33[4m'
    CBLINK = '\33[5m'
    CBLINK2 = '\33[6m'
    CSELECTED = '\33[7m'
    CBLACK = '\33[30m'
    CRED = '\33[31m'
    CGREEN = '\33[32m'
    CYELLOW = '\33[33m'
    CBLUE = '\33[34m'
    CVIOLET = '\33[35m'
    CBEIGE = '\33[36m'
    CWHITE = '\33[37m'
    CBLACKBG = '\33[40m'
    CREDBG = '\33[41m'
    CGREENBG = '\33[42m'
    CYELLOWBG = '\33[43m'
    CBLUEBG = '\33[44m'
    CVIOLETBG = '\33[45m'
    CBEIGEBG = '\33[46m'
    CWHITEBG = '\33[47m'
    CGREY = '\33[90m'
    CRED2 = '\33[91m'
    CGREEN2 = '\33[92m'
    CYELLOW2 = '\33[93m'
    CBLUE2 = '\33[94m'
    CVIOLET2 = '\33[95m'
    CBEIGE2 = '\33[96m'
    CWHITE2 = '\33[97m'
    CGREYBG = '\33[100m'
    CREDBG2 = '\33[101m'
    CGREENBG2 = '\33[102m'
    CYELLOWBG2 = '\33[103m'
    CBLUEBG2 = '\33[104m'
    CVIOLETBG2 = '\33[105m'
    CBEIGEBG2 = '\33[106m'
    CWHITEBG2 = '\33[107m'

    num_businesses_to_process = 0
    num_videos_to_process = 0

    def add_arguments(self, parser):
        parser.add_argument('-m', '--mode', type=str, help='Define a mode {seed, migrate}')

    @staticmethod
    def process_business(business):
        """
        migrate business into LSTV2
        """

        success = False
        results, user_ids = get_usermeta_for_business_name(business['name'].strip())

        # do we have a user for this legacy business?

        business_props = None

        if len(results) > 0:
            business_props = get_business_legacy_props(user_ids)

        # get business parent
        business_parent = translate_legacy_parent(business['parent_slug'], business['grandparent_slug'])

        # if this is a venue, we need, and this is an exception, the venue type associated with this venue.
        # we require this information later in the business creation process.

        venue_type = None
        venues_emails_and_websites = None

        # venues are special in LSTV1 (nice way to say fucked up). The emails are very detached if there's no user
        # account claiming the venue.

        if business_parent is not None:
            valid = True
            if business_parent['new_value'] == 'venue':
                venue_type = get_venue_type_from_business(business)
                if venue_type:
                    venues_emails_and_websites = get_unclaimed_venue_emails_and_websites(business)
                    venue_type = venue_type if venue_type is not None else None
                else:
                    valid = False

            if valid:
                success = create_business_from_legacy(business, business_parent, business_props, venue_type,
                                                      venues_emails_and_websites)
        else:
            logging.getLogger('migration').error("[NOK] cannot translate business role type for business: {} ({})".
                                                 format(business['name'], business['term_id']))

        # did we make it?
        return success

    def migrate_businesses(self):
        """
        Migrate LSTV1 businesses
        """

        business_types_to_migrate = []

        # obtain all business term ids.
        v1_business_types = get_business_types(business_types_to_migrate)

        # estimate number of businesses...

        self.num_businesses_to_process = get_num_legacy_businesses(business_types_to_migrate)
        isaac_migration_status(
            f":hammer_and_wrench: {len(v1_business_types)} business role types in LSTV1")

        logging.getLogger('migration').info(
            "[OK ] {} businesses to be migrated in legacy database.".format(self.num_businesses_to_process))

        if self.num_businesses_to_process > 0:
            index = 1
            # for each business type (parent), load the children terms
            grand_total_businesses = 0
            for business_type in v1_business_types:
                results, term_ids = get_legacy_businesses_from_business_type(business_type)
                logging.getLogger('migration').info(
                    "[OK ] business type {} ({}) with parent ids: {} - Items: {}".format(
                        business_type['slug'], business_type['term_id'], term_ids, len(results)))
                grand_total_businesses += len(results)

                # process business type results...
                num_success = 0
                with alive_bar(len(results), "- Businesses (" + business_type['name'] + ")                      ",
                               bar="blocks", length=10) as bar:
                    for result in results:
                        index += 1
                        if self.process_business(result) is True:
                            num_success += 1
                        else:
                            logging.getLogger('migration').warning("[NOK] skipping legacy business {} ({})".format(
                                result['name'], result['term_id']))
                        bar()
                logging.getLogger('migration').info(
                    "[OK ] processed business type {}, {} migrated, {} skipped".format(
                        business_type['name'], num_success, len(results) - num_success))
                isaac_migration_status(f":heavy_plus_sign: Migrated {num_success} {business_type['name']} records")

            logging.getLogger('migration').info(
                "[OK ] grand total of business records considered: {}".format(grand_total_businesses))
        else:
            pass

    @staticmethod
    def migrate_videos():
        """
        Migrate LSTV1 videos
        """
        # TODO: REMOVE when done developing

        videos = get_legacy_videos()
        index = 1

        # create a probate user account to take ownership of dangling videos/photos etc.

        try:
            new_user = User(email='video_probate@lovestoriestv.com', user_type=UserTypeEnum.bot,
                            source=ContentModelSource.legacy,
                            source_desc="legacy_model_utils migration")
            new_user.set_password(generate_random_password())
            new_user.save()
        except IntegrityError:
            new_user = User.objects.filter(email='video_probate@lovestoriestv.com').first()

        with alive_bar(len(videos), "- Video Library", bar="blocks", length=10) as bar:

            legacy_user_record_not_present = 0
            legacy_business_record_not_present = 0

            for video in videos:
                bar()
                # look for uploader user in the database based on its legacy id
                business = None
                business_team_member = None
                uploader = get_uploader_for_legacy_video_library_row(video['user_id'], video)
                state = ContentModelState.active
                state_desc = None

                if uploader is None:
                    # no uploader? assign to probate
                    uploader = new_user
                    legacy_user_record_not_present += 1
                    logging.getLogger('migration').warning(
                        "[NOK] can't find legacy uploader user record for uploader {} for legacy video library: {} - "
                        "assigning to probate user".format(uploader.email, video['id']))

                else:
                    # user exists? look for the business...
                    business_team_member = BusinessTeamMember.objects.filter(user=uploader).first()
                    if business_team_member is None:
                        # if business team member doesn't exist
                        logging.getLogger('migration').warning(
                            "[NOK] can't find owner business for uploader {} for legacy video library: {} - assigning to "
                            "probate user".format(uploader.email, video['id']))
                        legacy_business_record_not_present += 1
                        user = new_user

                    else:
                        business = business_team_member.business

                # create video record

                video_status = {
                    'queued': VideoStatusEnum.new,
                    'ready': VideoStatusEnum.ready,
                    'legacy': VideoStatusEnum.ready,
                    'showcased': VideoStatusEnum.ready,
                    'in_drafts': VideoStatusEnum.ready
                }

                # some extra actions requires for legacy videos (Before new filmmaker UX)
                # LEGACY in video_library = All filmmaker NON JWP videos.

                video_type = VideoTypeEnum.jwplayer
                media_id = video['media_id'].lower().strip()

                if video['status'] not in ['ready', 'queued', 'in progress'] and video['post_id']:
                    media_id, video_type = get_legacy_video_type(video['post_id'])

                    if video['status'] == 'legacy':
                        video['filename'] = None

                    if media_id is None:
                        logging.getLogger('migration').warning(
                            "[NOK] media_id cannot be retrieved for {} for legacy video library: {} - assigning to "
                            "probate user".format(uploader.email, video['id']))
                        media_id = 'n/a'

                    if video['thumbnail_url'] is None:
                        video['thumbnail_url'] = get_legacy_video_thumbnail_url(video['post_id'])
                        if video['thumbnail_url'] is None:

                            if video_type == VideoTypeEnum.jwplayer and media_id != 'n/a':
                                # synthesize thumbnail url from jwplayer media_id
                                video[
                                    'thumbnail_url'] = "https://assets-jpcust.jwpsrv.com/thumbs/" + media_id + "-1280.jpg"
                            else:
                                logging.getLogger('migration').warning(
                                    "[NOK] thumbnail cannot be retrieved for {} for legacy video library: {} - assigning to "
                                    "probate user".format(uploader.email, video['id']))
                                video['thumbnail_url'] = 'n/a'

                    if video['duration'] == -1:
                        video['duration'] = None

                    try:
                        new_thumbnail = Image.objects.get(legacy_url=video['thumbnail_url'])
                    except Image.DoesNotExist:
                        new_thumbnail = Image(legacy_url=video['thumbnail_url'],
                                              purpose=ImagePurposeTypes.thumbnail)
                        new_thumbnail.save()

                    if video_type:
                        new_video = VideoSource(state=state, state_desc=state_desc, uploader=uploader,
                                                owner_business=business, filename=video['filename'],
                                                source_url=video['aws_url'],
                                                uploaded_at=get_datetime_with_utc(video['uploaded_at']),
                                                process_started_at=get_datetime_with_utc(video['queued_at']),
                                                process_complete_at=get_datetime_with_utc(video['ready_at']),
                                                media_id=media_id, duration=video['duration'], size=video['size'],
                                                thumbnail=new_thumbnail, legacy_post_id=video['post_id'],
                                                legacy_user_id=uploader.legacy_user_id, type=video_type,
                                                status=video_status[video['status']], source=ContentModelSource.legacy,
                                                source_desc="legacy_model_utils migration",
                                                width=video['video_width'],
                                                height=video['video_height'])
                        try:
                            if uploader is None:
                                new_video.set_active_review_required("orphaned_video",
                                                                     "Please provide uploader identity for this video")
                            new_video.save()
                        except IntegrityError as e:
                            # print(video)
                            # print(e)
                            exit(1)
                        except DataError as e:
                            # print(video)
                            # print(e)
                            exit(1)

                        if business_team_member:
                            logging.getLogger('migration').info("[OK ] uploader {} of {} for legacy video library: {}".
                                                                format(uploader.email,
                                                                       business_team_member.business.name,
                                                                       video['id']))
                        index += 1

                        logging.getLogger('migration').info(
                            "[OK ] legacy video items successfully imported: {}".format(len(videos)))
                        logging.getLogger('migration').info(
                            "[NOK] probate user assignment (no user record): {}".format(legacy_user_record_not_present))
                        logging.getLogger('migration').info(
                            "[NOK] probate user assignment (no business record): {}".format(
                                legacy_business_record_not_present))
                        mark_video_as_migrated(video['id'], "success")

    @staticmethod
    def migrate_photos():
        """
        Migrate LSTV1 photos
        """

        # TODO: remove this
        Photo.objects.all().delete()
        Image.objects.filter(purpose=ImagePurposeTypes.photo).delete()

        photos = get_legacy_photos()

        index = 1

        with alive_bar(len(photos), "- Photo Library", bar="blocks", length=10) as bar:
            for photo in photos:
                # validate photo...

                success = verify_image_url(photo['aws_url'])
                if not success:
                    logging.getLogger('migration').warning(
                        "[NOK] image {} HEAD fails to fetch. skipping".format(photo['aws_url']))
                    continue
                # else:
                #     if new_url is not None:
                #         photo['aws_url'] = new_url

                user = User.objects.filter(legacy_user_id=photo['user_id']).first()
                if User:
                    team_member = BusinessTeamMember.objects.filter(user=user).first()
                    if team_member:
                        width, height = get_image_size_from_url(photo['aws_url'])
                        try:
                            new_image = Image.objects.get(legacy_url=photo['aws_url'])
                        except Image.DoesNotExist:
                            new_image = Image(legacy_url=photo['aws_url'],
                                              purpose=ImagePurposeTypes.photo,
                                              width=width,
                                              height=height)
                            new_image.save()

                        new_photo = Photo(uploader=user, owner_business=team_member.business, image=new_image,
                                          legacy_term_id=photo['term_id'],
                                          legacy_user_id=photo['user_id'],
                                          legacy_post_id=photo['post_id'],
                                          source=ContentModelSource.legacy,
                                          source_desc="legacy_model_utils migration")
                        new_photo.save()

                        # add photo to appropriate event story
                        try:
                            p = Post.objects.get(legacy_post_id=new_photo.legacy_post_id)
                            es = Video.objects_all_states.filter(post=p).first()
                            if es:
                                es.photos.add(new_photo)
                        except Post.DoesNotExist:
                            logging.getLogger('migration').error("[NOK] legacy post_id {} could not be \
                            found while migrating photos".format(photo['post_id']))

                    logging.getLogger('migration').info("[OK ] photo {} migrated".format(photo['aws_url']))
                    mark_photo_as_migrated(photo['id'], "success")
                else:
                    # print("can't find user " + str(photo['user_id']))
                    pass
                index += 1
                bar()

    @staticmethod
    def migrate_songs():
        """
        Migrate all LSTV1 songs/artists
        """

        num_non_migrated_songs_artists = get_num_legacy_songs_artists()
        posts_with_songs = get_all_posts_with_songs()
        total = len(posts_with_songs)
        if (len(num_non_migrated_songs_artists)) > 0:
            index = 1
            with alive_bar(total, "- Songs/Artists", bar="blocks", length=10) as bar:
                for post in posts_with_songs:
                    index += 1
                    bar()
                    song_artists = get_songs_from_legacy_post(post['id'])
                    for song_artist in song_artists:
                        # sanitize
                        song_artist['name'] = title_with_caps(song_artist['name']).strip()

                    # pre-quality, mix and match.

                    if len(song_artists) % 2 != 0:
                        logging.getLogger('migration').warning(
                            "[NOK] un-even number of songs/artists in post {} ({}) - skipping post song/artist data".
                                format(post['id'], len(song_artists)))

                        for song_artist in song_artists:
                            # mark as failed migration
                            mark_term_as_migrated(song_artist['term_id'], 'fail')
                        continue
                    else:
                        a_idx = 0
                        s_idx = int((len(song_artists) / 2))

                        while a_idx <= (len(song_artists) / 2) - 1:
                            artist = SongPerformer.objects.filter(
                                slug=slugify_2(title_with_caps(song_artists[a_idx]['name']))).first()
                            if artist is None:
                                artist = SongPerformer(name=title_with_caps(song_artists[a_idx]['name']),
                                                       slug=slugify_2(title_with_caps(song_artists[a_idx]['name'])),
                                                       legacy_term_ids=[song_artists[a_idx]['term_id']])
                                artist.save()
                            else:
                                if song_artists[a_idx]['term_id'] not in artist.legacy_term_ids:
                                    artist.legacy_term_ids.append(song_artists[a_idx]['term_id'])
                                    artist.save()

                            song = Song.objects.filter(slug=slugify_2(song_artists[s_idx]['name'])).first()
                            if song is None:
                                song = Song(title=title_with_caps(song_artists[s_idx]['name']),
                                            slug=slugify_2(title_with_caps(song_artists[s_idx]['name'])),
                                            legacy_term_ids=[song_artists[s_idx]['term_id']],
                                            song_performer=artist)
                                song.save()
                            else:
                                if song_artists[s_idx]['term_id'] not in song.legacy_term_ids:
                                    song.legacy_term_ids.append(song_artists[s_idx]['term_id'])
                                    song.save()

                            # update database with migration information
                            mark_term_as_migrated(song_artists[a_idx]['term_id'], 'success')
                            mark_term_as_migrated(song_artists[s_idx]['term_id'], 'success')

                            a_idx += 1
                            s_idx += 1

    @staticmethod
    def migrate_non_business_users():

        """
        Migrate LSTV1 photos
        """
        from django.conf import settings

        users = get_legacy_users('consumers')
        index = 1
        with alive_bar(len(users), "- Users (Guests, Newlyweds, Soonlyweds)", bar="blocks", length=10) as bar:
            for user in users:
                user_meta = get_legacy_user_meta(user['ID' if settings.DEBUG else 'id'])
                create_user_from_legacy_user(user, user_meta)
                index += 1
                bar()

        users = get_legacy_users('admins')
        index = 1
        with alive_bar(len(users), "- Users (Admins)", bar="blocks", length=10) as bar:
            for user in users:
                user_meta = get_legacy_user_meta(user['ID' if settings.DEBUG else 'id'])
                create_user_from_legacy_user(user, user_meta, True)
                index += 1
                bar()

    @staticmethod
    def migrate_posts():
        """
        Migrate LSTV1 posts
        """

        # TODO: Remove this.
        # Article.objects.all().delete()
        # VideoBusiness.objects.all().delete()
        # Video.objects.all().delete()
        # Address.objects.all().delete()
        # Post.objects.all().delete()
        # cursor = connections['migrate'].cursor()
        # cursor.execute("update posts set migrated = false where migrated = true;")
        # cursor.close()

        posts = get_posts('article')
        index = 1
        with alive_bar(len(posts), "- Blog Posts", bar="blocks", length=10) as bar:
            for post in posts:
                result = process_post(PostTypeEnum.article, post)
                index += 1
                bar()

        # posts = get_posts('page')
        # index = 1
        # with alive_bar(len(posts), "- Static Pages", bar="blocks", length=10) as bar:
        #     for post in posts:
        #         result = process_post(PostTypeEnum.page, post)
        #         index += 1
        #         bar()

        posts = get_posts('video')
        index = 1
        with alive_bar(len(posts), "- Video Posts", bar="blocks", length=10) as bar:
            for post in posts:
                result = process_post(PostTypeEnum.video, post)
                index += 1
                bar()

    @staticmethod
    def verify_external_videos():
        videos = VideoSource.objects.filter(
            Q(type=VideoTypeEnum.youtube) | Q(type=VideoTypeEnum.vimeo))

        with alive_bar(len(videos), "- External video verification", bar="blocks", length=10) as bar:
            for video in videos:
                bar()

    def seed_database(self):
        # cleaning up existing data
        # print('cleanup ... ', end='', flush=True)

        # clean up all data from the database...
        cleanup_db_content()
        cleanup_db_seed()

        for obj in BusinessSubscriptionLevel.objects.all():
            obj.delete_deep()

        free = BusinessSubscriptionLevel(
            name="Free",
            slug="free",
            numerical_value=0
        )
        free.save()

        basic = BusinessSubscriptionLevel(
            name="Basic",
            slug="basic",
            numerical_value=1
        )
        basic.save()

        plus = BusinessSubscriptionLevel(
            name="Plus",
            slug="plus",
            numerical_value=2
        )
        plus.save()

        premium = BusinessSubscriptionLevel(
            name="Premium",
            slug="premium",
            numerical_value=3
        )
        premium.save()


        # print(self.CGREEN + '[OK]' + self.CEND)

        # creating static content

        # print('generate static content')
        # print(self.CBLUE + '--- navigation bar content ... ' + self.CEND, end='', flush=True)
        management.call_command('loaddata', 'navbar_content', verbosity=0)
        # print(self.CGREEN + '[OK]' + self.CEND)

        # print(self.CBLUE + '--- navigation bar content ... ' + self.CEND, end='', flush=True)
        management.call_command('loaddata', 'navbar_content', verbosity=0)
        # print(self.CGREEN + '[OK]' + self.CEND)

        # print(self.CBLUE + '--- initial homepage grid selection... ' + self.CEND, end='', flush=True)
        management.call_command('generate_home_page_card_grids', verbosity=0)
        # print(self.CGREEN + '[OK]' + self.CEND)

        # print(self.CBLUE + '--- settings ... ' + self.CEND, end='', flush=True)
        management.call_command('loaddata', 'settings', verbosity=0)
        # print(self.CGREEN + '[OK]' + self.CEND)

        # print(self.CBLUE + '--- countries ... ' + self.CEND, end='', flush=True)
        # management.call_command('update_countries_plus', verbosity=0)
        # print(self.CGREEN + '[OK]' + self.CEND)

        # print(self.CBLUE + '--- event story types ... ' + self.CEND, end='', flush=True)
        VideoType(**{"slug": "engagement", "name": "Engagement"}).save()
        VideoType(**{"slug": "wedding-shower", "name": "Wedding Shower"}).save()
        VideoType(**{"slug": "wedding-ceremony", "name": "Wedding Ceremony"}).save()
        VideoType(**{"slug": "wedding-reception", "name": "Wedding Reception"}).save()
        VideoType(**{"slug": "wedding-ceremony-and-reception", "name": "Wedding Ceremony & Reception"}).save()
        VideoType(**{"slug": "gender-reveal", "name": "Gender Reveal"}).save()
        VideoType(**{"slug": "baby-shower", "name": "Baby Shower"}).save()
        # print(self.CGREEN + '[OK]' + self.CEND)

        # print(self.CBLUE + '--- business roles ... ' + self.CEND, end='', flush=True)

        venue_sub_types = []

        for sub_type_name in venue_sub_type_names:
            v = BusinessVenueType(name=sub_type_name, slug=slugify_2(sub_type_name))
            v.save()
            venue_sub_types.append(v)

        for key in business_roles:
            # create role type family
            family = BusinessRoleFamilyType(name=key, slug=slugify_2(key), bg_color=business_family_color[key])
            family.save()

            for d in business_roles[key]:
                vd = d.split('|')
                v = BusinessRoleType(name=vd[0], slug=slugify_2(vd[0]), role_family_type=family)
                if len(vd) > 1:
                    v.singular = vd[1]
                v.save()

        # print(self.CGREEN + '[OK]' + self.CEND)

        # print(self.CBLUE + '--- business team member permissions  ... ' + self.CEND, end='', flush=True)

        p_close = BusinessTeamMemberRolePermissionType(
            **{"name": "Close the account", "description": "Permanently close the account"})
        p_close.slug = slugify(p_close.name)
        p_close.save()

        p_suspend = BusinessTeamMemberRolePermissionType(
            **{"name": "Suspend the account", "description": "Temporarily suspend the account, hiding all content."})
        p_suspend.slug = slugify(p_suspend.name)
        p_suspend.save()

        p_rename = BusinessTeamMemberRolePermissionType(
            **{"name": "Rename the business", "description": "Rename/Rebrand the business account"})
        p_rename.slug = slugify(p_rename.name)
        p_rename.save()

        p_upgrade = BusinessTeamMemberRolePermissionType(
            **{"name": "Upgrade to paid plan", "description": "Upgrade the acount to a paid plan"})
        p_upgrade.slug = slugify(p_upgrade.name)
        p_upgrade.save()

        p_btype = BusinessTeamMemberRolePermissionType(
            **{"name": "Modify business roles", "description": "Modify business role types "
                                                               "(e.g. add photographer to business roles)"})
        p_btype.slug = slugify(p_btype.name)
        p_btype.save()

        p_subscribers = BusinessTeamMemberRolePermissionType(
            **{"name": "Manage subscribers", "description": "View, add or remove business subscriber"})
        p_subscribers.slug = slugify(p_subscribers.name)
        p_subscribers.save()

        p_profile = BusinessTeamMemberRolePermissionType(
            **{"name": "Edit business profile",
               "description": "Make changes to the properties of the business profile"})
        p_profile.slug = slugify(p_profile.name)
        p_profile.save()

        p_manage_users = BusinessTeamMemberRolePermissionType(**{"name": "Manage team members",
                                                                 "description": "Invite, remove or edit team members"})
        p_manage_users.slug = slugify(p_manage_users.name)
        p_manage_users.save()

        p_editor = BusinessTeamMemberRolePermissionType(
            **{"name": "Edit all content", "description": "Edit all published business content"})
        p_editor.slug = slugify(p_editor.name)
        p_editor.save()

        p_contributor_editor = BusinessTeamMemberRolePermissionType(
            **{"name": "Edit own content", "description": "Edit self-created published business content"})
        p_contributor_editor.slug = slugify(p_contributor_editor.name)
        p_contributor_editor.save()

        p_video_publisher = BusinessTeamMemberRolePermissionType(
            **{"name": "Publish videos", "description": "Upload and publish videos"})
        p_video_publisher.slug = slugify(p_video_publisher.name)
        p_video_publisher.save()

        p_photo_publisher = BusinessTeamMemberRolePermissionType(
            **{"name": "Publish photographs", "description": "Upload and publish photographs"})
        p_photo_publisher.slug = slugify(p_photo_publisher.name)
        p_photo_publisher.save()

        # Admin full
        classification = BusinessTeamMemberRoleType(name="Admin",
                                                    slug=slugify_2("admin"))
        classification.save()
        classification.permissions.add(p_close)
        classification.permissions.add(p_btype)
        classification.permissions.add(p_subscribers)
        classification.permissions.add(p_suspend)
        classification.permissions.add(p_rename)
        classification.permissions.add(p_upgrade)
        classification.permissions.add(p_profile)
        classification.permissions.add(p_manage_users)
        classification.permissions.add(p_editor)
        classification.permissions.add(p_contributor_editor)
        classification.permissions.add(p_video_publisher)
        classification.permissions.add(p_video_publisher)
        classification.permissions.add(p_photo_publisher)

        # Partial Admin
        classification = BusinessTeamMemberRoleType(name="Manager", slug=slugify_2("manager"))
        classification.save()
        classification.permissions.add(p_profile)
        classification.permissions.add(p_subscribers)
        classification.permissions.add(p_manage_users)
        classification.permissions.add(p_editor)
        classification.permissions.add(p_contributor_editor)
        classification.permissions.add(p_video_publisher)
        classification.permissions.add(p_video_publisher)
        classification.permissions.add(p_photo_publisher)

        # Contributor
        classification = BusinessTeamMemberRoleType(name="Editor", slug=slugify_2("Editor"))
        classification.save()
        classification.permissions.add(p_editor)
        classification.permissions.add(p_video_publisher)
        classification.permissions.add(p_video_publisher)
        classification.permissions.add(p_photo_publisher)

        # print(self.CGREEN + '[OK]' + self.CEND)

        # migrating data
        # data = {"title": "test title"}
        # post = Post(**data)
        # post.save()
        # post.delete(hard=False)

        # print(self.CBLUE + '--- Vibe/Tag presets... ' + self.CEND, end='', flush=True)

        vibe_types = [
            add_vibe_family_type('Dress Style', [107, 113]),
            add_vibe_family_type('Hair Style', [111]),
            add_vibe_family_type('Dress Color', [118]),
            add_vibe_family_type('Engagement Ring Style', [123]),
            add_vibe_family_type('Shoes Style', [125]),
            add_vibe_family_type('Suit Style', [132]),
            add_vibe_family_type('Theme', [199]),
            add_vibe_family_type('Flower Hairstyle', [260]),
            add_vibe_family_type('Bouquet', [286]),
            add_vibe_family_type('Color', [313, 4882]),
            add_vibe_family_type('Season', [355]),
            add_vibe_family_type('Culture/Religion', [4336]),
            add_vibe_family_type('Wedding Style', [5673]),
            add_vibe_family_type('Holiday Wedding & Love Stories', [9826]),
            add_vibe_family_type('Special Moments', [171]),
            add_vibe_family_type('Dating Apps', [69821]),
            add_vibe_family_type('Venue Types', [])
        ]

        for vibe_type in vibe_types:
            add_vibes_per_vibe_type(vibe_type)

        # resolving the mess around same sex marriage categories
        ssm = add_vibe_family_type('Sexual Orientation', None)

        new_vibe = TagType(name="Gay", slug='gay', tag_family_type=ssm, legacy_term_id=3168,
                           legacy_url="/wedding/lgbtq+/gay/")
        new_vibe.save()
        new_vibe = TagType(name="Lesbian", slug='lesbian', tag_family_type=ssm, legacy_term_id=3169,
                           legacy_url="/wedding/lgbtq+/lesbian/")
        new_vibe.save()
        new_vibe = TagType(name="Same Sex Wedding", slug='lgbtq+', tag_family_type=ssm, legacy_term_id=5926,
                           legacy_url="/wedding/lgbtq/")
        new_vibe.save()
        new_vibe = TagType(name="Bride & Groom", slug='bride-groom', tag_family_type=ssm, legacy_term_id=22874,
                           legacy_url="/wedding/straight/")
        new_vibe.save()

        # precious metal will now be a resolving the mess around same sex marriage categories
        pm = add_vibe_family_type('Precious Metal', [51663])
        add_vibes_per_vibe_type(pm)

        # adding editorial/LSTV staff tags
        staff_tags = add_vibe_family_type('LSTV Editorial', None)
        new_vibe = TagType(name="The Highlight Reel", slug=slugify_2('The Highlight Reel'), tag_family_type=staff_tags,
                           legacy_term_id=10653, legacy_url="/wedding/from-the-editors-desk/")
        new_vibe.save()

        new_vibe = TagType(name="Editor's Choice", slug=slugify_2("Editor's Choice"),
                           tag_family_type=staff_tags, legacy_term_id=164,
                           legacy_url="wedding/editors-pick/")

        new_vibe = TagType(name="#LoveStoriesTVandChill", slug=slugify_2('#LoveStoriesTVandChill'),
                           tag_family_type=staff_tags, legacy_term_id=12349,
                           legacy_url="/wedding/lovestoriestvandchill/")
        new_vibe.save()

        new_vibe = TagType(name="For Filmmakers", slug=slugify_2('For Filmmakers'), tag_family_type=staff_tags,
                           legacy_term_id=12458, legacy_url="/wedding/for-the-filmmakers/")
        new_vibe.save()

        from lstv_api_v1.management.commands.deprecated.job_set_vibe_importance import Command
        importance = Command()
        importance.handle()

        # social networks

        fb = SocialNetworkTypes(name="Facebook", slug='facebook', link_pattern='https://facebook.com/<account>')
        fb.save()

        ig = SocialNetworkTypes(name="Instagram", slug='instagram', link_pattern='https://instagram.com/<account>')
        ig.save()

        tk = SocialNetworkTypes(name="Tiktok", slug='tiktok', link_pattern='https://tiktok.com/@<account>')
        tk.save()

        pn = SocialNetworkTypes(name="Pinterest", slug='pinterest', link_pattern='https://pinterest.com/<account>')
        pn.save()

        yt = SocialNetworkTypes(name="YouTube", slug='youtube',
                                link_pattern='https://www.youtube.com/channel/<account>')
        yt.save()

        tw = SocialNetworkTypes(name="Twitter", slug='twitter',
                                link_pattern='https://twitter.com/<account>')
        tw.save()

        # awards

        # awards = add_vibe_family_type('Awards', None)

        # 2018 - 2025 awards...

        # for x in range(2018, 2026):
        #     name = "Top 50 Weddings of " + str(x)
        #     new_record = TagType(name=name,
        #                          slug=slugify_2(name),
        #                          tag_family_type=awards,
        #                          legacy_term_id=67493 if x == 2019 else None,
        #                          legacy_url="/wedding/top-50-weddings-of-" + str(x) + "/")
        #     new_record.save()
        #
        #     t_strs = ['Nominee', 'Winner']
        #     for t in range(0, 2):
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Filmmaker Of The Year"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Film Of The Year"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Best Elopement Or Destination Film"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Best Proposal Or Engagement Film"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Most Emotional Moment In A Wedding Film"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Best Storytelling In A Wedding Film"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Most Creative Use of Cinematography"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Best Dress Shot in A Wedding Film"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #         name = str(x) + " Wedding Film Awards " + t_strs[t] + ", Most Epic Venue In A Wedding Film"
        #         new_record = TagType(name=name,
        #                              slug=slugify_2(name),
        #                              tag_family_type=awards)
        #         new_record.save()
        #
        #     name = str(x) + " Most Watched Wedding Film"
        #     new_record = TagType(name=name,
        #                          slug=slugify_2(name),
        #                          tag_family_type=awards)
        #     new_record.save()
        #
        #     name = "Editor's Choice"
        #     new_record = TagType(name=name + " (" + str(x) + ")",
        #                          slug=slugify_2(name) + "-" + str(x),
        #                          tag_family_type=awards)
        #     new_record.save()
        #
        #     name = "Home Page Featured"
        #     new_record = TagType(name=name + " (" + str(x) + ")",
        #                          slug=slugify_2(name) + "-" + str(x),
        #                          tag_family_type=awards)
        #     new_record.save()
        #
        #     name = "Most Liked Video"
        #     new_record = TagType(name=name + " (" + str(x) + ")",
        #                          slug=slugify_2(name) + "-" + str(x),
        #                          tag_family_type=awards)
        #     new_record.save()
        #
        #     name = "Most Shared Video"
        #     new_record = TagType(name=name + " (" + str(x) + ")",
        #                           slug=slugify_2(name) + "-" + str(x),
        #                           tag_family_type=awards)
        #      new_record.save()
        #
        # # non-year-related awards
        #
        # name = "5K Views"
        # new_record = TagType(name=name,
        #                      slug=slugify_2(name),
        #                      tag_family_type=awards)
        # new_record.save()
        #
        # name = "10K Views"
        # new_record = TagType(name=name,
        #                      slug=slugify_2(name),
        #                      tag_family_type=awards)
        # new_record.save()
        #
        # name = "50K Views"
        # new_record = TagType(name=name,
        #                      slug=slugify_2(name),
        #                      tag_family_type=awards)
        # new_record.save()
        #
        # name = "100K Views"
        # new_record = TagType(name=name,
        #                      slug=slugify_2(name),
        #                      tag_family_type=awards)
        # new_record.save()

        # self.stdout.write(self.CGREEN + '[OK]' + self.CEND)

        # print(self.CBLUE + '--- Event Story Business Capacity Types ' + self.CEND, end='', flush=True)

        # VideoBusinessCapacityType(name="Gift Ideas",
        #                              slug="gift-ideas",
        #                              legacy_term_id=[180],
        #                              business_role_type=BusinessRoleType.objects.get(slug='gifts')).save()
        #
        # VideoBusinessCapacityType(name="Bridal Party Gifts",
        #                              slug="bridal-party-gifts",
        #                              legacy_term_id=[28063],
        #                              business_role_type=BusinessRoleType.objects.get(slug='gifts')).save()

        VideoBusinessCapacityType(name="Bride's Shoes Designer",
                                  slug="bride-shoe-designer",
                                  legacy_term_id=[3065, 27893],
                                  business_role_type=BusinessRoleType.objects.get(slug='shoe-designer')).save()

        VideoBusinessCapacityType(name="Groom's Shoe Designer",
                                  slug="groom-shoe-designer",
                                  legacy_term_id=[27894],
                                  business_role_type=BusinessRoleType.objects.get(slug='shoe-designer')).save()

        VideoBusinessCapacityType(name="Groom's Suit Designer",
                                  slug="groom-suit-designer",
                                  legacy_term_id=[3067],
                                  business_role_type=BusinessRoleType.objects.get(slug='suit-designer')).save()

        VideoBusinessCapacityType(name="Bridal Party Suit Designer",
                                  slug="bridal-party-suit-designer",
                                  legacy_term_id=[27890],
                                  business_role_type=BusinessRoleType.objects.get(slug='shoe-designer')).save()

        VideoBusinessCapacityType(name="Groom or Bride Suit Designer",
                                  slug="groom-or-bride-suit-designer",
                                  legacy_term_id=[27891],
                                  business_role_type=BusinessRoleType.objects.get(slug='shoe-designer')).save()

        VideoBusinessCapacityType(name="Bridesmaid's Dress Designer",
                                  slug="bridesmaids-dress-designer",
                                  legacy_term_id=[3066],
                                  business_role_type=BusinessRoleType.objects.get(slug='dress-designer')).save()

        VideoBusinessCapacityType(name="Bride's Dress Designer",
                                  slug="brides-dress-designer",
                                  legacy_term_id=[3068],
                                  business_role_type=BusinessRoleType.objects.get(slug='dress-designer')).save()

        VideoBusinessCapacityType(name="Bridal Party Dress Designer",
                                  slug="bridal-party-dress-designer",
                                  legacy_term_id=[27889],
                                  business_role_type=BusinessRoleType.objects.get(slug='dress-designer')).save()

        VideoBusinessCapacityType(name="Ceremony Venue",
                                  slug="ceremony-venue",
                                  legacy_term_id=[108],
                                  business_role_type=BusinessRoleType.objects.get(slug='venue')).save()

        VideoBusinessCapacityType(name="Reception Venue",
                                  slug="reception-venue",
                                  legacy_term_id=[109],
                                  business_role_type=BusinessRoleType.objects.get(slug='venue')).save()

        # self.stdout.write(self.CGREEN + '[OK]' + self.CEND)

    def import_lstv1_view_log(self):
        count = 0
        package = 0
        items = []
        for view in LegacyViewsLog.objects.all().iterator():
            count += 1
            items.append(view.id)
            if count % 3000 == 0:
                package += 1
                job_import_from_legacy_views.delay(items)
                # print(f"{count} legacy view log entries sent to be processed in {package} packs...")
                items = []

    def prune_weight(self):
        job_recalc_weight()

    def import_view_log(self, async_exec=True):
        cursor = connections['migrate'].cursor()
        cursor.execute("select count(*) as count from post_views_detail")
        views = get_dict(cursor)
        cursor.close()
        if views[0]['count'] < 1:
            # print("nothing to import. all post_views_detail items migrated.")
            return

        cursor = connections['migrate'].cursor()
        cursor.execute("select id from post_views_detail order by id asc limit 1")
        start_offset = get_dict(cursor)
        cursor.close()
        offset = start_offset[0]['id']

        cursor = connections['migrate'].cursor()
        cursor.execute("select id from post_views_detail order by id desc limit 1")
        start_offset = get_dict(cursor)
        cursor.close()
        last_id = start_offset[0]['id']

        if not async_exec:
            pass
            # print("starting off at: " + str(offset))
            # print("last offset ID at: " + str(last_id))

        size = 2000
        with alive_bar(int(views[0]['count'] / size), "- importing view logs                      ", bar="blocks",
                       length=10) as bar:
            while offset <= last_id:
                bar()
                if async_exec:
                    job_import_post_views_batch.delay(offset, size)
                else:
                    job_import_post_views_batch(offset, size)
                offset += size

    def prune_videos_for_minimum_businesses(self):
        es = Video.objects.all()

        with alive_bar(len(es), "- Pruning event stories for minimum businesses requirements", bar="blocks",
                       length=10) as bar:
            for e in es:
                bar()
                venue_found = False
                videographer_found = False
                for v in e.businesses.all():
                    for r in v.business.roles.all():
                        if r.slug == 'venue':
                            venue_found = True
                        if r.slug == 'videographer':
                            videographer_found = True
                if not videographer_found:
                    logging.getLogger('migration-prune').error(
                        "[NOK] no minimum businesses for event story ({})".format(e.post.title))
                    e.set_suspended_review_required(SUSPENDED_REVIEW_NO_MINIMUM_BUSINESSS,
                                                    "minimum businesses (venue + videographer) not met")

    def schedule_data_pruning_jobs(self):
        # import event story and blog views
        # self.import_view_log()

        # go over all addresses and try to fix up incomplete records
        addresses = Location.objects.filter(legacy_migrated=True, sanitized=False)
        with alive_bar(len(addresses), "- sanitizing locations", bar="blocks", length=10) as bar:
            for address in addresses:
                bar()
                job_sanitize_address.delay(address.id)

        # create most popular videos (30 days) cache
        job_refresh_most_watched_30d_videos_x_days(LSTV_CACHE_MOST_WATCHED_VIDEOS_30_DAYS, 30, True)

        # verify external videos
        videos = VideoSource.objects.filter(Q(type=VideoTypeEnum.vimeo) | Q(type=VideoTypeEnum.youtube)).filter(
            external_verified_at__isnull=True)
        for video in videos:
            job_verify_external_video.delay(video.id)

        # verify images

        images = Image.objects.filter(verified_at__isnull=True)
        with alive_bar(len(images), "- verifying images", bar="blocks", length=10) as bar:
            for image in images:
                bar()
                job_verify_images.delay(image.id)

        # # verify emails : properties with emails
        #
        # # TODO: Remove :50 limitations from emails
        # props = Properties.objects.filter(
        #     Q(key='legacy_ceremony_venue_email') | Q(key='legacy_reception_venue_email'))[:50]
        # for prop in props:
        #     job_verify_email_in_properties.delay(prop.id)

        # verify emails: user accounts
        # if settings.DEBUG:
        #    users = User.objects.filter(email_verification_at__isnull=True)[:50]
        # else:
        #    users = User.objects.filter(email_verification_at__isnull=True)
        # with alive_bar(len(users), "- verifying user email                                      ", bar="blocks", length=10) as bar:
        #    for user in users:
        #        bar()
        #        job_verify_email_in_users.delay(user.id)

        # # verify venue websites.
        # websites = Properties.objects.filter(
        #     Q(key='legacy_reception_venue_website') | Q(key='legacy_ceremony_venue_website'))
        # for website in websites:
        #     job_verify_venue_websites.delay(website.id)
        # make sure wedding date is copied over from the post metadata.

        # prune event stories for minimum businesses (videographer + venue)
        self.prune_videos_for_minimum_businesses()

        # remove dangling, unused JWP videos from the platform
        # with alive_bar(len(jwp_vids), "- Pruning JWP Videos (hosted)                       ", bar="blocks", length=10) as bar:
        #     used = 0
        #     orphan = 0
        #     used_size = 0
        #     orphan_size = 0
        #     for jwp_video in jwp_vids:
        #         # look for media ID in videos
        #         vid = Video.objects.filter(media_id=jwp_video['media_key']).first()
        #         if vid:
        #             used = used + 1
        #             used_size = used_size + int(jwp_video['size'])
        #         else:
        #             orphan = orphan + 1
        #             orphan_size = orphan_size + int(jwp_video['size'])
        #
        #         bar()
        #
        #     logging.getLogger('migration-prune').info(
        #         "[TOT] JWP Videos - used: {}   orphan: {}   used_size: {}  orphan_size: {} - TOTAL: {}".format(
        #             used,
        #             orphan,
        #             str(round((used_size / 1000 / 1000 / 1000 / 1000), 2)) + "TB",
        #             str(round((orphan_size / 1000 / 1000 / 1000 / 1000), 2)) + "TB",
        #             str(round(((orphan_size + used_size) / 1000 / 1000 / 1000 / 1000), 2)) + "TB"))

    def handle(self, *args, **options):
        mode = options['mode']

        if mode == 'viewlog':
            self.import_view_log(False)
            self.import_lstv1_view_log()
            exit(0)

        if mode == 'clean':
            cleanup_legacy_migration_flags()
            cleanup_db_content()
            cleanup_db_seed()
            exit(0)

        if mode == 'seed':
            cleanup_legacy_migration_flags()
            cleanup_db_content()
            self.seed_database()
            exit(0)

        if mode == 'prune':
            # schedule pruning jobs...
            self.schedule_data_pruning_jobs()
            exit(0)

        if mode == 'migrate' or mode == 'migrate-clean' or mode == 'migrate-clean-hard':
            isaac_migration_status(":oil_drum: LSTV1 -> LSTV2 data migration began")
            if mode == 'migrate-clean' or mode == 'migrate-clean-hard':
                # clean up content, non-seed data...
                cleanup_legacy_migration_flags(hard=(mode == 'migrate-clean-hard'))
                self.seed_database()

            logging.getLogger('migration').info(
                "******************** LSTV1->LSTV2 migration fired up. mode={}".format(mode))

            # migrate the data...

            self.migrate_businesses()  # incremental
            self.migrate_songs()  # incremental
            self.migrate_non_business_users()  # incremental
            self.migrate_videos()  # incremental
            self.migrate_posts()  # incremental
            self.migrate_photos()  # incremental
            migrate_landing_page_video_setting()
            job_migrate_wedding_dates()  # incremental

            # update users passwords for seamless Wordpress -> Django validation using user_obj.check_password

            users = User.objects_all_states.all()
            hasher = get_hasher('phpass')
            for user in users:
                user.password = hasher.from_orig(user.legacy_password)
                user.save()
            exit(0)
