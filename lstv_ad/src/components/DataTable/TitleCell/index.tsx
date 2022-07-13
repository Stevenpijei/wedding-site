import React from 'react';
import Box from '@material-ui/core/Box';

import { IMG_PLACEHOLDER } from 'config/constants';
import './styles.scss';

interface Props {
    title: React.ReactNode;
    thumbnailUrl: string;
    onClick?: () => void;
}

const TitleCell: React.FC<Props> = ({ title, thumbnailUrl, onClick }: Props) => {
    const addDefaultSrc = (ev: React.SyntheticEvent<HTMLImageElement>) => {
        ev.currentTarget.src = IMG_PLACEHOLDER;
    };

    const _title = title || 'No Title';

    return (
        <Box display="flex" alignItems="center" justifyContent="flex-start" height="100%" className="title_cell">
            <div className="img-wrapper">
                <img
                    src={(thumbnailUrl && thumbnailUrl.replace('-orig', '-mbl')) || IMG_PLACEHOLDER}
                    onError={addDefaultSrc}
                />
            </div>
            <p style={{ marginBottom: 0, cursor: onClick ? 'pointer' : 'auto' }} onClick={onClick}>
                {_title}
            </p>
        </Box>
    );
};

export default TitleCell;
