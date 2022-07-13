import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as S from './PhotoGallery.styles';
import Gallery from 'react-photo-gallery';
import InView from 'react-intersection-observer';
import LSTVLightbox from '../components/Pages/VideoPage/LSTVLightbox';
import { useMediaReady } from '../utils/LSTVUtils';
import { UserDevice } from '../global/globals';

const PhotoGallery = ({ photos, photoCredit, targetImageHeight }) => {
    // const THRESHOLD = 0.75;
    // const [photoCount, setPhotoCount] = useState(1);
    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);
    const [photoLimit, setPhotoLimit] = useState(6);
    const [isMobile, ready] = useMediaReady(UserDevice.isWithinMobile, false);

    const openLightbox = useCallback((event, { photo, index }) => {
        setCurrentImage(index);
        setTimeout(() => {
            setViewerIsOpen(true);
        }, 100);
    }, []);

    const imageRenderer = ({ index, left, top, key, photo }) => (
        <SelectedImage
            key={key}
            margin={'2px'}
            index={index}
            photo={photo}
            left={left}
            top={top}
            handleClick={openLightbox}
        />
    );

    return (
        <>
            <LSTVLightbox
                photos={photos}
                photoCredit={photoCredit ? photoCredit : ''}
                isOpen={viewerIsOpen}
                onClose={() => setViewerIsOpen(false)}
                imageIndex={currentImage}
            />
            {isMobile ? (
                <S.MobilePhotoRow>
                    {photos.map((photo, index) => (
                        // This works but causes some sort of race condition on tablet sizes
                        // <InView as="div" threshold={THRESHOLD} onChange={(inView) => inView && setPhotoCount(index + 1) } key={photo.url}>
                        <div key={photo.url}>
                            <S.GalleryImage
                                src={photo.url}
                                onClick={() => openLightbox(undefined, { photo: undefined, index: index })}
                            />
                        </div>
                        // </InView>
                    ))}
                    {/* <S.Counter>
                        {photoCount}/{photos.length}
                    </S.Counter> */}
                </S.MobilePhotoRow>
            ) : (
                <S.Container>
                    <Gallery
                        photos={photos
                            .map((photo) => {
                                return { ...photo, src: photo.url };
                            })
                            .slice(0, photoLimit)}
                        renderImage={imageRenderer}
                        targetRowHeight={targetImageHeight}
                    />
                    {photoLimit < photos.length && (
                        <div>
                            <S.MorePhotos onClick={() => setPhotoLimit(photos.length)}>More photos</S.MorePhotos>
                        </div>
                    )}
                </S.Container>
            )}
        </>
    );
};

PhotoGallery.propTypes = {
    photos: PropTypes.array.isRequired,
    photoCredit: PropTypes.string,
    // This is an approximate height of each row in px
    targetImageHeight: PropTypes.number,
};

PhotoGallery.defaultProps = {
    photos: [],
    photoCredit: null,
    targetImageHeight: 250,
};

export default PhotoGallery;

const SelectedImage = ({ index, photo, margin, direction, top, left, handleClick }) => {


    const handleOnClick = (e) => {
        handleClick(e, { photo, index });
    };

    return (
        <div style={{ margin, height: photo.height, width: photo.width }}>
            <img
                alt={photo.title}
                {...photo}
                onClick={handleOnClick}
                style={{ borderRadius: '4px', cursor: 'pointer' }}
            />
        </div>
    );
};
