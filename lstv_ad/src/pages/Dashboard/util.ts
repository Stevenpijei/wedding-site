import { ETimespan } from 'config/enum';
import {
    format,
    subDays,
    startOfWeek,
    addDays,
    startOfMonth,
    startOfQuarter,
    startOfYear,
    differenceInCalendarDays,
} from 'date-fns';
import { IDatePeriod, IGranularity } from '.';

export const getFormattedDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const generateGranularity = (period: IDatePeriod): IGranularity => {
    const diff = differenceInCalendarDays(period.to_date, period.from_date);
    if (diff >= 50) {
        return 'week';
    } else if (diff > 360) {
        return 'month';
    } else return 'day';
};

export const getPreviousPeriodFromCurrent = (currentPeriod: IDatePeriod) => {
    const { from_date, to_date } = currentPeriod;

    const diff = differenceInCalendarDays(to_date, from_date);
    const compare_to_date = subDays(from_date, 1);
    const compare_from_date = subDays(compare_to_date, diff);

    return {
        compare_to_date,
        compare_from_date,
    };
};

export const getDateFromTimespan = (timespan: ETimespan): IDatePeriod => {
    let from_date: Date = new Date();
    let to_date: Date = new Date();
    const now = new Date();
    switch (timespan) {
        case ETimespan.Today:
            from_date = now;
            to_date = from_date;
            break;
        case ETimespan.Yesterday:
            from_date = subDays(now, 1);
            to_date = from_date;
            break;
        case ETimespan.WTD:
            from_date = startOfWeek(now, { weekStartsOn: 1 });
            to_date = now;
            break;
        case ETimespan.Last7d:
            from_date = subDays(now, 7);
            to_date = subDays(now, 1);
            break;
        case ETimespan.LW:
            from_date = subDays(startOfWeek(now, { weekStartsOn: 1 }), 7);
            to_date = addDays(from_date, 6);
            break;
        case ETimespan.MTD:
            from_date = startOfMonth(now);
            to_date = now;
            break;
        case ETimespan.Last30d:
            from_date = subDays(now, 30);
            to_date = subDays(now, 1);
            break;
        case ETimespan.LM:
            const lastMonthEndDate = subDays(startOfMonth(now), 1);
            from_date = startOfMonth(lastMonthEndDate);
            to_date = lastMonthEndDate;
            break;
        case ETimespan.QTD:
            from_date = startOfQuarter(now);
            to_date = now;
            break;
        case ETimespan.LQ:
            const lastQuarterEndDate = subDays(startOfQuarter(now), 1);
            from_date = startOfQuarter(lastQuarterEndDate);
            to_date = lastQuarterEndDate;
            break;
        case ETimespan.YTD:
            from_date = startOfYear(now);
            to_date = now;
            break;
        case ETimespan.LY:
            const lastYearEndDate = subDays(startOfYear(now), 1);
            from_date = startOfYear(lastYearEndDate);
            to_date = lastYearEndDate;
            break;
    }
    return {
        from_date,
        to_date,
    };
};
