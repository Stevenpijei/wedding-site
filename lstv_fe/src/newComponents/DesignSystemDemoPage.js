import React, {useState} from 'react';
import { Formik, Field } from 'formik';
import styled from 'styled-components';
import * as Yup from 'yup';
import GooglePlacesSearchBar from './forms/GooglePlacesSearchBar'; 
import { StyledForm, FormRow, FormSubmitButton } from './forms/StyledForm';
import DateInput from './forms/DateInput'
import { CheckBox } from './buttons/BaseCheckBox';
import { Toggle } from './buttons/BaseToggle';
import { HeartToggle } from './buttons/BaseHeartIcon';
import { RadioButton, Input, RadioButtonGroup } from './buttons/BaseRadioButton';
import { OutlinedCTAButton } from './common/OutlinedCTALink'
import Button, { ButtonBaseStyle, media } from '../components/Utility/Button'
import { MenuButton, ButtonGroup } from './buttons/BaseMenuButton';
import DefaultPageLayout from './DefaultPageLayout';
import WeddingCarousel from './WeddingCarousel'
import Modal from './Modal'
import BaseCtaButton from './buttons/BaseCtaButton'
import BaseMultiSelect from './BaseMultiSelect';
import BaseTag, { BaseChip } from './BaseTag';


import * as LSTVGlobals from '../global/globals';

const HeaderBorderButtonStyle = {
    ...ButtonBaseStyle,
    fontWeight: LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
    height: '30px',
    fontSize: '0.937rem',
    lineHeight: '1.125rem',
    padding: '0 4px 0 15px',
    border: '2px solid' + LSTVGlobals.TEXT_AND_SVG_BLACK,
    borderRadius: '20px',
    color: LSTVGlobals.TEXT_AND_SVG_BLACK,
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    [`${media(LSTVGlobals.UserDevice.laptop)}`]: {
        '&:hover': {
            border: `2px solid ${LSTVGlobals.PRIMARY_COLOR}`,
            color: LSTVGlobals.PRIMARY_COLOR,
            '& svg': {
                fill: LSTVGlobals.PRIMARY_COLOR,
            },
        },
    },
};
const HeaderTextButtonStyle = {
    ...HeaderBorderButtonStyle,
    border: 'none',
    fontWeight: LSTVGlobals.FONT_WEIGHT_MEDIUM,
    padding: 0,
    fontSize: '1.125rem',
    lineHeight: '1.312rem',
    transition: 'all 0.3s linear 0s !important',
    backgroundImage: `linear-gradient(to right, #7B3DFF 0, #6A25FF 100%) !important`,
    backgroundPosition: '0 bottom !important',
    backgroundSize: '0% 2px !important',
    backgroundRepeat: 'no-repeat',
    borderRadius: 0,

    [`${media(LSTVGlobals.UserDevice.laptop)}`]: {
        '&:hover': {
            backgroundSize: '100% 2px !important',
        },
    },
};
const EditProfileSchema = Yup.object().shape({
    weddingLocation: Yup.string().min(5, 'too short!').required('Required'),
    weddingDate: Yup.date()
        .min(new Date(), 'must be a future date')
        .required('Required')
        .typeError('must be a valid date: mm/dd/yyyy'),
});

const SpacerDiv = styled.div`
    height: 400px;
    display: flex;
    justify-content: center;
`

const baseMultiSelectOptions = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
    { value: 'chocolate2', label: 'Chocolate2' },
    { value: 'strawberry2', label: 'Strawberry2' },
    { value: 'vanilla2', label: 'Vanilla2' },
    { value: 'chocolate3', label: 'Chocolate3' },
    { value: 'strawberry3', label: 'Strawberry3' },
    { value: 'vanilla3', label: 'Vanilla3' },
];
 
const DesignSystemDemoPage = ({ onSubmit }) => {
    const locationFieldName = 'weddingLocation';
    const [radioValue, setRadioValue] = useState('');
    const [radioValue2, setRadioValue2] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toggleValue, setToggleValue] = useState('');
    const [checkBox1, setCheckBox1] = useState(false);
    const handleCheckBox1 = () => setCheckBox1(!checkBox1)
    const handleMenuClick = () => console.log("props are being passed");
    return (
        <>
            <SpacerDiv/>
            <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <BaseMultiSelect options={baseMultiSelectOptions} defaultOpen />
            </div>
            <SpacerDiv/>

            <BaseChip title="Awesome sauce"/>
            <BaseChip title="Really really long title with words"/>
            <BaseTag title="Enabled"/>
            
            <MenuButton
                onClick={handleMenuClick}
                disabled={false}
            >This is a long item</MenuButton>
            <MenuButton>Discover</MenuButton>
            <MenuButton>Discover</MenuButton>
            <ButtonGroup>
                <MenuButton
                    onClick={handleMenuClick}
                    disabled={false}
                >This is a long item</MenuButton>
                <MenuButton>Discover</MenuButton>
                <MenuButton>Discover</MenuButton>

            </ButtonGroup>
            <HeartToggle />
            <Toggle toggleId={1}/>
            <Toggle disabled toggleId={2}/>
            <Toggle toggleId={3}/>
            <RadioButtonGroup name='radio1'>
                <RadioButton
                    groupValue={radioValue}
                    value='Option 1'
                    handleChange={setRadioValue}
                    labelName="This is option 1"
                />
                <RadioButton
                    groupValue={radioValue}
                    value='Option 2'
                    handleChange={setRadioValue}
                    labelName="This is option 2"
                />
                <RadioButton
                    groupValue={radioValue}
                    value='Option 3'
                    handleChange={setRadioValue}
                    labelName="This is option 3"
                />
            </RadioButtonGroup>
            <RadioButtonGroup name='radio2'>
                <RadioButton
                    
                    groupValue={radioValue2}
                    value='Option 1'
                    handleChange={setRadioValue2}
                    labelName="This is option 1"
                    primary
                />
                <RadioButton
                    primary
                    groupValue={radioValue2}
                    value='Option 2'
                    handleChange={setRadioValue2}
                    labelName="This is option 2"
                />
                <RadioButton
                    primary
                    groupValue={radioValue2}
                    value='Option 3'
                    handleChange={setRadioValue2}
                    labelName="This is option 3"
                />
            </RadioButtonGroup>
            <div>

                <CheckBox 
                    disabled={true} 
                    label="disabled" 
                    checkBoxId={'checkbox1'}
                    
                />
                <CheckBox 
                    label="active" 
                        checkBoxId={'checkbox2'}
                />
                <CheckBox 
                    indeterminate={true} 
                    label="indeterminate" 
                    checkBoxId={'checkbox3'}
                />
                
                <Formik
            initialValues={{
                weddingDate: '',
                [locationFieldName]: '',
            }}
            onSubmit={(values) => {
                onSubmit({
                    weddingDate: values.weddingDate,
                    weddingLocation: {
                        components: values.weddingLocation.address_components,
                        formatted: values.weddingLocation.formatted_address,
                        position: {
                            lat: values.weddingLocation.geometry.location.lat().toString(),
                            long: values.weddingLocation.geometry.location.lng().toString(),
                        },
                    },
                });
            }}
            validationSchema={EditProfileSchema}
            validateOnMount
        >
            {({
                errors,
                touched,
                isSubmitting,
                isValid,
                values,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
            }) => (
                    <StyledForm onSubmit={handleSubmit} maxWidth="576px">
                        <FormRow>
                            <DateInput name="weddingDate" placeholder="" label="When is your wedding?" />
                        </FormRow>
                        <FormRow>
                            <GooglePlacesSearchBar
                                label="Where are you getting married?"
                                identifier={'weddingLocation'}
                                name="weddingLocation"
                                placeHolder={''}
                                type={'string'}
                                placeSelectionHandler={(place) => {
                                    setFieldValue(locationFieldName, place);
                                    setFieldTouched(locationFieldName, true, true);
                                }}
                                textChangeHandler={(text) => {
                                    setFieldValue(locationFieldName, '');
                                    setFieldTouched(locationFieldName, true, true);
                                }}
                                types={['(regions)']}
                                apiKey={'AIzaSyCmkzi07c9x40XQFleo1GU_2VBLWI1vYH8'}
                                blurHandler={(e) => {
                                    handleBlur(e);
                                }}
                            />
                        </FormRow>
                        <FormSubmitButton>
                            <OutlinedCTAButton type="submit" disabled={!isValid || isSubmitting}>Create</OutlinedCTAButton>
                        </FormSubmitButton>
                    </StyledForm>
                )}
        </Formik>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                Modal Content
            </Modal>
           <div>
                <p>Medium CTA</p>
                <BaseCtaButton title="Shop Now" size="medium" />
                <p>Large CTA</p>
                <BaseCtaButton title="Shop Now" size="large" />
                <p>Full Width CTA</p>
                <BaseCtaButton title="Shop Now" size="fullWidth" />
                <p>CTA - Disabled</p>
                <BaseCtaButton title="Shop Now" size="large" disabled />
            </div>
            <WeddingCarousel title="Wedding Team" businesses={newBusinessesMock} />
        </>                        
    );
};

const newBusinessesMock = [
    {
        name: "Emma K Films",
        slug: "emma-k-films",
        role_name: "Videographer",
        role_name_is: null,
        role_slug: "videographer",
        premium: false,
        role_family: "video-photo",
        weight: 10
    },
    {
        name: "An Airbnb",
        slug: "an-airbnb",
        role_name: "Venue",
        role_name_is: null,
        role_slug: "venue",
        premium: false,
        role_family: "venue",
        weight: 4,
        business_capacity_type_name: "Reception Venue",
        business_capacity_type_slug: "reception-venue"
    },
    {
        name: "Kayla Sprint",
        slug: "kayla-sprint",
        role_name: "Photographer",
        role_name_is: null,
        role_slug: "photographer",
        premium: false,
        role_family: "video-photo",
        weight: 1
    },
    {
        name: "Metropolitan Market",
        slug: "metropolitan-market",
        role_name: "Bakery",
        role_name_is: null,
        role_slug: "bakery",
        premium: false,
        role_family: "food-beverage",
        weight: 1
    },
    {
        name: "Washington Floral Service",
        slug: "washington-floral-service",
        role_name: "Florist",
        role_name_is: null,
        role_slug: "florist",
        premium: false,
        role_family: "florals",
        weight: 1
    }
]

 const businessesMock = [
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'Beautini',
         role: {
             name: 'Videographer',
             slug: 'videographer',
             family_type: 'video-photo',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'Prettier',
         role: {
             name: 'Catering',
             slug: 'catering',
             family_type: 'food_beverage',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'ESLint',
         role: {
             name: 'Catering',
             slug: 'venue',
             family_type: 'music_entertainment',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'JazzBand',
         role: {
             name: 'Catering',
             slug: 'music_entertainment',
             family_type: 'music_entertainment',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'Designit',
         role: {
             name: 'Designer',
             slug: 'planning_design',
             family_type: 'music_entertainment',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'Eyal2',
         role: {
             name: 'decor_rentals',
             slug: 'decor_rentals',
             family_type: 'decor_rentals',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'Decors',
         role: {
             name: 'decor_rentals',
             slug: 'decor_rentals',
             family_type: 'decor_rentals',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'Businessit',
         role: {
             name: 'decor_rentals',
             slug: 'decor_rentals',
             family_type: 'decor_rentals',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'LSTV',
         role: {
             name: 'Decor Rentals',
             slug: 'decor_rentals',
             family_type: 'decor_rentals',
         },
     },
     {
         cardSlug: 'https://lstv2web-r.ngrok.io/chloe-jay-wedding-video-september-2017',
         premium: true,
         name: 'Eyal',
         role: {
             name: 'Decor Rentals',
             slug: 'decor_rentals',
             family_type: 'decor_rentals',
         },
     },
 ];

export default DesignSystemDemoPage;
