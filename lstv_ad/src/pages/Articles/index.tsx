import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Paper, Tab, Tabs } from '@material-ui/core';

import TabBadgeCount from 'components/TabBadgeCount';
import TabPanel from 'components/TabPanel';

import { useArticleCount } from 'service/hooks/article';

import { articleTabs } from 'config/constants';
import { PrivateRoutes } from 'config/routes';

import ArticleTable from './ArticleTable';

const Articles: React.FC = () => {
    const { data: articleCounts } = useArticleCount();

    const history = useHistory();
    const params = new URLSearchParams(useLocation().search);
    const activeTab = articleTabs.find((tab) => tab.name === params.get('tab'));

    const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
        const newTabName = articleTabs.find((tab) => tab.id === newValue)?.name || '';
        history.push(`${PrivateRoutes.ARTICLES}?tab=${newTabName}`);
    };

    const { active_count, active_review, suspended, suspended_review, deleted } = articleCounts?.result || {};

    return (
        <div className="table-page">
            <Paper style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                <Tabs value={activeTab?.id || 0} onChange={handleTabChange} indicatorColor="primary">
                    <Tab label={<TabBadgeCount label="Active" count={active_count} className="badge-active" />} />
                    <Tab
                        label={
                            <TabBadgeCount
                                label="Active/Review"
                                count={active_review}
                                className="badge-active-review"
                            />
                        }
                    />
                    <Tab
                        label={
                            <TabBadgeCount
                                label="Suspended/Review"
                                count={suspended_review}
                                className="badge-suspended-review"
                            />
                        }
                    />
                    <Tab label={<TabBadgeCount label="Suspended" count={suspended} className="badge-suspended" />} />
                    <Tab label={<TabBadgeCount label="Deleted" count={deleted} className="badge-deleted" />} />
                </Tabs>
            </Paper>
            {articleTabs.map((tab) => (
                <TabPanel key={tab.id} index={tab.id} value={activeTab?.id || 0}>
                    <ArticleTable scope={tab.name} />
                </TabPanel>
            ))}
        </div>
    );
};

export default Articles;
