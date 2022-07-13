import React from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TabPanel from 'components/TabPanel';

import HomePageLineUp from './HomePageLineUp';
import General from './General';

const Videos: React.FC = () => {
    const [value, setValue] = React.useState<number>(0);

    const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
        setValue(newValue);
    };

    return (
        <div className="table-page">
            <Paper style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                <Tabs value={value} onChange={handleTabChange} indicatorColor="primary">
                    <Tab label="General" />
                    <Tab label="Home Page Line Up" />
                </Tabs>
            </Paper>
            <TabPanel value={value} index={0}>
                <General />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <HomePageLineUp />
            </TabPanel>
        </div>
    );
};

export default Videos;
