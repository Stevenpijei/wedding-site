import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Lightbox from 'react-spring-lightbox';
import { UserDevice } from '../../../global/globals';
import BaseCTAButton from '../../../newComponents/buttons/BaseCtaButton';
import { CloseIcon, ArrowRight } from '../../Utility/LSTVSVG';

const StyledLightbox = styled(Lightbox)`
    img {
        border-radius: 4px;
    }
`;

const CloseContainer = styled.div`
    max-width: 175px;
`;

const CustomHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
const TopMenu = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin: 20px 0px;
    align-items: center;
`;
const Count = styled.div``;
const ArrowContainer = styled.div`
    display: none;
    position: absolute;
    right: ${(props) => (props.isRight ? 0 : 'unset')};
    left: ${(props) => (props.isRight ? 'unset' : 0)};
    transform: ${(props) => (props.isRight ? 'unset' : 'rotate(180deg)')};
    height: 16px;
    width: 16px;
    padding: 10px;
    border-radius: 100%;
    border: 2px solid black;
    z-index: 100;
    cursor: pointer;
    @media ${UserDevice.tablet} {
        display: block;
    }
`;

const PhotoFooter = styled.div`
    margin-bottom: 8px;
    text-align: center;
`;

const PhotoTitle = styled.span`
    font-weight: bold;
    font-size: 1.125em;
    padding-right: 4px;
`;
const PhotoDescription = styled.span`
    font-size: 1.125em;
`;

const CustomFooter = styled.div`
    p {
        text-align: center;
    }
`;

const LSTVLightbox = ({ photos, photoCredit, onClose, imageIndex, isOpen }) => {
    const images = photos.map((photo, index) => {
        return { src: photos[index].url, alt: photos[index].url };
    });
    const [currentImageIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setCurrentIndex(imageIndex);
    }, [imageIndex]);

    const goToPrevious = () => currentImageIndex > 0 && setCurrentIndex(currentImageIndex - 1);

    const gotoNext = () => currentImageIndex + 1 < images.length && setCurrentIndex(currentImageIndex + 1);

    const CustomHeaderComponent = () => (
        <CustomHeader>
            <TopMenu>
                <CloseContainer>
                    <BaseCTAButton
                        title="Close"
                        size="fullWidth"
                        icon={<CloseIcon fillColor="white" strokeColor="none" />}
                        onClick={() => onClose()}
                    />
                </CloseContainer>
                {/* <div>{data ? <ShareComp data={data} showText={false} /> : null}</div> */}
            </TopMenu>
            <Count>
                <span>
                    {currentImageIndex + 1}/{images.length}
                </span>
            </Count>
        </CustomHeader>
    );
    const CustomFooterComponent = ({ photoCredit, photo }) => (
        <CustomFooter>
            {photo?.title ? (
                <PhotoFooter>
                    <PhotoTitle>{photo?.title}:</PhotoTitle> <PhotoDescription>{photo?.description}</PhotoDescription>
                </PhotoFooter>
            ) : null}
            <p>Photo Credit: {photoCredit}</p>
        </CustomFooter>
    );
    const CustomArrowComponent = (props) => (
        <>
            {props.isRight && currentImageIndex + 1 < images.length && (
                <ArrowContainer {...props}>
                    <ArrowRight strokeColor="none" />
                </ArrowContainer>
            )}
            {!props.isRight && currentImageIndex >= 1 && (
                <ArrowContainer {...props}>
                    <ArrowRight strokeColor="none" />
                </ArrowContainer>
            )}
        </>
    );

    return (
        <StyledLightbox
            isOpen={isOpen}
            onPrev={goToPrevious}
            onNext={gotoNext}
            images={images}
            currentIndex={currentImageIndex}
            onClose={onClose}
            /* Add your own UI */
            renderHeader={() => <CustomHeaderComponent />}
            renderFooter={() =>
                photoCredit && <CustomFooterComponent photoCredit={photoCredit} photo={photos[currentImageIndex]} />
            }
            renderPrevButton={() => <CustomArrowComponent isRight={false} onClick={() => goToPrevious()} />}
            renderNextButton={() => <CustomArrowComponent isRight onClick={() => gotoNext()} />}
            // renderImageOverlay={() => (<ImageOverlayComponent />)}

            /* Add styling */
            // className="cool-class"
            style={{ background: 'white', padding: '10px' }}

            /* Use single or double click to zoom */
            // singleClickToZoom

            /* react-spring config for open/close animation */
            // pageTransitionConfig={{
            //   from: { transform: "scale(0.75)", opacity: 0 },
            //   enter: { transform: "scale(1)", opacity: 1 },
            //   leave: { transform: "scale(0.75)", opacity: 0 },
            //   config: { mass: 1, tension: 320, friction: 32 }
            // }}
        />
    );
};

export default LSTVLightbox;
