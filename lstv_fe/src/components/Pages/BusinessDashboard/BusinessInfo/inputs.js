import { useField } from 'formik';
import React, { useState, useEffect } from 'react';

import styled, { createGlobalStyle } from 'styled-components';
import theme from '../../../../styledComponentsTheme';
import axios from 'axios';
import useSWR from 'swr';
import parse from 'html-react-parser';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { FormControl, Input, Label, ErrorMessage, Textarea } from '../Style';
import BaseMultiSelect from '../../../../newComponents/BaseMultiSelect';
import Autocomplete from 'react-google-autocomplete';
import { Toggle } from '../../../../newComponents/buttons/BaseToggle';

const AutocompleteGlobalStyles = createGlobalStyle`

    .pac-container {
        border-radius: 10px;
        margin-top: 10px;
        padding: 20px;

        .pac-item:first-of-type {
            border-top: none;
        }
        .pac-item {
            font-size: 1.5rem;
        }
        box-shadow: none;
        border: 1px solid ${(props) => props.theme.midGrey};
    }
`;

const AutocompleteStyled = styled(Autocomplete)`
    appearance: none;
    color: ${(props) => props.theme.black};
    box-sizing: border-box;
    border-radius: 10px;
    outline: none;
    background: ${(props) => props.theme.lightGrey};
    border: 1px solid ${(props) => props.theme.midGrey};
    padding: 16px;
    height: 44px;
`;
const ToggleWrapper = styled.div`
    display: flex;
    align-items: flex-start;
    padding-top: 20px;
    margin-bottom: -20px;
`
const ToggleLabel = styled(Label)`
        margin-top: -4px;
        padding-left: 12px;
`

export const BusinessLocation = (props) => {
    const [field, meta, helpers] = useField(props);
    const [showAddress, setShowAddress] = useState(props.$useMailingAdress);
    const [hide, setHide] = useState(false);

    useEffect(() => {
        setHide(!hide);
        setTimeout(() => setHide(false), 250);
    }, [showAddress]);

    return (
        <FormControl>
            <AutocompleteGlobalStyles />
            <Label htmlFor={props.name}>{props.label}</Label>
            {!hide ? (
                <AutocompleteStyled
                    identifier={'location'}
                    type={'string'}
                    onPlaceSelected={(place) => {
                        helpers.setValue(place);
                    }}
                    types={showAddress ? ['address'] : ['(regions)']}
                    // types={['address']}
                    placeholder={field.value}
                    onChange={(e) => {
                        // setTextValue(e.target.value);
                    }}
                    defaultValue={field.value}
                    onBlur={(e) => {
                        () => {
                            // console.log(e);
                        };
                    }}
                    apiKey={'AIzaSyCmkzi07c9x40XQFleo1GU_2VBLWI1vYH8'}
                    {...props}
                />
            ) : (
                <p style={{ height: '44px' }}>loading...</p>
            )}
            <ToggleWrapper>
                <Toggle
                    toggleId={'1'}
                    disabled={false}
                    name={'toggler'}
                    onCheckboxChange={() => setShowAddress(!showAddress)}
                    isSelected={showAddress}
                />
                <ToggleLabel htmlFor={'toggler'}>
                    {'Business with Physical Location'}
                    {props.$useMailingAdress}
                </ToggleLabel>
            </ToggleWrapper>
        </FormControl>
    );
};

export const TextInput = ({ label, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const hasError = React.useMemo(() => Boolean(meta.error), []); //, [meta.error]);

    return (
        <FormControl>
            <Label htmlFor={props.name}>{label}</Label>
            <Input {...field} {...props} touched={meta.touched} hasError={hasError} />
            {meta.error ? (
                <ErrorMessage>{Array.isArray(meta.error) ? parse(meta.error[0]) : meta.error}</ErrorMessage>
            ) : null}
        </FormControl>
    );
};

export const TextArea = ({ label, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const hasError = React.useMemo(() => Boolean(meta.error), []); //, [meta.error]);

    return (
        <FormControl style={props.style}>
            <Label htmlFor={props.name}>{label}</Label>
            <Textarea {...field} {...props} touched={meta.touched} hasError={hasError} style={{ minHeight: '150px' }} />
            {meta.error && meta.touched ? (
                <ErrorMessage>{Array.isArray(meta.error) ? parse(meta.error[0]) : meta.error}</ErrorMessage>
            ) : null}
        </FormControl>
    );
};

const StyledPhoneInput = styled(PhoneInput)`
    display: flex;
    .PhoneInputCountry {
        display: flex;
        .PhoneInputCountrySelect {
            width: 120px;
            margin-right: 10px;
            border-radius: 10px;
            padding-left: 10px;
            height: 44px;
            background: ${theme.lightGrey};
            border: 1px solid ${theme.midGrey};
        }
    }
    .PhoneInputCountryIcon {
        display: none;
    }
    .PhoneInputInput {
        outline: none;
        height: 44px;
        border-radius: 10px;
        padding: 0 16px;
        background: ${theme.lightGrey};
        border: 1px solid ${theme.midGrey};

        &::placeholder {
            color: ${theme.black};
        }
    }
`;

export const BusinessPhoneInput = (props) => {
    const [field, meta, helpers] = useField(props);
    // const phoneNumber = parsePhoneNumber(field.value);
    return (
        <FormControl>
            <Label htmlFor={props.name}>{props.label}</Label>
            <StyledPhoneInput
                placeholder="Enter phone number"
                defaultCountry="US"
                value={field.value}
                onChange={helpers.setValue}
                error={
                    field.value
                        ? isValidPhoneNumber(field.value)
                            ? undefined
                            : 'Invalid phone number'
                        : 'Phone number required'
                }
            />
            {/* Is possible: {field.value && isPossiblePhoneNumber(field.value) ? 'true' : 'false'} */}
            {/* country: {phoneNumber?.country} */}
        </FormControl>
    );
};

export const BusinessType = (props) => {
    const fetcher = () => axios.get(`${API_URL}/v1/businessRoleTypes`).then((res) => res.data.result);
    const { data, error } = useSWR('businessRoleTypes', fetcher);
    const [field, meta, helpers] = useField(props);

    if (error) return <div>failed to load</div>;
    if (!data) return <div>loading...</div>;

    return (
        <FormControl>
            <Label htmlFor={props.name}>{props.label}</Label>
            <BaseMultiSelect
                isSquare
                placeholder="Business Type"
                name={'business_roles'}
                defaultValue={
                    field.value?.length > 0 &&
                    field.value.split(', ').map((role) => {
                        return { label: role.charAt(0).toUpperCase() + role.slice(1), value: role };
                    })
                }
                options={data.map((type) => ({
                    label: type.name,
                    value: type.slug,
                }))}
                onChange={(value) => {
                    helpers.setValue(value.map((val) => val.value).join(', ') || []);
                }}
            />
            {meta.error ? (
                <ErrorMessage>{Array.isArray(meta.error) ? parse(meta.error[0]) : meta.error}</ErrorMessage>
            ) : null}
        </FormControl>
    );
};
