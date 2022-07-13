import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';

import { useVideo } from 'service/hooks/video';
import LoadingIndicator from 'components/LoadingIndicator';
import NotFoundPage from 'pages/NotFound';
import { setPageBreadCrumbs } from 'store/reducers/pageBreadCrumb';
import { PrivateRoutes } from 'config/routes';
import { APP_URL } from 'config/env';
import { Box, Paper, Tab, Tabs } from '@material-ui/core';
import TabPanel from 'components/TabPanel';
import GeneralInfo from './GeneralInfo';
import WeddingTeam from './WeddingTeam';
import Tags from './Tags';

const Video: React.FC = () => {
    const dispatch = useDispatch();
    const { id: videoId } = useParams<{ id: string }>();
    const { data, isLoading, isError, refetch: refetchVideo } = useVideo(videoId);
    const [value, setValue] = React.useState<number>(0);

    useEffect(() => {
        if (data && data.result) {
            dispatch(
                setPageBreadCrumbs([
                    {
                        title: 'Videos',
                        link: PrivateRoutes.VIDEOS,
                    },
                    {
                        title: data.result.title,
                        link: `${APP_URL}/${data.result.slug}`,
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
                            <Tab label="Video & Info" />
                            <Tab label="Wedding Team" />
                            <Tab label="Tags" />
                            <Tab label="Q&A" />
                        </Tabs>
                    </Paper>
                    <TabPanel value={value} index={0}>
                        <GeneralInfo videoId={videoId} data={data.result} onRefetchVideo={refetchVideo} />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <WeddingTeam data={data.result} />
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <Tags slug={data.result.slug} />
                    </TabPanel>
                    <TabPanel value={value} index={3}></TabPanel>
                </>
            )}
        </Box>
    );
};

export default Video;
