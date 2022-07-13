import React from 'react';
import AsyncCreateableSelect from 'react-select/async-creatable';
import { reactSelectStyles, renderPillCreateLabel } from '/newComponents/BaseMultiSelect';
import PublicContentService from '/rest-api/services/publicContentService';
import theme from '../../styledComponentsTheme';
import { ITag } from '../Pages/BusinessDashboard/VideoInfoModal/types';

type Props = {
  values?: ITag[],
  onChange: (tags: ITag[]) => void
}

const CreateableTagSelect = ({ values, onChange }: Props) => {  
  const defaultTags = (values || []).map(tag => ({
    label: tag.name,
    value: tag.name,
    slug: tag.slug
  }))

  const loadTags = async (query: string) => {
    const res = await PublicContentService.selectSearch(query, 'tag')
    const { tags } = res.data.result

    return tags.map(tag => ({
      label: tag.name,
      value: tag.name,
      slug: tag.slug
    }))
  }

  /**
   * drop the react-select option props
   */
  const sanitizeTags = (tags) => {
    return tags?.map(tag => {
      if(tag.__isNew__) {
        return {
          name: tag.label          
        }
      }
      return {
        name: tag.label,
        slug: tag.slug
      }
    })
  }

  return (
    <AsyncCreateableSelect
      cacheOptions
      isMulti
      loadOptions={loadTags}
      defaultValue={defaultTags}
      placeholder='Ex.: Lesbian, Jewish, Boho, Rustic, Military, etc.'
      onChange={options => onChange(sanitizeTags(options))}
      // TODO: eventually abstract this to a component library
      styles={{
        ...reactSelectStyles,
        multiValue: base => ({
          ...base,
          backgroundColor: theme.primaryPurple,          
          padding: '4px 8px',
          borderRadius: 60,
          alignItems: 'center',
        }),
        multiValueLabel: base => ({
          ...base,
          color: theme.white,
          fontWeight: 500
        }),
        multiValueRemove: () => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.primaryPurple,
          borderRadius: '50%',
          backgroundColor: theme.white,
          width: 20,
          height: 20,
          marginLeft: 6,
          cursor: 'pointer',
        })
      }}
      createOptionPosition='first'
      formatCreateLabel={renderPillCreateLabel}
      components={{      
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
    />
  )
}

export default CreateableTagSelect