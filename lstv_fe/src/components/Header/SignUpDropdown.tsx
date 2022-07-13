import React from 'react';
import theme from '../../styledComponentsTheme';
import Badge from '../Badge';
import * as S from './HeaderBar.styles';
import Dropdown from '../../components/Dropdown';
import { UserAvatarIcon, VendorsIcon } from '../../components/Utility/LSTVSVG';
import { useAuthService } from '../../rest-api/hooks/useAuthService';

const SignUpDropdown = () => {
  const { goToSignUp, goToSignUpPro } = useAuthService()
  return (
    <Dropdown
      id='header_sign_up'
      alignEnd
      toggle={
        <S.SignInButton>
          Sign Up <Badge id='arrowRight' style={{ marginLeft: 10 }} />
        </S.SignInButton>
      }
      menu={
        <S.SignInMenu>
          <S.SignInMenuItem onClick={goToSignUp}>
            <S.SignInMenuItemIcon>
              <UserAvatarIcon fillColor={theme.darkerGrey} />
            </S.SignInMenuItemIcon>
                  Sign Up
              </S.SignInMenuItem>
          <S.SignInMenuItem onClick={goToSignUpPro} noSeparator>
            <S.SignInMenuItemIcon>
              <VendorsIcon fillColor={theme.darkerGrey} />
            </S.SignInMenuItemIcon>
                  Pro Sign Up
              </S.SignInMenuItem>
        </S.SignInMenu>
      }
    />
  )
}

export default SignUpDropdown