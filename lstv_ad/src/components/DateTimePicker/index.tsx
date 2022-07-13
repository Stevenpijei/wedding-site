import React from 'react';
import Datetime, { DatetimepickerProps } from 'react-datetime';

import './styles.scss';

const DateTimePicker: React.FC<DatetimepickerProps> = (props: DatetimepickerProps) => {
    return <Datetime {...props} />;
};

export default DateTimePicker;
