import React from 'react';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { withStyles } from '@material-ui/core/styles';

import { PRIMARY_PURPLE } from 'styles/theme';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface Props<T> {
    loading: boolean;
    title: string;
    list: T[];
    properties: {
        name?: keyof T;
        slug: keyof T;
    };
    values: T[];
    style?: React.CSSProperties;
    onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setValues: React.Dispatch<React.SetStateAction<T[]>>;
    onClose?: () => void;
}

export const PurpleCheckBox = withStyles({
    root: {
        color: PRIMARY_PURPLE,
        '&$checked': {
            color: PRIMARY_PURPLE,
        },
    },
    checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

function MultiSelect<T>({
    properties,
    list,
    values,
    loading,
    title,
    style,
    onInputChange,
    setValues,
    onClose,
}: Props<T>) {
    const handleChange = (event: React.ChangeEvent<any>, value: T[]) => {
        setValues(value);
    };

    return (
        <Autocomplete
            multiple
            options={list}
            value={values}
            disableCloseOnSelect
            getOptionSelected={(option: T, value: T) => option[properties.slug] === value[properties.slug]}
            getOptionLabel={(option: T) => (properties.name ? option[properties.name] : (option as unknown)) as string}
            renderOption={(option: T, { selected }) => (
                <React.Fragment>
                    <PurpleCheckBox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {properties.name ? option[properties.name] : (option as unknown)}
                </React.Fragment>
            )}
            onChange={handleChange}
            style={{ minWidth: '400px', ...style }}
            loading={loading}
            renderInput={(params) => <TextField {...params} label={title} onChange={onInputChange} />}
            onClose={onClose}
        />
    );
}

export default MultiSelect;
