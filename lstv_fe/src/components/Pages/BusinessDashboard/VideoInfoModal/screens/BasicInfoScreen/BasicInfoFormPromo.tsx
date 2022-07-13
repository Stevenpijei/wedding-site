import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { maxFieldWidth } from '../../index';
import { CommonProps } from "./index";
import { FormikTextArea, TextInput } from '/newComponents/forms/StyledForm';

const basicValidationSchema = Yup.object({
  title: Yup.string().required('A title is required'),
  content: Yup.string().required('A description is required')
})

const PromoBasicInfoForm = ({ data, onChange, formikRef }: CommonProps) => {
  return (
    <Formik
      initialValues={data}
      validationSchema={basicValidationSchema}
      onSubmit={() => null}
      innerRef={formikRef}
    >
      {({ handleChange, values }) => {
        return (
          <Form style={{ maxWidth: maxFieldWidth }}>
            <TextInput
              name='title'
              label='Title *'
              value={values.title}
              onChange={e => {
                onChange({
                  ...values,
                  title: e.target.value
                })
                handleChange(e)
              }}
            />
            <FormikTextArea 
              name='content'
              label='Video Description *'
              value={values.content}
              onChange={e => {
                onChange({
                  ...values,
                  content: e.target.value
                })
                handleChange(e)
              }}
            />           
          </Form>
        )          
      }}
    </Formik>
  )
}

export default PromoBasicInfoForm