import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Input } from "../../newComponents/forms/StyledForm";
import { OutlinedCTAButton } from "../../newComponents/common/OutlinedCTALink";

const InputContainer = styled.div`
    position: relative;
`;

const StyledInput = styled(Input)`
    padding: 15px 50px 15px 16px;
    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
`;

const CopyButton = styled(OutlinedCTAButton)`
    position: absolute;
    top: 0;
    right: 0;
    font-family: Calibre;
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
`;

const URLShareBar = ({ fullUrl }) => {
    const [url, setUrl] = useState(fullUrl);
    const [urlCopied, setUrlCopied] = useState(false);
    
    useEffect(() => {
        setUrl(fullUrl)
        
    }, [fullUrl])


    const onCopy = (text, success) => {
        setUrlCopied(true);

        setTimeout(() => {
            setUrlCopied(false);
        }, 3000)
    };
    return (
        <>
        <InputContainer>
            <StyledInput value={url} disabled/>
            <CopyToClipboard onCopy={onCopy} text={url}>
                <CopyButton className='filled' width={'30%'}>
                    {urlCopied ? "Copied" : "Copy"}
                </CopyButton> 
            </CopyToClipboard>
        </InputContainer>
        </>
    );
}


URLShareBar.defaultProps = {
    fullUrl: null,
};


export default URLShareBar;

