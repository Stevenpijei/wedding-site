// Also defined in globals/globals.js to keep existing patterns.
import * as breakpoints from './global/breakpoints'
import { isMobile } from 'react-device-detect'

const theme = {
    main: 'mediumseagreen',

    primaryPurple: '#6A25FF',
    secondaryPurple: '#793dfa',
    highlightColor: '#9980fd',
    primaryYellow: '#f9f39f',

    lightGrey: '#f9f9f9',
    midGrey: '#ececec',
    darkGrey: '#c9c4c4',
    placeholderGrey: '#cdc9c9',
    lighterGrey: '#F3F3F3',
    darkerGrey: '#9B9B9B',

    black: '#0c090a',
    red: '#FF9D9D',
    white: '#ffffff',
    fontWeightSemibold: '500',

    textAndSvgBlack: '#0C098A',
    cardDropShadow: '#bababa',
    business_role_family_color: {
        beauty: '#EBC7B7',
        jewelry: '#ff8b3d',
        decor_rentals: '#EBA900',
        default_purple: '#6A25FF',
        fashion: '#F16565',
        florals: '#FF7A00',
        florists: '#FF7A00',
        food_beverage: '#790074',
        gifts: '#85E6BD',
        music_entertainment: '#53B7FF',
        music: '#53B7FF',
        officiant_ceremony: '#241C78',
        officiant: '#241C78',
        other: '#F4DB75',
        planning_design: '#8AEC81',
        planning_and_design: '#8AEC81',
        signage_stationery: '#CA9AD6',
        transportation: '#2D0AB9',
        venue: '#FF80A6',
        venues: '#FF80A6',
        video_photo: '#10D3EA',
        videographers: '#10D3EA',
        photography: '#10D3EA',
    },
    breakpoints: breakpoints.UserDevice,
    zIndex: {
        mobileFooter: 8,
        specifcPageFooter: 9,
        uberModalOrVeil: '100',
        searchContent: 20,
        modalOverlay: '100',
        stickySideBar: 9,
        dropdown: 9,
    },
    headerHeight: isMobile ? '75px' : '124px',
};

export default theme;
