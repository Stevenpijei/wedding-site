import React, { useState } from 'react';
import { useModals } from '../global/use-modals';
import { UserDevice } from '../global/globals';
import styled from 'styled-components';
import Modal from './Modal';
import { RadioButton, RadioButtonGroup } from './buttons/BaseRadioButton';
import { OutlinedCTAButton } from './common/OutlinedCTALink';

const StyledModal = styled(Modal)``;

const ModalChildrenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100% - 70px);
    justify-content: center;
    padding-bottom: 50px;

    @media ${UserDevice.tablet} {
        padding-top: 50px;
    }
`;

const CardFooter = styled.div`
    display: flex;
    margin-top: 30px;
    & > button {
        margin-right: 8px;
    }
`;
const SuccessMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-content: center;
    & > p {
        font-size: 2rem;
        margin-bottom: 40px;
    }
`;

const ModalStyles = {
    width: '80%',
    height: 'unset',
    borderRadius: '10px',
    maxHeight: '500px',
    maxWidth: '500px',
    flexDirection: 'column',
};

const FlagModal = () => {
    const { isFlagModalOpen, closeFlagModal, flagModalParams } = useModals();

    const [radioValue, setRadioValue] = useState('');
    const [reportSubmitted, setReportSubmitted] = useState(false);


    const handleSubmit = () => {
        flagModalParams?.onFlag(radioValue);
        setReportSubmitted(true);
        setTimeout(() => closeFlagModal(), 2000);
    };

    return (
        isFlagModalOpen && (
            <StyledModal
                open={isFlagModalOpen}
                onClose={() => closeFlagModal()}
                showCloseButton={true}
                bigCloseButton={false}
                fullHeight
                customStyles={{ content: ModalStyles }}
                title={flagModalParams?.title}
            >
                <ModalChildrenContainer>
                    {!reportSubmitted ? (
                        <>
                            {/* <CardTitle>{title}</CardTitle> */}
                            <RadioButtonGroup name="radio1">
                                {flagModalParams?.options.map((option) => (
                                    <RadioButton
                                        key={option.value}
                                        groupValue={radioValue}
                                        value={option.value}
                                        handleChange={setRadioValue}
                                        labelName={option.label}
                                    />
                                ))}
                            </RadioButtonGroup>
                            <CardFooter>
                                <OutlinedCTAButton short width={'40%'} onClick={() => closeFlagModal()}>
                                    Cancel
                                </OutlinedCTAButton>
                                <OutlinedCTAButton
                                    short
                                    width={'40%'}
                                    className="filled"
                                    onClick={() => handleSubmit()}
                                >
                                    Report
                                </OutlinedCTAButton>
                            </CardFooter>
                        </>
                    ) : (
                        <SuccessMessage>
                            <p>Report Submitted</p>
                            <OutlinedCTAButton short width={'40%'} onClick={() => closeFlagModal()}>
                                Close
                            </OutlinedCTAButton>
                        </SuccessMessage>
                    )}
                </ModalChildrenContainer>
            </StyledModal>
        )
    );
};

export default FlagModal;
