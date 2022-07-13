import * as ActionTypes from './actions';
import * as LSTVGlobals from '../global/globals';
import { ACTION_FRONT_END_SETTINGS_READY } from './actions';
import { BUSINESSROLETYPES, BUSINESSSROLECAPTYPES } from './businessesDefault';

export const volatileState = {
    connectionIssue: false,
    showOverlay: false,
    showShareModal: false,
    shareInfo: {
        shareOptions: {
            title: '',
        }
    },
};

const initialState = {
    user: {
        loggedIn: false,
    },
    app: {
        cachedData: {
            frontEndSettings: {
                homePageTitle: LSTVGlobals.FRONT_END_SETTINGS_HOME_PAGE_TITLE,
                systemNotifications: [],
                downtime: [],
            },
            
        },
        layout: {
            showFooter: true,
            
        },
        businessRoles: {
            businessTypes: BUSINESSROLETYPES,
            businessCapacityTypes: BUSINESSSROLECAPTYPES
        }
    },
    volatile: {
        ...volatileState,
    },
    
};

const updateState = (state, action, key = null, value = null) => {
    let newState = { ...state };
    if (!key && !value)
        action.cacheAt
            .split('.')
            .reduce(
                (obj, key) => (obj && obj[key]) || (obj[key] = {}),
                newState
            )[action.cacheKey] = action.data;
    else
        action.cacheAt
            .split('.')
            .reduce(
                (obj, key) => (obj && obj[key]) || (obj[key] = {}),
                newState
            )[action.cacheKey][key] = value;

    return newState;
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.ACTION_LOGGED_IN:
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.data,
                    loggedIn: true,
                }
            };
        case ActionTypes.UPDATE_USER_BUSINESS:
            return {
                ...state,
                user: {
                    ...state.user,
                    businessName: action.payload.businessName,
                    businessSlug: action.payload.businessSlug
                }
            };
        case ActionTypes.ACTION_LOGOUT:
            return {
                ...state,
                user: {
                    loggedIn: false,
                }
            }
        case ActionTypes.ACTION_OVERLAY_ON:
            return {
                ...state,
                volatile: {
                    ...state.volatile,
                    showOverlay: true,
                },
            };
        case ActionTypes.ACTION_OVERLAY_OFF:
            return {
                ...state,
                volatile: {
                    ...state.volatile,
                    showOverlay: false,
                },
            };
        case ActionTypes.ACTION_NAVBAR_DATA_READY:
        case ActionTypes.ACTION_MAIN_VIDEO_DATA_READY:
        case ActionTypes.ACTION_FRONT_END_SETTINGS_READY:
        case ActionTypes.ACTION_HOME_CARD_GRID_SECTIONS_READY:
            return state;
        case ActionTypes.CACHE_REST_API_RESPONSE:
            action.data['local_cache_created'] = Math.floor(Date.now() / 1000);
            return updateState(state, action);

        case ActionTypes.CACHE_REST_API_LAST_REQUEST_TIMESTAMP:
            return updateState(
                state,
                action,
                'local_cache_created',
                Math.floor(Date.now() / 1000)
            );
        case ActionTypes.TEMPORARY_CONNECTIVITY_ISSUE:
            return {
                ...state,
                volatile: {
                    temporaryConnectivityIssue: action.issue,
                },
            };
        case ActionTypes.ACTION_LOG_CARD_SIZE_STATS:
            let newState = {
                ...state,
                contentCache: {
                    ...state.contentCache,
                    cardSizes: {
                        ...state.contentCache.cardSizes,
                    },
                },
            };

            newState['contentCache']['cardSizes'][action.data.key] = {
                width: action.data.width,
                height: action.data.height,
            };
            return newState;
        case ActionTypes.ACTION_ONLINE_STATUS:
            return {
                ...state,
                volatile: {
                    ...state.volatile,
                    online: action.data.online,
                },
            };
        case ActionTypes.ACTION_SHOW_SHARE_MODAL:
            return {
                ...state,
                volatile: {
                    ...state.volatile,
                    showShareModal: true,
                    shareInfo: action.data
                }
            };
        case ActionTypes.ACTION_HIDE_SHARE_MODAL:
            return {
                ...state,
                volatile: {
                    ...state.volatile,
                    showShareModal: false,
                    shareInfo: {
                        shareOptions: {
                            title: ""
                        }
                    },
                },
            };
        case ActionTypes.ACTION_CHANGE_CARD_GRID_VIEW_MODE:
            return {
                ...state,
                user: {
                    ...state.user,
                    options: {
                        ...state.user.options,
                        [action.data.slug]: action.data.mode
                    }
                },
            };
        case ActionTypes.ACTION_TOGGLE_FOOTER_DISPLAY:
            return {
                ...state,
                app: {
                    ...state.app,
                    layout: {
                        ...state.layout,
                        showFooter: action.payload
                    }
                    
                },
            };
        case ActionTypes.ACTION_UPDATE_BUSINESSTYPES:
            return {
                ...state,
                app: {
                    ...state.app,
                    businessRoles: {
                        ...state.app.businessRoles,
                        businessTypes: action.payload
                    }
                    
                },
            };
        case ActionTypes.ACTION_UPDATE_BUSINESSCAPACITYTYPES:
            return {
                ...state,
                app: {
                    ...state.app,
                    businessRoles: {
                        ...state.app.businessRoles,
                        businessCapacityTypes: action.payload
                    }
                    
                },
            };
        case ActionTypes.UPDATE_DIRECTORIES:
            return {
                ...state,
                app: {
                    ...state.app,
                    directories: 
                        action.payload
                    
                    
                },
            };
    }

    // default...
    return state;
};

export default reducer;
