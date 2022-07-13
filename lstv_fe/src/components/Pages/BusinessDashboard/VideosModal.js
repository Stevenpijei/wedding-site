import React, { useState } from 'react'
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { UserDevice } from '../../../global/globals';
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';
import Modal from '../../../newComponents/Modal';
import { RadioButtonGroup, RadioButton } from '../../../newComponents/buttons/BaseRadioButton';
import { useBusinessService } from '../../../rest-api/hooks/useBusinessService';

const STATUS = [
    {label: "Unlisted", value: "unlisted", desc: "Anyone with the link can watch your video but it will not appear on your business page"},
    {label: "Public", value: "public", desc: "Everyone can watch your video and it will appear on your business page"}
]

const StyledModal = styled(Modal)``;

const ModalChildrenContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100% - 70px);
    justify-content: center;

    @media ${UserDevice.tablet} {
        padding-top: 40px;
    }
`;
const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
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


/**
 * Modal that just provides editing visibility or deleting
 */
export const VideosModal = ({isVideoModalOpen, onModalClose, videoId, modalType, values, setValues, onSubmit}) => {
    const { patchBusinessVideoStatus } = useBusinessService();
    
    const [reportSubmitted, setReportSubmitted] = useState(false);

    const ModalStyles = {
        width: modalType === 'delete' ? '350px' : '80%',
        height: 'unset',
        borderRadius: '10px',
        maxHeight: '500px',
        maxWidth: '700px',
        flexDirection: 'column',
    };

    const renderModalContent = () => {
        switch (modalType) {
            case "statusChange":
                return  <StatusContent values={values} setValues={setValues} />
            case "delete":
                return  <p>Do you want to permanetly delete this video file and its associated data?</p>
        }
    }
    const renderTitle = () => {
        switch (modalType) {
            case "statusChange":
                return "Visibility"
            case "delete":
                return "Delete Video File"
        }
    }

    const handleSaveClick = () => {
        switch (modalType) {
            case "statusChange":
                onSubmit(values)
                break;
            case "delete":
                onSubmit(values)
        }
        setReportSubmitted(true);
        setTimeout(() => {
            onModalClose();
            setReportSubmitted(false);
        }, 2000);
    }

    return (
        isVideoModalOpen ? (
            <StyledModal
                open={isVideoModalOpen}
                onClose={onModalClose}
                showCloseButton={true}
                bigCloseButton={false}
                fullHeight
                customStyles={{ content: ModalStyles }}
                title={renderTitle()}
            >
                <ModalChildrenContainer>
                    {!reportSubmitted ? (
                        <>
                            {/* <CardTitle>{title}</CardTitle> */}
                            {renderModalContent()}
                            <CardFooter>
                                <OutlinedCTAButton short width={'150px'} onClick={onModalClose}>
                                    Cancel
                                </OutlinedCTAButton>
                                <OutlinedCTAButton
                                    short
                                    width={'150px'}
                                    className="filled"
                                    onClick={handleSaveClick}
                                >
                                    {modalType === "delete" ? "Delete" : "Save"}
                                </OutlinedCTAButton>
                            </CardFooter>
                        </>
                    ) : (
                        <SuccessMessage>
                            <p>Saved</p>
                            <OutlinedCTAButton short width={'40%'} onClick={onModalClose}>
                                Close
                            </OutlinedCTAButton>
                        </SuccessMessage>
                    )}
                </ModalChildrenContainer>
            </StyledModal>
    ): null
    )
}

VideosModal.propTypes = {
    isVideoModalOpen: PropTypes.bool,
    onModalClose: PropTypes.func,
    videoId: PropTypes.string,
    modalType: PropTypes.oneOf(["statusChange", "delete"]),
    initialValues: PropTypes.object
};

VideosModal.defaultProps = {
    
};

const Wrapper = styled.div`
    background: ${props => props.theme.lightGrey} ;
    border: 1px solid ${props => props.theme.midGrey} ;
    border-radius: 10px;
    padding: 25px 15px;
    margin: 0px 20px;
`;

export const StatusContent = ({values, setValues}) => {

    return (
        <Wrapper>
        <RadioButtonGroup name="radio1">
            {STATUS.map((option) => (
                <RadioButton
                    key={option.value}
                    groupValue={values.status}
                    value={option.value}
                    handleChange={(arg) => setValues({status: arg})}
                    labelName={option.label}
                    labelDesc={option.desc}
                />
            ))}
        </RadioButtonGroup>
        </Wrapper>
    )
}
