import React, { useState } from 'react';
import Select from 'react-select';
import theme from '../styledComponentsTheme'

const customStyles = {
    option: (provided, state) => ({
        ...provided,
        borderBottom: `1px solid ${theme.midGrey}`,
        color: state.isSelected ? 'blue' : '#oco9oa',
        height: 40,
        backgroundColor: state.isFocused ? '#ececec' : 'white',
        fontWeight: '300',
    }),
    container: (provided) => ({
        ...provided,
        width: '100%',
        color: theme.black,
        
    }),
    control: (provided) => ({
        ...provided,
        width: '100%',
        minHeight: '44px',
        borderRadius: '10px',
        backgroundColor: theme.lightGrey,
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
        borderRadius: '30px',
    }),
    menuList: (provided) => ({
        ...provided,
        borderRadius: '30px',
        padding: 0,
    }),
    multiValue: (provided, state) => ({
        ...provided,
        backgroundColor: '#6A25FF',
        height: '30px',
        alignItems: 'center',
        paddingRight: '2px',
        borderRadius: '15px',
    }),
    multiValueLabel: (provided, state) => ({
        ...provided,
        color: 'white',
        marginLeft: '4px',
        marginRight: '2px',
        marginTop: '0px',
        marginBottom: '0px',
        paddingRight: '10px',
        paddingBottom: '5px',
    }),
    multiValueRemove: (provided, state) => ({
        ...provided,
        backgroundColor: 'white',
        color: '#793DFA',
        borderRadius: '12px',
        width: '24px',
        height: '24px',
        marginRight: '2px',
        paddingLeft: '6px',
        cursor: 'pointer',
    }),
    singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300ms';

        return { ...provided, opacity, transition };
    },
    clearIndicator: provided => ({
      ...provided,
      cursor: 'pointer'
    }),
    dropdownIndicator: provided => ({
      ...provided,
      cursor: 'pointer'
    })
};

const BaseChipsSelect = ({ options, defaultOpen, placeholder, onChange }) =>  {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleChange = options => {
    setSelectedOption(options)
    onChange(options)
  }

  return (
    <Select
      isMulti
      value={selectedOption}
      onChange={handleChange}
      options={options}
      styles={customStyles}
      defaultMenuIsOpen={true}
      placeholder={placeholder}
      theme={theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          danger: 'white',
          dangerLight: '#793DFA',
          primary: '#793dfa',
          neutral50: '#9b9b9b'
        },
      })}
    />
  );
}

export default BaseChipsSelect;

