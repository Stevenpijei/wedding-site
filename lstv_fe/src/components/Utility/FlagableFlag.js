import React from 'react';
import { ReportIcon } from './LSTVSVG';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useAuthService } from '../../rest-api/hooks/useAuthService';
import { useModals } from '../../global/use-modals';

const FlagContainer = styled.div`
    display: flex;
    justify-content: center;
    width: ${(props) => (props.width ? props.width : 'unset')};
`;

const FlagSvgStyle = styled(ReportIcon)`
    width: 100%;
    height: 100%;
    cursor: pointer;
`;



const FlagableFlag = ({  options, title, width, style, onFlag }) => {
    const { loggedIn } = useAuthService();
    const { openLoginModal, openFlagModal } = useModals();
    
   
    const handleClick = () => {
        if (!loggedIn) {
            openLoginModal()
            return;
        }
        openFlagModal({options, title, onFlag})
    };

    return (
        <FlagContainer onClick={handleClick} style={{ ...style }} width={width}>
            <FlagSvgStyle />
        </FlagContainer>
    );
};

FlagableFlag.propTypes = {
    onFlag: PropTypes.func.isRequired,
    // optional array of flag values and labels
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.string,
        }).isRequired
    ),
    // optional title for popup modal
    title: PropTypes.string,
    width: PropTypes.string,
    style: PropTypes.object,
};

FlagableFlag.defaultProps = {
    title: "Report Comment",
    options: [
        { value: 'spam', label: 'Unwanted commercial content or spam' },
        { value: 'porn', label: 'Pornography or sexually explicit material' },
        { value: 'childAbuse', label: 'Child abuse' },
        { value: 'hateViolence', label: 'Hate speech or graphic violence' },
        { value: 'harrass', label: 'Harassment or bullying' },
    ]
};

export default FlagableFlag;
