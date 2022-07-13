import { FieldArray, Field, Formik, Form } from 'formik';
import * as Yup from 'yup';
import React from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import BaseCTAButton from '../../../../newComponents/buttons/BaseCtaButton';
import {
    FormSection,
    FormTitle,
    FormContent,
    Label,
    Input,
    ErrorMessage,
    HeaderContainer,
    FormSubmitButtons,
    FormSectionVieled,
} from '../Style';
import theme from '../../../../styledComponentsTheme';
import { DeleteIcon } from '../../../Utility/LSTVSVG';
import { useBusinessService } from '../../../../rest-api/hooks/useBusinessService';
import UpgradeBanner from './UpgradeBanner';
import { Debug } from '../Debug';
import { popMessageSuccess } from '../../../../utils/LSTVUtils';
import { POPUP_MESSAGE_POSITION_TOP_RIGHT } from '../../../../global/globals';

const Container = styled.div`
    padding: 0px 0px 60px 0px;
    display: flex;
    /* align-items: center; */
`;
const FieldCol = styled.div`
    display: flex;
    flex-direction: column;
    padding-right: 35px;
`;
const LinksContainer = styled.div`
    border-bottom: 1px solid ${theme.midGrey};
    margin-bottom: 40px;
`;
const InputSection = styled.div`
    padding: 10px 0px;
`;
const URLSection = styled.div`
    padding: 10px 0px;
    display: flex;
    align-items: center;
    p {
        font-size: 1.125rem;
        line-height: 1.5rem;
        margin-right: 10px;
        color: ${theme.darkerGrey};
    }
`;

const DeleteButton = styled.div`
    border-radius: 100%;
    background-color: ${theme.primaryPurple};
    width: 50px;
    min-width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    cursor: pointer;
    :hover {
        background-color: ${theme.highlightColor};
    }
`;
const reactSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        color: theme.black,
        height: 40,
        paddingLeft: 24,
        backgroundColor: state.isFocused || state.isSelected ? theme.lightGrey : 'white',
        fontWeight: '400',
    }),
    container: (provided) => ({
        ...provided,
        width: '100%',
        color: theme.black,
        boxShadow: '0',
    }),
    control: (provided) => ({
        ...provided,
        width: '130px',
        marginBottom: '10px',
        minHeight: '44px',
        borderRadius: '10px',
        backgroundColor: theme.lightGrey,
        boxShadow: 'none',
        border: `1px solid ${theme.midGrey}`,
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '5px 0 5px 16px',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: theme.placeholderGrey,
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: theme.zIndex.dropdown,
        borderRadius: '10px',
        boxShadow: '0px 0px 6px rgba(186, 186, 186, 0.25)',
        border: '0',
    }),
    menuList: (provided) => ({
        ...provided,
        borderRadius: '10px',
        paddingTop: 16,
        paddingBottom: 16,
        maxHeight: 300,
    }),
    multiValue: (provided, state) => ({
        ...provided,
        backgroundColor: 'transparent',
        color: theme.black,
        height: '30px',
        alignItems: 'center',
    }),
    multiValueLabel: (provided, state) => ({
        ...provided,
        color: theme.black,
    }),
    multiValueRemove: (provided, state) => ({
        ...provided,
        display: 'none',
    }),
    singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300ms';

        return { ...provided, opacity, transition };
    },
    clearIndicator: (provided) => ({
        ...provided,
        cursor: 'pointer',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        cursor: 'pointer',
    }),
};
const options = [
    { value: 'facebook', label: 'Facebook', url: 'https://facebook.com/' },
    { value: 'instagram', label: 'Instagram', url: 'https://instagram.com/' },
    { value: 'tiktok', label: 'TikTok', url: 'https://tiktok.com/@' },
    { value: 'pinterest', label: 'Pinterest', url: 'https://pinterest.com/' },
    { value: 'youtube', label: 'Youtube', url: 'https://www.youtube.com/channel/' },
    { value: 'twitter', label: 'Twitter', url: 'https://twitter.com/' },
];

export const SocialLink = ({ index, arrayHelpers, business, resetForm }) => {
    const { deleteBusinessSocialLinks } = useBusinessService();
    const getIndex = (value) => options.findIndex((element) => element.value === value);

    const handleDelete = (index, value, values) => {
        if(value.id === "new"){
            arrayHelpers.remove(index);
        } else if (value.id) {
            deleteBusinessSocialLinks(business.slug, value.id).then(
                (d) => {
                    if (d) {
                        console.log(`d`, d)
                        // if (!d.success) actions.setErrors(d?.response_errors);
                        if (d.success) {
                            values.socialLinks.splice(index, 1);
                            resetForm({ values: { ...values }, submitCount: 1 });
                            popMessageSuccess(
                                `Social Link removed`,
                                '',
                                POPUP_MESSAGE_POSITION_TOP_RIGHT,
                                50
                            );
                        }
                    }
                },
                (error) => {}
            );
        } 
    };

    return (
        <Container>
            <FieldCol>
                <Label htmlFor={`socialLinks.${index}.type`}>Social Network</Label>
                <Field name={`socialLinks.${index}.type`}>
                    {({ field, form: { touched, errors, setFieldValue, values }, meta }) => (
                        <InputSection>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                // defaultValue={options[getIndex()]}
                                isClearable={false}
                                name="Social Type"
                                options={options.filter((option) => {
                                    return !values.socialLinks.map((link) => link.type).includes(option.value);
                                })}
                                styles={reactSelectStyles}
                                value={options[getIndex(field.value)]}
                                onChange={(e) => {
                                    arrayHelpers.replace(index, { type: e.value, link: '', id: undefined });
                                }}
                            />
                            {touched[field.name] && errors[field.name] && (
                                <div className="error">{errors[field.name]}</div>
                            )}
                        </InputSection>
                    )}
                </Field>
            </FieldCol>
            <Field name={`socialLinks.${index}`}>
                {({ field, form, meta }) => {
                    const currentOption = options[getIndex(form.values.socialLinks[index].type)] || options[0];

                    return (
                        <>
                            <FieldCol>
                                <Label htmlFor={`socialLinks.${index}`}>Profile Link</Label>

                                <URLSection>
                                    <p>{currentOption?.url}</p>
                                    {/* {console.log('value', currentOption)} */}
                                    <Input
                                        type="text"
                                        placeholder=""
                                        value={field.value.link.replace(currentOption.url, '')}
                                        onChange={(e) =>
                                            arrayHelpers.replace(index, {
                                                id: field.value.id,
                                                type: currentOption.value,
                                                link: `${currentOption.url}${e.target.value}`,
                                            })
                                        }
                                        style={{ width: '250px' }}
                                    />
                                    {meta.touched && meta.error && <div className="error">{meta.error}</div>}
                                </URLSection>
                            </FieldCol>
                            <DeleteButton onClick={() => handleDelete(index, field.value, form.values)}>
                                <DeleteIcon fillColor="white" strokeColor="none" />
                            </DeleteButton>
                        </>
                    );
                }}
            </Field>
        </Container>
    );
};

const SocialLinksSchema = Yup.object().shape({
    socialLinks: Yup.array(),
    // businessRoles: Yup.string().required('Required'),
});

export const SocialLinksForm = ({ business, mutate }) => {
    const { postBusinessSocialLink, editBusinessSocialLink } = useBusinessService();

    const removeUrl = (array) =>
        array.map((entry) => {
            return {
                ...entry,
                link: entry.link.replace(options.find((element) => element.value === entry.type).url, ''),
            };
        });
    const handleSubmit = async (values, actions, initialValues) => {
        // New entry stuff
        const newEntries = values.socialLinks.filter((link) => !link.id && link.id !== 'new');
        const newPromises = [];

        if (newEntries.length > 0) {
            removeUrl(newEntries).forEach((entry) => {
                newPromises.push(postBusinessSocialLink(business.slug, entry));
            });
        }
        Promise.allSettled(newPromises).then((results) => {
            results.forEach(async (result, index) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    const newValues = values.socialLinks.map((link) => {
                        if (!link.id) {
                            return { ...link, id: 'new' };
                        } else {
                            return link;
                        }
                    });
                    await mutate({ socialLinks: [...newValues] });
                    actions.resetForm({
                        values: {
                            socialLinks: [...newValues],
                        },
                        submitCount: 1,
                    });
                }
                popMessageSuccess(
                    `Social Link added successfully`,
                    '',
                    POPUP_MESSAGE_POSITION_TOP_RIGHT,
                    50
                );
            });
        });

        // Edited entry stuf
        const editedEntries = values.socialLinks
            .filter((link) => link.id)
            .filter((social, index) => social.link !== initialValues[index].link);
        const editedPromises = [];
        if (editedEntries.length > 0) {
            removeUrl(editedEntries).forEach((entry) => {
                editedPromises.push(editBusinessSocialLink(business.slug, entry));
            });
        }

        Promise.allSettled(editedPromises).then((results) => {
            let updated = false;
            results.forEach(async (result, index) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    updated = true
                    await mutate(values);
                    actions.resetForm({
                        values: {
                            ...values,
                        },
                        submitCount: 1,
                    });
                    
                }
            });
            updated && popMessageSuccess(
                `Social Link updated successfully`,
                '',
                POPUP_MESSAGE_POSITION_TOP_RIGHT,
                50
            );
        });
    };

    const showAddMoreButton = (values) => {
        // free, basic, plus, premium
        // free accounts get zero social links, but it's hidden behind veil so it can't be clicked
        if (business.subscription_level === 'free' && values.socialLinks.length === 0) {
            return true;
        }
        // Free account that has legacy social links can't add more but can edit
        if (business.subscription_level === 'free') {
            return false;
        }
        // basic accounts get one social link
        if (business.subscription_level === 'basic' && values.socialLinks.length === 0) {
            return true;
        }
        // plus and premium get unlimited social links
        if (business.subscription_level === 'plus' || business.subscription_level === 'premium') {
            return true;
        }

        return false;
    };

    const showContent = () => {
       if(business.subscription_level !== 'free' || business.social_links.length > 0) {
           return true
       }
       return false
    }

    return (
        <Formik
            initialValues={{
                socialLinks: business.social_links,
            }}
            validationSchema={SocialLinksSchema}
            onSubmit={async (values, actions) => {
                // console.log('values', args);
                handleSubmit(values, actions, business.social_links);
            }}
            validateOnMount={true}
        >
            {({ isValid, isSubmitting, dirty, handleReset, setFieldValue, values, submitCount }) => (
                <Form>
                    <FormSectionVieled showContent={showContent()} upgradeMessage={"Upgrade your account to add more social links"}>
                        <HeaderContainer>
                            <FormTitle>Social Links</FormTitle>
                            <FormSubmitButtons
                                isValid={isValid}
                                isSubmitting={isSubmitting}
                                dirty={dirty}
                                handleReset={handleReset}
                                submitCount={submitCount}
                            />
                        </HeaderContainer>
                        <FormContent>
                            <FieldArray
                                name="socialLinks"
                                render={(arrayHelpers) => (
                                    <div style={{ gridColumn: '1 /3 ' }}>
                                        <LinksContainer>
                                            {values.socialLinks &&
                                                values.socialLinks.length > 0 &&
                                                values.socialLinks.map((socialLinks, index) => (
                                                    <SocialLink
                                                        index={index}
                                                        key={index}
                                                        arrayHelpers={arrayHelpers}
                                                        business={business}
                                                        resetForm={() =>
                                                            handleReset({
                                                                values: {
                                                                    ...values,
                                                                },
                                                                submitCount: 1,
                                                            })
                                                        }
                                                    />
                                                ))}
                                        </LinksContainer>
                                        {showAddMoreButton(values) ? (
                                            values.socialLinks.length >= options.length ? null : (
                                                <BaseCTAButton
                                                    title="Add another link"
                                                    center
                                                    hideIcon
                                                    size="medium"
                                                    disabled={false}
                                                    type="button"
                                                    onClick={() => arrayHelpers.push({ type: '', link: '' })}
                                                />
                                            )
                                        ) 
                                        : (
                                             <UpgradeBanner message={'Upgrade your account to add more social links'} />
                                        )
                                        }
                                    </div>
                                )}
                            />
                        </FormContent>
                    </FormSectionVieled>

                    {/* <Debug /> */}
                </Form>
            )}
        </Formik>
    );
};
