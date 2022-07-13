import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TabBadgeCount from 'components/TabBadgeCount';
import TabPanel from 'components/TabPanel';

import { useTagCount } from 'service/hooks/tag';

import { tagTabs } from 'config/constants';
import { PrivateRoutes } from 'config/routes';

import TagTable from './TagTable';

const Videos: React.FC = () => {
    const { data: tagCounts } = useTagCount();

    const history = useHistory();
    const params = new URLSearchParams(useLocation().search);
    const activeTab = tagTabs.find((tab) => tab.name === params.get('tab'));

    const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
        const newTabName = tagTabs.find((tab) => tab.id === newValue)?.name || '';
        history.push(`${PrivateRoutes.TAGS}?tab=${newTabName}`);
    };

    const { active_count, deleted_count, suggested_count } = tagCounts?.result || {};

    return (
        <div className="table-page">
            <Paper style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                <Tabs value={activeTab?.id || 0} onChange={handleTabChange} indicatorColor="primary">
                    <Tab label={<TabBadgeCount label="Active" count={active_count} className="badge-active" />} />
                    <Tab label={<TabBadgeCount label="Deleted" count={deleted_count} className="badge-deleted" />} />
                    <Tab
                        label={
                            <TabBadgeCount
                                label="Suggested"
                                count={suggested_count}
                                className="badge-suspended-review"
                            />
                        }
                    />
                </Tabs>
            </Paper>
            {tagTabs.map((tab) => (
                <TabPanel key={tab.id} index={tab.id} value={activeTab?.id || 0}>
                    <TagTable scope={tab.name} />
                </TabPanel>
            ))}
        </div>
    );
};

export default Videos;
