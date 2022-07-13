

import React from "react";
import {Bling as GPT} from "react-gpt";
import styled from "styled-components";
import * as LSTVGlobals from "../../../global/globals";
import MediaQuery from "react-responsive";


const AdBannerStyle = styled.div`
    display: block;
    text-align: center;
    font-size: 1.5rem;
    margin: 5px auto 0 auto;
    height: ${props => props.height}px;
    width: ${props => props.width}px;
    max-width: 100vw;
`;

const AdBannerStyleDev = styled(AdBannerStyle)`
    border: 1px dashed ${LSTVGlobals.DISABLED_FRAME_TEXT};
    //background: ${LSTVGlobals.DIAGONAL_BACKGROUND};
    p {
    	color: ${LSTVGlobals.DISABLED_FRAME_TEXT};
    }
 `;

const AdContainer = styled.div`
	@media ${LSTVGlobals.UserDevice.laptop} {
		margin-bottom: 10px;
	}
`;

class GoogleAd extends React.Component {

	render () {

		return (
			<AdContainer className='ad'>
				{
					(LSTVGlobals.IS_DEV())
						?
						<div>
							<AdBannerStyleDev width={this.props.width} height={this.props.height} >
								<LSTVGlobals.VCenteredParagraph>
									[ {this.props.width}x{this.props.height} Google Ad]
								</LSTVGlobals.VCenteredParagraph>
							</AdBannerStyleDev>
						</div>
						:
						<div>
							<AdBannerStyle width={this.props.width} height={this.props.height}>
								<GPT adUnitPath={this.props.adUnitPath} slotSize={[this.props.width, this.props.height]} />
							</AdBannerStyle>
						</div>
				}
			</AdContainer>
		);
	}
}

export default GoogleAd;