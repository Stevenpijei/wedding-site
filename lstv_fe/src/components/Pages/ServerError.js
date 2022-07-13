
import React from "react";
import * as LSTVGlobals from "../../global/globals";
import BrokenHeart from '../../images/broken-heart.svg';

class ServerErrorPage extends React.Component {
	render() {

		const style = {
			...LSTVGlobals.STYLE_V_CENTER,
			...LSTVGlobals.STYLE_ROUND_CORNERS,
			width: "90%",
			margin: "0 auto",
			textAlign: "center",
			fontSize: "2rem",
			font: LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
			lineHeight: "2rem",
		};

		const textStyle = {
			color: LSTVGlobals.WHITE,
			fontSize: "1.5rem"
		};

		const paragraphStyle = {
			color: LSTVGlobals.BUTTON_DOWN_COLOR_PURPLE,
		};

		const hrefStyle = {
			color: LSTVGlobals.BUTTON_DOWN_COLOR_PURPLE
		};

		const notFoundContainer = {
			position: "fixed",
			background: LSTVGlobals.LSTV_ERROR_PAGE_500_GRADIENT,
			width: "100%",
			height: "100%",
		};

		return (
			<div style={notFoundContainer}>
				<div style={style}>
					<p style={paragraphStyle}>Something Unexpected Went Wrong.<br/><br/><span style={textStyle}>Are you connected to the internet? If so, please try again in a few minutes or click <a style={hrefStyle} href="/">here</a> for the home page.</span></p>
					<div style={{marginTop:"50px"}}>
						<img height="50px" alt="lstv-logo" src={BrokenHeart}/>
					</div>
				</div>
			</div>
		);
	}
}

export default ServerErrorPage;

