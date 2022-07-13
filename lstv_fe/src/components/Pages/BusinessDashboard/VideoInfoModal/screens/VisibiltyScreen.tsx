import { Form, Formik } from 'formik';
import React from 'react';
import styled from 'styled-components';
import * as Yup from 'yup';
import theme from '../../../../../styledComponentsTheme';
import * as S from '../index.styles';
import { IVisibility, VideoType } from '../types';
import HorizontalRule from '/components/HorizontalRule';
import { CheckBox } from '/newComponents/buttons/BaseCheckBox';
import { RadioButton, RadioButtonGroup } from '/newComponents/buttons/BaseRadioButton';
import { TextInput } from '/newComponents/forms/StyledForm';

const Well = styled.div`
  padding: 20px;
  background-color: ${props => props.theme.lightGrey};
  border: 1px solid ${props => props.theme.midGrey};
  border-radius: 10px;
`

const visibilityValidationSchema = Yup.object({
  bride_email: Yup.string().email('Must be a valid email address').nullable(),
  bride_instagram: Yup.string().nullable(),
})

type Props = {
  data?: IVisibility,
  formikRef: any,
  videoType: VideoType,
  onChange: (data: IVisibility) => void
}

const VisibilityScreen = ({ data, onChange, videoType, formikRef }: Props) => {
  if(!data?.visibility) {
    data.visibility = 'public'
  }

  // avoid null input warnings. b/e likes using null.
  if(data?.bride_email === null) data.bride_email = ''
  if(data?.bride_instagram === null) data.bride_instagram = ''

  const onVisChange = visibility => {
    onChange({ visibility })
  }

  return (
    <S.Section>
      <S.H4 style={{ marginBottom: 10 }}>Visibility</S.H4>
      <S.P style={{ marginBottom: 40 }}>
        Choose who can see your video
      </S.P>
      <Well>
        <RadioButtonGroup name='visibility'>
          <RadioButton
            primary
            labelName='Public'
            labelDesc='Everyone can watch your video'
            name='public'
            value='public'
            groupValue={data.visibility}
            handleChange={onVisChange}
          />
          <RadioButton
            primary
            labelName='Unlisted'
            labelDesc='Anyone with the video link can watch your video'
            name='unlisted'
            value='unlisted'
            groupValue={data.visibility}
            handleChange={onVisChange}
          />
        </RadioButtonGroup>
      </Well>

      <HorizontalRule style={{ marginTop: 40 }} />

      <S.H4 style={{ marginTop: 20, marginBottom: 20 }}>
        Social Promotion and Paid Partnerships
      </S.H4>
      <CheckBox
        checkBoxId='optIn'
        label={`I'd like this video considered for features on Love Stories TV's social channels`}
        checked={data?.opt_in_for_social_and_paid}
        onChange={e => {
          onChange({
            opt_in_for_social_and_paid: e.target.checked
          })
        }}
      />
      { videoType === 'wedding' &&
        <>
          <HorizontalRule style={{ marginTop: 40, marginBottom: 30 }} />
          {/*
            as this section is conditional and no validation is
            required on the fields above it's easier to omit them from Formik.
          */}
          <Formik
            initialValues={data}
            validationSchema={visibilityValidationSchema}
            onSubmit={() => null}
            innerRef={formikRef}
          >
            {({ handleChange }) => (
              <Form>
                <S.H4>Couple's Contact Info</S.H4>
                <S.P style={{ margin: '10px 0 20px', maxWidth: 530 }}>
                  Please provide your client's information so our editorial team can
                  reach out to learn more about the wedding for feature opportunities.
                  We will not add them to our mailing list without permission.
                </S.P>
                <div style={{ maxWidth: 290 }}>
                  <TextInput
                    name='bride_email'
                    type='email'
                    label="Couple's Email"
                    value={data?.bride_email}
                    onChange={e => {
                      handleChange(e)
                      onChange({
                        bride_email: e.target.value
                      })
                    }}
                  />
                </div>
                <div style={{ maxWidth: 420 }}>
                  <TextInput
                    name='bride_instagram'
                    label="Instagram Username"
                    placeholder="username"
                    value={data?.bride_instagram}
                    prefixContent={
                      <div style={{
                        marginRight: 10,
                        color: theme.darkerGrey,
                        fontWeight: 500
                      }}>
                        https://instagram.com/
                      </div>
                    }
                    onChange={e => {
                      handleChange(e)
                      onChange({
                        bride_instagram: e.target.value
                      })
                    }}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </>
      }
    </S.Section>
  )
}

export default VisibilityScreen
