import { capitalize } from '/utils/LSTVUtils';
import { FormikErrors } from 'formik';
import React, { CSSProperties, useEffect, useState } from 'react';
import Select, { OptionsType, OptionTypeBase } from 'react-select';
import styled from 'styled-components';
import { IBusinessRow } from '../../types';
import CreateableBusinessSelect, { ICreateableBusiness, INewBusiness, ISearchBusinessResult } from '/components/CreateableBusinessSelect';
import Flex from '/components/Utility/Flex';
import { reactSelectStyles } from '/newComponents/BaseMultiSelect';
import { ErrorMessage, InputWrapper as SInputWrapper, Label, Input } from '/newComponents/forms/StyledForm';

const InputWrapper = styled(SInputWrapper)`
  margin-left: 0;
  margin-right: 20px;
`

type Props = {
  value?: IBusinessRow,
  onChange: (data: IBusinessRow) => void,
  /**
   * true if you don't want an Email field appearing when a new business name is entered
   */
  disableEmail?: boolean,
  formikErrors?: FormikErrors<IBusinessRow>,
  filterByRoleSlugs?: string[],
  filterStrategy?: 'omit' | 'include',
  style?: CSSProperties,

  defaultRoleOptions: OptionsType<OptionTypeBase>
}

const WeddingBusinessSelectRow = ({
  value,
  disableEmail,
  style,
  formikErrors,
  defaultRoleOptions,
  onChange,
  ...props
}: Props) => {
  useEffect(() => {
    if(!value?.slug) {
      // so long as an existing biz is not selected
      // give roles menu all available options
      setRoles(defaultRoleOptions)
    }

    if(value?.role_slug) {
      const roleForLabel = defaultRoleOptions.find(role => role.value === value.role_slug)
      const selectedRole = {
        label: roleForLabel ? roleForLabel.label : capitalize(value.role_slug),
        value: value.role_slug
      }
      setRole(selectedRole)
    }
  }, [value, defaultRoleOptions])

  let defaultBusinessValue
  if(value) {
    if(value.slug) {
      defaultBusinessValue = {
        slug: value.slug,
        name: value.name
      }

    } else if(value.name) {
      defaultBusinessValue = {
        name: value.name
      }
    }
  }

  // local set of values from all inputs so we can dispatch
  // to onChange as a complete bit of row data
  const [values, setValues] = useState<IBusinessRow>(value)
  // biz as selected by user - use it to manage role options
  const [business, setBusiness] = useState<ICreateableBusiness>()
  // for editing, need to search on selected business and get the available roles
  const [roles, setRoles] = useState<OptionsType<any>>()
  // to easily reset the role input on changing business
  const [role, setRole] = useState<{ label: string, value: string }>()

  const onSelectBusiness = (business: ICreateableBusiness) => {
    setBusiness(business)

    if((business as INewBusiness).__isNew__) {
      setRoles(defaultRoleOptions)

    } else {
      const roles = (business as ISearchBusinessResult).roles.map(role => ({
        label: role.role,
        value: role.role_slug
      }))
      setRoles(roles)
    }

    setRole(null)

    const updatedData: IBusinessRow = {}

    if((business as ISearchBusinessResult).slug) {
      updatedData.name = (business as ISearchBusinessResult).name
      updatedData.slug = (business as ISearchBusinessResult).slug

    } else if ((business as INewBusiness).__isNew__) {
      updatedData.name = (business as INewBusiness).value
    }

    setValues(updatedData)
    onChange(updatedData)
  }

  const onRoleChange = option => {
    setRole(option)

    const updatedData: IBusinessRow = {
      ...values,
      role_slug: option.value
    }
    setValues(updatedData)
    onChange(updatedData)
  }

  const onEmailChange = e => {
    const email: string = e.target.value
    const updatedData: IBusinessRow = {
      ...values,
      email
    }
    setValues(updatedData)
    onChange(updatedData)
  }

  return (
    <Flex style={style}>
      <InputWrapper>
        <Label>Business Name *</Label>
        <CreateableBusinessSelect
          defaultValue={defaultBusinessValue}
          onSelect={onSelectBusiness}
          {...props}
        />
        { formikErrors?.name && <ErrorMessage>{ formikErrors.name }</ErrorMessage> }
        { formikErrors?.slug && <ErrorMessage>{ formikErrors.slug }</ErrorMessage> }
      </InputWrapper>

      <InputWrapper>
        <Label>Role *</Label>
        <Select
          isSearchable={false}
          isDisabled={!defaultBusinessValue && !values?.name}
          options={roles}
          onChange={onRoleChange}
          value={role}
          placeholder=''
          styles={reactSelectStyles}
          components={{
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null
          }}
        />
        { formikErrors?.role_slug && <ErrorMessage>{ formikErrors.role_slug }</ErrorMessage> }
      </InputWrapper>

      {/* TODO: the validation on this is a bit wonky */}
      {/* show email field if user just created a new business or,
          when editing if a value for email or a user-entered business
          name (ie, sans slug) is passed.
      */}
      { !disableEmail &&
        ((business as INewBusiness)?.__isNew__ || (!business && (values?.email || (values?.name && !values?.slug)))) &&
        <InputWrapper hasError={formikErrors?.email}>
          <Label htmlFor='email'>Email</Label>
          <Input
            name='email'
            type='email'
            onChange={onEmailChange}
            value={values?.email}
            hasError={formikErrors?.email ?? ''}
            touched
          />
          { formikErrors?.email && <ErrorMessage>{ formikErrors.email }</ErrorMessage> }
        </InputWrapper>
      }
    </Flex>
  )
}

export default WeddingBusinessSelectRow
