import React, { useCallback, useEffect, useRef, useState } from 'react';
import isEqual from 'lodash.isequal'
import parseDate from 'date-fns/parseISO';
import { useHistory } from 'react-router';
import { HelpIcon, CloseIcon, AlertExclamation } from '/components/Utility/LSTVSVG';
import BaseCTAButton from '/newComponents/buttons/BaseCtaButton';
import * as S from './index.styles';
import BasicInfoScreen from './screens/BasicInfoScreen';
import VisibilityScreen from './screens/VisibiltyScreen';
import WeddingDetailsScreen from './screens/WeddingDetailsScreen';
import { IVideo, VideoType } from './types';
import VideoUploadPreview from './VideoUploadPreview';
import HorizontalRule from '/components/HorizontalRule';
import ProgressBar from '/components/ProgressBar';
import { OutlinedCTAButton } from '/newComponents/common/OutlinedCTALink';
import BaseCtaButton from '/newComponents/buttons/BaseCtaButton';
import Modal from '/newComponents/Modal';
import { useAuthService } from '/rest-api/hooks/useAuthService';
import PublicContentService from '/rest-api/services/publicContentService';
import { convertGoogleLocation, popMessageSuccess, popMessageError } from '/utils/LSTVUtils';
import Flex from '/components/Utility/Flex';
import { isValidDate } from '/utils/date';

type Props = {
  isOpen?: boolean,
  onVideoEdit?: (video: IVideo) => void,
  onClose: () => void,
  /**
   * Pass this in when creating a new video. Defaults to wedding.
   */
  videoType?: VideoType,
  /**
   * Pass in a video prop if editing
   * Else we're crating a new one
   */
  video?: IVideo,
  /**
   * If creating a new video
   */
  videoFileToUpload?: File
}

enum Screens {
  Info = 'Basic Info',
  Wedding = 'Wedding Details',
  Visibility = 'Visibility'
}

type CtaLabel = 'Next' | 'Save' | 'Publish'

// keyed by a VideoType
const progressBarLabels = {
  wedding: [Screens.Info, Screens.Wedding, Screens.Visibility],
  promo: [Screens.Info, Screens.Visibility]
}

export const maxFieldWidth = 632

/**
 * Full-screen takeovr modal for adding info to a new video upload or editing and existing video
 */
const VideoInfoModal = ({
  isOpen,
  onClose,
  onVideoEdit,
  video,
  videoFileToUpload,
  videoType='wedding',
}: Props) => {
  // date handling is a nightmare.
  // it's saved to the b/e as YYYY-MM-DD but components
  // count on it being a Date up until the point where we submit to the API.
  if(video?.event_date && !isValidDate(video.event_date)) {
    video.event_date = parseDate(video.event_date as string)
  }

  const { user } = useAuthService()
  const history = useHistory()

  const modalContentRef = useRef<any>()
  const basicFormikRef = useRef<any>()
  const weddingFormikRef = useRef<any>()
  const visFormikRef = useRef<any>()
  const lastSavedVideoData = useRef(video || { video_type: videoType })
  const videoThumbInterval = useRef<NodeJS.Timeout>()

  const [screenKey, setScreenKey] = useState(Screens.Info)
  const [videoData, setVideoData] = useState(lastSavedVideoData.current)
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState<CtaLabel>('Next')
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(video?.thumbnail_url)
  const [uploadPctComplete, setUploadPctComplete] = useState(video ? 100 : 0)

  const [saving, setSaving] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [formValid, setFormValid] = useState(true)

  useEffect(() => {
    return () => {
      clearInterval(videoThumbInterval.current)
    }
  }, [])

  useEffect(() => {
    if(videoFileToUpload) uploadVideoFile(videoFileToUpload)
  }, [videoFileToUpload])

  useEffect(() => {
    let label: CtaLabel = 'Next'

    if(screenKey === Screens.Visibility) {
      if(videoData.visibility === 'unlisted') {
        label = 'Save'
      } else {
        label = 'Publish'
      }
    }

    setPrimaryCtaLabel(label)
  }, [screenKey])

  const { title, event_location, name_spouse_1, name_spouse_2 } = videoData
  let videoTitle, videoLocation

  if(video) {
    // editing a video - grab the video type.
    // ... and default to wedding as it appears that some videos created
    // before video_type was a thing may pass undefined here.
    videoType = video.video_type ?? 'wedding'
  }

  // TODO: this is a prob when editing vids. `title` comes the b/e and
  // isn't updated as you change the values of spouse names
  if(title) {
    videoTitle = title
  } else if(name_spouse_1 && name_spouse_2) {
    videoTitle = `${name_spouse_1} & ${name_spouse_2}`
  }

  if(event_location) {
    videoLocation = event_location.formatted_address
  }

  const onUploadProgress = (pctComplete: number) => {
    setUploadPctComplete(pctComplete)
  }

  const warnOnClose = () => {
    // TODO: could also use react-router's Prompt to catch page nav when unsaved
    const unsavedChanges = !isEqual(lastSavedVideoData.current, videoData)

    if(!unsavedChanges || confirm('You have unsaved changes. Are you sure you want to leave?')) {
      onClose()
    }
  }

  async function uploadVideoFile(file) {
    try {
      const resp = await PublicContentService.getSignedVideoUploadUrl(file.name)
      const uploadUrl = resp.data.result.upload_url
      const uploadToken = resp.data.result.temporary_token

      onChange({ video_upload_token: uploadToken })
      pollVideoThumbnail(uploadToken)
      PublicContentService.uploadVideo(file, uploadUrl, uploadToken, onUploadProgress)

      // so that the added token doesn't trigger the unsaved warning dialog
      lastSavedVideoData.current = { ...videoData, video_upload_token: uploadToken }

    } catch(e) {
      popMessageError('We encountered an error uploading your video. Please try again.')
      onClose()
    }
  }

  // data will be partial IVideo based on which
  // screen this is coming from.
  const onChange = (data: IVideo) => {
    // useful debugging
    // console.log('====================================')
    // console.log('update data at top level', data)
    // console.log('====================================')

    if(data.thumbnail_url) {
      // user has uploaded their own thumb
      // stop polling the video processor for one.
      clearInterval(videoThumbInterval.current)
    }

    if(data.visibility) {
      // visibility is now set only on the last page where the
      // primary cta will save and exit
      setPrimaryCtaLabel(data.visibility === 'public' ? 'Publish' : 'Save')
    }

    setVideoData({
      ...videoData,
      ...data
    })
  }

  /**
   * Check the status of the video upload to see if a thumbnail
   * has been generated. If it has and user has yet to upload
   * their own, use it in the Preview component.
   */
  const pollVideoThumbnail = (uploadToken: string) => {
    clearInterval(videoThumbInterval.current)
    videoThumbInterval.current = setInterval(() => {
      (async () => {
        try {
          const resp = await PublicContentService.checkVideoProcessing(uploadToken)

          if(resp.initial_ready) {
            if(!videoData.thumbnail_url) {
              // user has not yet uploaded their own so use this in the preview
              setThumbnailPreviewUrl(resp.thumbnail_url)
            }
            clearInterval(videoThumbInterval.current)
          }

        } catch(e) {
          clearInterval(videoThumbInterval.current)
          console.warn('Error checking on vid processing', uploadToken)
        }
      })()
    }, 5000)
  }

  const renderScreen = useCallback(() => {
    switch(screenKey) {
      case Screens.Info:
        return (
          <BasicInfoScreen
            videoType={videoType}
            onChange={onChange}
            onThumbnailPreview={setThumbnailPreviewUrl}
            data={videoData}
            formikRef={basicFormikRef}
          />
        )
      case Screens.Wedding:
        return (
          <WeddingDetailsScreen
            onChange={onChange}
            data={videoData}
            formikRef={weddingFormikRef}
          />
        )
      case Screens.Visibility:
        return (
          <VisibilityScreen
            onChange={onChange}
            data={videoData}
            videoType={videoType}
            formikRef={visFormikRef}
          />
        )
    }
  }, [screenKey, videoData, videoType])

  const isFormValid = async (): Promise<boolean> => {
    let ref

    if(screenKey === Screens.Info) {
      ref = basicFormikRef
    } else if(screenKey === Screens.Wedding) {
      ref = weddingFormikRef
    } else if(screenKey === Screens.Visibility) {
      if(videoType === 'wedding') {
        ref = visFormikRef
      } else {
        // promo vids omit the part of this screen that uses Formik
        return true
      }
    } else {
      throw Error('Bad screen key passed to isFormValid')
    }

    // check form validation
    // validateForm will run validation on all fields
    await ref.current.validateForm(videoData)
    // ... but it won't cause err msgs to show on fields that haven't been touched
    const touched = {}
    Object.keys(ref.current.errors).forEach(field => {
      touched[field] = true
    })
    ref.current.setTouched(touched, false)

    const valid = ref.current.isValid
    setFormValid(valid)
    return valid
  }

  const onClickSaveDraft = async () => {
    const isValid = await isFormValid()
    if(!isValid) return

    const saveSucces = await saveVideo(true)
    if(saveSucces) lastSavedVideoData.current = videoData
  }

  const onClickPrimaryCta = async () => {
    const isValid = await isFormValid()
    if(!isValid) return

    const screens = progressBarLabels[videoType]

    // if at the last screen, we're doneˆ
    if(screens.indexOf(screenKey) === screens.length-1) {
      saveVideo(false)
    } else {
      navToNextScreen()
    }
  }

  const navToScreenByIndex = (index: number) => {
    const screens = progressBarLabels[videoType]
    navToScreen(screens[index])
  }

  const navToNextScreen = () => {
    let nextScreenKey

    if(videoType === 'wedding') {
      // this could be a little more elegant
      nextScreenKey = screenKey === Screens.Info ? Screens.Wedding : Screens.Visibility
    } else {
      nextScreenKey = Screens.Visibility
    }

    navToScreen(nextScreenKey)
  }

  const navToScreen = (screenKey: Screens) => {
    modalContentRef.current.scrollTop = 0
    setScreenKey(screenKey)
  }

  const saveVideo = async (asDraft: boolean) => {
    asDraft ? setSavingDraft(true) : setSaving(true)

    const video: IVideo = {
      ...videoData,
      draft: asDraft,
    }

    // clean up and format some attrs
    if(videoType === 'wedding') {
      // never send the b/e synthesized `title` field.
      // for promo vids however, it's fine and required.
      delete video.title

      if(video.event_date) {
        video.event_date = new Date(video.event_date).toISOString().slice(0, 10)
      }

      // if user has selected a location, we'll have a Google Places object here
      // that needs to be converted to a location string like "united-states/california/los-angeles"
      if(video.event_location?.address_components) {
        video.event_location = convertGoogleLocation(video.event_location)

      } else if(video.event_location?.location_id) {
        // this is an unchanged Location object received from the b/e - don't submit it again
        delete video.event_location
      }

      if(video.businesses) {
        // remove 'name' from businesses w slugs
        video.businesses = video.businesses.map(biz => {
          if(biz.slug) {
            const knownBiz = { ...biz }
            delete knownBiz.name
            return knownBiz
          }
          return biz
        })
      }

      if(video.tags) {
        // remove name from tags w slug
        video.tags = video.tags.map(tag => {
          if(tag.slug) {
            const knownTag = { ...tag }
            delete knownTag.name
            return knownTag
          }
          return tag
        })
      }

      // the b/e rejects empty strings here
      if(video.bride_email === '') video.bride_email = null
      if(video.bride_instagram === '') video.bride_instagram = null
    }

    console.log('====================================')
    console.log('video obj submitted', video)
    console.log('====================================')

    try {
      let resp
      // if we have an ID, we'll want to use PATCH
      if(video.id) {
        // if we have an id this vid's already been saved.
        //  sending the temp token will bork it.
        delete video.video_upload_token

        resp = await PublicContentService.patchVideo(video, video.id, user.businessSlug)

        console.log('====================================')
        console.log('patch resp', resp)
        console.log('====================================')

        // callback and modify the videos list data
        // note: if we change this page to swr, change this to mutate.
        if(resp.data.success && resp.data.result.object) {
          // the full processed video is returned
          onVideoEdit && onVideoEdit(resp.data.result.object)
        }

      } else {
        resp = await PublicContentService.postVideo(video, user.businessSlug)
      }

      // after posting, retain the video id so we can patch next time
      const id = resp.data.result.id
      // so that the added id doesn't trigger the unsaved warning dialog
      lastSavedVideoData.current = { ...videoData, id }
      onChange({ id })

      setSaving(false)
      setSavingDraft(false)
      popMessageSuccess(asDraft ? 'Video draft saved successfully' : 'Video saved successfully!')

      if(!asDraft) {
        history.push('/dashboard/videos')
        onClose()
      }

      return true

    } catch(e) {
      setSaving(false)
      setSavingDraft(false)
      popMessageError('There was an error while saving your video')
    }
  }

  return (
    <Modal
      open={isOpen}
      contentRef={modalContentRef}
      // in favor of our own close button in the sticky container
      showCloseButton={false}
      fullHeight
      width='100%'
      customStyles={{ content: { borderRadius: 0, padding: '0 50px' } }}
    >
      <S.ButtonContainer>
        <Flex align='center'>
          {/* Yes, this div is necessary */}
          <div>
            <BaseCTAButton
              iconLeft
              title='Close'
              size='fullWidthMedium'
              icon={<CloseIcon fillColor='white' strokeColor='none' />}
              onClick={warnOnClose}
            />
          </div>
          { !formValid &&
            <S.InvalidFormWarning style={{ marginLeft: 30 }}>
              <div style={{ width: 5, height: 17, marginRight: 6 }}>
                <AlertExclamation />
              </div>
              Required fields must be filled in correctly
            </S.InvalidFormWarning>
          }
        </Flex>
        <Flex>
          <OutlinedCTAButton
            onClick={onClickSaveDraft}
            style={{ marginRight: 20 }}
            loading={savingDraft}
          >
            Save as Draft
          </OutlinedCTAButton>
          <BaseCtaButton
            title={primaryCtaLabel}
            onClick={onClickPrimaryCta}
            loading={saving}
          />
        </Flex>
      </S.ButtonContainer>

      <S.ContentContainer>
        <div style={{ flexGrow: 1, marginRight: 80 }}>
          <ProgressBar
            labels={progressBarLabels[videoType]}
            currentIndex={progressBarLabels[videoType].indexOf(screenKey)}
            onLabelClick={navToScreenByIndex}
            style={{ margin: '10px 0 30px' }}
          />
          <HorizontalRule style={{ marginBottom: 0 }} />
          <S.ScreenContainer>
            { renderScreen() }
          </S.ScreenContainer>
        </div>
      </S.ContentContainer>

      <S.PreviewContainer>
        <HorizontalRule style={{ marginBottom: 20 }} />
        <S.H4 style={{ marginBottom: 40 }}>Preview</S.H4>
        <VideoUploadPreview
          pctComplete={uploadPctComplete}
          thunbmailUrl={thumbnailPreviewUrl}
          videoAuthor={`${user.firstName} ${user.lastName}`}
          videoTitle={videoTitle}
          videoLocation={videoLocation}
          videoTags={videoData.tags}
        />

        <S.HelpContainer style={{ marginTop: 46 }}>
          <div style={{ width: 45, height: 45, marginRight: 10 }}>
            <HelpIcon />
          </div>
          <div>
            <h5 style={{ marginBottom: 2 }}>Need help? Contact us at</h5>
            <a href='mailto:videos@lovestoriestv.com'>videos@lovestoriestv.com</a>
          </div>
        </S.HelpContainer>
      </S.PreviewContainer>
    </Modal>
  )
}

export default VideoInfoModal
