import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import FormControl, { FormControlProps } from '@material-ui/core/FormControl';
import InputLabel, { InputLabelProps } from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input, { InputProps } from '@material-ui/core/Input';

import styles from 'assets/tss/material-dashboard-pro-react/components/customInputStyle';

interface Props {
    labelText: React.ReactNode;
    labelProps?: InputLabelProps;
    id: string;
    inputProps: InputProps & any;
    formControlProps: FormControlProps;
    inputRootCustomClasses?: string;
    error?: boolean;
    success?: boolean;
    white?: boolean;
    helperText?: React.ReactNode;
}

const useStyles = makeStyles(styles as any);

const CustomInput: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {
        formControlProps,
        labelText,
        id,
        labelProps,
        inputProps,
        error,
        white,
        inputRootCustomClasses = '',
        success,
        helperText,
    } = props;

    const labelClasses = classNames({
        [' ' + classes.labelRootError]: error,
        [' ' + classes.labelRootSuccess]: success && !error,
    });
    const underlineClasses = classNames({
        [classes.underlineError]: error,
        [classes.underlineSuccess]: success && !error,
        [classes.underline]: true,
        [classes.whiteUnderline]: white,
    });
    const marginTop = classNames({
        [inputRootCustomClasses]: inputRootCustomClasses !== undefined,
    });
    const inputClasses = classNames({
        [classes.input]: true,
        [classes.whiteInput]: white,
    });
    let formControlClasses;
    if (formControlProps !== undefined) {
        formControlClasses = classNames(formControlProps.className, classes.formControl);
    } else {
        formControlClasses = classes.formControl;
    }
    const helpTextClasses = classNames({
        [classes.labelRootError]: error,
        [classes.labelRootSuccess]: success && !error,
    });
    const newInputProps = {
        maxLength: inputProps && inputProps.maxLength ? inputProps.maxLength : undefined,
        minLength: inputProps && inputProps.minLength ? inputProps.minLength : undefined,
    };
    return (
        <FormControl {...formControlProps} className={formControlClasses}>
            {labelText !== undefined ? (
                <InputLabel className={classes.labelRoot + ' ' + labelClasses} htmlFor={id} {...labelProps}>
                    {labelText}
                </InputLabel>
            ) : null}
            <Input
                classes={{
                    input: inputClasses,
                    root: marginTop,
                    disabled: classes.disabled,
                    underline: underlineClasses,
                }}
                id={id}
                {...inputProps}
                inputProps={newInputProps}
            />
            {helperText !== undefined ? (
                <FormHelperText id={id + '-text'} className={helpTextClasses}>
                    {helperText}
                </FormHelperText>
            ) : null}
        </FormControl>
    );
};

export default CustomInput;
