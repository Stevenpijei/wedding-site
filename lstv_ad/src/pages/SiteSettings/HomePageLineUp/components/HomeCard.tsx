import React, { useState, useEffect, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import isEqual from 'lodash/isEqual';

import { Box, Grid, TextField } from '@material-ui/core';

import MultiSelect from 'components/MultiSelect';
import SingleSelect from 'components/SingleSelect';

import { useAllBusinesses } from 'service/hooks/business';
import { useSearch } from 'service/hooks/search';
import { useListVideos } from 'service/hooks/video';

import { IBusinessAdmin, IBusinessVendor, IHomeCardContentType, IHomeCardSection } from 'interface';

interface Props {
    data: IHomeCardSection;
    onUpdate: (section: IHomeCardSection) => void;
}

interface IFormData {
    content_type: string;
    cta_text: string;
    cta_url: string;
    header: string;
    items: IHomeCardContentType[];
}

const contentTypes: IHomeCardContentType[] = [
    { slug: 'fixed_video_list', display_name: 'Fixed Video List' },
    { slug: 'fixed_business_list', display_name: 'Fixed Business List' },
    { slug: 'vibe_to_video', display_name: 'Videos for vibe' },
    { slug: 'business_to_video', display_name: 'Videos for Business' },
];

export const HomeCard: React.FC<Props> = ({ data, onUpdate }: Props) => {
    const [formData, setFormData] = useState<IFormData>({
        content_type: data.content_type,
        cta_text: data.cta_text || '',
        cta_url: data.cta_url || '',
        header: data.header || '',
        items: data.items,
    });
    const [search, setSearch] = useState<string>('');
    const { data: businesses, isLoading: isBusinessLoading, refetch: fetchBusinesses } = useAllBusinesses(
        {
            offset: 0,
            size: 20,
            verbosity: 'admin_list',
            search_term: search,
        },
        { enabled: false }
    );
    const { data: videos, isLoading: isVideoLoading, refetch: fetchVideos } = useListVideos(
        {
            content_sort_method: 'most_recent',
            verbosity: 'admin_list',
            title: search,
            offset: 0,
            size: 20,
        },
        { enabled: false }
    );
    const { data: tags, isLoading: isTagLoading, refetch: fetchTags } = useSearch(
        {
            term: search,
            type: 'tag',
        },
        { enabled: false }
    );

    const contentTypeItems: IHomeCardContentType[] = useMemo(() => {
        if (!search) return [];
        if (formData.content_type === 'fixed_video_list') {
            return (videos?.result || []).map((video) => ({ slug: video.slug, display_name: video.title }));
        } else if (formData.content_type === 'fixed_business_list' || formData.content_type === 'business_to_video') {
            return (businesses?.result || []).map((business: IBusinessAdmin | IBusinessVendor) => ({
                slug: business.slug,
                display_name: business.name,
            }));
        } else if (formData.content_type === 'vibe_to_video') {
            return (tags?.result.tags || []).map((tag) => ({ slug: tag.slug, display_name: tag.name }));
        }
        return [];
    }, [videos, businesses, tags]);

    useEffect(() => {
        if (!search) return;
        debounceSearch();
    }, [search]);

    useEffect(() => {
        debounceUpdate({ ...data, ...formData });
    }, [formData]);

    const debounceUpdate = useDebouncedCallback((payload: IHomeCardSection) => {
        if (!isEqual(data, payload)) onUpdate(payload);
    }, 200);

    const debounceSearch = useDebouncedCallback(() => {
        if (formData.content_type === 'fixed_video_list') {
            fetchVideos();
        } else if (formData.content_type === 'fixed_business_list' || formData.content_type === 'business_to_video') {
            fetchBusinesses();
        } else if (formData.content_type === 'vibe_to_video') {
            fetchTags();
        }
    }, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <Box>
            <Grid container alignItems="flex-end" spacing={3}>
                <Grid item xs={2}>
                    <SingleSelect<IHomeCardContentType>
                        title=""
                        properties={{ slug: 'slug', name: 'display_name' }}
                        style={{ minWidth: 'unset' }}
                        list={contentTypes}
                        value={contentTypes.find((item) => item.slug === formData.content_type) || null}
                        setValue={(value) => {
                            if (value) {
                                setSearch('');
                                const slug = (value as IHomeCardContentType).slug;
                                setFormData({ ...formData, content_type: slug, items: [] });
                            }
                        }}
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField fullWidth name="header" value={formData.header} onChange={handleChange} />
                </Grid>
                <Grid item xs={2}>
                    <TextField fullWidth name="cta_text" value={formData.cta_text} onChange={handleChange} />
                </Grid>
                <Grid item xs={2}>
                    <TextField fullWidth name="cta_url" value={formData.cta_url} onChange={handleChange} />
                </Grid>
                <Grid item xs={4}>
                    <MultiSelect<IHomeCardContentType>
                        title=""
                        loading={isBusinessLoading || isVideoLoading || isTagLoading}
                        style={{ minWidth: 'unset' }}
                        properties={{ slug: 'slug', name: 'display_name' }}
                        list={contentTypeItems}
                        values={formData.items}
                        onInputChange={handleInputChange}
                        setValues={(value) => setFormData({ ...formData, items: value as IHomeCardContentType[] })}
                        onClose={() => setSearch('')}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomeCard;
