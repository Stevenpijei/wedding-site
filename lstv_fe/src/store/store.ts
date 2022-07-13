import { createStore } from 'redux';
import reducer from './reducer';
import loadState from "./loadState";

export interface IStore {
    user: any,
    app: any,
    volatile: any
}

const persistedState = loadState();
const reduxStore: IStore = createStore(
    reducer,
    persistedState,
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
export default reduxStore;