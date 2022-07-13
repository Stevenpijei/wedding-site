import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { PurpleCheckBox } from './MultiSelect';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface Props<T> {
    loading?: boolean;
    disabled?: boolean;
    title: string;
    list: T[];
    properties: {
        name?: keyof T;
        slug: keyof T;
    };
    value: T | null;
    style?: React.CSSProperties;
    required?: boolean;
    disableCloseOnSelect?: boolean;
    onChange?: (event: React.ChangeEvent<any>, value: string) => void;
    setValue: React.Dispatch<React.SetStateAction<T | null>>;
}

function SingleSelect<T>({
    properties,
    disabled,
    list,
    value,
    loading = false,
    title,
    style,
    required = false,
    disableCloseOnSelect = true,
    setValue,
    onChange,
}: Props<T>) {
    const handleChange = (event: React.ChangeEvent<any>, value: T | null) => {
        setValue(value);
    };

    return (
        <Autocomplete
            options={list}
            value={value}
            disabled={disabled}
            disableCloseOnSelect={disableCloseOnSelect}
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
            onInputChange={onChange}
            style={{ minWidth: '400px', ...style }}
            loading={loading}
            renderInput={(params) => <TextField {...params} disabled={disabled} label={title} required={required} />}
        />
    );
}

export default SingleSelect;
