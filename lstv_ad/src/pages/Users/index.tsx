import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Paper, Tab, Tabs } from '@material-ui/core';

import TabPanel from 'components/TabPanel';
import TabBadgeCount from 'components/TabBadgeCount';

import { useUserCount } from 'service/hooks/user';

import { userTabs } from 'config/constants';
import { PrivateRoutes } from 'config/routes';

import UserTable from './UserTable';

const Users: React.FC = () => {
    const { data: userCounts } = useUserCount();

    const history = useHistory();
    const params = new URLSearchParams(useLocation().search);
    const activeTab = userTabs.find((tab) => tab.name === params.get('tab'));

    const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
        const newTabName = userTabs.find((tab) => tab.id === newValue)?.name || '';
        history.push(`${PrivateRoutes.USERS}?tab=${newTabName}`);
    };

    const { active_count, active_review_count, suspended_count, suspended_review_count, deleted_count } =
        userCounts?.result || {};

    return (
        <div className="table-page">
            <Paper style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                <Tabs value={activeTab?.id || 0} onChange={handleTabChange} indicatorColor="primary">
                    <Tab label={<TabBadgeCount label="Active" count={active_count} className="badge-active" />} />
                    <Tab
                        label={
                            <TabBadgeCount
                                label="Active/Review"
                                count={active_review_count}
                                className="badge-active-review"
                            />
                        }
                    />
                    <Tab
                        label={
                            <TabBadgeCount
                                label="Suspended/Review"
                                count={suspended_review_count}
                                className="badge-suspended-review"
                            />
                        }
                    />
                    <Tab
                        label={<TabBadgeCount label="Suspended" count={suspended_count} className="badge-suspended" />}
                    />
                    <Tab label={<TabBadgeCount label="Deleted" count={deleted_count} className="badge-deleted" />} />
                </Tabs>
            </Paper>
            {userTabs.map((tab) => (
                <TabPanel key={tab.id} index={tab.id} value={activeTab?.id || 0}>
                    <UserTable scope={tab.name} />
                </TabPanel>
            ))}
        </div>
    );
};

export default Users;
