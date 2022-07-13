import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Box, Paper, Tab, Tabs } from '@material-ui/core';

import LoadingIndicator from 'components/LoadingIndicator';
import { useBusiness } from 'service/hooks/business';
import NotFoundPage from 'pages/NotFound';
import SocialForm from './SocialForm';
import InformationForm from './InformationForm';
import TabPanel from 'components/TabPanel';
import PhotoTable from './PhotoTable';
import { setPageBreadCrumbs } from 'store/reducers/pageBreadCrumb';
import { PrivateRoutes } from 'config/routes';
import { APP_URL } from 'config/env';
import LogoCardThumbnails from './LogoCardThumbnails';
import Reviews from './Reviews';

const Business: React.FC = () => {
    const { id: businessId } = useParams<{ id: string }>();
    const [value, setValue] = React.useState<number>(0);
    const dispatch = useDispatch();
    const { data, isLoading, isError, refetch: refetchBusiness } = useBusiness(businessId);

    useEffect(() => {
        if (data && data.result) {
            dispatch(
                setPageBreadCrumbs([
                    {
                        title: 'Businesses',
                        link: PrivateRoutes.BUSINESSES,
                    },
                    {
                        title: data.result.name,
                        link: `${APP_URL}/business/${data.result.slug}`,
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
        <Box mt="-20px">
            {data && (
                <>
                    <Paper style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                        <Tabs value={value} onChange={handleTabChange} indicatorColor="primary">
                            <Tab label="Business Information" />
                            <Tab label="Social Links" />
                            <Tab label="Business Photos" />
                            <Tab label="Reviews" />
                        </Tabs>
                    </Paper>
                    <TabPanel value={value} index={0}>
                        <InformationForm businessId={businessId} data={data.result} fetchBusiness={refetchBusiness} />
                        <LogoCardThumbnails data={data.result} fetchBusiness={refetchBusiness} />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <SocialForm
                            businessId={businessId}
                            data={data.result.social_links}
                            fetchBusiness={refetchBusiness}
                            slug={data.result.slug}
                        />
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <PhotoTable slug={data.result.slug} name={data.result.name} />
                    </TabPanel>
                    <TabPanel value={value} index={3}>
                        <Reviews slug={data.result.slug} />
                    </TabPanel>
                </>
            )}
        </Box>
    );
};

export default Business;
