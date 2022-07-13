import { ETimespan } from 'config/enum';
import { RootState } from 'store';

const DASHBOARD_TIMESPAN = `dashboard_timespan`;

interface IDashboardTimespan {
    timespan: ETimespan;
    custom: {
        from_date: string;
        to_date: string;
    };
    isComparison: boolean;
}

const DEFAULT_DASHBOARD_TIMESPAN: IDashboardTimespan = {
    timespan: ETimespan.Today,
    custom: {
        from_date: new Date().toISOString(),
        to_date: new Date().toISOString(),
    },
    isComparison: false,
};

export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

export const saveState = (state: Partial<RootState>) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
    } catch {
        // ignore write errors
    }
};

export const setTimespanState = (key: keyof IDashboardTimespan, value: any) => {
    const state = getTimespanState();
    state[key] = value as never;
    window.localStorage.setItem(DASHBOARD_TIMESPAN, JSON.stringify(state));
    return state;
};

export const getTimespanState = (): IDashboardTimespan => {
    try {
        const v = window.localStorage.getItem(DASHBOARD_TIMESPAN) || '';
        return JSON.parse(v) as IDashboardTimespan;
    } catch (e) {
        return DEFAULT_DASHBOARD_TIMESPAN;
    }
};
