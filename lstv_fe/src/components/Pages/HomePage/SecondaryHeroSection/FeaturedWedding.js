import React from 'react';
import styled from 'styled-components';
import LSTVLink from '../../../Utility/LSTVLink';
import VideoPlayer from '../../../Video/VideoPlayer';
import PropTypes from 'prop-types';

const FeaturedWedding = ({videoSource, title, slug}) => {
    return videoSource ? (
        <FeaturedWeddingContainer>
            <Header>Featured Wedding</Header>
            <VideoPlayer
                isAutoPlay={false}
                onPercentageComplete={null}
                onVideoComplete={null}
                video={videoSource}
                upNextSlide={null}
            />
             <LSTVLink noStyle to={slug}><SubHeader>{title}</SubHeader></LSTVLink>
            
        </FeaturedWeddingContainer>
    ) : null;
};

const FeaturedWeddingContainer = styled.div`
    flex: 9;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 27px;
`;

const Header = styled.h4`
    font-family: Heldane Display Test;
    font-style: normal;
    font-weight: bold;
    font-size: 32px;
    line-height: 124.4%;
    margin-bottom: 17px;
`;

const SubHeader = styled.h5`
    font-family: Calibre;
    font-style: normal;
    font-weight: 600;
    font-size: 21px;
    line-height: 25px;
    padding-top: 10px;
`;

FeaturedWedding.propTypes = {
    videoSource: PropTypes.object,
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
   
};

FeaturedWedding.defaultProps = {
    CustomCTA: undefined,
};

export default FeaturedWedding;
