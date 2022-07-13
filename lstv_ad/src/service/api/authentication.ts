import { ILoginForm } from 'pages/Login';
import { postRequest } from '.';

export const requestLogin = ({ email, password }: ILoginForm) => postRequest(`/login`, { email, password });
