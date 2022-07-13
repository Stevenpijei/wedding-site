import React, { CSSProperties, useState } from 'react'
import Dropzone from 'react-dropzone';
import styled from 'styled-components'
import Badge from '../Badge';
import BaseCtaButton from '/newComponents/buttons/BaseCtaButton'

const Container = styled.div`
  border-radius: 10px;
  background-color: ${props => props.theme.lightGrey};
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%239B9B9BFF' stroke-width='3' stroke-dasharray='4%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
  /* border: 1px dashed ${props => props.theme.lightGrey}; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 462px;
  height: 275px;
`

type Props = {
  /**
   * ex.: image/*, video/*
   */
  accept?: string,
  multiple?: boolean,
  containerStyle?: CSSProperties,
  /**
   * If uploading an image, show image in the dropzone. 
   * If used w multiple, shows just first image.
   */
  previewImage?: boolean,
  /**
   * Initial image URL
   */
  value?: string,
  onDrop: (acceptedFiles: File[]) => Promise<void>
}

/**
 * Generic DropZone component for uploading any file type
 */
const FileUpload = ({ value, accept, multiple, onDrop, previewImage, containerStyle }: Props) => {
  const [files, setFiles] = useState<{ preview: string }[]>()

  let previewUrl
  if(files?.length > 0) {
    previewUrl = files[0].preview
  } else if(value) {
    previewUrl = value
  }

  containerStyle = {
    ...containerStyle,
    position: 'relative',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundImage: previewImage && !!previewUrl && `url(${previewUrl})`
  }

  const Button = ({ title }: { title: string }) => 
    <BaseCtaButton
      size='medium'
      type='button'
      title={title}
      icon={<Badge id='upload' />}
    />

  return (
    <Dropzone
      accept={accept}
      multiple={multiple}
      onDrop={files => {
        setFiles(files.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        })))
        onDrop(files)
      }}
    >
      {
        ({ getRootProps, getInputProps }) => 
          <Container {...getRootProps()} style={containerStyle}>
            <input {...getInputProps()} />
            { previewUrl ?
              <div style={{ position: 'absolute', bottom: 20, right: 20 }}>
                <Button title='Reupload File' />
              </div> : 
              <>
                <h5 style={{ marginBottom: 20 }}>
                  Drag and drop to upload
                </h5>
                <Button title='Select File' />
              </>
            }
          </Container>
      }
    </Dropzone>
  )
}

export default FileUpload