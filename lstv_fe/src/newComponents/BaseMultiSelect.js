import { useSelect } from 'downshift';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import styled from 'styled-components';
import useMedia from 'use-media';
import { ArrowDown, CheckMark } from '/components/Utility/LSTVSVG';
import theme from '../styledComponentsTheme';
import Flex from '/components/Utility/Flex';
import Modal from './Modal';

const BaseMultiSelectContainer = styled('div')`
    width: 100%;
`

const StyledButton = styled('button')`
    box-sizing: border-box;
    width: 100%;
    display: flex;
    justify-content: space-between;
    background: ${(props) => props.theme.lightGrey};
    border: 1px solid ${(props) => props.theme.midGrey};
    border-radius: 42px;
    text-align: left;
    font-size: 0.9375rem;
    padding: 16px;
    align-items: center;
`;

const StyledMenu = styled('ul')`
    overflow-y: scroll;
    padding-bottom: 120px;
    flex: 1;
`;

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

const MenuModalHeader = styled('div')({
    display: 'flex',
    justifyContent: 'space-between',
    height: 50,
    padding: '8px 16px',
    borderBottom: `1px solid ${theme.midGrey}`,
});

const MenuModalAction = styled('button')`
    font-weight: 600;
    font-size: 1.25em;
    font-weight: 500;
    display: flex;
    align-items: center;
    border: none;
    background: none;
`;

const OptionIcon = styled('div')`
    display: flex;
    width: 24px;
    padding-right: 10px;
    height: 14px;
    height: 100%;
    align-items: center;
`;

export const reactSelectStyles = {
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
        cursor: 'pointer',
    }),
    control: (provided) => ({
        ...provided,
        width: '100%',
        minHeight: 44,
        backgroundColor: theme.lightGrey,
        boxShadow: 'none',
        borderRadius: 10,
        border: `1px solid ${theme.midGrey}`,
        '&:hover': {
            border: `1px solid ${theme.primaryPurple}`,
        }
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
    multiValue: (provided, state) => ({
        ...provided,
        backgroundColor: 'transparent',
        color: theme.black,
        height: '30px',
        alignItems: 'center',
    }),
    multiValueLabel: (provided, state) => ({
        ...provided,
        color: theme.black,
    }),
    multiValueRemove: (provided, state) => ({
        ...provided,
        display: 'none',
    }),
    singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300ms';

        return { ...provided, opacity, transition };
    },
    clearIndicator: (provided) => ({
        ...provided,
        cursor: 'pointer',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        cursor: 'pointer',
    }),
};

/**
 * Use with formatCreateLabel prop for Createable selects.
 * Renders a purple "Create" pill before the input string.
 */
export const renderPillCreateLabel = input => {
    return (
      <Flex align='center'>
        <Flex
          align='center'
          justify='center'
          style={{
            color: theme.white,
            fontWeight: 500,
            padding: '6px 15px',
            marginRight: 10,
            backgroundColor: theme.primaryPurple,
            borderRadius: 20
          }}
        >
          Create
        </Flex>
        &ldquo;{ input }&rdquo;
      </Flex>
    )
  }


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

export const ReactSelectOption = (props) => {
    const { isSelected, data, getStyles, innerProps } = props;

    return <BaseOption isSelected={isSelected} {...innerProps} data={data} style={getStyles('option', props)} />;
};

const MenuModal = ({ open, onCancel, onSelect, children }) => {
    const customStyles = {
        container: {
            alignItems: 'flex-end',
        },
        content: {
            borderRadius: '20px 20px 0 0',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
        },
    };

    return (
        <Modal height="70%" onClose={null} open={open} customStyles={customStyles}>
            <MenuModalHeader>
                <MenuModalAction onClick={onCancel}>Cancel</MenuModalAction>
                <MenuModalAction onClick={onSelect}>Select</MenuModalAction>
            </MenuModalHeader>
            {children}
        </Modal>
    );
};

const BaseMultiSelectMobile = ({ onChange, options, placeholder, customStyles }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemsClone, setItemsClone] = useState([]);

    const { isOpen, closeMenu, getToggleButtonProps, getMenuProps, getItemProps } = useSelect({
        items: options,
        stateReducer: (state, actionAndChanges) => {
            const { changes, type } = actionAndChanges;
            switch (type) {
                case useSelect.stateChangeTypes.ItemClick:
                    return {
                        ...changes,
                        isOpen: true, // keep menu open after selection.
                    };
                default:
                    return changes;
            }
        },
        selectedItem: null,
        onSelectedItemChange: ({ selectedItem }) => {
            let newItems;

            if (!selectedItem) {
                return;
            }

            const index = selectedItems.indexOf(selectedItem);

            if (index > 0) {
                newItems = [...selectedItems.slice(0, index), ...selectedItems.slice(index + 1)]
            } else if (index === 0) {
                newItems = [...selectedItems.slice(1)];
            } else {
                newItems = [...selectedItems, selectedItem];
            }

            setSelectedItems(newItems);
            onChange(newItems);
        },
    });

    useEffect(() => {
        if (isOpen) {
            setItemsClone(selectedItems);
        }
    }, [isOpen]);

    const buttonText = selectedItems?.length
        ? `${selectedItems.map(({ label }) => label).join(', ')}`
        : placeholder || 'Select';

    const handleCancel = () => {
        setSelectedItems(itemsClone);
        closeMenu();
    };

    const handleSelect = () => {
        closeMenu();
    };

    return (
        <div>
            <div>
                <StyledButton type="button" {...getToggleButtonProps()} style={customStyles && customStyles.button}>
                    <span>{buttonText}</span>
                    <ArrowDown fillColor={theme.darkGrey} imageHeight="20px" imageWidth="20px" />
                </StyledButton>
            </div>
            <MenuModal open={isOpen} onCancel={handleCancel} onSelect={handleSelect}>
                <StyledMenu {...getMenuProps()}>
                    {options.map((item, index) => (
                        <BaseOption
                            key={`${item}${index}`}
                            isSelected={selectedItems.includes(item)}
                            data={item}
                            {...getItemProps({ item: item.label, index })}
                        />
                    ))}
                </StyledMenu>
            </MenuModal>
        </div>
    );
};

const StyledSelect = styled(Select)`
    .react-select__control{
        border-radius:  ${props => props.isSquare ? "10px" : "42px"};
    }
`

const BaseMultiSelect = ({ options, defaultOpen, placeholder, onChange, defaultValue, isSquare }) => {
    const isMobile = useMedia(theme.breakpoints.isMobile);
    const [selectedOption, setSelectedOption] = useState(defaultValue || null);

    const handleChange = (options) => {
        setSelectedOption(options);
        if (onChange) {
            onChange(options);
        }
    };

    return (
        <BaseMultiSelectContainer className="base-multi-select">
            {isMobile ? (
                <BaseMultiSelectMobile onChange={onChange} options={options} placeholder={placeholder} />
            ) : (
                <StyledSelect
                    isMulti
                    className='react-select-container'
                    classNamePrefix="react-select"
                    value={selectedOption}
                    defaultValue={defaultValue}
                    onChange={handleChange}
                    options={options}
                    styles={reactSelectStyles}
                    isSquare={isSquare}
                    defaultMenuIsOpen={defaultOpen}
                    hideSelectedOptions={false}
                    blurInputOnSelect={false}
                    closeMenuOnSelect={false}
                    components={{
                        MultiValue: BaseMultiValue,
                        Option: ReactSelectOption,
                    }}
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
            )}
        </BaseMultiSelectContainer>
    );
};

export default BaseMultiSelect;
