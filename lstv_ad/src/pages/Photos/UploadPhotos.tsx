import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Box } from '@material-ui/core';
import { useDebouncedCallback } from 'use-debounce';

import { ToastContext } from 'contexts/ToastContext';

import RegularButton from 'components/CustomBtns/Button';
import FileUpload from 'components/FileUpload';
import SingleSelect from 'components/SingleSelect';

import { IMG_EXTENSIONS } from 'config/constants';

import { IBusinessAdmin, IBusinessVendor, IVideoAdmin, IVideoWeddingTeam } from 'interface';

import { useAllBusinesses } from 'service/hooks/business';
import { useUploadWeddingPhotos } from 'service/hooks/photo';
import { useListVideos, useVideo } from 'service/hooks/video';
import { useFileUpload } from 'service/hooks/upload';

import helpers from 'utils/helpers';

interface UploadPhotosProps {
    onClose: () => void;
}

const UploadPhotos: React.FC<UploadPhotosProps> = ({ onClose }: UploadPhotosProps) => {
    const [videoSearch, setVideoSearch] = useState<string>('');
    const [photographerSearch, setPhotographerSearch] = useState<string>('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [photographers, setPhotographers] = useState<IVideoWeddingTeam[] | IBusinessAdmin[] | IBusinessVendor[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<IVideoAdmin | null>(null);
    const [selectedPhotographer, setSelectedPhotographer] = useState<
        IVideoWeddingTeam | IBusinessAdmin | IBusinessVendor | null
    >(null);
    const [isLoading, setLoading] = useState<boolean>(false);
    const { data, isLoading: isVideoLoading, refetch: fetchVideos } = useListVideos(
        {
            content_sort_method: 'most_recent',
            verbosity: 'admin_list',
            title: videoSearch,
            offset: 0,
            size: 20,
        },
        { enabled: false }
    );
    const { data: videoInfo, isLoading: isVideoInfoLoading, refetch: fetchVideoInfo } = useVideo(
        selectedVideo?.slug || '',
        {
            enabled: false,
        }
    );
    const { data: photographersInfo, isLoading: isBusinessLoading, refetch: fetchPhotographers } = useAllBusinesses(
        {
            offset: 0,
            size: 20,
            verbosity: 'admin_list',
            search_term: photographerSearch,
            roles: 'photographer',
        },
        {
            enabled: false,
        }
    );
    const { requestFileUpload, loading: isUploading } = useFileUpload();
    const { mutateAsync: requestUploadPhotos } = useUploadWeddingPhotos();
    const { showToast } = useContext(ToastContext);

    const videos = useMemo(() => {
        return data?.result || [];
    }, [data]);

    useEffect(() => {
        if (!videoSearch) return;
        debounceSearch();
    }, [videoSearch]);

    useEffect(() => {
        if (!photographerSearch) return;
        debouncePhotographerSearch();
    }, [photographerSearch]);

    useEffect(() => {
        if (!selectedVideo) return;
        fetchVideoInfo();
    }, [selectedVideo]);

    useEffect(() => {
        if (!videoInfo) {
            setPhotographers([]);
            setSelectedPhotographer(null);
        } else {
            const temp = videoInfo.result.businesses.filter((business) => business.role_name === 'Photographer');
            setSelectedPhotographer(temp[0]);
            setPhotographers(temp);
        }
    }, [videoInfo]);

    useEffect(() => {
        if (photographersInfo?.result) {
            setPhotographers(photographersInfo?.result || []);
            setSelectedPhotographer(null);
        }
    }, [photographersInfo]);

    const debounceSearch = useDebouncedCallback(() => {
        fetchVideos();
    }, 300);

    const debouncePhotographerSearch = useDebouncedCallback(() => {
        fetchPhotographers();
    }, 300);

    const handlePhotoSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e) setPhotographerSearch(e.target.value);
    };

    const handleUpload = (files: File[]) => {
        setPhotos((prevPhotos) => [...prevPhotos, ...files]);
    };

    const handleSubmit = async () => {
        if (!selectedVideo) {
            showToast({
                type: 'info',
                message: 'Video is mandatory',
            });
            return;
        }
        if (!selectedPhotographer) {
            showToast({
                type: 'info',
                message: 'Photographer is mandatory',
            });
            return;
        }
        if (!photos.length) {
            showToast({
                type: 'info',
                message: 'Photos are mandatory',
            });
            return;
        }

        try {
            const photoPromises = photos.map((photo) => requestFileUpload(photo));
            const downloadUrls = await Promise.all(photoPromises);

            const payload = {
                video_id: selectedVideo.id,
                business_slug: selectedPhotographer.slug,
                photos: downloadUrls,
            };
            setLoading(true);
            await requestUploadPhotos(payload);
            setLoading(false);
            showToast({
                type: 'success',
                message: 'Successfully uploaded photos',
            });
            onClose();
        } catch (e) {
            setLoading(false);
            showToast({
                type: 'error',
                message: e.message,
            });
        }
    };

    return (
        <Box py="20px" maxHeight="800px" minWidth="550px">
            <Box textAlign="right">
                <RegularButton
                    className="round_btn"
                    disabled={isUploading || isLoading || isBusinessLoading}
                    onClick={handleSubmit}
                >
                    Save
                </RegularButton>
            </Box>
            <Box mb="20px">
                <SingleSelect<IVideoAdmin>
                    properties={{ slug: 'slug', name: 'title' }}
                    style={{ minWidth: 'unset', marginBottom: 20 }}
                    title="Video Page"
                    loading={isVideoLoading}
                    list={videos}
                    value={selectedVideo}
                    onChange={(e) => setVideoSearch(e.target.value)}
                    setValue={(value) => setSelectedVideo(value)}
                />
                <SingleSelect<IVideoWeddingTeam | IBusinessAdmin | IBusinessVendor>
                    properties={{ slug: 'slug', name: 'name' }}
                    style={{ minWidth: 'unset' }}
                    title="Photographer"
                    disabled={!selectedVideo}
                    loading={isVideoLoading || isVideoInfoLoading}
                    list={photographers}
                    value={selectedPhotographer}
                    onChange={handlePhotoSearchChange}
                    setValue={(value) => setSelectedPhotographer(value)}
                />
            </Box>
            <Box maxWidth="400px" margin="25px auto">
                <FileUpload multiple accept={IMG_EXTENSIONS} onUpload={handleUpload} />
            </Box>
            {!!photos.length && (
                <Box textAlign="center" fontWeight="bold" color="green">
                    {photos.length} {helpers.getSinglarOrPlural('photo', photos.length)} uploaded. You can upload more
                    photos for this video
                    <br /> or click Save to finish
                </Box>
            )}
        </Box>
    );
};

export default UploadPhotos;
