import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, IconButton } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import './styles.scss';

export type IDropType = 'logo' | 'card';

interface Props {
    handleUpload: (file: File, type?: IDropType) => Promise<void> | void;
    type?: IDropType;
}

const Dropzone: React.FC<Props> = ({ handleUpload, type }: Props) => {
    const onDrop = useCallback((acceptedFiles) => {
        handleUpload(acceptedFiles[0], type);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*', multiple: false });

    return (
        <Box {...getRootProps()} className="drop_zone" flexGrow="1">
            <input {...getInputProps()} />
            <IconButton>
                <CloudUploadIcon />
            </IconButton>
            <p>Select an Image File</p>
        </Box>
    );
};

export default Dropzone;
