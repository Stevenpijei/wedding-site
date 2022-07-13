import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TabBadgeCount from 'components/TabBadgeCount';
import TabPanel from 'components/TabPanel';

import { useVideoCount } from 'service/hooks/video';

import { videoTabs } from 'config/constants';
import { PrivateRoutes } from 'config/routes';

import VideoTable from './VideoTable';

const Videos: React.FC = () => {
    const { data: videoCounts } = useVideoCount();

    const history = useHistory();
    const params = new URLSearchParams(useLocation().search);
    const activeTab = videoTabs.find((tab) => tab.name === params.get('tab'));

    const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
        const newTabName = videoTabs.find((tab) => tab.id === newValue)?.name || '';
        history.push(`${PrivateRoutes.VIDEOS}?tab=${newTabName}`);
    };

    const { active_count, active_review_count, suspended_count, suspended_review_count, deleted_count } =
        videoCounts?.result || {};

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
            {videoTabs.map((tab) => (
                <TabPanel key={tab.id} index={tab.id} value={activeTab?.id || 0}>
                    <VideoTable scope={tab.name} />
                </TabPanel>
            ))}
        </div>
    );
};

export default Videos;
