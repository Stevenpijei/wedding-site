import React from 'react'
import styled from "styled-components";
import {
    EmailShareButton,
    FacebookShareButton,
    PinterestShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    FacebookMessengerShareButton,   
  } from "react-share";
import { TwitterIcon, FacebookIcon, MailIcon, WhatsAppIcon, FacebookMessengerIcon, PinterestIcon, HTMLIcon } from './LSTVSVG';
import { useSelector } from 'react-redux';
import { UserDevice } from '../../global/globals';


const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-around;
    padding: 20px 0px;
    max-width: 400px;
    margin: auto;
    @media ${UserDevice.isWithinTablet} {
        flex-wrap: wrap;
        button {
            flex-basis: 25%;
            margin-bottom: 20px
        }
    }
`;


const ButtonCircle = styled.div`
    border: 2px solid black;
    margin: auto;
    border-radius: 100%;
    width: 35px;
    height: 35px;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
`;

const HTMLShareButton = styled.button`
    background-color: unset;
`


const SocialMediaButtonsBar = ({ fullUrl, onShowHTML }) => {
    const {shareInfo: { shareThumbnailUrl }} = useSelector((state) => state.volatile)

    return (
        <ButtonContainer>
            <PinterestShareButton url={fullUrl} media={shareThumbnailUrl}>
                <ButtonCircle>
                    <PinterestIcon width={40}  strokeColor='none' />
                </ButtonCircle>
            </PinterestShareButton>
            <FacebookShareButton url={fullUrl} >
                <ButtonCircle>
                    <FacebookIcon width={40}/>
                </ButtonCircle>
            </FacebookShareButton>
            <FacebookMessengerShareButton url={fullUrl}  appId={undefined}>
                <ButtonCircle>
                    <FacebookMessengerIcon width={40}/>
                </ButtonCircle>
            </FacebookMessengerShareButton>
            <TwitterShareButton url={fullUrl} >
                <ButtonCircle>
                    <TwitterIcon width={40}/>
                </ButtonCircle>
            </TwitterShareButton>
            <WhatsappShareButton url={fullUrl} >
                <ButtonCircle>
                    <WhatsAppIcon width={40}/>
                </ButtonCircle>
            </WhatsappShareButton>
            <EmailShareButton url={fullUrl} >
                <ButtonCircle>
                    <MailIcon width={40}/>
                </ButtonCircle>
            </EmailShareButton>
        </ButtonContainer>
    )
}

export default SocialMediaButtonsBar
