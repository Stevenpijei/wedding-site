import React, { useEffect, useState } from 'react';
import { Box, FormControlLabel } from '@material-ui/core';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import { ETimespan } from 'config/enum';
import { PurpleCheckBox } from 'components/MultiSelect';
import { IDatePeriod } from '.';
import { getDateFromTimespan } from './util';
import { getTimespanState, setTimespanState } from 'store/localStorage';

interface Props {
    setCurrentPeriod: React.Dispatch<React.SetStateAction<IDatePeriod>>;
    setCompareChecked: React.Dispatch<React.SetStateAction<boolean>>;
}

const TimespanPresets: React.FC<Props> = ({ setCurrentPeriod, setCompareChecked }: Props) => {
    const localStorageTimespan = getTimespanState();
    const [customStartDate, setCustomStartDate] = useState<Date>(new Date(localStorageTimespan.custom.from_date));
    const [customToDate, setCustomToDate] = useState<Date>(new Date(localStorageTimespan.custom.to_date));
    const [timespan, setTimespan] = useState<ETimespan>(localStorageTimespan.timespan);

    useEffect(() => {
        setTimespanState('timespan', timespan);
        if (timespan !== ETimespan.Custom) {
            setCurrentPeriod(getDateFromTimespan(timespan));
        } else {
            const payload = {
                from_date: customStartDate,
                to_date: customToDate,
            };
            setCurrentPeriod(payload);
            setTimespanState('custom', payload);
        }
    }, [customStartDate, customToDate, timespan]);

    const handleTimespanChange = (event: React.MouseEvent<HTMLElement>, newTimespan: ETimespan | null) => {
        if (newTimespan) setTimespan(newTimespan);
    };

    const handleStartDateChange = (date: Date | null) => {
        if (date) setCustomStartDate(date);
    };

    const handleEndDateChange = (date: Date | null) => {
        if (date) setCustomToDate(date);
    };

    const handleCompareChange = (event: React.ChangeEvent<any>, checked: boolean) => {
        setCompareChecked(checked);
        setTimespanState('isComparison', checked);
    };
    console.log(localStorageTimespan);
    return (
        <div>
            <h4>Timespan Presets</h4>
            <Box display="flex" alignItems="center">
                <ToggleButtonGroup
                    exclusive
                    style={{ marginRight: '20px' }}
                    value={timespan}
                    onChange={handleTimespanChange}
                >
                    <ToggleButton value={ETimespan.Today}>Today</ToggleButton>
                    <ToggleButton value={ETimespan.Yesterday}>Yesterday</ToggleButton>
                    <ToggleButton value={ETimespan.WTD}>WTD</ToggleButton>
                    <ToggleButton value={ETimespan.Last7d}>Last7d</ToggleButton>
                    <ToggleButton value={ETimespan.LW}>LW</ToggleButton>
                    <ToggleButton value={ETimespan.MTD}>MTD</ToggleButton>
                    <ToggleButton value={ETimespan.Last30d}>Last30d</ToggleButton>
                    <ToggleButton value={ETimespan.LM}>LM</ToggleButton>
                    <ToggleButton value={ETimespan.QTD}>QTD</ToggleButton>
                    <ToggleButton value={ETimespan.LQ}>LQ</ToggleButton>
                    <ToggleButton value={ETimespan.YTD}>YTD</ToggleButton>
                    <ToggleButton value={ETimespan.LY}>LY</ToggleButton>
                    <ToggleButton value={ETimespan.Custom}>Custom</ToggleButton>
                </ToggleButtonGroup>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <Box display="flex" alignItems="center">
                        <KeyboardDatePicker
                            disableToolbar
                            disabled={timespan !== ETimespan.Custom}
                            variant="inline"
                            format="yyyy-MM-dd"
                            margin="normal"
                            label="From Date"
                            value={customStartDate}
                            onChange={handleStartDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                        <p style={{ margin: '0 10px 0 10px' }}>to</p>
                        <KeyboardDatePicker
                            disableToolbar
                            disabled={timespan !== ETimespan.Custom}
                            variant="inline"
                            format="yyyy-MM-dd"
                            minDate={customStartDate}
                            margin="normal"
                            label="To Date"
                            value={customToDate}
                            onChange={handleEndDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </Box>
                </MuiPickersUtilsProvider>
            </Box>
            <FormControlLabel
                control={<PurpleCheckBox defaultChecked={localStorageTimespan.isComparison} />}
                label="Compare to previous time period"
                onChange={handleCompareChange}
            />
        </div>
    );
};

export default TimespanPresets;
