import {
    browserVersion,
    isBrowser,
    isChrome,
    isEdge,
    isMobileOnly,
    isMobileSafari,
    isSafari,
    isTablet,
} from 'react-device-detect';
import LSTVLink from '../components/Utility/LSTVLink';
import React, {useState, useEffect} from 'react';
import useMedia from 'use-media';
import * as LSTVGlobals from '../global/globals';
import styled, {css} from 'styled-components';
import cogoToast from 'cogo-toast';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle} from '@fortawesome/pro-solid-svg-icons';
import TimeAgo from 'javascript-time-ago'

import { YoutubeIcon, PinterestIcon, TiktokIcon, TwitterIcon, InstagramIcon, FacebookIcon } from '../components/Utility/LSTVSVG';

export const months = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
};

export const monthsShort = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
};

/**
 * From an array of businsseses, finds the one with
 * role_slug = "venue". If more than one, returns the one
 * with business_capacity_type_slug = "reception-venue"
 */
export const findVenueBusiness = businesses => {
  if(!businesses?.length) return

  let venue

  businesses.forEach(biz => {
    if(biz.role_slug === 'venue') {
      if(
        !venue ||
        (venue && biz.business_capacity_type_slug === 'reception-venue')
      ) {
        venue = biz
      }
    }
  })

  return venue
}

export const findVideographerBusiness = businesses => {
  if(!businesses?.length) return
  return businesses.find(business => business.role_slug === LSTVGlobals.VENDOR_ROLE_VIDEOGRAPHER);
}

export const isPaidUser = user => {
    if(!user?.subscriptionLevel) return false
    const sl = user.subscriptionLevel
    return sl === 'basic' || sl === 'plus' || sl === 'premium'
}

export const isVideographerUser = user => {
  if(!user?.businessRoles) return false
  const vRole = user.businessRoles.find(role => role.slug === 'videographer')
  return !!vRole
}

export const shorthandValue = (value, appendix, shorthand) => {
    if (shorthand) {
        let num = null;
        if (value < 1000000)
            num =
                Math.abs(value) > 999
                    ? Math.sign(value) * (Math.abs(value) / 1000).toFixed(1) + 'k'
                    : Math.sign(value) * Math.abs(value);
        else num = Math.sign(value) * (Math.abs(value) / 1000000).toFixed(1) + 'm';

        if (appendix) return num + ' ' + appendix;
        else return num;
    } else {
        return Number(value).toLocaleString('EN-us') + (appendix ? ` ${appendix}` : '');
    }
};

export const getTimeAgoString = (date) => {
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + ' years ago';
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + ' months ago';
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + ' days ago';
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + ' hours ago';
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + ' minutes ago';
    }
    return Math.floor(seconds) + 'just now';
};

export const businessFromVideo = (businesss, role, specificSlug = false) => {
    let rc = null;

    let videoBusinesses = businesss.filter((data) => {
        if (!specificSlug) return data.business_capacity_type_slug === role || data.role_slug === role;
        else
            return (
                (data.business_capacity_type_slug === role || data.role_slug === role) &&
                data.business.slug === specificSlug
            );
    });

    if (videoBusinesses.length > 0) {
        rc = videoBusinesses[0];
    }

    return rc;
};
// Deprecated,use one below
export const coupleDisplayNamesFromVideo = (properties) => {
    let rc = '';
    if (properties.spouse_1 && properties.spouse_2) rc = properties.spouse_1 + ' & ' + properties.spouse_2;
    return rc;
};
export const couplesNamesFromProperties = (properties) => (
    (properties?.spouse_1 && properties?.spouse_2) ?
    properties.spouse_1 + ' and ' + properties.spouse_2 :
    ""
);

 const getUserFacingLocationFields = (location) => {
    let rc = {
        place: false,
        state_province: false,
        country: false,
    };

    if (location) {
        if (location.country) rc.country = location.country.toLowerCase() !== 'united states';
        rc.state_province =
            location.state_province !== undefined &&
            location.state_province !== null &&
            !LSTVGlobals.display_no_state_countries.includes(location.country.toLowerCase());
        rc.place = location.place !== undefined && location.place !== null;
    }
    return rc;
};

export const getLocationFullName = (location) => location && location.display_name


export const GetElapsedTimeLabel = (epochTimestamp) => {

    let ts = ((new Date().getTime() / 1000) - (epochTimestamp));
    const timeAgo = new TimeAgo('en-US');
    return timeAgo.format(Date.now() - ts * 1000)
}

export const getLocationCoords = (location) => {
    return typeof location?.lat !== 'undefined' && typeof location?.long !== 'undefined'
        ? { lat: location.lat, lng: location.long }
        : undefined;
}

export const generateBusinessRoleJSX = (
    businesss,
    role,
    weight = LSTVGlobals.FONT_WEIGHT_NORMAL,
    fontSize = '1rem',
    context = null,
    display = 'inline-block',
    prefix = null,
    justName = false,
    external = false
) => {
    let rc = [];
    if (businesss) {
        let slug = null;
        let name = null;

        let videographer = businesss.filter((data, index) => {
            return data.role_slug === role && data.primary;
        });

        if (videographer.length > 0) {
            name = videographer[0].name;
            slug = videographer[0].slug;
        } else {
            videographer = businesss.filter((data, index) => {
                return data.role_slug === role;
            });

            //console.log(videographer);

            if (videographer.length > 0) {
                name = videographer[0].name;
                slug = videographer[0].slug;
            }
        }

        if (name != null && slug != null) {
            if (justName) return name;

            rc.push(
                <LSTVLink
                    to={'/business/' + slug}
                >{name}</LSTVLink>
            );
        }
    }

    return rc;
};

export const getFilmmakerFromBusinesses = (businesses) => {
    let videographer = businesses.filter((data, index) => {
        return data.role_slug === 'videographer';
    });

    if (videographer.length > 0) return videographer[0];
    else return null;
};

export const Spacer = styled.div`
    width: ${(props) => (props.width ? props.width : '5px')};
    height: 1px;
`;

export const NumericalBadge = styled.div`
    right: -10%;
    top: -11%;
    position: absolute;
    border-radius: 999px;
    background: rgba(233, 20, 9, 0.85);

    min-width: 1.4em;
    max-width: 1.4em;
    min-height: 1.1em;
    max-height: 1.1em;

    @media ${LSTVGlobals.UserDevice.isMobileOrTablet} {
        top: -7%;
    }

    p {
        position: absolute;
        font-size: 0.7rem;
        line-height: 0.7rem;
        color: white;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
    }
`;

export const ordinalSuffixOf = (i) => {
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + 'st';
    }
    if (j === 2 && k !== 12) {
        return i + 'nd';
    }
    if (j === 3 && k !== 13) {
        return i + 'rd';
    }
    return i + 'th';
};

export const dateStringToHumanDate = (dateStr) => {
    if (!dateStr) return null;

    let date = new Date(dateStr);
    if (date instanceof Date && !isNaN(date.getTime())) {
        let month = date.getUTCMonth() + 1;
        let year = date.getUTCFullYear();
        let day = date.getUTCDate();

        return `${months[month]} ${ordinalSuffixOf(day)}, ${year}`;
    }

    return null;
};

export const DateToMonthYearString = (date) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
        let month = date.getUTCMonth() + 1;
        let year = date.getUTCFullYear();
        return months[month].substr(0, 3) + ' ' + year;
    }

    return null;
};

export const generateWeddingDateJSX = (
    weddingDate,
    weight = LSTVGlobals.FONT_WEIGHT_NORMAL,
    fontSize = '1rem',
    context = null,
    external = false
) => {
    let rc = null;

    if (weddingDate) {
        let year = null;
        let month = null;
        let day = null;
        let wdate = new Date(weddingDate);

        if (wdate instanceof Date && !isNaN(wdate.getTime())) {
            month = wdate.getUTCMonth() + 1;
            year = wdate.getUTCFullYear();
            day = wdate.getUTCDate();
        }

        rc = (
            <React.Fragment>
                <LSTVLink
                    to={'/weddings/month/' + months[month].toLowerCase()}
                >{months[month].substr(0, 3)}</LSTVLink>
                &nbsp;
                <LSTVLink
                    context={context}
                    lineHeight={fontSize}
                    external={external}
                    fontSize={fontSize}
                    fontWeight={weight}
                    dataTip={'Watch More ' + year + ' Weddings'}
                    appendix={false}
                    key="1"
                    link={'/weddings/year/' + year}
                    title={year}
                />
            </React.Fragment>
        );
    }

    return rc;
};

export const getRolesStringFromBusiness = (roles, limit = 2) => {
    if (roles) {
        let a = roles.map((d) => (d.name_is ? d.name_is : d.name));
        if (a.length > limit) a = a.slice(0, limit);
        return a.join(' & ');
    }
    return null;
};

export const generateVenueNameJSX = (
    businesses,
    weight = LSTVGlobals.FONT_WEIGHT_NORMAL,
    fontSize = '1rem',
    context = null,
    display = 'inline-block',
    external = false
) => {
    let rc = [];
    if (businesses) {
        let slug = null;
        let name = null;

        let primaryVenue = businesses.filter((data, index) => {
            return data.role_slug === 'venue' && data.primary;
        });

        if (primaryVenue.length > 0) {
            name = primaryVenue[0].name;
            slug = primaryVenue[0].slug;
        } else {
            // prefer reception venue if exists, otherwise ceremony

            let primaryVenue = businesses.filter((data, index) => {
                return data.role_slug === 'venue' && data.business_capacity_type_slug === 'reception-venue';
            });

            if (primaryVenue.length > 0) {
                name = primaryVenue[0].name;
                slug = primaryVenue[0].slug;
            } else {
                let primaryVenue = businesses.filter((data, index) => {
                    return data.role_slug === 'venue' && data.business_capacity_type_slug === 'ceremony-venue';
                });

                if (primaryVenue.length > 0) {
                    name = primaryVenue[0].name;
                    slug = primaryVenue[0].slug;
                }
            }
        }

        if (name != null && slug != null) {
            rc.push(
                <LSTVLink
                    to={'/business/' + slug}
                >{name}</LSTVLink>
            );
        }
    }

    return rc;
};

export const generateLocationJSX = (
    location,
    weight = LSTVGlobals.FONT_WEIGHT_NORMAL,
    fontSize = '1rem',
    context = null,
    display = 'inline-block',
    prefix = null,
    external = false,
    nameOnly = false,
    textColor = null
) => {
    if (location) {
        let fields = getUserFacingLocationFields(location);

        if (nameOnly) {
            let rc = [];
            fields.place && rc.push(location.place);
            fields.state_province && rc.push(location.state_province);
            fields.country && rc.push(location.country);
            return prefix ? prefix + ' ' + rc.join(', ') : rc.join(', ');
        }

        return (
            <React.Fragment>
                {fields.place && (
                    <LSTVLink
                        to={location.place_url}
                    >{location.place}</LSTVLink>
                )}

                {fields.place && fields.state_province && <span style={{color: textColor}}>{', '}</span>}

                {fields.state_province && (
                    <LSTVLink
                        to={location.state_province_url}
                    >{location.state_province}</LSTVLink>
                )}

                {(fields.state || fields.place) && fields.country && <span style={{color: textColor}}>{', '}</span>}

                {fields.country && (
                    <LSTVLink
                        to={location.country_url}
                    >{location.country}</LSTVLink>
                )}
            </React.Fragment>
        );
    }
    return [];
};

const VibeContainer = styled.div`
    display: inline-block;
    border: none;
    line-height: 1.7rem;

    @media ${LSTVGlobals.UserDevice.isTablet} {
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
    }
`;

const VerticalSpacerStyle = styled.div`
    width: 100%;
    height: ${(props) => props.space}px;
`;

const HorizontalSpacerStyle = styled.div`
    height: 1px;
    width: ${(props) => props.space}px;
    display: inline-block;
`;

export const MobilePageContent = styled.div`
    //padding: 2px;
`;

export const VerticalSpacer = (props) => {
    return <VerticalSpacerStyle space={props.space}/>;
};

export const HorizontalSpacer = (props) => {
    return <HorizontalSpacerStyle space={props.space}/>;
};

export const buildFixedContentItemsFromSlugArray = (slugArray) => {
    let slugs = slugArray.map((data) => {
        return data.slug;
    });
    return slugs.join(',');
};

export const getVibesForCard = (vibe, limit, context = 'video') => {
    let rc = vibe.map((data) => data.name);
    if (rc.length > limit) rc = rc.slice(0, limit);
    return rc;
};

export const ifValidReturnObject = (object, returnObjectFunc, alternative) => {
    return object !== undefined && object !== null ? returnObjectFunc() : alternative;
};

export const ifValidReturn = (object, alternative) => {
    return object !== undefined && object !== null ? object : alternative;
};

export const secsToTimeStr = (value) => {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let minutes = Math.floor(sec / 60); // get minutes
    let seconds = sec % 60; //  get seconds
    // add 0 if value < 10
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return minutes + ':' + seconds; // Return is MM : SS
};

export const isBackdropFilterSupported = () => {
    return (
        (isMobileSafari && browserVersion >= 9) ||
        (isChrome && browserVersion >= 76) ||
        (isEdge && browserVersion >= 17) ||
        (isSafari && browserVersion >= 9)
    );
};

export const synthesize_couple_names = (properties) => {
    try {
        return properties['spouse_1'] + ' & ' + properties['spouse_2'];
    } catch (e) {
        return 'A Wedding Video';
    }
};

export const obtain_business_from_video_by_role = (video, role) => {
    let rc = {name: 'A Filmmaker', slug: '#'};
    video.businesses.forEach((data) => {
        if (data.role_slug === role) rc = {name: data.name, slug: data.slug};
    });
    return rc;
};

export const capitalize = (str) => {
    str = str.split(' ');
    for (var i = 0, x = str.length; i < x; i++) str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    return str.join(' ');
};

export const FancySeparator = styled.div`
    border-top: 1px dotted ${(props) => props.color || LSTVGlobals.CARD_BACKGROUND_DARKEST};
    width: 100%;
    height: 2px;
    margin: ${(props) => props.margin || '15px 0 0 0'};
    mask-image: linear-gradient(to left, transparent 0%, black 15%, black 85%, transparent 100%);

    ${(props) =>
    props.noMargin &&
    css`
            margin-top: 0;
        `}

    ${(props) =>
    props.short &&
    css`
            mask-image: linear-gradient(to left, transparent 0%, black 25%, black 75%, transparent 100%);
        `}
`;

export const FancySeparatorVertical = styled.div`
    border-left: 1px dotted #ccc;
    width: 5px;
    margin-left: 5px;
    height: 100%;
    mask-image: linear-gradient(to bottom, transparent 0%, black 20px, black 95%, transparent calc(100% - 40px));
`;

export const L2SeparatorVertical = styled.div`
    border-left: 1px solid ${LSTVGlobals.BLACK};
    width: 1px;
    height: 100%;
`;

export const getVerbosity = (verbosity) => {
    return {
        minVerbosity: verbosity === LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MINIMUM,
        minVerbosityAtLeast: verbosity >= LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MINIMUM,
        medVerbosity: verbosity === LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MEDIUM,
        medVerbosityAtLeast: verbosity >= LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MEDIUM,
        maxVerbosity: verbosity === LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MAXIMUM,
    };
};

export const shortHandValue = (value, appendix = false) => {
    let num;

    if (value < 1000000)
        num =
            Math.abs(value) > 999
                ? Math.sign(value) * (Math.abs(value) / 1000).toFixed(1) + 'K'
                : Math.sign(value) * Math.abs(value);
    else num = Math.sign(value) * (Math.abs(value) / 1000000).toFixed(1) + 'M';

    if (appendix) num = num + ' ' + appendix;

    return num;
};

export const GenericContainer = styled.div`
    display: ${(props) => (props.display ? props.display : 'block')};
    position: ${(props) => props.position || 'relative'};
    width: ${(props) => props.width || 'auto'};
    height: ${(props) => props.height || 'auto'};
    padding: ${(props) => props.padding || '0'};
    margin: ${(props) => props.margin || '0'};
    background: ${(props) => props.background || 'none'};
    top: ${(props) => props.top || 'auto'};
    left: ${(props) => props.left || 'auto'};
    background-image: ${(props) => props.backgroundImage || 'none'};
    min-height: ${(props) => props.minHeight || 'auto'};
    border-radius: ${(props) => props.borderRadius || '0'};
    mask-image: ${(props) => props.maskImage || 'none'};
    border-bottom: ${(props) => props.borderBottom || 'none'};
    border-top: ${(props) => props.borderTop || 'none'};
    border-left: ${(props) => props.borderLeft || 'none'};
    border-right: ${(props) => props.borderRight || 'none'};
    font-size: ${(props) => props.fontSize || 'inherit'};
    line-height: ${(props) => props.lineHeight || 'inherit'};
    color: ${(props) => props.color || 'inherit'};
    font-weight: ${(props) => props.fontWeight || 'inherit'};
    font-family: ${(props) => props.fontFamily || 'inherit'};
    text-align: ${(props) => props.textAlign || 'inherit'};
    text-transform: ${(props) => props.textTransform || 'none'};
    flex: ${(props) => props.flex || 'unset'};
    animation: ${(props) => props.animation || 'none'};
    max-width: ${(props) => props.maxWidth || 'none'};
    min-width: ${(props) => props.minWidth || 'initial'};
    max-height: ${(props) => props.maxHeight || 'none'};
    min-height: ${(props) => props.minHeight || 'initial'};
    clip-path: ${(props) => props.clipPath || 'none'};
    letter-spacing: ${(props) => props.letterSpacing || 'normal'};
    z-index: ${(props) => props.zIndex || 'auto'};
    box-shadow: ${(props) => props.boxShadow || 'none'};
    transition: ${(props) => props.transition || 'initial'};
`;

export const FlexSpan = styled.div`
    font-size: ${(props) => props.fontSize};
    color: ${LSTVGlobals.TEXT_AND_SVG_BLACK};
`;

export const FlexContainer = styled.div`
    padding: ${(props) => (props.padding ? props.padding : '5px')};
    z-index: ${LSTVGlobals.Z_INDEX_6_OF_100};
`;

export const Flex = styled.div`
    position: relative;
    display: ${(props) => (props.display ? props.display : 'flex')};
    flex-direction: ${(props) => (props.flexDirection ? props.flexDirection : 'row')};
    flex-wrap: ${(props) => (props.flexWrap ? props.flexWrap : 'nowrap')};
    justify-content: ${(props) => (props.justifyContent ? props.justifyContent : 'space-between')};
    align-items: ${(props) => (props.alignItems ? props.alignItems : 'flex-start')};
    align-content: flex-start;
    height: ${(props) => props.height || 'auto'};
    max-width: ${(props) => props.maxWidth || 'none'};
    min-width: ${(props) => props.minWidth || 'initial'};
    max-height: ${(props) => props.maxHeight || 'none'};
    min-height: ${(props) => props.minHeight || 'initial'};
    width: ${(props) => props.width || 'auto'};
    flex: ${(props) => props.flex || 'unset'};
    padding: ${(props) => props.padding || '0'};
    margin: ${(props) => props.margin || '0'};
    grid-template-columns: ${(props) => props.gridTemplateColumns || 'unset'};
    background: ${(props) => props.background || 'none'};
    overflow: ${(props) => props.overflow || 'inherit'};
    color: ${(props) => props.color || 'inherit'};
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : 'inherit')};
    font-size: ${(props) => (props.fontSize ? props.fontSize : 'inherit')};
    word-break: ${(props) => props.wordBreak || 'normal'};
    font-weight: ${(props) => (props.fontWeight ? props.fontWeight : 'inherit')};
    z-index: ${(props) => props.zIndex || 'auto'};
    border-radius: ${(props) => props.borderRadius || '0'};
    transform: ${(props) => props.transform || 'none'};

    ${(props) =>
    props.rightborder &&
    css`
            border-right: 1px solid ${LSTVGlobals.CARD_BACKGROUND_DARKEST};
        `};

    ${(props) =>
    props.fullLine &&
    css`
            flex: 1 0 100%;
        `};

    ${(props) =>
    props.stretch &&
    css`
            width: 100%;
            height: 100%;
        `};
`;

export const PageSectionTitle = styled.div`
    margin-top: 15px;
    font-size: 1.5rem;
    line-height: 1.5rem;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_SEMIBOLD};
    text-align: center;
    margin-bottom: 10px;
    text-decoration: none;

    @media ${LSTVGlobals.UserDevice.isTablet} {
        font-size: 1.1rem;
        margin-top: 0;
        margin-bottom: 12px;
    }

    @media ${LSTVGlobals.UserDevice.isMobile} {
        font-size: 1rem;
        margin-top: 0;
        margin-bottom: 12px;
    }
`;

export const BorderSeparator = styled.div`
    width: 100%;
    height: ${(props) => props.height || '0px'};
    border-bottom: ${(props) => props.borderBottom || `1px solid ${LSTVGlobals.CARD_BORDER_COLOR}`};

    ${(props) =>
    props.color &&
    css`
            border-bottom: 1px solid ${(props) => props.color};
        `}
`;

export const getDeviceFontSize = (propName) => {
    if (isMobileOnly && propName && propName.mobile) return propName.mobile;

    if (isTablet && propName && propName.tablet) return propName.tablet;

    // desktop fallback if defined...
    if (propName.desktop) return propName.desktop;

    return '1rem'; // fallback
};

export const popMessageSuccess = (
    message,
    heading = '',
    position = LSTVGlobals.POPUP_MESSAGE_POSITION_TOP_RIGHT,
    delayBeforeShow = 0,
    hideAfterSecs = 3
) => {
    setTimeout(() => {
        const {hide} = cogoToast.success(message, {
            onClick: () => hide(),
            position: position,
            heading: heading,
            hideAfter: hideAfterSecs,
            renderIcon: () => {
                return <FontAwesomeIcon style={{color: 'white'}} className="fa-fw" icon={faCheckCircle}/>;
            },
        });
    }, delayBeforeShow);
};

export const popMessageError = (
    message,
    heading = '',
    position = LSTVGlobals.POPUP_MESSAGE_POSITION_TOP_RIGHT,
    delayBeforeShow = 0,
    hideAfterSecs = 3
) => {
    setTimeout(() => {
        const {hide} = cogoToast.error(message, {
            onClick: () => hide(),
            position: position,
            heading: heading,
            hideAfter: hideAfterSecs,
            // renderIcon: () => {
            //     return <FontAwesomeIcon style={{color: 'white'}} className="fa-fw" icon={faCheckCircle}/>;
            // },
        });
    }, delayBeforeShow);
}

export const synthesizeErrorMessage = (errorCode, responseData, customPresets = null) => {
    let rc = [];

    switch (errorCode) {
        case 0:
            if (customPresets && customPresets[errorCode]) rc.push(customPresets[errorCode]);
            else rc.push('Are you connected to the internet?');
            break;
        case 1:
            if (customPresets && customPresets[errorCode]) rc.push(customPresets[errorCode]);
            else rc.push('Server unreachable, please try again in a few moments.');
            break;
        case 400:
            if (customPresets && customPresets[errorCode]) rc.push(customPresets[errorCode]);
            else
                for (let [key, value] of Object.entries(responseData.data)) {
                    if (key !== 'status_code') {
                        let str = `${key}: ${value}`;
                        rc.push(str);
                    }
                }
            break;
        case 500:
            if (customPresets && customPresets[errorCode]) rc.push(customPresets[errorCode]);
            else rc.push('500: We are working to correct a temporary server issue, please try again later.');
            break;
        case 429:
            if (customPresets && customPresets[errorCode]) rc.push(customPresets[errorCode]);
            else rc.push('daily limit reached, try again tomorrow.');
            break;
        default:
            if (customPresets && customPresets['default']) rc.push(customPresets['default']);
            else rc.push(`${errorCode}: We are working to correct a temporary issue, please try again later.`);
            break;
    }
    return rc;
};

export const GetVideoShareOptions = (elements) => {
    return {
        ...elements,
        title: `Share: ${elements.coupleNames}'s Wedding Video`,
        shareLinkLabel: 'Direct Link',
        shareEmbedLabel: 'Embed The Video On Your Website',
        shareObjectType: 'Video',
        embed: true,
        html: 'Copy and paste this code into your website, where you wish the video to appear.',
        wordpress:
            'Copy and paste this code into your WordPress post or page while in text mode, as seen in the example below.',
        wix: 'In the Wix editor, click the plus sign ( + ) to add a new element.',
        wix2: 'Select "Embed" and then "HTML iFrame". ',
        wix3: 'Click "Enter Code" and make sure the "Code" option is chosen.',
        wix4: 'Copy and paste the flollowing code in the "Add Your Code Here" section and click Update.',
        wix5:
            'Resize the blue frame around the embedded video for a perfect fit without partially visible items or excess whitespace.',
        wix6:
            'Once the desktop size is good, click the Mobile icon at the top and resize the blue frame for a perfect fit on mobile too.',
        squarespace:
            'In Squarespac\'s page editor, click an insert point in the desired section and choose "Code" under "More".',
        squarespace2: 'Copy and paste the following code to the box',
        squarespace3:
            'Please note that Squarespace disables the code for security reasons while you are logged in and editing your site. But the live site will show the embeded video.',
        squarespace4:
            'IMPORTANT: Adding JavaScript or iframes in Squarespace is a Premium feature available in the Business or Commerce plans only. Squarespace does not permit embedding outside of those plans.',
    };
};

export const getDeviceImageUrl = (url) => {
    if (url) {
        if (isBrowser) url = url.replace('-orig', '-dsk');
        if (isMobileOnly) url = url.replace('-orig', '-mbl');
        if (isTablet) url = url.replace('-orig', '-tab');
    } else {
        url = "https://d3g1ohya32imgb.cloudfront.net/images/site/nothumb.jpg";
    }

    return url;
};

export const getYearWeekStringFromDate = d => {
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}.${weekNo}`;
}


// Hook
export const useMediaReady = (query, defaultValue) => {
    const [ready, setReady] = useState(false);
    const queryResult = useMedia(query, defaultValue);

    const isMobileTest  = useMedia(LSTVGlobals.UserDevice.isWithinMobile, true);
    const isDesktopTest  = useMedia(LSTVGlobals.UserDevice.desktop, true);

    useEffect(() => {
        if(isDesktopTest !== true || isMobileTest !== true) {
            setReady(true);
        }
    }, [isDesktopTest, isMobileTest])


    return [queryResult ,ready];
  }

export const getSocialIconByNetwork = (type) => {
    return {
        facebook: <FacebookIcon />,
        twitter: <TwitterIcon />,
        instagram: <InstagramIcon />,
        pinterest: <PinterestIcon />,
        tiktok: <TiktokIcon />,
        youtube: <YoutubeIcon />
    }[type];
};

export const convertGoogleLocation = (location) => {
    if (location.address_components) {
        const result = [];
        for (const component of location?.address_components) {
            if (component.types.includes('country')) {
                result.push({ path: component.long_name, order: 0 });
            }
            if (component.types.includes('administrative_area_level_1')) {
                result.push({ path: component.long_name, order: 1 });
            }
            if (component.types.includes('locality') || component.types.includes('colloquial_area')) {
                result.push({ path: component.long_name, order: 2 });
            }
        }

        const processed = result
            .sort((a, b) => a.order - b.order)
            .map((item) => item.path)
            .join('/')
            .split(' ')
            .join('-')
            .toLowerCase();

        return processed;
    } else {
        return '';
    }
};
