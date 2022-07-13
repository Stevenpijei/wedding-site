import React, { useEffect, useState } from 'react'
import AsyncCreateableSelect from 'react-select/async-creatable';
import PublicContentService from '/rest-api/services/publicContentService';
import { renderPillCreateLabel, reactSelectStyles } from '/newComponents/BaseMultiSelect'

export interface ISearchBusinessResult {
  bg_color: string,
  display_location: string,
  label: string,
  name: string,
  premium: boolean,
  role: string,
  role_slug: string,
  roles: {
    role: string,
    role_slug: string
  }[],
  slug: string,
  subscription_level: string,
  value: string,
  weight_videos: number
}

export interface INewBusiness {
  label: string,
  value: string,
  __isNew__: boolean
}

export type ICreateableBusiness = INewBusiness | ISearchBusinessResult

type Props = {
  defaultValue?: Partial<ISearchBusinessResult>,
  filterByRoleSlugs?: string[],
  filterStrategy?: 'omit' | 'include',
  onSelect: (business: ICreateableBusiness) => void
}

const CreateableBusinessSelect = ({
  defaultValue,
  onSelect,
  filterByRoleSlugs,
  filterStrategy='omit'
}: Props) => {
  const [defaultOptions, setDefaultOptions] = useState<Partial<ISearchBusinessResult>[]>()

  let defaultValueOption
  if(defaultValue) {
    if(defaultValue.slug) {
      defaultValueOption = {
        label: defaultValue.name,
        value: defaultValue.slug
      }

    } else {
      defaultValueOption = {
        __isNew__: true,
        label: defaultValue.name,
        value: defaultValue.name
      }
    }
  }

  useEffect(() => {
    (async () => {
      // NOTE: b/e throw a 400 if you search empty string. *shrug* better than no defaults
      const defaults = await loadBusinesses(' ')
      setDefaultOptions(defaults)
    })()
  }, [])

  const loadBusinesses = async (query: string) => {
    try {
      const res = await PublicContentService.selectSearch(query, 'business')
      let businesses: ISearchBusinessResult[] = res.data.result.businesses

      if(filterByRoleSlugs) {
        businesses = businesses.filter(b => {
          if(b.roles.some(role => filterByRoleSlugs.includes(role.role_slug))) {
            return filterStrategy === 'include'
          }
          return filterStrategy === 'omit'
        })
      }

      return businesses.map(b => ({
        ...b,
        label: b.name,
        value: b.slug,
      }))

    } catch(e) {
      // if user leaves/unmounts this component while a req is being
      // made axios may throw an abort error
    }
  }

  const onChange = (option) => {
    if(typeof option.label !== 'string') {
      // occasional react-select bug where the label that's returned
      // is the ReactNode returned by renderPillCreate instead
      // of the string value.
      option.label = option.value
    }

    onSelect(option)
  }

  return (
    <AsyncCreateableSelect
      cacheOptions
      placeholder=''
      defaultValue={defaultValueOption}
      defaultOptions={defaultOptions}
      loadOptions={loadBusinesses}
      onChange={onChange}
      styles={reactSelectStyles}
      createOptionPosition='first'
      formatCreateLabel={renderPillCreateLabel}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
    />
  )
}

export default CreateableBusinessSelect
