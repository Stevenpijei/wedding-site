import React, { useState, useEffect, useContext } from 'react';
import { Box, Checkbox, Grid, Typography } from '@material-ui/core';
import orderBy from 'lodash/orderBy';

import LoadingIndicator from 'components/LoadingIndicator';
import RegularButton from 'components/CustomBtns/Button';

import { useListHomeCardSections, useUpdateHomeCardSections } from 'service/hooks/homeCardSections';

import { IHomeCardSection } from 'interface';

import { HomeCard, HomeCardHeader } from './components';

import { ToastContext } from 'contexts/ToastContext';

import './style.scss';

const HomePageLineUp: React.FC = () => {
    const { showToast } = useContext(ToastContext);
    const { data, isLoading, refetch: refetchHomeCardSections } = useListHomeCardSections({
        verbosity: 'admin',
    });
    const [isSubmitting, setSubmitting] = useState<boolean>(false);
    const [isDirty, setDirty] = useState<boolean>(false);
    const [isHideLoggedIn, setHideLoggedIn] = useState<boolean>(false);
    const [loggedOutSection, setLoggedOutSection] = useState<IHomeCardSection[]>([]);
    const [loggedInSection, setLoggedInSection] = useState<IHomeCardSection[]>([]);
    const { mutateAsync: updateHomeCardSections } = useUpdateHomeCardSections();

    useEffect(() => {
        let homeCardSections = data?.result.sections || [];
        if (!homeCardSections.length) return;

        // sort home card sections by group/order
        homeCardSections = orderBy(homeCardSections, ['order'], ['asc']);
        homeCardSections = orderBy(homeCardSections, ['group'], ['asc']);

        const tempLoggedOutSection: IHomeCardSection[] = [];
        const tempLoggedInSection: IHomeCardSection[] = [];

        homeCardSections.forEach((section) => {
            if (section.target === 'logged_out_home_page') {
                tempLoggedOutSection.push(section);
            } else {
                tempLoggedInSection.push(section);
            }
        });

        setLoggedOutSection(tempLoggedOutSection);
        setLoggedInSection(tempLoggedInSection);
    }, [data]);

    const handleUpdate = (payload: IHomeCardSection) => {
        const temp: IHomeCardSection[] = (payload.target === 'logged_out_home_page'
            ? loggedOutSection
            : loggedInSection
        ).map((section) => {
            if (section.order === payload.order && section.group === payload.group) {
                return payload;
            }
            return section;
        });
        setDirty(true);
        if (payload.target === 'logged_out_home_page') {
            setLoggedOutSection(temp);
        } else {
            setLoggedInSection(temp);
        }
    };

    const handleSubmit = async () => {
        const loggedInPayload: IHomeCardSection[] = isHideLoggedIn
            ? loggedOutSection.map((section) => ({ ...section, target: 'logged_in_home_page' }))
            : loggedInSection;
        let payload: IHomeCardSection[] = [...loggedInPayload, ...loggedOutSection];
        payload = orderBy(payload, ['order'], ['asc']);
        payload = orderBy(payload, ['group'], ['asc']);
        if (!isDirty && !isHideLoggedIn) {
            showToast({
                type: 'info',
                message: 'You have nothing to update',
            });
            return;
        }
        setSubmitting(true);
        try {
            await updateHomeCardSections({ sections: payload });
            await refetchHomeCardSections();
            showToast({
                type: 'success',
                message: 'Successfully updated home card sections.',
            });
            setDirty(false);
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
        setSubmitting(false);
    };

    return (
        <Box className="home-card-lineup" mt="50px">
            {isLoading && <LoadingIndicator />}
            {!isLoading && (
                <>
                    <Box textAlign="right" mt="20px">
                        <RegularButton
                            variant="contained"
                            className="round_btn"
                            disabled={isLoading || isSubmitting}
                            loading={isLoading || isSubmitting}
                            onClick={handleSubmit}
                        >
                            Save
                        </RegularButton>
                    </Box>
                    <Box mb="30px">
                        <Typography variant="subtitle1">Logged out Home Page</Typography>
                        <HomeCardHeader />
                        {loggedOutSection?.map((section, index) => (
                            <HomeCard key={index} data={section} onUpdate={handleUpdate} />
                        ))}
                    </Box>
                    <Box mb="30px">
                        <Grid container alignItems="center" justify="flex-end" spacing={3}>
                            <Checkbox
                                id="same_as_logged_out"
                                color="primary"
                                checked={isHideLoggedIn}
                                onChange={() => setHideLoggedIn(!isHideLoggedIn)}
                            />
                            <label htmlFor="same_as_logged_out">Same as Logged Out Home Page</label>
                        </Grid>
                    </Box>
                    {!isHideLoggedIn && (
                        <Box>
                            <Typography variant="subtitle1">Logged in Home Page</Typography>
                            <HomeCardHeader />
                            {loggedInSection?.map((section, index) => (
                                <HomeCard key={index} data={section} onUpdate={handleUpdate} />
                            ))}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default HomePageLineUp;
