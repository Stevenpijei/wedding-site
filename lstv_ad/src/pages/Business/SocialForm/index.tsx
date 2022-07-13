import React, { useContext, useEffect, useState } from 'react';
import { QueryObserverResult, RefetchOptions, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Box } from '@material-ui/core';
import isEqual from 'lodash/isEqual';

import { IBusinessResponse, IError, ISocialLink } from 'interface';
import RegularButton from 'components/CustomBtns/Button';
import SocialLink from './SocialLink';
import { ESocialLink } from 'config/enum';
import { BusinessQueryKeys, useCreateSocialLink, useUpdateSocialLink } from 'service/hooks/business';
import { ToastContext } from 'contexts/ToastContext';
import './styles.scss';

interface Props {
    businessId: string;
    data: ISocialLink[];
    slug: string;
    fetchBusiness: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IBusinessResponse, IError>>;
}

export interface ISocialLinkOption {
    value: ESocialLink;
    label: string;
    url: string;
}

export const SOCIAL_LINK_OPTIONS: ISocialLinkOption[] = [
    { value: ESocialLink.facebook, label: 'Facebook', url: 'https://facebook.com/' },
    { value: ESocialLink.instagram, label: 'Instagram', url: 'https://instagram.com/' },
    { value: ESocialLink.tiktok, label: 'TikTok', url: 'https://tiktok.com/@' },
    { value: ESocialLink.pinterest, label: 'Pinterest', url: 'https://pinterest.com/' },
    { value: ESocialLink.youtube, label: 'Youtube', url: 'https://www.youtube.com/channel/' },
    { value: ESocialLink.twitter, label: 'Twitter', url: 'https://twitter.com/' },
];

export const convertSocialLinkToOption = (socialLink: ISocialLink) =>
    SOCIAL_LINK_OPTIONS.find((option) => option.value === socialLink.type) as ISocialLinkOption;

const SocialForm: React.FC<Props> = ({ businessId, data, slug, fetchBusiness }: Props) => {
    const urlTouchedData = data.map((item) => ({
        ...item,
        link: item.link.replace(convertSocialLinkToOption(item).url, ''),
    }));

    const queryClient = useQueryClient();
    const { showToast } = useContext(ToastContext);
    const { handleSubmit } = useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);
    const [options, setOptions] = useState<ISocialLinkOption[]>([]);

    const { mutateAsync: requestUpdateSocialLink } = useUpdateSocialLink();
    const { mutateAsync: requestCreateSocialLink } = useCreateSocialLink();

    useEffect(() => {
        setSocialLinks(urlTouchedData);
    }, [data]);

    useEffect(() => {
        const socialLinkTypes = Object.values(socialLinks).map((v) => v.type);
        setOptions(SOCIAL_LINK_OPTIONS.filter((option) => !socialLinkTypes.includes(option.value)));
    }, [socialLinks]);

    const onSubmit = async () => {
        const updatePromises: Promise<any>[] = [];
        socialLinks.forEach((item, idx) => {
            if (!!item.id) {
                // if the link is not new, then let's update
                if (!isEqual(item, urlTouchedData[idx])) {
                    updatePromises.push(
                        requestUpdateSocialLink({
                            businessSlug: slug,
                            socialLinkId: item.id,
                            type: item.type as string,
                            account: item.link,
                        })
                    );
                }
            } else {
                // if the link is new, then let's create
                updatePromises.push(
                    requestCreateSocialLink({
                        businessSlug: slug,
                        type: item.type as string,
                        account: item.link,
                    })
                );
            }
        });
        if (updatePromises.length > 0) {
            setLoading(true);
            try {
                await Promise.all(updatePromises);
                queryClient.refetchQueries([BusinessQueryKeys.GET_BUSINESS, businessId]);
                showToast({
                    type: 'success',
                    message: `Successfully update social links`,
                });
            } catch (e) {
                showToast({
                    type: 'error',
                    message: e.message,
                });
            }
            await fetchBusiness();
            setLoading(false);
        } else {
            showToast({
                type: 'info',
                message: `Nothing to update.`,
            });
        }
    };

    return (
        <Box
            className="social-links"
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
                    disabled={loading}
                    loading={loading}
                >
                    Save
                </RegularButton>
            </Box>
            <Box>
                {socialLinks.map((socialLink, idx) => {
                    const _options = [...options];
                    if (!!socialLink.type) _options.push(convertSocialLinkToOption(socialLink));
                    return (
                        <SocialLink
                            key={`${socialLink.id}-${idx}`}
                            index={idx}
                            data={socialLink}
                            options={_options}
                            currentOption={
                                socialLink.type !== undefined
                                    ? convertSocialLinkToOption(socialLink)
                                    : {
                                          url: 'Please choose social network',
                                          value: ESocialLink.facebook,
                                          label: '',
                                      }
                            }
                            setSocialLinks={setSocialLinks}
                            businessSlug={slug}
                            businessId={businessId}
                        />
                    );
                })}
                <RegularButton
                    variant="contained"
                    className="round_btn"
                    disabled={socialLinks.length >= SOCIAL_LINK_OPTIONS.length}
                    onClick={() => setSocialLinks((prev) => [...prev, { id: '', type: undefined, link: '' }])}
                >
                    Add another link
                </RegularButton>
            </Box>
        </Box>
    );
};

export default SocialForm;
