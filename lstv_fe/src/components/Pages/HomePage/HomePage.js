import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as LSTVGlobals from '../../../global/globals';
import { useAppDataService } from '../../../rest-api/hooks/useAppDataService';
import CardSections from '../../Content/Cards/CardSections';
import PageVeil from '../../Utility/PageVeil';
import PageContent from '../PageContent';
import Overlay from '../PageSupport/Overlay';
import Hero from './HeroSection/Hero';
import Footer from './Footer';
import { useSearch } from '../../../newComponents/Search/use-search'
import SEO from '../../../newComponents/SEO';

const HomePage = () => {
    const [pageReady, setPageReady] = useState(false);
    const [mainVideoData, setMainVideoData] = useState(undefined);
    const [frontEndSettings, setFrontEndSettings] = useState(undefined);
    const { getMainVideo, getFrontEndSettings, cancel } = useAppDataService();
    const { showSearchPanel, hideSearchPanel } = useSearch();

    useEffect(() => {
        getMainVideo().then((data) => data && setMainVideoData(data));
        getFrontEndSettings().then((data) => data && setFrontEndSettings(data));

        hideSearchPanel()
        setTimeout(() => {
            setPageReady(true);
        }, 1000);

        return () => {
            showSearchPanel()
            cancel();
        };
    }, []);

    const onUnveilCheck = () => pageReady;

    return (
        <>
            <PageVeil isLoading={true} onUnveilCheck={onUnveilCheck} />
            <SEO 
                postTitle={frontEndSettings && Object.keys(frontEndSettings).includes('homePageTitle')
                ? frontEndSettings.homePageTitle
                : LSTVGlobals.FRONT_END_SETTINGS_HOME_PAGE_TITLE}
            />
            <PageContent>
                <Overlay />
                <Hero />
                <CardSections />
                <Footer />
            </PageContent>
        </>
    );
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

const mapStateToProps = (state) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HomePage));
