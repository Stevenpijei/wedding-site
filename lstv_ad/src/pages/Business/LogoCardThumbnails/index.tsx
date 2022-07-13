import React, { useContext, useEffect, useState } from 'react';
import { QueryObserverResult, RefetchOptions } from 'react-query';
import { Box, Grid } from '@material-ui/core';
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback';

import { IBusiness, IBusinessResponse, IError, IVideoAdmin } from 'interface';
import Dropzone, { IDropType } from '../Dropzone';
import RegularButton from 'components/CustomBtns/Button';
import { useFileUpload } from 'service/hooks/upload';
import { useUpdateBusinessGeneralInfo } from 'service/hooks/business';
import SingleSelect from 'components/SingleSelect';
import { useListVideos } from 'service/hooks/video';
import './styles.scss';
import { ToastContext } from 'contexts/ToastContext';

interface Props {
    data: IBusiness;
    fetchBusiness: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IBusinessResponse, IError>>;
}

const LogoCardThumbnails: React.FC<Props> = ({ data, fetchBusiness }: Props) => {
    const { showToast } = useContext(ToastContext);
    const [profileImage, setProfileImage] = useState<File>();
    const [thumbnailImage, setThumbnailImage] = useState<File>();
    const [video, setVideo] = useState<IVideoAdmin | null>(null);
    const [videoSearchKeyword, setVideoSearchKeyword] = useState<string>('');
    const { requestFileUpload, loading: uploading } = useFileUpload();
    const { mutateAsync: requestUpdateBusinessGeneralInfo, isLoading: updating } = useUpdateBusinessGeneralInfo();
    const { data: videoSearchResponse, isLoading: isVideoSearching, refetch: fetchVideos } = useListVideos(
        {
            offset: 0,
            size: 5,
            content_sort_method: 'most_recent',
            verbosity: 'admin_list',
            title: videoSearchKeyword,
        },
        { enabled: false }
    );

    useEffect(() => {
        if (videoSearchKeyword) fetchVideos();
    }, [videoSearchKeyword]);

    const debounced = useDebouncedCallback((text: string) => {
        setVideoSearchKeyword(text);
    }, 800);

    const handleVideoSearchChange = (event: React.ChangeEvent<any>, value: string) => {
        debounced(value);
    };

    const handleUpload = async (file: File, type?: IDropType) => {
        if (type === 'card') {
            setVideoSearchKeyword('');
            setVideo(null);
            setThumbnailImage(file);
        } else if (type === 'logo') setProfileImage(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const patchData: { [key: string]: any } = {};

        if (profileImage) {
            try {
                const response = await requestFileUpload(profileImage);
                patchData['profile_image_url'] = response;
            } catch (e) {
                showToast({
                    type: 'error',
                    message: e.message,
                });
            }
        }

        if (video && video.thumbnail_url) {
            // if there is a video selected, let's use video thumbnail url as a updated url
            patchData['card_thumbnail_url'] = video.thumbnail_url;
        } else {
            // if there is no video selected, let's use uploaded file url
            if (thumbnailImage) {
                try {
                    const response = await requestFileUpload(thumbnailImage);
                    patchData['card_thumbnail_url'] = response;
                } catch (e) {
                    showToast({
                        type: 'error',
                        message: e.message,
                    });
                }
            }
        }

        if (Object.keys(patchData).length > 0) {
            try {
                await requestUpdateBusinessGeneralInfo({
                    businessId: data.id,
                    ...patchData,
                });
                await fetchBusiness();
                showToast({
                    type: 'success',
                    message: 'Successfully updated images',
                });
            } catch (e) {
                showToast({
                    type: 'error',
                    message: e.message,
                });
            }
        } else {
            showToast({
                type: 'info',
                message: 'Nothing to updates',
            });
        }
    };

    const previewProfile = (!!profileImage && URL.createObjectURL(profileImage)) || data.profile_image;
    const previewCard =
        video?.thumbnail_url || (!!thumbnailImage && URL.createObjectURL(thumbnailImage)) || data.card_thumbnail_url;

    const VIDEO_OPTION_LIST: IVideoAdmin[] = (videoSearchResponse && videoSearchResponse.result) || [];

    return (
        <Grid container spacing={6} className="logo_card_thumbnails" component="form" onSubmit={handleSubmit}>
            <Grid item xs={12} style={{ textAlign: 'right', paddingBottom: '0px' }}>
                <RegularButton
                    className="round_btn"
                    type="submit"
                    disabled={uploading || updating}
                    loading={uploading || updating}
                >
                    Save
                </RegularButton>
            </Grid>
            <Grid item xs={12} md={6} className="upload_card" style={{ alignItems: 'flex-end' }}>
                <Box maxWidth="400px" flexGrow="1" display="flex" flexDirection="column" width="100%">
                    <p>Logo Image</p>
                    <Box className="upload_card-content">
                        <Dropzone handleUpload={handleUpload} type="logo" />
                        {previewProfile && <img src={previewProfile} alt="Profile Image" />}
                        {!previewProfile && <div className="no_image">No Logo Image</div>}
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12} md={6} className="upload_card">
                <Box maxWidth="400px" flexGrow="1" display="flex" flexDirection="column">
                    <p>Card Thumbnail Image</p>
                    <Box className="upload_card-content">
                        <Dropzone handleUpload={handleUpload} type="card" />
                        <p>or</p>
                        <p>select a video and use its card thumbnail as the card thumbnail for the business</p>
                        <SingleSelect<IVideoAdmin>
                            loading={isVideoSearching}
                            title="Video title search"
                            value={VIDEO_OPTION_LIST.length === 0 ? null : video}
                            setValue={setVideo}
                            list={VIDEO_OPTION_LIST}
                            properties={{
                                name: 'title',
                                slug: 'slug',
                            }}
                            onChange={handleVideoSearchChange}
                            style={{ width: '100%', minWidth: 'auto' }}
                        />

                        {previewCard && <img src={previewCard} alt="Card Image" />}
                        {!previewCard && <div className="no_image">No Card Image</div>}
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default LogoCardThumbnails;
