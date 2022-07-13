import React, { useEffect, useState } from 'react';
import { generatePath, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import HomePage from './Pages/HomePage/HomePage';
import NotFound from './Pages/NotFound';
import Post from './Content/SlugProcessor';
import AccountClaimPage from './Pages/AccountClaimPage'
import BusinessTypes from './Pages/BusinessTypes';
import VideoEmbed from './EmbedContent/VideoEmbed';
import BusinessPage from './Pages/BusinessPage/';
import VibePage from './Pages/VibePage';
import LocationPage from './Pages/VibePage/LocationPage/';
import { TestStats } from './Pages/TestStats';
import SignIn from './Pages/SignInPage';
import SignUp from './Pages/SignUpPage';
import VideoPage from './Pages/VideoPage/';
import EditProfilePage from './Pages/PostGuestSignUpPage';
import EditProfileProPage from './Pages/PostBusinessSignUpPage';
import ForgotPasswordPage from './Pages/ForgotPassword';
import ChangePasswordPage from './Pages/ChangePassword';
import BusinessDashboard from './Pages/BusinessDashboard';
import ResultsPage from './Pages/ResultsPage';
// import { useAppDataService } from '../rest-api/hooks/useAppDataService';
import DirectoryPage from './Pages/DirectoryPage';
// import { DirectoryConfig } from './Pages/DirectoryPage/DirectoryMap';
// import { GRIDTYPES } from './Pages/DirectoryPage/Grids';
import DesignSystemDemoPage from '../newComponents/DesignSystemDemoPage';

import PrivacyPolicy from './Pages/StaticPages/PrivacyPolicy';
import Nondiscrimination from './Pages/StaticPages/Nondiscrimination';
import TermsOfUse from './Pages/StaticPages/TermsOfUse';
import Copyright from './Pages/StaticPages/Copyright';
import About from './Pages/StaticPages/About';
import Press from './Pages/StaticPages/Press';
import LSTVForWeddingPros from './Pages/StaticPages/LSTVForWeddingPros';
import LSTVForFilmMakers from './Pages/StaticPages/LSTVForFilmMakers';
import LSTVForBrands from './Pages/StaticPages/LSTVForBrands';
import Faq from './Pages/StaticPages/Faq';
import Team from './Pages/StaticPages/Team';
import Contact from './Pages/StaticPages/Contact';
import PublicContentService from '../rest-api/services/publicContentService';
import WFAWinners from './Pages/StaticPages/WFAWinners';


const Routes = (props) => {
    const Directories = useSelector((state) => state.app.directories);
    const [directories, setDirectories] = useState(Directories);
    const { pathname } = useLocation();
    
    useEffect(() => {
        // get timestamp
        fetchDirectories();
    }, []);

    const fetchDirectories = async () => {
        const request = await PublicContentService.getSearchDirectoriesTimestamp();

        // if timestamps are different update directories, and redux
        if (request?.timestamp !== directories.timestamp) {
            const newDirectories = await PublicContentService.getAllSearchDirectories();
            setDirectories(newDirectories);
            props.updateDirectories(newDirectories);
        }
    };

    const generateDirectoryRoute = (directory) => {
        const { id, slug } = directory;
        return (
            <Route
                key={id}
                path={generatePath('/:slug/', { slug: slug })}
                exact
                component={() => <DirectoryPage directory={directory} />}
            />
        );
    };

    return (
        <Switch>
            <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
            <Route path="/" exact component={HomePage} />
            <Route path="/account-claim" exact component={AccountClaimPage} />
            <Route path="/privacy-policy" exact component={PrivacyPolicy} />
            <Route path="/terms-of-use" exact component={TermsOfUse} />
            <Route path="/nondiscrimination" exact component={Nondiscrimination} />
            <Route path="/for-wedding-pros" exact component={LSTVForWeddingPros} />
            <Route path="/for-filmmakers" exact component={LSTVForFilmMakers} />
            <Route path="/for-brands" exact component={LSTVForBrands} />
            <Route path="/faq" exact component={Faq} />
            <Route path="/dmca-copyright-policy" exact component={Copyright} />
            <Route path="/about" exact component={About} />
            <Route path="/team" exact component={Team} />
            <Route path="/contact-us" exact component={Contact} />
            <Route path="/wedding-film-awards-2021-winners" exact component={WFAWinners} />
            <Route path="/press" exact component={Press} />
            <Route path="/wedding-film-awards-2021-winners" exact component={WFAWinners} />
            <Route path="/design" exact component={DesignSystemDemoPage} />
            <Route path="/businessTypes" exact component={BusinessTypes} />
            <Route
                path="/wfa" exact
                render={() => (window.location = "https://www.weddingfilmawards.com/")}
            />
            <Route path="/embed/video/:id" exact component={VideoEmbed} />
            <Route path="/video/:id" exact component={VideoPage} />
            <Route path="/business/:slug" exact component={BusinessPage} />
            <Route path="/style/:slug" exact component={VibePage} />
            <Route
                path="/vibe/:slug"
                exact
                render={(props) => <Redirect to={`/style/${props?.match?.params?.slug}`} />}
            />
            <Route path="/location/:slug" component={LocationPage} />
            {/* Programmatically generate direcotry pages from directories */}
            {directories.result.map((directory) => generateDirectoryRoute(directory))}
            <Route path="/results" exact component={ResultsPage} />
            <Route path="/testStats" exact component={TestStats} />
            <Route path="/Sign-in" exact component={SignIn} />
            <Route path="/sign-up" exact component={SignUp} />
            <Route path="/sign-up-pro" exact component={() => <SignUp isBusiness />} />
            <Route path="/forgot-password" exact component={ForgotPasswordPage} />
            <Route path="/setNewPassword" exact component={ChangePasswordPage} />
            <Route path="/edit-profile" exact component={EditProfilePage} />
            <Route path="/edit-profile-pro" exact component={EditProfileProPage} />
            <Route path="/dashboard" component={BusinessDashboard} />
            <Route path="/:slug" exact component={Post} />

            {/*
                  _                                  ____          _ _               _
                 | |    ___  __ _  __ _  ___ _   _  |  _ \ ___  __| (_)_ __ ___  ___| |_
                 | |   / _ \/ _` |/ _` |/ __| | | | | |_) / _ \/ _` | | '__/ _ \/ __| __|
                 | |__|  __/ (_| | (_| | (__| |_| | |  _ <  __/ (_| | | | |  __/ (__| |_
                 |_____\___|\__, |\__,_|\___|\__, | |_| \_\___|\__,_|_|_|  \___|\___|\__|
                            |___/            |___/
           */}

            <Route
                path="/wedding/:role/:slug"
                render={({ match }) => {
                    return <Redirect to={`/business/${match.params.slug}`} />;
                }}
            />
            <Route
                path="/wedding/:role/:subrole/:slug"
                render={({ match }) => {
                    return <Redirect to={`/business/${match.params.slug}`} />;
                }}
            />
            <Route
                path="/:year/:month/:day/:slug"
                render={({ match }) => {
                    return <Redirect to={`/${match.params.slug}`} />;
                }}
            />

            <Route component={NotFound} />
        </Switch>
    );
};
const mapDispatchToProps = (dispatch) => {
    return {
        updateDirectories: (data) => {
            dispatch({ type: 'UPDATE_DIRECTORIES', payload: data });
        },
    };
};
export default connect(null, mapDispatchToProps)(Routes);
