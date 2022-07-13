import React from 'react';
import PropTypes from 'prop-types'
import styled from 'styled-components'
import theme from '../../../styledComponentsTheme';
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';
import BaseCTAButton from '../../../newComponents/buttons/BaseCtaButton';
import UpgradeBanner from './BusinessInfo/UpgradeBanner';

export const Container = styled.div`
    * {
        box-sizing: border-box;
    }

    position: relative;
    height: 100%;
    padding: 0 100px 0 75px;
`;

export const CancelButton = styled(OutlinedCTAButton)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 152px;
    height: 45px;
    margin: 0 32px 0 0;
`;

export const SaveButtonStyle = {
    width: 152,
    height: 45
}

export const HeaderContainer = styled.div`
    position: sticky;
    top: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${theme.white};
    width: 100%;
    padding: 50px 0px 10px 0px;
    z-index: 1;
`;

const ButtonsContainer = styled.div`
    display: flex;
    position: relative;
`

export const FormSubmitButtons = ({ isSubmitting }) => {
    return (        
        <ButtonsContainer>
            <BaseCTAButton
                style={SaveButtonStyle}
                title='Save'
                center
                hideIcon
                size='medium'
                type='submit'
                disabled={isSubmitting}
            />
            </ButtonsContainer>
    );
};

export const FormSection = styled.div`
    border-top: 1px solid ${theme.midGrey};
    padding: 16px 0 32px 0;
    position: relative;
    filter:  ${props => props.showContent ? 'opacity(1)': 'opacity(0.5)'};
`;

const Viel = styled.div`
    display: ${props => props.showContent ? 'none': 'block'};
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
`;


export const FormSectionVieled = ({showContent=true, upgradeMessage, children}) => {
    return (
        <>
        <FormSection showContent={showContent}>
            {children}
            <Viel showContent={showContent}/>          
        </FormSection>
        {!showContent && <UpgradeBanner message={upgradeMessage} />}
        </>
    )
}

FormSectionVieled.defaultProps = {
    showContent: true,
	upgradeMessage: "Upgrade your account to access this feature"
};

FormSectionVieled.propTypes = {
    showContent: PropTypes.bool,
    upgradeMessage: PropTypes.string,
    children: PropTypes.element
};

export const FormContent = styled.div`
    margin: 40px 0 0 0;
    display: grid;
    grid-template-columns: minmax(0, 0.4fr) minmax(0, 0.6fr);
    grid-gap: 32px;
    padding: 0 0px 0 0;
`;

export const FormTitle = styled.h4`
    margin-top: 16px;
    font-weight: 800;
    font-size: 2em;
    font-family: 'Heldane Display', serif;
    z-index: 2;
    width: fit-content;
`;

export const FormSubtitle = styled.p`
    font-size: 18px;
    margin-top: 6px;
    margin-bottom: 10px;
    max-width: 460px;
`;

export const Input = styled.input`
    outline: none;
    height: 44px;
    border-radius: 10px;
    padding: 0 16px;
    background: ${theme.lightGrey};
    border: 1px solid ${theme.midGrey};

    &::placeholder {
        color: ${theme.black};
    }
`;

export const ErrorMessage = styled.p`
    color: ${(props) => props.theme.red};
    font-size: 0.8125rem;
    line-height: ${(props) => (props?.numItems > 1 ? '1rem' : '1.2rem')};
    margin-left: 5px;
    text-align: left;
`;

export const Textarea = styled.textarea`
    border-radius: 10px;
    outline: none;
    background: ${theme.lightGrey};
    border: 1px solid ${theme.midGrey};
    padding: 16px;
    min-height: 100px;
`;

export const Label = styled.label`
    margin: 0 0 10px 0;
    font-family: Calibre;
    font-weight: 600;
`

export const FormControl = styled.div`
    display: flex;
    flex-direction: column;
`



