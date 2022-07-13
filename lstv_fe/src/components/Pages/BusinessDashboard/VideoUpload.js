import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router'
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import theme from '../../../styledComponentsTheme';
import VideoInfoModal from './VideoInfoModal';
import * as S from './VideoUpload.styles';
import { ArrowLeft, UploadIcon } from '/components/Utility/LSTVSVG';
import { reactSelectStyles } from '/newComponents/BaseMultiSelect';
import BaseCTAButton from '/newComponents/buttons/BaseCtaButton';
import { useAuthService } from '/rest-api/hooks/useAuthService';
import { isPaidUser, isVideographerUser } from '/utils/LSTVUtils';

const UploadPrompt = ({ isDragActive }) =>
  <S.UploadPromptContainer isDragActive={isDragActive}>
    <div style={{ width: 35 }}>
      <UploadIcon fillColor={theme.darkGrey} />
    </div>
  </S.UploadPromptContainer>

// these `value` items are VideoType values
const videoTypeOptions = [{
  label: 'Promo Video',
  value: 'promo'
}, {
  label: 'Wedding Video',
  value: 'wedding'
}]

function VideoUpload() {
  const history = useHistory()
  const { user } = useAuthService();

  const isPaid = isPaidUser(user)
  const isVideographer = isVideographerUser(user)

  const [modalOpen, setModalOpen] = useState(false)
  const [files, setFiles] = useState();
  const [fileLoading, setFileLoading] = useState(false);

  // remains undefined if user is a paying videographer.
  // they can upload both types of vids and will be shown
  // a dropdown where they make their choice.
  let defaultVideoType = undefined

  if(isVideographer && !isPaid) {
    // non-paying videographer can upload only wedding vids
    defaultVideoType = 'wedding'
  } else if(!isVideographer && isPaid) {
    // paying non-videographer can upload only promo vids
    defaultVideoType = 'promo'
  }

  const [videoType, setVideoType] = useState(defaultVideoType)
  const initShowTypeChoice = defaultVideoType === undefined
  const [showTypeChoice, setShowTypeChoice] = useState(initShowTypeChoice)

  const disableUpload = !!files;

  useEffect(() => {
    // user is not permitted to be here
    if(!isPaid && !isVideographer) {
      history.push('/dashboard/info')
    }
  }, [user])

  const onModalClose = () => {
    setModalOpen(false)
    setFiles(null)
  }

  return (
    <S.Container>
      <S.Section>
        <Dropzone
          noClick
          disabled={showTypeChoice}
          accept='video/*'
          multiple={false}
          onDrop={async (acceptedFiles) => {
            if (!disableUpload) {
              setFiles(acceptedFiles);
              setFileLoading(true);
              // reset state of uploader for case where user closes modal
              setTimeout(() => {
                setModalOpen(true)
                setFileLoading(false)
                setShowTypeChoice(initShowTypeChoice)
              }, 3000)
            }
          }}
        >
          {({ getRootProps, getInputProps, isDragActive, open }) => (
            <S.DragandDropContainer {...getRootProps()}>
              <input {...getInputProps()} />
              { showTypeChoice ?
                <>
                  <S.VideoTypeTitle>
                    Choose a type of video
                  </S.VideoTypeTitle>
                  <S.VideoTypeContainer>
                    <h5>Promo Video</h5>
                    <p>
                      Select this video option to showcase your business.
                      These videos will appear as featured videos on your business page.
                    </p>
                    <h5>Wedding Video</h5>
                    <p>
                      Select this video option to showcase your weddings.
                      These videos will appear across LoveStoriesTV so make sure
                      to tag your colleagues and add styles to be discoverable.
                    </p>
                  </S.VideoTypeContainer>
                  <div style={{ width: 257, marginBottom: 20 }}>
                    <Select
                      placeholder='Choose a type of video ...'
                      options={videoTypeOptions}
                      styles={reactSelectStyles}
                      value={videoTypeOptions.find(o => o.value === videoType)}
                      onChange={option => setVideoType(option.value)}
                    />
                  </div>
                  <BaseCTAButton
                    hideIcon
                    title='Next'
                    disabled={!videoType}
                    onClick={() => setShowTypeChoice(false)}
                  />
                </> :
                <>
                  { initShowTypeChoice &&
                    <S.VideoTypeBackContainer>
                      <BaseCTAButton
                        size='iconOnly'
                        icon={
                          <S.VideoTypeBackIcon>
                            <ArrowLeft />
                          </S.VideoTypeBackIcon>
                        }
                        onClick={() => setShowTypeChoice(true)}
                      />
                    </S.VideoTypeBackContainer>
                  }
                  <div style={{ marginBottom: 10 }}>
                    { fileLoading ?
                      <CircularProgress size={100} style={{ color: theme.primaryPurple }} /> :
                      <UploadPrompt isDragActive={isDragActive} />
                    }
                  </div>
                  <S.H4 style={{ marginBottom: 10 }}>
                    { fileLoading ? 'Right on! We got your file!' : 'Drag and drop to upload' }
                  </S.H4>
                  <p style={{ marginBottom: 20 }}>
                    { fileLoading ?
                      'Give us a second to process the information.' :
                      'Your video will be saved as a draft until you publish it.'
                    }
                  </p>
                  { !fileLoading &&
                    <div style={{ marginBottom: 24 }}>
                      <BaseCTAButton
                        hideIcon
                        title='Select File'
                        cursor='pointer'
                        onClick={open}
                      />
                    </div>
                  }
                </>
              }
              <S.Disclaimer>
                You can upload any video format (WMV, AVI, MP4, MOV, MPEG, FLV, ...)<br />
                By submitting your videos to LSTV, you acknowledge that you agree to LSTV’s Terms of Service and Community Guidelines.<br />
                Please be sure not to violate copyright or privacy rights.
              </S.Disclaimer>
            </S.DragandDropContainer>
          )}
        </Dropzone>
      </S.Section>

      {/* conditional rendering makes sure modal is always reset when we open it */}
      { modalOpen &&
        <VideoInfoModal
          isOpen
          onClose={onModalClose}
          videoFileToUpload={files[0]}
          videoType={videoType}
        />
      }
    </S.Container>
  );
}

export default VideoUpload;

