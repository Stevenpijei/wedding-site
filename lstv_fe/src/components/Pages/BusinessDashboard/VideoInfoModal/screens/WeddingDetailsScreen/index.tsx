import { Form, Formik, FormikErrors } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';
import * as S from '../../index.styles';
import { IBusinessRow, IWeddingDetails } from '../../types';
import WeddingBusinessSelectRow from './WeddingBusinessSelectRow';
import CreateableTagSelect from '/components/CreateableTagSelect';
import HorizontalRule from '/components/HorizontalRule';
import Flex from '/components/Utility/Flex';
import { DeleteIcon, LSTVSVG } from '/components/Utility/LSTVSVG';
import BaseCtaButton from '/newComponents/buttons/BaseCtaButton';
import { FormikTextArea } from '/newComponents/forms/StyledForm';
import { maxFieldWidth } from '../../index'
import { useAppDataService } from '/rest-api/hooks/useAppDataService'

const P = styled(S.P)`
  margin: 13px 0 40px;
`

const validationSchema = Yup.object({
  businesses: Yup.array().of(Yup.object({
    role_slug: Yup.string().required('A role is required'),
    email: Yup.string().email('Must be a valid email address').nullable(),
    slug: Yup.string(),
    name: Yup.string().when('slug', { is: undefined, then: Yup.string().required('Please select a business or create a new one') }),
  })),
  tags: Yup.array().of(Yup.object({
    slug: Yup.string(),
    name: Yup.string()
  })),
  description: Yup.string().nullable(),
})

type Props = {
  data?: IWeddingDetails,
  formikRef?: any,
  onChange: (data: IWeddingDetails) => void
}

type BizType = 'team' | 'fashion'

// businesses w any of the following roles are
// used in the Fashion section below not the
// Wedding Team section.
const fashionSlugs = [
  'dress-designer',
  'suit-designer',
  'shoe-designer',
  'jewelry-shop',
  'headpiece-designer',
  'fashion-stylist',
  'alterations',
  'childrens-apparel',
  // needed to add this because there are businesses with fashion
  // roles from above that also have this role and if selected
  // would not appear correctly under Fashion
  'bridal-salon'
]

// don't ask. our svg icons are janky.
const plusIcon =
  <div style={{ height: 20, width: 20 }}>
    <LSTVSVG icon='plus-sign' fillColor='#fff' imageWidth='30px' imageHeight='30px'  />
  </div>

const WeddingDetailsScreen = ({ data, onChange, formikRef }: Props) => {
  const defaultTeamKey = useRef(uuid())
  const defaultFashionKey = useRef(uuid())

  const { getBusinessTypes } = useAppDataService()
  const [teamDefaultRoleOptions, setTeamDefaultRoleOptions] = useState([])
  const [fashionDefaultRoleOptions, setFashionDefaultRoleOptions] = useState([])

  useEffect(() => {
    (async () => {
      const bizRoles = await getBusinessTypes()
      const roleOptions = bizRoles.map(role => ({
        label: role.name,
        value: role.slug
      }))
      setTeamDefaultRoleOptions(roleOptions.filter(option => !fashionSlugs.includes(option.value)))
      setFashionDefaultRoleOptions(roleOptions.filter(option => fashionSlugs.includes(option.value)))
    })()
  }, [])

  const rowStyle = { flex: 1, maxWidth: maxFieldWidth }

  // sort based on role slug
  let team = [], fashion = []

  if(data.businesses?.length) {
    data.businesses.forEach(b => {
      if(fashionSlugs.includes(b.role_slug)) {
        const fashionBiz = { ...b, key: uuid() }
        if(!fashion.length) {
          fashionBiz.key = defaultFashionKey.current
        }
        fashion.push(fashionBiz)

      } else {
        const teamBiz = { ...b, key: uuid() }
        if(!team.length) {
          teamBiz.key = defaultTeamKey.current
        }
        team.push(teamBiz)
      }
    })
  }

  const [values, setValues] = useState<IWeddingDetails>({
    ...data,
    businesses: [...team, ...fashion]
  })

  // additional rows beyond the default first
  const [teamRows, setTeamRows] = useState(team.length > 0 ? team.slice(1, team.length) : team)
  const [fashionRows, setFashionRows] = useState(fashion.length > 0 ? fashion.slice(1, fashion.length) : fashion)

  const AddButton = ({ type }: { type: BizType }) =>
    <BaseCtaButton
      title='Add Business'
      size='medium'
      icon={plusIcon}
      onClick={() => onAddBusiness(type)}
    />

  const DeleteButton = ({ type, id }: { type: BizType, id: string }) =>
    <BaseCtaButton
      size='iconOnly'
      icon={<DeleteIcon fillColor='white' />}
      onClick={() => onDeleteBusiness(type, id)}
    />

  const onAddBusiness = (type: BizType) => {
    type === 'team' ?
      setTeamRows([...teamRows, { key: uuid() }]) :
      setFashionRows([...fashionRows, { key: uuid() }])
  }

  const onDeleteBusiness = (type: BizType, key: string) => {
    if(type === 'team') {
      const updatedTeams = [...teamRows].filter(row => row.key !== key)
      setTeamRows(updatedTeams)

    } else {
      const updatedFashion = [...fashionRows].filter(row => row.key !== key)
      setFashionRows(updatedFashion)
    }

    const updatedBusinesses = values.businesses.filter(value => value.key !== key)
    setValues({
      ...values,
      businesses: updatedBusinesses
    })
    sanitizedOnChange(updatedBusinesses)
  }

  const onChangeBusinessRow = (row: IBusinessRow, key: string) => {
    row.key = key
    const updatedBusinesses = []

    if(values.businesses.length) {
      let updated = false
      // if this change was an update to an existing row
      values.businesses.forEach(biz => {
        if(biz.key === key) {
          updated = true
          updatedBusinesses.push(row)
        } else {
          updatedBusinesses.push(biz)
        }
      })

      // if this was a newly created row
      if(!updated) {
        updatedBusinesses.push(row)
      }

    } else {
      updatedBusinesses.push(row)
    }

    setValues({
      ...values,
      businesses: updatedBusinesses
    })
    sanitizedOnChange(updatedBusinesses)
  }

  const sanitizedOnChange = (businesses) => {
    // strip key before sending the change up
    const businessesSansKey = businesses.map(biz => {
      const bizSansKey = { ...biz }
      delete bizSansKey.key
      return bizSansKey
    })

    onChange({
      businesses: businessesSansKey
    })
  }

  const getBusinessErrors = (errors: FormikErrors<IWeddingDetails>, key: string): FormikErrors<IBusinessRow> => {
    if(!errors?.businesses?.length) return

    const index = values.businesses.findIndex(biz => biz.key === key)
    return errors.businesses[index] as FormikErrors<IBusinessRow>
  }

  return (
    <Formik
      initialValues={data}
      validationSchema={validationSchema}
      onSubmit={() => null}
      innerRef={formikRef}
    >
      {({ handleChange, values, errors }) => {
        return (
          <Form>
            <S.Section>
              <S.H4>Wedding Team</S.H4>
              <P>
                Give credit to your colleagues! Tag your fellow pros who worked
                on this wedding. The more vendors you tag, the more frequently your
                video will appear in search.
              </P>
              <WeddingBusinessSelectRow
                filterByRoleSlugs={fashionSlugs}
                filterStrategy='omit'
                value={team.length > 0 ? team[0] : undefined}
                defaultRoleOptions={teamDefaultRoleOptions}
                onChange={data => {
                  onChangeBusinessRow(data, defaultTeamKey.current)
                }}
                formikErrors={getBusinessErrors(errors, defaultTeamKey.current)}
                style={rowStyle}
              />
              {
                teamRows.map((row, index) =>
                  <Flex key={row.key} align='center'>
                    <WeddingBusinessSelectRow
                      filterByRoleSlugs={fashionSlugs}
                      filterStrategy='omit'
                      style={rowStyle}
                      value={team[index + 1]}
                      defaultRoleOptions={teamDefaultRoleOptions}
                      onChange={data => onChangeBusinessRow(data, row.key)}
                      formikErrors={getBusinessErrors(errors, row.key)}
                    />
                    <DeleteButton type='team' id={row.key} />
                  </Flex>
                )
              }
              <AddButton type='team' />
            </S.Section>

            <HorizontalRule />

            <S.Section>
              <S.H4>Fashion</S.H4>
              <P>
                Providing fashion designer information allows us to come to you
                with feature and paid partnership opportunities.
              </P>
              <WeddingBusinessSelectRow
                disableEmail
                filterByRoleSlugs={fashionSlugs}
                filterStrategy='include'
                value={fashion.length > 0 ? fashion[0] : undefined}
                defaultRoleOptions={fashionDefaultRoleOptions}
                onChange={data => onChangeBusinessRow(data, defaultFashionKey.current)}
                formikErrors={getBusinessErrors(errors, defaultFashionKey.current)}
                style={rowStyle}
              />
              {
                fashionRows.map((row, index) =>
                  <Flex key={row.key} align='center'>
                    <WeddingBusinessSelectRow
                      disableEmail
                      filterByRoleSlugs={fashionSlugs}
                      filterStrategy='include'
                      style={rowStyle}
                      value={fashion[index + 1]}
                      defaultRoleOptions={fashionDefaultRoleOptions}
                      onChange={data => onChangeBusinessRow(data, row.key)}
                      formikErrors={getBusinessErrors(errors, row.key)}
                    />
                    <DeleteButton type='fashion' id={row.key} />
                  </Flex>
                )
              }
              <AddButton type='fashion' />
            </S.Section>

            <HorizontalRule />

            <S.Section>
              <S.H4>Wedding Styles</S.H4>
              <P>What kind of wedding was this? Help engaged couples discover your work.</P>
              <div style={{ maxWidth: maxFieldWidth }}>
                <CreateableTagSelect
                  values={data?.tags}
                  onChange={tags => {
                    onChange({ tags })
                  }}
                />
              </div>
            </S.Section>

            <HorizontalRule />

            <S.Section>
              <S.H4>Wedding Description</S.H4>
              <P>
                This description will be published on the video page. The more you can
                share about the wedding, the better! Prospective clients love to hear what
                made a wedding special.
              </P>
              <div style={{ maxWidth: maxFieldWidth }}>
                <FormikTextArea
                  name='content'
                  placeholder='How did the couple meet and fall in love?'
                  value={values.content ?? ''}
                  onChange={e => {
                    onChange({ content: e.target.value })
                    handleChange(e)
                  }}
                />
              </div>
            </S.Section>
          </Form>
        )
      }}
    </Formik>
  )
}

export default WeddingDetailsScreen
