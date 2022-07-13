import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { QueryObserverResult, RefetchOptions } from 'react-query';
import { Box, FormControlLabel, Grid, Select, Switch, TextField } from '@material-ui/core';
import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input';
import isEqual from 'lodash/isEqual';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AutoComplete = require('react-google-autocomplete');

import {
    useBusinessRoleTypes,
    useCreateBusinessPhone,
    useUpdateBusinessGeneralInfo,
    useUpdateBusinessPhone,
    useUpdateBusinessRoles,
} from 'service/hooks/business';
import ErrorAlert from 'components/ErrorAlert';
import { IBusiness, IBusinessGeneralInfoRequest, IBusinessResponse, IBusinessRole, IError } from 'interface';
import MultiSelect from 'components/MultiSelect';
import RegularButton from 'components/CustomBtns/Button';
import { ToastContext } from 'contexts/ToastContext';

import 'react-phone-number-input/style.css';
import './styles.scss';

interface Props {
    businessId: string;
    data: IBusiness;
    fetchBusiness: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<IBusinessResponse, IError>>;
}

interface IBusinessInfoForm {
    name: string;
    description: string;
    email: string;
    subscription_level: string;
}

export const SUBSCRIPTION_LEVELS = [
    { label: 'Free', value: 'free' },
    { label: 'Basic', value: 'basic' },
    { label: 'Plus', value: 'plus' },
    { label: 'Premium', value: 'premium' },
];

const InformationForm: React.FC<Props> = ({ businessId, data, fetchBusiness }: Props) => {
    const { showToast } = useContext(ToastContext);
    const [loading, setLoading] = useState<boolean>(false);
    const {
        data: roleTypes,
        isLoading: roleTypesLoading,
        isError: isRoleTypesError,
        error: roleTypesError,
    } = useBusinessRoleTypes();
    const { mutateAsync: requestUpdateGeneralInfo } = useUpdateBusinessGeneralInfo();
    const { mutateAsync: requestUpdateRoles } = useUpdateBusinessRoles();
    const { mutateAsync: requestUpdatePhone } = useUpdateBusinessPhone();
    const { mutateAsync: requestCreatePhone } = useCreateBusinessPhone();
    const { handleSubmit, register, control } = useForm<IBusinessInfoForm>();
    const [roles, setRoles] = useState<IBusinessRole[]>([]);
    const [phone, setPhone] = useState<string>('');
    const [showAddress, setShowAddress] = useState<boolean>(
        Object.keys(data.business_locations[0] || {}).includes('address')
    );
    const [location, setLocation] = useState<any>('');

    useEffect(() => {
        if (data && roleTypes) {
            setRoles(data.roles);
        }
    }, [data, roleTypes]);

    useEffect(() => {
        if (data) {
            if (Array.isArray(data.phones) && data.phones.length > 0) {
                setPhone(data.phones[0].link_phone_number);
            }
        }
    }, [data]);

    const onSubmit = async (formData: IBusinessInfoForm) => {
        const generalInfo: IBusinessGeneralInfoRequest = {};
        const updatePromises: Promise<any>[] = [];
        const { name, description, email, subscription_level } = formData;
        if (!isEqual(name, data.name)) {
            generalInfo['business_name'] = name;
        }
        if (description && !isEqual(description, data.description)) {
            generalInfo['description'] = description;
        }
        if (!isEqual(email, data.inquiry_email)) {
            if (!!email) {
                generalInfo['inquiry_email'] = email;
            } else {
                generalInfo['inquiry_email'] = null;
            }
        }
        if (!(typeof location === 'string') && !!location && !isEqual(location, data.business_locations[0])) {
            generalInfo['business_location'] = {
                google: {
                    components: location.address_components,
                    formatted: location.formatted_address,
                    position: location.geometry.location,
                },
            };
        }
        if (!isEqual(subscription_level, data.subscription_level)) {
            generalInfo['subscription_level'] = subscription_level;
        }
        if (Object.keys(generalInfo).length > 0)
            updatePromises.push(requestUpdateGeneralInfo({ businessId, ...generalInfo }));
        if (!isEqual(roles, data.roles)) {
            updatePromises.push(
                requestUpdateRoles({
                    businessId,
                    roles: roles.map((role) => role.slug),
                })
            );
        }
        if (!!phone) {
            const parsedPhoneInfo = parsePhoneNumber(phone);
            if (parsedPhoneInfo) {
                if (Array.isArray(data.phones) && data.phones[0]) {
                    if (!isEqual(phone, data.phones[0].link_phone_number))
                        updatePromises.push(
                            requestUpdatePhone({
                                businessId,
                                country: parsedPhoneInfo.country as string,
                                number: parsedPhoneInfo.nationalNumber,
                                type: 'business',
                                phoneId: data.phones[0].id,
                            })
                        );
                } else {
                    updatePromises.push(
                        requestCreatePhone({
                            businessId,
                            country: parsedPhoneInfo.country as string,
                            number: parsedPhoneInfo.nationalNumber,
                            type: 'business',
                        })
                    );
                }
            }
        }
        if (updatePromises.length > 0) {
            setLoading(true);
            try {
                await Promise.all(updatePromises);
                await fetchBusiness();
                showToast({
                    type: 'success',
                    message: 'Successfully updates the business information.',
                });
            } catch (e) {
                showToast({
                    type: 'error',
                    message: e.message,
                });
            }
            setLoading(false);
        } else {
            showToast({
                type: 'info',
                message: 'You have nothing to updates',
            });
        }
    };

    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowAddress(event.target.checked);
    };

    const initialLocationValue =
        (data.business_locations && data.business_locations.length > 0 && data.business_locations[0].display_name) ||
        '';

    return (
        <Box
            className="business-information"
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

            <ErrorAlert error={roleTypesError as IError} isError={isRoleTypesError} />
            <Grid container spacing={5} alignItems="flex-start">
                <Grid item xs={12} md={6}>
                    <label>Business Name</label>
                    <TextField
                        defaultValue={data.name}
                        fullWidth
                        required
                        inputRef={register}
                        error={true}
                        name="name"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <div>
                        <label>Business Location</label>
                        {showAddress && (
                            <AutoComplete.default
                                identifier="location"
                                type="string"
                                style={{ width: '100%' }}
                                onPlaceSelected={(place: any) => {
                                    setLocation(place);
                                }}
                                defaultValue={initialLocationValue}
                                types={['address']}
                            />
                        )}
                        {!showAddress && (
                            <AutoComplete.default
                                identifier="location"
                                type="string"
                                style={{ width: '100%' }}
                                onPlaceSelected={(place: any) => {
                                    setLocation(place);
                                }}
                                defaultValue={initialLocationValue}
                                types={['(regions)']}
                            />
                        )}
                        <FormControlLabel
                            control={<Switch checked={showAddress} onChange={handleToggle} color="primary" />}
                            label="Business with Physical Location"
                        />
                    </div>
                </Grid>
                <Grid item xs={12} md={6}>
                    <label>Client Contact Email Address</label>
                    <TextField
                        defaultValue={data.inquiry_email}
                        fullWidth
                        inputRef={register}
                        name="email"
                        type="email"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <label>Business Type(s)</label>
                    <MultiSelect<IBusinessRole>
                        loading={roleTypesLoading}
                        title=""
                        values={roles}
                        setValues={setRoles}
                        list={roleTypes?.result || []}
                        properties={{
                            name: 'name',
                            slug: 'slug',
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <label>Phone Number</label>
                    <PhoneInput placeholder="Enter phone number" value={phone} onChange={setPhone} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <label>Subscription Level</label>
                    <Controller
                        name="subscription_level"
                        control={control}
                        defaultValue={data.subscription_level}
                        as={
                            <Select native fullWidth>
                                {SUBSCRIPTION_LEVELS.map((subscriptionLevel) => (
                                    <option key={subscriptionLevel.value} value={subscriptionLevel.value}>
                                        {subscriptionLevel.label}
                                    </option>
                                ))}
                            </Select>
                        }
                    />
                </Grid>
                <Grid item xs={12}>
                    <label>Business Description</label>
                    <TextField
                        defaultValue={data.description}
                        fullWidth
                        multiline
                        rows={6}
                        inputRef={register}
                        name="description"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default InformationForm;
