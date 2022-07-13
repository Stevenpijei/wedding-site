import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { maxFieldWidth } from '../../index';
import * as S from '../../index.styles';
import { CommonProps } from './index';
import GooglePlacesSearchBar from '/components/Pages/BusinessDashboard/NewGooglePlacesSearchBar';
import Flex from '/components/Utility/Flex';
// AK: does it matter which one we use? ... why are there two anyway??
// import DateInput from '/components/Pages/BusinessDashboard/NewDateInput'
import DateInput from '/newComponents/forms/DateInput';
import { TextInput } from '/newComponents/forms/StyledForm';

const weddingValidationSchema = Yup.object({
  name_spouse_1: Yup.string()
    .max(25, 'Name should be fewer than 25 characters')
    .required('A name for each spouse is required'),
  name_spouse_2: Yup.string()
    .max(25, 'Name should be fewer than 25 characters')
    .required('A name for each spouse is required'),
  event_date: Yup.date()
    .nullable()
    .default(null)
    .required('Wedding date is required'),
  event_location: Yup.object()
    .typeError('Location should be selected from the list')
    .required('Wedding location is required'),
})

type Props = CommonProps & { defaultLocation?: string }

const BasicInfoFormWedding = ({ data, onChange, formikRef, defaultLocation }: Props) => {
  return (
    <Formik
      initialValues={data}
      validationSchema={weddingValidationSchema}
      onSubmit={() => null}
      innerRef={formikRef}
    >
      {({ handleChange, handleBlur, values }) => {
        return (
          <Form>
            <S.Section style={{ maxWidth: maxFieldWidth }}>
              <Flex align='flex-end'>
                <TextInput
                  name='name_spouse_1'
                  label='Who got married? *'
                  placeholder='First Name'
                  value={values.name_spouse_1}
                  onChange={e => {
                    handleChange(e)
                    onChange({
                      ...values,
                      name_spouse_1: e.target.value
                    })
                  }}
                />
                <div style={{ margin: '0 10px 46px' }}>and</div>
                <TextInput
                  name='name_spouse_2'
                  placeholder='First Name'
                  value={values.name_spouse_2}
                  onChange={e => {
                    handleChange(e)
                    onChange({
                      ...values,
                      name_spouse_2: e.target.value
                    })
                  }}
                />
              </Flex>

              <Flex>
                <GooglePlacesSearchBar
                    label='Wedding Location *'
                    identifier='weddingLocation'
                    name='event_location'
                    $placeHolder='City or Zip Code'
                    defaultValue={defaultLocation}
                    type='string'
                    types={['(regions)']}
                    onBlur={handleBlur}
                    onSelected={place => {
                      onChange({
                        ...values,
                        event_location: place
                      })
                    }}
                />
                {/* kinda dumb */}
                <div style={{ width: 30 }}></div>
                <DateInput
                  label='Wedding Date *'
                  name='event_date'
                  placeholder=''
                  onBlur={handleBlur}
                  onChange={date => {
                    onChange({
                      ...values,
                      event_date: date
                    })
                  }}
                />
              </Flex>
            </S.Section>
          </Form>
        )
      }}
    </Formik>
  )
}

export default BasicInfoFormWedding
