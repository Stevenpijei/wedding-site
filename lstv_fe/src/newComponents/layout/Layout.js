import React, { useEffect } from 'react'
import PropTypes from 'prop-types'; // ES6
import { useSelector, useDispatch } from 'react-redux'

import { ModalsProvider } from '../../global/use-modals';
import { SearchProvider } from '../Search/use-search';

import Header from '../../components/Header'
import Footer from '../../components/Utility/Footer'
import SEO from '../SEO';
import V3MainContent from './V3MainContent'
import MobileFooter from './MobileFooter'
import ContactBusinessModal from '../ContactBusinessModal';
import SearchModal from '../Search/SearchModal'
import LoginModal from '../LoginModal';
import {FRONT_END_SETTINGS_HOME_PAGE_TITLE} from "../../global/globals";
import FlagModal from '../FlagModal';

export const Layout = ({children, title, setShowSearch}) => {
    const showFooter = useSelector((state) => state.app.layout?.showFooter)
    return (
        <>
            <ModalsProvider>
                <SearchProvider>
                    <SEO />
                    <Header setShowSearch={setShowSearch} />
                    <V3MainContent>{children}</V3MainContent>
                    {showFooter && <Footer />}
                    <MobileFooter />
                    <ContactBusinessModal />
                    <LoginModal />
                    <SearchModal />
                    <FlagModal />
                </SearchProvider>
            </ModalsProvider>
        </>
    );
}

Layout.propTypes = { 
    title: PropTypes.string,
    children: PropTypes.element.isRequired
}

Layout.defaultProps = {
    title: FRONT_END_SETTINGS_HOME_PAGE_TITLE
}

// export default Layout

export function useHideFooter() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: 'TOGGLE_FOOTER_DISPLAY', payload: false })
        return () => {
            dispatch({ type: 'TOGGLE_FOOTER_DISPLAY', payload: true })
        }
    }, [])
  }
