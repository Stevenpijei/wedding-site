import React from 'react';
import SearchTwoToneIcon from '@material-ui/icons/SearchTwoTone';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

const SearchInput: React.FC<TextFieldProps> = ({ ...rest }) => {
    return (
        <>
            <SearchTwoToneIcon />
            <TextField size="small" type="search" {...rest} />
        </>
    );
};

export default SearchInput;
