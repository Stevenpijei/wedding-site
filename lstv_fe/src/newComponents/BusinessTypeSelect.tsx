import React from 'react';
import Select, { Props as ReactSelectProps, SingleValueProps } from 'react-select';
import styled from 'styled-components';
import { VendorsIcon, SelectCaret } from '../components/Utility/LSTVSVG';
import theme from '../styledComponentsTheme';
import { reactSelectStyles as baseSelectStyles } from './BaseMultiSelect';
import { useSearch } from './Search/use-search';
import { useMediaReady } from '/utils/LSTVUtils';
import useHover from '/hooks/useHover'

const StyledOption = styled.div<ReactSelectProps>`
  position: relative;
  cursor: pointer !important;

  .color-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    background-color: ${props => props.data.bg_color};
  }
`

const IconContainer = styled.div`
  width: 28px;
  height: 26px;
  margin-right: 10px;
`

const Text = styled.p`
  font-size: 18px;
  font-weight: 500;
`

const Placeholder = () => 
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <IconContainer>
      <VendorsIcon fillColor='#000' />
    </IconContainer>
    <Text>What are you looking for?</Text>
  </div>

const BaseOption = (props: ReactSelectProps) => {
  const [ref, hovered] = useHover()
  return (
    <StyledOption {...props} ref={ref}>
      <div className='color-bar' />
      <IconContainer>
        <VendorsIcon fillColor={hovered ? theme.primaryPurple : theme.darkerGrey} />
      </IconContainer>
      <Text>{ props.data.name }</Text>
    </StyledOption>
  )
}

const Option = (props) => {
  const { isSelected, data, getStyles, innerProps } = props
  return (
    <BaseOption
      {...innerProps}
      isSelected={isSelected}
      data={data}
      style={getStyles('option', props)}
    />
  )
};

const SingleValue = (props: SingleValueProps<any>) => 
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <IconContainer>
      <VendorsIcon fillColor='white' />
    </IconContainer>
    <Text>{ props.data.name }</Text>
  </div>

const DropdownIndicator = (props: ReactSelectProps) => 
  // maxWidth to fix a bug in Chrome
  props.hasValue && <div style={{ maxWidth: 30 }}><SelectCaret fill='white' /></div>

const reactSelectStyles = {
  ...baseSelectStyles,
  control: (provided, state) => ({
    ...baseSelectStyles.control(provided),
    height: 55,    
    minWidth: 284,
    borderRadius: 42,
    paddingLeft: 14,
    paddingRight: 10,
    cursor: 'pointer',      
    // having a hell of a time figuring out where border color is spec'd and why !important is necessary.
    borderColor: `${state.isFocused ?
        state.hasValue ? state.selectProps.value.bg_color : theme.darkGrey :
        theme.midGrey} !important`,
    '&:hover': {
      borderColor: !state.hasValue && `${theme.darkGrey} !important`
    },
    color: state.hasValue ? theme.white : theme.black,
    background: state.hasValue ? state.selectProps.value.bg_color : theme.lightGrey  
  }),
  menu: (provided) => ({
    ...baseSelectStyles.menu(provided),
    boxShadow: '0px 0px 14px rgba(0, 0, 0, 0.25)',
    borderRadius: 10
  }),
  menuList: (provided) => ({
    ...baseSelectStyles.menuList(provided),
    paddingTop: 0
  }),
  option: (provided, state) => ({
    ...baseSelectStyles.option(provided, state),
    height: 46,
    paddingLeft: 31
  })
}

type Props = {
  // TSFIXME Directory
  value: any,
  onChange: (value: any) => void
}

const BusinessTypeSelect = ({ value, onChange }: Props) => {
  const { roleDirectories } = useSearch()
  const [laptop] = useMediaReady(theme.breakpoints.laptop, false)
  const styles = { ...reactSelectStyles }

  if(laptop) {
    styles.control = (provided, state) => ({
      ...reactSelectStyles.control(provided, state),
      minWidth: 365
    })
  }

  return (
    <Select
      isSearchable={false}
      options={roleDirectories}
      value={value}
      styles={styles}
      // @ts-ignore react select components get annoying about internal prop types that aren't important to us
      components={{ Placeholder, Option, SingleValue, DropdownIndicator, IndicatorSeparator: null }}
      onChange={onChange}
    />
  )
}

export default BusinessTypeSelect