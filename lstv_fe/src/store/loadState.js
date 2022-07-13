import { FRONT_END_SETTINGS_HOME_PAGE_TITLE } from '../global/globals';
import { BUSINESSROLETYPES, BUSINESSSROLECAPTYPES, DIRECTORIES } from './businessesDefault';
import { volatileState } from './reducer';

const loadState = () => {
  console.warn("LOADING localstorage <--<-<-<-<-<-<-<-");
  // Include initial state
  const initialState = {
      version: process.env.APP_VERSION,
      user: {
          loggedIn: false,
      },
      app: {
          cachedData: {
              frontEndSettings: {
                  homePageTitle: FRONT_END_SETTINGS_HOME_PAGE_TITLE,
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
          },
          directories: {
              ...DIRECTORIES
          }
      },
      volatile: {
          ...volatileState,
      },
  };

  try {
      const serializedState = localStorage.getItem(`state`);

      if (serializedState === null) {
          return initialState;

      } else {
          const parsed = JSON.parse(serializedState);

          if(Object.keys(parsed).includes('version') && parsed.version === process.env.APP_VERSION){
              //If the version in ss === cureent app version, return ss otherwise return null
              return parsed
          } else if(Object.keys(parsed).includes('user') && parsed.user?.loggedIn) {
              return { ...initialState, user: parsed.user}
          }

          return initialState
      }
     
  } catch (err) {
      return initialState;
  }
};

export default loadState