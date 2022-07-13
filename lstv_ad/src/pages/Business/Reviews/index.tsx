import React, { useContext } from 'react';
import { Box } from '@material-ui/core';

import ReviewTable from './ReviewTable';
import RegularButton from 'components/CustomBtns/Button';
import { ModalContext } from 'contexts/ModalContext';
import ReviewDetailsModal from './ReviewDetailsModal';

interface Props {
    slug: string;
}

const Reviews: React.FC<Props> = ({ slug }: Props) => {
    const { showModal } = useContext(ModalContext);

    const handleAddClick = () => {
        showModal({
            header: `Add a new review`,
            content: <ReviewDetailsModal title="" content="" rating={0} mode="add" businessSlug={slug} reviewId="" />,
        });
    };

    return (
        <Box>
            <Box mt="30px" textAlign="right">
                <RegularButton className="round_btn" onClick={handleAddClick}>
                    Add
                </RegularButton>
            </Box>
            <ReviewTable businessSlug={slug} />
        </Box>
    );
};

export default Reviews;
