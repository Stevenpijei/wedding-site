import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, IconButton } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import './styles.scss';

interface Props {
    multiple?: boolean;
    accept?: string | string[];
    onUpload: (files: File[]) => Promise<void> | void;
}

const defaultProps: Props = {
    multiple: false,
    accept: 'image/*',
    onUpload: () => {},
};

const FileUpload: React.FC<Props> = ({ multiple, accept, onUpload }: Props) => {
    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.length && onUpload(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept, multiple });

    return (
        <Box {...getRootProps()} className="drop_zone" flexGrow="1">
            <input {...getInputProps()} />
            <p>Drag/Drop photos to upload here</p>
            <span>or</span>
            <IconButton>
                <CloudUploadIcon />
            </IconButton>
            <p>Select photos to upload</p>
        </Box>
    );
};

FileUpload.defaultProps = defaultProps;

export default FileUpload;
