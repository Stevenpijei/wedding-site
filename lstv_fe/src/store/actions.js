export const ACTION_LOGGED_IN = "ACTION_LOGGED_IN";
export const ACTION_LOGOUT = "ACTION_LOGOUT";
export const ACTION_OVERLAY_ON = "ACTION_OVERLAY_ON";
export const ACTION_OVERLAY_OFF = "ACTION_OVERLAY_OFF";
export const ACTION_SHOW_SIDEBAR = "ACTION_SHOW_SIDEBAR";
export const ACTION_HIDE_SIDEBAR = "ACTION_HIDE_SIDEBAR";
export const ACTION_NAVBAR_DATA_READY = "ACTION_NAVBAR_DATA_READY";
export const ACTION_FRONT_END_SETTINGS_READY = "ACTION_FRONT_END_SETTINGS_READY";
export const ACTION_MAIN_VIDEO_DATA_READY = "ACTION_MAIN_VIDEO_DATA_READY";
export const ACTION_HOME_CARD_GRID_SECTIONS_READY = "ACTION_HOME_THUMBNAIL_SECTIONS_DATA_READY";
export const CACHE_REST_API_RESPONSE = "CACHE_REST_API_RESPONSE";
export const CACHE_REST_API_LAST_REQUEST_TIMESTAMP = "CACHE_REST_API_LAST_REQUEST_TIMESTAMP";
export const TEMPORARY_CONNECTIVITY_ISSUE = "TEMPORARY_CONNECTIVITY_ISSUE";
export const ACTION_LOG_CARD_SIZE_STATS = "ACTION_LOG_CARD_SIZE_STATS";
export const ACTION_ONLINE_STATUS = "ACTION_ONLINE_STATUS";
export const ACTION_SHOW_SHARE_MODAL = "SHOW_SHARE_MODAL";
export const ACTION_HIDE_SHARE_MODAL = "HIDE_SHARE_MODAL";
export const ACTION_CHANGE_CARD_GRID_VIEW_MODE = " ACTION_CHANGE_CARD_GRID_VIEW_MODE";
export const ACTION_TOGGLE_FOOTER_DISPLAY = "TOGGLE_FOOTER_DISPLAY";
export const ACTION_UPDATE_BUSINESSTYPES = "UPDATE_BUSINESS_TYPES";
export const ACTION_UPDATE_BUSINESSCAPACITYTYPES = "UPDATE_BUSINESS_CAP_TYPES";
export const UPDATE_DIRECTORIES = "UPDATE_DIRECTORIES";
export const UPDATE_USER_BUSINESS = "UPDATE_USER_BUSINESS";

export const userLoginSuccess = (data) => ({
    type: ACTION_LOGGED_IN,
    data,
})

export const userLogout = () => ({
    type: ACTION_LOGOUT
})