

import React from "react";
import LSTVButton from "./LSTVButton";
import * as LSTVGlobals from "../../global/globals";


class StateImage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            images: this.props.images.map(image => ({
                ...image,
                loaded: false,

            })),
            activeMode: props.activeMode,
            numReady: 0,
            imagesReady: false
        };

        this.state.images.forEach((image, index) => {

            const src = image.image;

            const primaryImage = new Image();
            primaryImage.onload = () => {

                const images = [...this.state.images];
                images[index].loaded = true;



                this.setState( {
                    ...this.state,
                    images: images,
                    numReady: ++this.state.numReady
                }, () => {
                    // are we done loading all required images?
                    if (this.state.numReady === this.state.images.length) {
                        this.setState( {
                           ...this.state,
                           imagesReady: true
                        });
                        this.props.onReady();
                    }
                });
            };
            primaryImage.src = src;

        });
    }

    updateActiveMode = (activeMode) => {
        ////console.log("current active mode " + this.state.activeMode);

        this.setState({
           ...this.state,
            activeMode: activeMode
        }, () => {
            ////console.log("updated active mode " + this.state.activeMode);
        });

    };

    onClick = (e) => {
         this.state.images.map( (image) => {
             if (image.clickable && image.name === this.state.activeMode)
                this.props.onClickHandler(this.state.activeMode);
                e.stopPropagation();
         });
    };

    render () {
        let images = this.state.images.map((image, index) => {
            if (image.name === this.state.activeMode && this.state.imagesReady)
                return <LSTVButton
                    clickHandler={ this.onClick }
                    key={ index }
                    image={ image.image }
                    width={ image.width }
                    height={ image.height }
					minHeight={ "auto" }
                    clickable={ image.clickable }
                    sidePadding={ 0 }
                    sideMargins={ "5px" }
                    showBackground={ image.showBackground }
                    showHoverBackground={ image.showHoverBackground }
                    hoverBackgroundColor={ image.hoverBackgroundColor }
                    backgroundColor={ image.backgroundColor }
                    buttonDownBackgroundColor ={ LSTVGlobals.BUTTON_DOWN_COLOR_PURPLE }
                    animated ={ this.props.animated }
                />
         });

        return (
            <div>
                {images}
            </div>
        );
    }
}

export default StateImage;