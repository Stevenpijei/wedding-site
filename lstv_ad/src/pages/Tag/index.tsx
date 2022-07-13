import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Box, Paper, Tab, Tabs } from '@material-ui/core';

import NotFoundPage from 'pages/NotFound';

import LoadingIndicator from 'components/LoadingIndicator';
import TabPanel from 'components/TabPanel';

import { PrivateRoutes } from 'config/routes';

import { useTag } from 'service/hooks/tag';
import { setPageBreadCrumbs } from 'store/reducers/pageBreadCrumb';

import GeneralInfo from './GeneralInfo';

const Tag: React.FC = () => {
    const dispatch = useDispatch();
    const { id: slug } = useParams<{ id: string }>();
    const { data, isLoading, isError } = useTag(slug);
    const [value, setValue] = useState<number>(0);

    useEffect(() => {
        if (data && data.result) {
            dispatch(
                setPageBreadCrumbs([
                    {
                        title: 'Tags',
                        link: PrivateRoutes.TAGS,
                    },
                    {
                        title: data.result.name,
                    },
                ])
            );
        }
    }, [data]);

    const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
        setValue(newValue);
    };

    if (isLoading) return <LoadingIndicator />;

    if (!isLoading && isError) {
        return <NotFoundPage />;
    }

    return (
        <Box>
            {data && (
                <>
                    <Paper style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                        <Tabs value={value} onChange={handleTabChange} indicatorColor="primary">
                            <Tab label="Information" />
                        </Tabs>
                    </Paper>
                    <TabPanel value={value} index={0}>
                        <GeneralInfo slug={slug} data={data.result} />
                    </TabPanel>
                    <TabPanel value={value} index={3}></TabPanel>
                </>
            )}
        </Box>
    );
};

export default Tag;
