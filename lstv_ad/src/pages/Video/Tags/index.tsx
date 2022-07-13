import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { useDebouncedCallback } from 'use-debounce/lib';

import MultiSelect from 'components/MultiSelect';
import RegularButton from 'components/CustomBtns/Button';

import { useUpdateVideoTags, useVideoTags } from 'service/hooks/video';
import { useSearch } from 'service/hooks/search';

import { ISlugWithName } from 'interface/general';

import { ToastContext } from 'contexts/ToastContext';

interface Props {
    slug: string;
}

const Tags: React.FC<Props> = ({ slug }: Props) => {
    const { showToast } = useContext(ToastContext);

    const [search, setSearch] = useState<string>('');
    const [tagValues, setTagValues] = useState<ISlugWithName[]>([]);

    const { data: tagsResponse, isLoading: isTagsLoading, refetch: fetchVideoTags } = useVideoTags(slug);
    const { data: searchResponse, isLoading: isSearching, refetch: fetchTagSearch } = useSearch(
        {
            term: search,
            type: 'tag',
        },
        { enabled: false }
    );
    const { mutateAsync: requestUpdateVideoTags, isLoading: isUpdatingTags } = useUpdateVideoTags();

    useEffect(() => {
        if (tagsResponse) {
            setTagValues(tagsResponse.result);
        }
    }, [tagsResponse]);

    useEffect(() => {
        if (search) fetchTagSearch();
    }, [search]);

    const debounce = useDebouncedCallback((text: string) => {
        setSearch(text);
    }, 800);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debounce(e.target.value);
    };

    const handleSaveClick = async () => {
        try {
            await requestUpdateVideoTags({
                slug,
                tags: tagValues.map((t) => t.slug),
            });
            await fetchVideoTags();
            showToast({
                type: 'success',
                message: 'Successfully updated the video tags.',
            });
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
    };

    const TAG_OPTIONS = useMemo(() => (searchResponse && searchResponse?.result.tags) || [], [searchResponse]);

    return (
        <Box>
            <Box mt="30px" textAlign="right">
                <RegularButton
                    className="round_btn"
                    loading={isUpdatingTags || isTagsLoading}
                    onClick={handleSaveClick}
                >
                    Save
                </RegularButton>
            </Box>
            <Box mt="30px" className="white_multi_select">
                <MultiSelect<ISlugWithName>
                    title=""
                    loading={isTagsLoading || isSearching}
                    style={{ minWidth: 'unset' }}
                    properties={{ slug: 'slug', name: 'name' }}
                    list={TAG_OPTIONS}
                    values={tagValues}
                    onInputChange={handleInputChange}
                    setValues={setTagValues}
                    onClose={() => setSearch('')}
                />
            </Box>
        </Box>
    );
};

export default Tags;
