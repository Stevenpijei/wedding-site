import React, { useState } from 'react';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import AsyncCreateableSelect from 'react-select/async-creatable';
import useMedia from 'use-media';
import theme from '../../../styledComponentsTheme';
import { CheckMark } from '../../Utility/LSTVSVG';
import PublicContentService from '../../../rest-api/services/publicContentService';



const BaseMultiSelectContainer = styled('div')`
    width: 100%;
    padding-bottom: 100px;
`

  
const StyledOption = styled('div')((props) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.black,
    height: 40,
    paddingLeft: 24,
    backgroundColor: props.isFocused || props.isSelected ? theme.lightGrey : 'white',
    fontWeight: '400',
}));

const MultiValueLabel = styled('p')({
    padding: '2px',
});

const OptionIcon = styled('div')`
    display: flex;
    width: 24px;
    padding-right: 10px;
    height: 14px;
    height: 100%;
    align-items: center;
`;

const reactSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        color: theme.black,
        height: 40,
        paddingLeft: 24,
        backgroundColor: state.isFocused || state.isSelected ? theme.lightGrey : 'white',
        fontWeight: '400',
    }),
    container: (provided) => ({
        ...provided,
        width: '100%',
        color: theme.black,
        boxShadow: '0',
    }),
    control: (provided) => ({
        ...provided,
        width: '100%',
        minHeight: '44px',
        borderRadius: '42px',
        backgroundColor: theme.lightGrey,
        boxShadow: 'none',
        border: `1px solid ${theme.midGrey}`
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
        borderRadius: '10px',
        boxShadow: '0px 0px 6px rgba(186, 186, 186, 0.25)',
        border: '0',
    }),
    menuList: (provided) => ({
        ...provided,
        borderRadius: '10px',
        paddingTop: 16,
        paddingBottom: 16,
        maxHeight: 300,
    }),
    // multiValue: (base, state) => {
    //     return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
    // },
    // multiValueLabel: (base, state) => {
    // return state.data.isFixed
    //     ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
    //     : base;
    // },
    // multiValueRemove: (base, state) => {
    // return state.data.isFixed ? { ...base, display: 'none' } : base;
    // },
    multiValue: (provided, state) => ({
        ...provided,
        backgroundColor: '#6A25ff',
        color: theme.white,
        height: '30px',
        alignItems: 'center',
        borderRadius: '15px'

     
    }),
    multiValueLabel: (provided, state) => ({
        ...provided,
        backgroundColor: '#6A25ff',
        color: theme.white,
        alignItems: 'center',
        borderTopLeftRadius: '15px',
        borderBottomLeftRadius: '15px'
      
    }),
    multiValueRemove: (provided, state) => ({
        ...provided,
        
       
    }),

    singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300ms';

        return { ...provided, opacity, transition };
    },
    clearIndicator: (provided) => ({
        ...provided,
        cursor: 'pointer',
        color: theme.white,
        
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        cursor: 'pointer',
    }),
};

const BaseMultiValue = (props) => {
    const values = props.getValue && props.getValue();
    const isLast = values && values.length && values[values.length - 1].value === props.data.value;

    return (
        <MultiValueLabel>
            {props.data.label}
            {!isLast ? ',' : ''}
        </MultiValueLabel>
    );
};

const BaseOption = (props) => {
    return (
        <StyledOption {...props}>
            <OptionIcon>
                {props.isSelected ? (
                    <CheckMark imageHeight={16} fillColor={theme.primaryPurple} strokeColor={theme.primaryPurple} />
                ) : null}
            </OptionIcon>
            {props.data.label}
        </StyledOption>
    );
};

const ReactSelectOption = (props) => {
    const { isSelected, data, getStyles, innerProps } = props;

    return <BaseOption isSelected={isSelected} {...innerProps} data={data} style={getStyles('option', props)} />;
};


const BaseMultiSelect2 = ({ options, defaultOpen, placeholder, onChange, isBusiness }) => {
    const isMobile = useMedia(theme.breakpoints.isMobile);
    const [selectedOption, setSelectedOption] = useState(null);
    

    const handleChange = (options) => {
        console.log("this getting called", options);
        setSelectedOption(options);

        if (onChange) {
            onChange(options);
        }
    };
    const filterOptions = inputValue => {
        return options.filter(i => 
            i.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    }
    const searchFreeText = async (inputValue) => {
        console.log("triggered", value)
        const request = await PublicContentService.search(value, '')
        console.log("Working",request )
    }
    const promiseOptions = async(inputValue) =>  {
        //1 - get the response on the console using the input
        //2 - use a try catch to resolve a promise 
        // 3 - 

        console.log("is this getting called more:", inputValue)
        
        const response = PublicContentService.selectSearch(inputValue );
        // console.log("Response is ", response?.data?.result?.tags);
        return response

        // return new Promise(resolve => {
        //         setTimeout(() => {
        //              resolve(filterOptions(inputValue))
        //          }, 500)
        //      })
      // return await PublicContentService.search(inputValue, '')
      //wire up search service here, toggle for the different kinds

    }
    //refactor this
    const addLabelField = (input, type) => {
        // console.log("input should be tags",input )
        // console.log("destructuring", input?.data?.result?.businesses)

        return input?.data?.result?.businesses.map((element, index) => {
            return {
                "label": element.name,
                "value": element.name, 
                "slug": element.slug
            }
        })
    }
    const getAsyncOptions = (inputValue) => {
        return new Promise((resolve, reject) => {
            PublicContentService.selectSearch(inputValue, 'business').then((result) => {
                console.log("Results are", result)
                // console.log(addLabelField(result))
                resolve(addLabelField(result))
            })
            .catch((error) => {
                reject(Error("search failed"))
            })
        })
    }
    const addLabelFieldTag = (input) => {
        console.log("input should be tags",input )
        console.log("destructuring", input?.data?.result?.tags)

        return input?.data?.result?.tags.map((element, index) => {
            console.log("tags are here",element )
            return {
                "label": element.name,
                "value": element.name, 
                "slug": element.slug
            }
        })
    }
    const getAsyncOptionsTag = (inputValue) => {
        return new Promise((resolve, reject) => {
            PublicContentService.selectSearch(inputValue, 'tag').then((result) => {
                console.log("Results are", result)
                // console.log(addLabelField(result))
                resolve(addLabelFieldTag(result))
            })
            .catch((error) => {
                reject(Error("search failed"))
            })
        })
    }
    //TODO add drop down for vendors. 
    //
    return (
        <BaseMultiSelectContainer className="base-multi-select">
            <AsyncCreateableSelect
                isMulti
                value={selectedOption}
                onChange={handleChange}
                loadOptions={isBusiness ? getAsyncOptions: getAsyncOptionsTag}
                styles={reactSelectStyles}
                defaultMenuIsOpen={defaultOpen}
                hideSelectedOptions={false}
                blurInputOnSelect={false}
                closeMenuOnSelect={false}
             
                placeholder={placeholder}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        danger: 'white',
                        dangerLight: '#793DFA',
                        primary: '#793dfa',
                        neutral50: '#9b9b9b',
                    },
                })}
            />
        </BaseMultiSelectContainer>
    );
};

export default BaseMultiSelect2;
