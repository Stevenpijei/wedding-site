import CircularProgress from '@material-ui/core/CircularProgress'
import React from 'react'
import { CSSProperties } from 'styled-components'
import theme from '../../../../../styledComponentsTheme'
import { ITag } from '../types'
import * as S from './index.styles'
import Flex from '/components/Utility/Flex'

type Props = {
  pctComplete?: number,
  thunbmailUrl?: any,
  videoAuthor?: string,
  videoTitle?: string,
  videoLocation?: string,
  videoTags?: ITag[],
}

const VideoUploadPreview = ({
  pctComplete,
  thunbmailUrl,
  videoTitle,
  videoAuthor,
  videoLocation,
  videoTags
}: Props) => {
  const url = thunbmailUrl ?? '/images/video-preview-thumb-placeholder.jpg'
  const thumbStyle: CSSProperties = {    
    backgroundImage: `url(${url})`
  }

  return (
    <S.Container>
      <S.ThumbContainer style={thumbStyle}>
        { !isNaN(pctComplete) && pctComplete < 100 &&
          <S.ProgressContainer>
            <CircularProgress
              variant='determinate'
              value={pctComplete}
              size={80}
              // we're not MUI components anywhere else presently but if that
              // changes we'll implement the ThemeProvider 
              style={{ color: theme.primaryPurple }}
            />
          </S.ProgressContainer>
        }
      </S.ThumbContainer>      
      <S.ContentContainer>
        { videoTitle && <S.Title>{ videoTitle }</S.Title> }
        {/* should this be shown before title is known? */}
        <S.Author>by { videoAuthor }</S.Author>
        { videoLocation && <S.Location>{ videoLocation }</S.Location> }
        <Flex style={{ flexWrap: 'wrap' }}>
          { (videoTags || []).map((tag, index) =>
            <S.Tag key={index}>{ tag.name }</S.Tag>)
          }
        </Flex>
      </S.ContentContainer>
    </S.Container>
  )
}

export default VideoUploadPreview