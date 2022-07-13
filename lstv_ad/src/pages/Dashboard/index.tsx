import React, { useContext, useState } from 'react';
import { Box, Grid } from '@material-ui/core';

import TimespanPresets from './TimespanPresets';
import { useAdminStats } from 'service/hooks/dashboard';
import { generateGranularity, getDateFromTimespan, getFormattedDate, getPreviousPeriodFromCurrent } from './util';
import { ETimespan } from 'config/enum';
import { ToastContext } from 'contexts/ToastContext';
import MultiAxis from './Graphs/MultiAxis';
import LoadingIndicator from 'components/LoadingIndicator';

export interface IDatePeriod {
    from_date: Date;
    to_date: Date;
}

export type IGranularity = 'day' | 'week' | 'month';

const METRIC = 'video_uploads';

const Dashboard: React.FC = () => {
    const { showToast } = useContext(ToastContext);
    const [currentPeriod, setCurrentPeriod] = useState<IDatePeriod>(getDateFromTimespan(ETimespan.Today));
    const [compareChecked, setCompareChecked] = useState<boolean>(false);

    const previousPeriod = getPreviousPeriodFromCurrent(currentPeriod);

    const from_date = getFormattedDate(currentPeriod.from_date);
    const to_date = getFormattedDate(currentPeriod.to_date);
    const compare_from_date = getFormattedDate(previousPeriod.compare_from_date);
    const compare_to_date = getFormattedDate(previousPeriod.compare_to_date);

    const { data, isLoading } = useAdminStats(
        {
            from_date,
            to_date,
            metric: METRIC,
            granularity: generateGranularity(currentPeriod),
            ...(compareChecked
                ? {
                      compare_from_date,
                      compare_to_date,
                  }
                : {}),
        },
        {
            onError: (err) => {
                showToast({ type: 'error', message: err.message });
            },
        }
    );

    return (
        <Box>
            <TimespanPresets setCurrentPeriod={setCurrentPeriod} setCompareChecked={setCompareChecked} />
            {isLoading && <LoadingIndicator />}
            {!isLoading && data && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <MultiAxis
                            data={data.result}
                            isCompared={compareChecked}
                            legend1={`${from_date} - ${to_date}`}
                            legend2={`${compare_from_date} - ${compare_to_date}`}
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default Dashboard;
