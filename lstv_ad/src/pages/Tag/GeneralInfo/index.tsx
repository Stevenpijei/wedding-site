import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, Grid, TextField } from '@material-ui/core';

import { ToastContext } from 'contexts/ToastContext';

import Dropzone from 'pages/Business/Dropzone';

import RegularButton from 'components/CustomBtns/Button';
import SingleSelect from 'components/SingleSelect';

import { useFileUpload } from 'service/hooks/upload';
import { useGetTagTypes, useUpdateTag } from 'service/hooks/tag';

import { PrivateRoutes } from 'config/routes';
import { ITag, ITagType, IUpdateTagRequest } from 'interface';

import './styles.scss';

interface Props {
    slug: string;
    data: ITag;
}

const GeneralInfo: React.FC<Props> = ({ data, slug }: Props) => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [typeSlug, setTypeSlug] = useState<string>('');
    const [thumbnail, setThumbnail] = useState<File>();

    const { showToast } = useContext(ToastContext);
    const history = useHistory();

    const { data: tagTypeResponse, isLoading: isTagTypeLoading } = useGetTagTypes();

    useEffect(() => {
        setName(data.name);
        setTypeSlug(data.type_slug);
        setThumbnail(undefined);
    }, [data]);

    const typeSlugs = useMemo(() => {
        return tagTypeResponse?.result || [];
    }, [tagTypeResponse]);

    const thumbnailSrc = useMemo(() => {
        if (thumbnail) return URL.createObjectURL(thumbnail);
        return data.thumbnail || '';
    }, [thumbnail, data]);

    const { requestFileUpload, loading: isUploading } = useFileUpload();
    const { mutateAsync: requestUpdateTag } = useUpdateTag();

    const handleSubmit = async () => {
        if (data.name === name && data.type_slug === typeSlug && !thumbnail) {
            showToast({
                type: 'info',
                message: `You have nothing to update`,
            });
            return;
        }

        const payload: IUpdateTagRequest = {
            slug,
        };
        if (data.name !== name) payload.name = name;
        if (data.type_slug !== typeSlug) payload.type_slug = typeSlug;
        if (thumbnail) {
            try {
                const response = await requestFileUpload(thumbnail);
                payload.thumbnail = response;
            } catch (e) {
                showToast({
                    type: 'error',
                    message: e.message,
                });
            }
        }

        setLoading(true);
        try {
            const response = await requestUpdateTag(payload);
            showToast({
                type: 'success',
                message: 'Successfully updated the tag information.',
            });
            history.push(`${PrivateRoutes.TAGS}/${response.result.slug}`);
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
        setLoading(false);
    };

    return (
        <Box className="tag-information" component="form">
            <Box textAlign="right" mt="20px">
                <RegularButton
                    variant="contained"
                    className="round_btn"
                    disabled={isLoading || isUploading}
                    loading={isLoading || isUploading}
                    onClick={handleSubmit}
                >
                    Save
                </RegularButton>
            </Box>
            <Grid container spacing={5} alignItems="flex-start">
                <Grid item xs={12} md={6}>
                    <label>Name</label>
                    <TextField fullWidth required value={name} onChange={(e) => setName(e.target.value)} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <label>Type slug</label>
                    <SingleSelect<ITagType>
                        title=""
                        style={{ minWidth: 'unset' }}
                        disableCloseOnSelect={false}
                        properties={{ slug: 'slug', name: 'name' }}
                        loading={isLoading || isTagTypeLoading}
                        list={typeSlugs}
                        value={typeSlugs.find((item) => item.slug === typeSlug) || null}
                        setValue={(value) => setTypeSlug((value as ITagType)?.slug || '')}
                    />
                </Grid>
                <Grid item xs={12} className="upload_card">
                    <Box maxWidth="400px" flexGrow="1" display="flex" flexDirection="column">
                        <label>Thumbnail Image</label>
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
