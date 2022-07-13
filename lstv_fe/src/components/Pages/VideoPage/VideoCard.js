/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { IconContainer, Stat } from './LayoutComps';
import styled from 'styled-components';
import {
    CARD_BACKGROUND,
    UserDevice,
    ACTION_BAR_OWNER_TYPE_VIDEO,
    ACTION_BAR_LIKES_DISPLAY_THRESHOLD,
    PRIMARY_COLOR,
} from '/global/globals';
import VideoPlayer from '../../Video/VideoPlayer';
import ContentShareWidget from '../../Utility/ContentShareWidget';
import { GetVideoShareOptions, couplesNamesFromProperties, findVideographerBusiness, findVenueBusiness } from '/utils/LSTVUtils';
import ShareModal from '/newComponents/ShareModal';
import LikableHeart from '../../Utility/LikableHeart';
import { ContactBusinessButton }  from '/components/Forms/LSTVInlineContactButtons';
import { useVideoLike } from './index';
import LSTVLink from '../../Utility/LSTVLink';
import { Flex } from '../../../utils/LSTVUtils';
import { trackEvent } from '../../../global/trackEvent';

var dayjs = require('dayjs')

const VideoCardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 20px;
    background: ${CARD_BACKGROUND};
    &>.video {
        display: flex;
        overflow: hidden;
        flex: 1;
        min-height: 150px;
        height: 100%;
        width: 100%;
        border-radius: 5px;
        @media ${UserDevice.tablet} {
            height: 100%;
            /* min-height: 350px; */
        }
    }
`;

const BottomContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: flex-start;
`

const BottomContainerDesktop = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
`;

const VideoCardTitle = styled.div`
    align-self: flex-start;
    padding: 25px 0px 0px 0px;
    h1, h2 {
        font-size: 2rem;
        padding: 0px;
        margin-top: 10px;
        font-weight: 800;
        line-height: 2.5rem;
    }
`;
const DateAndViews = styled.div`
    display: flex;
    margin: 8px 0px;
    p {
        font-size: 0.937rem;
        font-weight: 500;
        line-height: 1.125rem;
    }
`;

const LikableHeartContainer = styled(IconContainer)`
    /* padding-right: 10px; */
    @media ${UserDevice.tablet} {
        padding-right: 5px;
    }
`;

const StyledStat = styled(Stat)`
    padding-right: 30px;
`;

const Subtitle = styled.h3`
    font-family: Calibre;
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.5rem;
    margin: 5px 0;
`;

const SubtitleLink = styled.span`
    display: inline;
    font-weight: 500;
    font-size: 1.25rem;
    line-height: 1.5rem;
    text-decoration: underline;
`

const VideoCardStats = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    width: 100%;
    min-width: 235px;
    padding: 25px 0px;
    @media ${UserDevice.laptop} {
        justify-content: flex-end;
    }
`;
const RightSideStats = styled.div`
    margin-top: 20px;
`

const PremiumBadge = styled.div`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 24px;
    padding: 8px;
    background: ${PRIMARY_COLOR};
    border-radius: 4px;
    font-weight: 500;
    color: white;
    text-align: center;
`;

const LikesComp = ({ likes, slug, isLiked, handleLike }) => (
    <StyledStat>
        <LikableHeartContainer>
            <LikableHeart onLike={()=> handleLike()} isLiked={isLiked} />
        </LikableHeartContainer>
        {`${ likes >= ACTION_BAR_LIKES_DISPLAY_THRESHOLD ? likes : ''} `} <strong>Like{likes !== 1 && `s`}</strong>
    </StyledStat>
);

const VideographerAndVenue = ({ videographer, venue }) =>
    <>
        <Subtitle>
            Videographer:{' '}
            <SubtitleLink>
                <LSTVLink to={`/business/${videographer.slug}`}>{ videographer.name }</LSTVLink>
            </SubtitleLink>
        </Subtitle>
        { venue &&
          <Subtitle>
            Venue:{' '}
            <SubtitleLink>
                <LSTVLink to={`/business/${venue.slug}`}>{ venue.name }</LSTVLink>
            </SubtitleLink>
          </Subtitle>
        }
    </>

const ContactButtons = ({ CustomCTA, videographer, venue, onClickContact, videoId, stack }) =>
    <Flex direction={stack ? 'row' : 'column'} flexWrap={stack ? 'wrap' : 'nowrap'}>
        { CustomCTA ?
          CustomCTA :
          <ContactBusinessButton
              id='videographer-contact'
              business={videographer}
              videoId={videoId}
              tooltip='Contact the videographer'
              title='Contact Videographer'
              size="large"
              onClickCallback={() => onClickContact(videographer.name, 'vendor')}
          />
        }
        {/* If a custom cta was passed in, assume that's the only CTA we're intending to show */}
        { (!CustomCTA && venue) &&
            <div style={{ marginTop: stack ? 20 : 0, marginLeft: stack ? 0 : 20 }}>
                <ContactBusinessButton
                    id='venue-contact'
                    business={venue}
                    videoId={videoId}
                    tooltip='Contact the venue'
                    title='Contact Venue'
                    size="large"
                    onClickCallback={() => onClickContact(venue.name, 'venue')}
                />
            </div>
        }
    </Flex>

export const ShareComp = ({ data, videoIndex = 0, showText = true }) => {
    const { id, thumbnail_url, short_url_token } = data?.videosSources[videoIndex];
    const coupleNames = couplesNamesFromProperties(data.post_properties);

    return (
        <ContentShareWidget
            ownerType={ACTION_BAR_OWNER_TYPE_VIDEO}
            ownerId={id}
            shareOptions={GetVideoShareOptions({
                shortUrlToken: short_url_token,
                coupleNames: coupleNames,
                shareThumbnailUrl: thumbnail_url,
            })}
            shareThumbnailUrl={thumbnail_url}
            fontSize={'1.2em'}
            textColor={'black'}
            fillColor={'black'}
            showText={showText}
        />
    );
};

const VideoCard = ({
  data,
  isBusiness,
  subTitle,
  videoIndex = 0,
  handleLike,
  isLiked,
  isPremium,
  isDesktop,
  isAutoPlay,
  CustomCTA,
  hideDetails,
  style
}) => {
    const {
      id,
      title,
      event_date,
      location,
      videosSources,
      likes,
      businesses,
      slug
    } = data || {};
    const [isLikedInVideo, handleLikeInVideo ] = useVideoLike(slug)

    if (!data?.videosSources[videoIndex]) {
        return null;
    }

    const coupleNames = couplesNamesFromProperties(data.post_properties);
    const videographer = findVideographerBusiness(businesses)
    const venue = findVenueBusiness(businesses)

    const calcTitle = () => {
        const CardTitle = isBusiness ? <h2>{coupleNames || title}</h2> : <h1>{coupleNames || title}</h1>
        if(slug) {
            return <LSTVLink noStyle to={`/${slug}`}>{CardTitle}</LSTVLink>
        }
        return CardTitle
    }

    const onClickContact = (businessName, businessType='vendor') => {
        trackEvent(`${businessType}_contact`, {
            'event_label': `contact - ${businessName}`,
            'event_category': 'business_engagement',
            'sent_from_button_location': 'video_page_body'
        });
    }

    return (
        <>
            <VideoCardContainer style={style?.container}>
                <div className="video">
                    <VideoPlayer
                        isAutoPlay={isAutoPlay}
                        onPercentageComplete={null}
                        onVideoComplete={null}
                        video={videosSources[videoIndex]}
                        upNextSlide={null}
                    />
                </div>

                {!isDesktop && !hideDetails && (
                    <BottomContainer>
                        <VideoCardTitle>
                            {calcTitle()}
                            {subTitle ?
                                <Subtitle>{subTitle}</Subtitle> :
                                (location && Object.values(location).length > 0) &&
                                    <Subtitle>in {location.display_name}</Subtitle>
                            }
                            {/* This is all pretty confusing but VideoCard is used in at
                                least 3 contexts with different needs:
                                fashion, buiness, and video pages
                                It should really be refactored eventually.
                            */}
                            { !subTitle && <VideographerAndVenue videographer={videographer} venue={venue} /> }
                        </VideoCardTitle>
                        <VideoCardStats>
                            <LikesComp isLiked={isLiked || isLikedInVideo} handleLike={handleLike || handleLikeInVideo} likes={likes} slug={slug} />
                            <ShareComp data={data} />
                        </VideoCardStats>
                        <ContactButtons
                          videoId={id}
                          videographer={videographer}
                          venue={venue}
                          onClickContact={onClickContact}
                          CustomCTA={CustomCTA}
                          stack={true}
                        />
                    </BottomContainer>
                )}

                {isDesktop && !hideDetails && (
                    <BottomContainerDesktop>
                        <VideoCardTitle>
                            {isPremium ? <PremiumBadge>Premium</PremiumBadge> : null}
                            {calcTitle()}
                            {subTitle ?
                                <Subtitle>{subTitle}</Subtitle> :
                                (location && Object.values(location).length > 0) &&
                                    <Subtitle>in {location.display_name}</Subtitle>
                            }
                            { !subTitle && <VideographerAndVenue videographer={videographer} venue={venue} /> }
                            <DateAndViews>
                                {event_date &&
                                    <p>{dayjs(event_date).format('MMM D YYYY')}</p>
                                }
                            </DateAndViews>
                        </VideoCardTitle>
                        <RightSideStats>
                            <VideoCardStats>
                                <LikesComp  isLiked={isLiked || isLikedInVideo} handleLike={handleLike || handleLikeInVideo}likes={likes} slug={slug}/>
                                <ShareComp data={data} />
                            </VideoCardStats>
                            <ContactButtons
                              videoId={id}
                              videographer={videographer}
                              venue={venue}
                              onClickContact={onClickContact}
                              CustomCTA={CustomCTA}
                              stack={false}
                            />
                        </RightSideStats>
                    </BottomContainerDesktop>
                )}
            </VideoCardContainer>
            <ShareModal />
        </>
    );
};

VideoCard.propTypes = {
    data: PropTypes.object,
    videoIndex: PropTypes.number,
    isDesktop: PropTypes.bool,
    isPremium: PropTypes.bool,
    // Optional: if you want to manage like state in parent components
    handleLike: PropTypes.func,
      // Optional: if you want to manage like state in parent components
    isLiked: PropTypes.bool,
    // CustoCTA is an optional component, if you need a custom CTA elemnent
    CustomCTA: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

VideoCard.defaultProps = {
    CustomCTA: undefined,
    isAutoPlay: false,
};

export default VideoCard
