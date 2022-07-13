

import React from "react";


class ImagesComponent extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			imagesReady: false
		};

	}

	onImagesReady = () => {
		throw new Error("Method 'onImagesReady()' must be implemented.");
	};

	setImages = (images) => {

		this.setState ( {
			images: images.map(image => ({
				...image,
				loaded: false,
			})),
			numReady: 0,
			imagesReady: false
		}, () => {
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
							}, () => {
								this.onImagesReady();
							});

						}
					});
				};
				primaryImage.src = src;
			});
		});
	};

}

export default ImagesComponent;