import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';

// @material-ui/icons
import Email from '@material-ui/icons/Email';
import LockOutline from '@material-ui/icons/LockOutlined';

import GridContainer from 'components/Grid/GridContainer';
import GridItem from 'components/Grid/GridItem';
import CustomInput from 'components/CustomInput';
import Button from 'components/CustomBtns/Button';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import CardFooter from 'components/Card/CardFooter';
import ErrorAlert from 'components/ErrorAlert';

import styles from 'assets/tss/material-dashboard-pro-react/views/loginPageStyle';
import bgImage from 'assets/img/login-bg.jpg';
import { useLogin } from 'service/hooks/auth';
import { setLoggedIn } from 'store/reducers/authentication';

const useStyles = makeStyles(styles as any);

export interface ILoginForm {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const { register, handleSubmit } = useForm<ILoginForm>();
    const dispatch = useDispatch();
    const { mutateAsync: requestLogin, isLoading } = useLogin();
    const [cardAnimaton, setCardAnimation] = React.useState('cardHidden');
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const classes = useStyles();

    React.useEffect(() => {
        const id = setTimeout(function () {
            setCardAnimation('');
        }, 700);
        return function cleanup() {
            window.clearTimeout(id);
        };
    });

    const onSubmit = async (formValues: ILoginForm) => {
        try {
            const res = await requestLogin(formValues);
            if (res.result.user_type === 'admin') {
                dispatch(setLoggedIn(res.result));
            } else {
                throw new Error('Unable to log in with provided credentials.');
            }
        } catch (e) {
            setErrorMessage(e.message);
        }
    };

    return (
        <div style={{ backgroundImage: `url(${bgImage})`, height: '100%' }}>
            <div className={classes.container}>
                <GridContainer justify="center">
                    <GridItem xs={12} sm={6} md={4}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Card login className={classes[cardAnimaton]}>
                                <CardHeader className={`${classes.cardHeader} ${classes.textCenter}`} color="success">
                                    <h4 className={classes.cardTitle}>Isaac on the Web</h4>
                                </CardHeader>
                                <CardBody>
                                    <CustomInput
                                        labelText="Email..."
                                        id="email"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Email className={classes.inputAdornmentIcon} />
                                                </InputAdornment>
                                            ),
                                            required: true,
                                            inputRef: register,
                                            name: 'email',
                                        }}
                                    />
                                    <CustomInput
                                        labelText="Password"
                                        id="password"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <LockOutline className={classes.inputAdornmentIcon} />
                                                </InputAdornment>
                                            ),
                                            type: 'password',
                                            required: true,
                                            autoComplete: 'off',
                                            inputRef: register,
                                            name: 'password',
                                        }}
                                    />
                                    <ErrorAlert error={{ message: errorMessage }} isError={!!errorMessage} />
                                </CardBody>
                                <CardFooter className={classes.justifyContentCenter}>
                                    <Button
                                        color="primary"
                                        size="lg"
                                        block
                                        type="submit"
                                        disabled={isLoading}
                                        loading={isLoading}
                                    >
                                        Sign In
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </GridItem>
                </GridContainer>
            </div>
        </div>
    );
};

export default Login;
