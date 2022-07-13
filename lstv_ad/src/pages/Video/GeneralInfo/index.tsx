import React, { useState, useMemo, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { QueryObserverResult, RefetchOptions } from 'react-query';
import { Box, Grid, Switch, TextField } from '@material-ui/core';
import isEqual from 'lodash/isEqual';

import { ToastContext } from 'contexts/ToastContext';

import RegularButton from 'components/CustomBtns/Button';
import DateTimePicker from 'components/DateTimePicker';

import Dropzone from 'pages/Business/Dropzone';

import { useFileUpload } from 'service/hooks/upload';
import { useUpdateVideoGeneralInfo } from 'service/hooks/video';

import { IError, IVideo, IVideoGeneralInfoRequest, IVideoResponse } from 'interface';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AutoComplete = require('react-google-autocomplete');

interface Props {
    videoId: string;
    data: IVideo;
    onRefetchVideo: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IVideoResponse, IError>>;
}

interface IVideoInfoForm {
    isDraft: boolean;
    isVisible: boolean;
    spouseName1: string;
    spouseName2: string;
    eventDate: Date;
    eventLocation: string;
    description: string;
}

const GeneralInfo: React.FC<Props> = ({ videoId, data, onRefetchVideo }: Props) => {
    const { showToast } = useContext(ToastContext);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [location, setLocation] = useState<any>(data.location.display_name || '');
    const [thumbnail, setThumbnail] = useState<File>();

    const defaultFormData = useMemo(() => {
        setLocation(data.location.display_name || '');
        setThumbnail(undefined);
        return {
            isDraft: data.draft || false,
            isVisible: data.visibility === 'public',
            spouseName1: data.post_properties?.spouse_1 || '',
            spouseName2: data.post_properties?.spouse_2 || '',
            eventDate: new Date(data.event_date),
            description: data.content || '',
        };
    }, [data]);

    const thumbnailSrc = useMemo(() => {
        if (thumbnail) return URL.createObjectURL(thumbnail);
        return data.thumbnail || '';
    }, [thumbnail, data]);

    const { control, handleSubmit, register } = useForm<IVideoInfoForm>({
        defaultValues: defaultFormData,
    });
    const { requestFileUpload, loading: isUploading } = useFileUpload();
    const { mutateAsync: requestUpdateGeneralInfo } = useUpdateVideoGeneralInfo();

    const onSubmit = async (formData: IVideoInfoForm) => {
        if (!location) {
            showToast({
                type: 'info',
                message: 'Location is mandatory',
            });
            return;
        }
        const isLocationUpdated = typeof location === 'object';
        if (isEqual(formData, defaultFormData) && !thumbnail && !isLocationUpdated) {
            showToast({
                type: 'info',
                message: `You have nothing to update`,
            });
            return;
        }

        const payload: IVideoGeneralInfoRequest = {
            videoId,
            draft: formData.isDraft,
            visibility: formData.isVisible ? 'public' : 'unlisted',
            name_spouse_1: formData.spouseName1,
            name_spouse_2: formData.spouseName2,
            event_date: formData.eventDate.toISOString().substring(0, 10),
            content: formData.description,
        };
        if (isLocationUpdated) {
            payload.event_location_google = {
                google: {
                    components: location.address_components,
                    formatted: location.formatted_address,
                    position: location.geometry.location,
                },
            };
        }
        if (thumbnail) {
            try {
                const response = await requestFileUpload(thumbnail);
                payload.thumbnail_url = response;
            } catch (e) {
                showToast({
                    type: 'error',
                    message: e.message,
                });
            }
        }

        setLoading(true);
        try {
            await requestUpdateGeneralInfo(payload);
            await onRefetchVideo();
            showToast({
                type: 'success',
                message: 'Successfully updated the video information.',
            });
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
        setLoading(false);
    };

    return (
        <Box
            className="video-information"
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
                if (e.code === 'Enter') e.preventDefault();
            }}
        >
            <Box textAlign="right" mt="20px">
                <RegularButton
                    variant="contained"
                    className="round_btn"
                    type="submit"
                    disabled={isLoading || isUploading}
                    loading={isLoading || isUploading}
                >
                    Save
                </RegularButton>
            </Box>

            <Grid container spacing={5} alignItems="flex-start">
                <Grid item xs={12} sm={6}>
                    <label>Visibility</label>
                    <Grid container alignItems="center" direction="row" spacing={1}>
                        <Grid item>Unlisted</Grid>
                        <Grid item>
                            <Switch
                                defaultChecked={defaultFormData.isVisible}
                                inputRef={register}
                                name="isVisible"
                                color="primary"
                            />
                        </Grid>
                        <Grid item>Public</Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <label>Draft</label>
                    <Switch
                        defaultChecked={defaultFormData.isDraft}
                        inputRef={register}
                        name="isDraft"
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <label>Spouse Name</label>
                    <TextField fullWidth required inputRef={register} error={true} name="spouseName1" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <label>Spouse Name</label>
                    <TextField fullWidth required inputRef={register} error={true} name="spouseName2" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <label>Wedding Date</label>
                    <Controller
                        name="eventDate"
                        control={control}
                        render={({ ref, ...rest }) => (
                            <DateTimePicker
                                closeOnSelect
                                utc={true}
                                timeFormat={false}
                                dateFormat="YYYY-MM-DD"
                                inputProps={{ ref, required: true }}
                                {...rest}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <div>
                        <label>Wedding Location</label>
                        <AutoComplete.default
                            identifier="eventLocation"
                            style={{ width: '100%' }}
                            type="string"
                            types={['(regions)']}
                            defaultValue={location}
                            onPlaceSelected={(place: any) => setLocation(place)}
                        />
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <label>Description</label>
                    <TextField fullWidth multiline rows={6} inputRef={register} name="description" />
                </Grid>
                <Grid item xs={12} className="upload_card">
                    <Box maxWidth="400px" flexGrow="1" display="flex" flexDirection="column">
                        <label>Video Card Thumbnail</label>
                        <Box className="upload_card-content">
                            <Dropzone handleUpload={(file) => setThumbnail(file)} />
                            {thumbnailSrc ? (
                                <img src={thumbnailSrc} alt="Card Image" />
                            ) : (
                                <div className="no_image">No Thumbnail Image</div>
                            )}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default GeneralInfo;
