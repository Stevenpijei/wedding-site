import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Paper, Tab, Tabs } from '@material-ui/core';
import classNames from 'classnames';

import TabPanel from 'components/TabPanel';
import TabBadgeCount from 'components/TabBadgeCount';

import { useBusinessCount } from 'service/hooks/business';

import { businessTabs } from 'config/constants';
import { PrivateRoutes } from 'config/routes';

import BusinessTable from './BusinessTable';
import './styles.scss';

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '100%',
        },
    })
);

const Businesses: React.FC = () => {
    const classes = useStyles();

    const history = useHistory();
    const params = new URLSearchParams(useLocation().search);
    const activeTab = businessTabs.find((tab) => tab.name === params.get('tab'));

    const { data: businessCounts } = useBusinessCount();

    const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
        const newTabName = businessTabs.find((tab) => tab.id === newValue)?.name || '';
        history.push(`${PrivateRoutes.BUSINESSES}?tab=${newTabName}`);
    };

    const {
        active_count,
        active_review_count,
        suspended_count,
        suspended_review_count,
        deleted_count,
        vendor_suggested,
    } = businessCounts?.result || {};

    return (
        <div className={classNames(classes.root, 'business-tables', 'table-page')}>
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
                    <Tab
                        label={
                            <TabBadgeCount
                                label="Vendor Suggested"
                                count={vendor_suggested}
                                className="badge-vendor-suggested"
                            />
                        }
                    />
                </Tabs>
            </Paper>
            {businessTabs.map((tab) => (
                <TabPanel key={tab.id} index={tab.id} value={activeTab?.id || 0}>
                    <BusinessTable scope={tab.name} />
                </TabPanel>
            ))}
        </div>
    );
};

export default Businesses;
