import React from 'react'
import ModalContainer from '../components/Utility/ModalContainer';
import ShareContentForm from '../components/Utility/ShareContentForm';
import { useSelector, useDispatch } from 'react-redux';
import * as ActionTypes from '../store/actions';
import Modal from './Modal';

const ShareModal = () => {
    const {showShareModal, shareInfo} = useSelector((state) => state.volatile)
    const dispatch = useDispatch();
    
    const onShareClosed = () => {
        dispatch({ type: ActionTypes.ACTION_HIDE_SHARE_MODAL, data: {},});
    };
    
    return (
         <Modal
            // fullHeight
            height={'fit-content'}
            width={'95vw'}
            // bigCloseButton
            // id={id}
            open={showShareModal}
            onClose={() =>  onShareClosed()}
            data-scroll-lock-scrollable
            title={shareInfo?.shareOptions?.title}
            customStyles={{content: {overflow: "unset", maxWidth: '650px', margin: 'auto'}, container: {}}}
        >  
        <ShareContentForm shareInfo={shareInfo} />
    </Modal>
    )
}

export default ShareModal
