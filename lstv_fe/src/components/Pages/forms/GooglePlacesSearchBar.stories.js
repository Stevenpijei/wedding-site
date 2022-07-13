import React from 'react';

import { Formik } from 'formik';

import GooglePlacesSearchBar from './GooglePlacesSearchBar'

export default {
    title: 'Forms/GooglePlacesSearchBar',
    component: GooglePlacesSearchBar,
    // subcomponents: [TextInput, DateInput, FormSubmitButton],
    parameters: { actions: { argTypesRegex: '^on.*' } }
};

// const Template = (args) => 
export const googleSearchComponent = ({ handleBlur, }) => (
    <Formik initialValues={{}}>
        <form>
            <GooglePlacesSearchBar
                label="Where are you getting married?"
                identifier={'weddingLocation'}
                name="weddingLocation"
                placeHolder={''}
                type={'string'}
                // placeSelectionHandler={(place) => {
                //     setFieldValue(locationFieldName, place);
                //     setFieldTouched(locationFieldName, true, true);
                // }}
                placeSelectionHandle={console.log}
                // textChangeHandler={(text) => {
                //     setFieldValue(locationFieldName, '');
                //     setFieldTouched(locationFieldName, true, true);
                // }}
                textChangeHandler={console.log}
                types={['(regions)']}
                apiKey={'AIzaSyCmkzi07c9x40XQFleo1GU_2VBLWI1vYH8'}
                // blurHandler={(e) => {
                //     handleBlur(e);
                // }}
                blurHandler={console.log}
            />
        </form>
    </Formik>
)

googleSearchComponent.args = {};
