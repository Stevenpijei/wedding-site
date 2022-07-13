import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import MuiTabs from '@material-ui/core/Tabs';
import MuiTab from '@material-ui/core/Tab';
import theme from '../../styledComponentsTheme';

interface StyledTabsProps {
  value: number;
  onChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

interface StyledTabProps {
  label: string;
}

const StyledTabs = withStyles({
  root: {
    borderBottom: `1px solid ${theme.lighterGrey}`
  },
  indicator: {
    height: 6,
    backgroundColor: theme.primaryPurple
  }
})((props: StyledTabsProps) => <MuiTabs {...props} />)


const StyledTab = withStyles({
  root: {
    minWidth: 0,
    height: 76,
    padding: 0,
    marginRight: 40,
    '& > span': {
      fontFamily: 'Calibre',
      fontWeight: 500,
      fontSize: 18,
      textTransform: 'none',
    }
  }
})((props: StyledTabProps) => <MuiTab disableRipple {...props} />)

type Props = {
  tabs: {
    label: string,
    id: string
  }[],
  value: number,
  onChange: (index: number) => void
}

const Tabs  = ({ tabs, value, onChange }: Props) => {
  const handleChange = (_, index) => {
    onChange(index)
  }
  
  return (
    <StyledTabs value={value} onChange={handleChange}>
      {
        tabs.map(tab => <StyledTab key={tab.id} label={tab.label} />)
      }
    </StyledTabs>
  )
}

export default Tabs