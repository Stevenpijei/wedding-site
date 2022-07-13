import React from 'react';
import * as S from '../../index.styles';
import { IBasicInfo, VideoType } from '../../types';
import BasicInfoFormPromo from './BasicInfoFormPromo';
import BasicInfoFormWedding from './BasicInfoFormWedding';
import FileUpload from '/components/FileUpload';
import HorizontalRule from '/components/HorizontalRule';
import PublicContentService from '/rest-api/services/publicContentService';

export type CommonProps = {
  data?: IBasicInfo,
  formikRef: any, // TSFIXME
  onChange: (data: IBasicInfo) => void,
}

type Props = CommonProps & {
  onThumbnailPreview: (objectUrl: string) => void,
  videoType: VideoType
}

const BasicInfoScreen = ({
  data,
  videoType,
  onChange,
  onThumbnailPreview,
  formikRef
}: Props) => {
  // if editing, location data will be this custom location obect
  const defaultLocation = data?.event_location?.display_name

  const onChangeForm = formValues => {
    onChange(formValues)
  }

  const onThumbDrop = async (acceptedFiles) => {
    if(!acceptedFiles.length) return

    const file = acceptedFiles[0]
    const thumbnail_url = await PublicContentService.uploadPhoto(file)

    onThumbnailPreview(URL.createObjectURL(file))
    onChange({ thumbnail_url })
  }

  return (
    <S.Section>
      <S.H4 style={{ marginBottom: 30 }}>Details</S.H4>
      <div style={{ marginBottom: 20 }}>
        { videoType === 'promo' ?
          <BasicInfoFormPromo
            data={data}
            onChange={onChangeForm}
            formikRef={formikRef}
          /> :
          <BasicInfoFormWedding
            data={data}
            onChange={onChangeForm}
            formikRef={formikRef}
            defaultLocation={defaultLocation}
          />
        }
      </div>

      <HorizontalRule style={{ marginBottom: 30 }} />

      <S.H4>Thumbnail</S.H4>
      { videoType === 'wedding' &&
        <S.P style={{ margin: '10px 0 40px', maxWidth: 530 }}>
          Pro Tip! No need to have the couple's names on the thumbnail. 
          Their names will be the title of the video.
        </S.P>
      }
      <FileUpload
        previewImage
        accept='image/*'
        value={data?.thumbnail_url}
        multiple={false}
        onDrop={onThumbDrop}
      />
    </S.Section>
  )
}

export default BasicInfoScreen