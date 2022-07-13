import React from 'react';
import * as LSTVGlobals from '../../global/globals';
import { withRouter } from 'react-router';
import Gallery from 'react-photo-gallery';
import { isMobileOnly, isTablet } from 'react-device-detect';
import styled, { css } from 'styled-components';
import ImageViewer from './PhotoGalleryCarousel';
import MediaQuery from 'react-responsive/src/Component';

const PhotoGalleryContainer = styled.div`
    width: 100%;
    display: block;
    height: auto;
`;

const Container = styled.div`
    position: ${(props) => props.position};
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    top: ${(props) => props.top}px;
    left: ${(props) => props.left}px;
    overflow: hidden;
    
`;

const ImageContainer = styled.div`
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 2px;

    img {
        transition: all 0.2s linear;
    }

    &:hover {
        img {
            opacity: 0.5;
            //transform: scale(1.05);
        }
    }
`;

const Image = styled.img`
    position: relative;
    cursor: pointer;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    margin: 0;
    display: block;
    

    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        border: 1px dotted white;
        box-sizing: border-box;
        margin: 2px;
    }
`;

class PhotoGallery extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            viewerIsOpen: false,
            currentImage: 0,
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {}

    componentDidMount() {}

    openLightBox = (index) => {
        this.setState({
            ...this.state,
            viewerIsOpen: true,
            currentImage: index,
        });
    };

    openLightBoxMobile = (event, index) => {
        this.setState({
            ...this.state,
            viewerIsOpen: true,
            currentImage: index,
        });
    };

    closeLightBox = () => {
        this.setState({
            ...this.state,
            viewerIsOpen: false,
        });
    };

    renderImageRow = (event) => {
        return (
            <Container
                onClick={() => this.openLightBox(event.index)}
                position={'relative'}
                key={event.key}
                width={event.photo.width}
                height={event.photo.height}
            >
                <ImageContainer>
                    <Image
                        alt={event.photo.alt}
                        width={event.photo.width}
                        height={event.photo.height}
                        src={event.photo.src}
                    />
                </ImageContainer>
            </Container>
        );
    };

    renderImageColumn = (event) => {
        return (
            <Container
                onClick={() => this.openLightBox(event.index)}
                position={'absolute'}
                key={event.key}
                top={event.top}
                left={event.left}
                width={event.photo.width}
                height={event.photo.height}
            >
                <Image
                    width={event.photo.width}
                    height={event.photo.height}
                    alt={event.photo.alt}
                    src={event.photo.src}
                />
            </Container>
        );
    };

    render() {
        let photos = this.props.images.map((image, index) => {
            return {
                key: index.toString(),
                src: image.url,
                width: image.width,
                height: image.height,
                title: this.props.title,
                businesses: this.props.payload,
            };
        });

        return (
            <PhotoGalleryContainer>
                <MediaQuery query={LSTVGlobals.UserDevice.laptop}>
                    <Gallery
                        margin={0}
                        direction={'row'}
                        photos={photos}
                        renderImage={this.renderImageRow}
                        onClick={this.openLightBox}
                    />
                </MediaQuery>
                <MediaQuery query={LSTVGlobals.UserDevice.isMobileOrTablet}>
                    <Gallery
                        margin={0}
                        columns={isMobileOnly ? 2 : 3}
                        direction={'column'}
                        photos={photos}
                        renderImage={this.renderImageColumn}
                    />
                </MediaQuery>

                {this.state.viewerIsOpen ? (
                    <ImageViewer
                        currentIndex={this.state.currentImage}
                        images={photos.map((x) => ({ ...x }))}
                        showClose={true}
                        handleClose={this.closeLightBox}
                    />
                ) : null}
            </PhotoGalleryContainer>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // onMainVideoDataReady: ( data ) => dispatch( {type: ActionTypes.ACTION_MAIN_VIDEO_DATA_READY,
        // 	data: data}),
    };
};

const mapStateToProps = (state) => {
    return {
        // mainVideoData: state.user.mainVideoData
    };
};

export default withRouter(PhotoGallery);
