import { useMutation } from 'react-query';

import { IError } from 'interface';
import { ILoginForm } from 'pages/Login';
import { requestLogin } from 'service/api/authentication';
import { ILoginResponse } from 'interface/auth';

export const useLogin = () => useMutation<ILoginResponse, IError, ILoginForm>(requestLogin);
