import React, { useContext, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Box, Select, TextField, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

import { ISocialLink } from 'interface';
import { ISocialLinkOption } from '.';
import { BusinessQueryKeys, useRemoveSocialLink } from 'service/hooks/business';
import { ESocialLink } from 'config/enum';
import { ToastContext } from 'contexts/ToastContext';

interface Props {
    data: ISocialLink;
    options: ISocialLinkOption[];
    currentOption: ISocialLinkOption;
    businessSlug: string;
    businessId: string;
    index: number;
    setSocialLinks: React.Dispatch<React.SetStateAction<ISocialLink[]>>;
}

const SocialLink: React.FC<Props> = ({
    data,
    options,
    currentOption,
    businessSlug,
    businessId,
    index,
    setSocialLinks,
}: Props) => {
    const queryClient = useQueryClient();
    const { showToast } = useContext(ToastContext);
    const [link, setLink] = useState<string>(data.link);
    const { mutateAsync: requestRemoveSocialLink } = useRemoveSocialLink();

    const handleRemoveClick = async () => {
        try {
            if (data.id) {
                await requestRemoveSocialLink({
                    businessSlug,
                    socialLinkId: data.id,
                });
                queryClient.refetchQueries([BusinessQueryKeys.GET_BUSINESS, businessId]);
                showToast({
                    type: 'success',
                    message: 'Successfully removed the social link.',
                });
            }
            setSocialLinks((prev) => {
                const _prev = [...prev];
                _prev.splice(index, 1);
                return _prev;
            });
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
    };

    const handleSelectChange = (
        event: React.ChangeEvent<{
            name?: string | undefined;
            value: unknown;
        }>
    ) => {
        setSocialLinks((prev) => {
            const _prev = [...prev];
            _prev[index].type = event.target.value as ESocialLink;
            return _prev;
        });
    };

    const handleUrlBlur = () => {
        setSocialLinks((prev) => {
            const _prev = [...prev];
            _prev[index].link = link;
            return _prev;
        });
    };

    return (
        <Box my="25px" display="flex">
            <Box mr="20px">
                <label>Social Network</label>
                <Select
                    native
                    value={data.type || ''}
                    onChange={handleSelectChange}
                    style={{ width: '200px' }}
                    required
                >
                    {!data.id && <option value=""></option>}
                    {options.map((option, idx) => {
                        return (
                            <option value={option.value} key={`${option.value}-${index}-${idx}`}>
                                {option.label}
                            </option>
                        );
                    })}
                </Select>
            </Box>
            <Box>
                <label>Profile Link</label>
                <Box display="flex" alignItems="center" justifyContent="flex-start">
                    <p>{currentOption.url}</p>
                    <TextField
                        value={link}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
                        onBlur={handleUrlBlur}
                        required
                    />
                </Box>
            </Box>
            <Box display="flex" alignItems="flex-end">
                <IconButton aria-label="delete" onClick={handleRemoveClick}>
                    <DeleteIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default SocialLink;
