import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Hidden from '@material-ui/core/Hidden';
import Poppers from '@material-ui/core/Popper';
import Avatar from '@material-ui/core/Avatar';

// core components
import Button from 'components/CustomBtns/Button';

import styles from 'assets/tss/material-dashboard-pro-react/components/adminNavbarLinksStyle';
import { logOut, selectAuthState } from 'store/reducers/authentication';
import { PRIMARY_PURPLE } from 'styles/theme';

const useStyles = makeStyles(styles as any);

// TODO: Fix handle click away issue here.

const AdminNavbarLinks: React.FC = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { user } = useSelector(selectAuthState);

    const [openProfile, setOpenProfile] = React.useState<null | HTMLElement>(null);

    const handleClickProfile = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!!openProfile && openProfile.contains(event.currentTarget)) {
            setOpenProfile(null);
        } else {
            setOpenProfile(event.currentTarget);
        }
    };

    const handleCloseProfile = () => {
        setOpenProfile(null);
    };

    const handleLogout = () => {
        handleCloseProfile();
        dispatch(logOut());
    };

    return (
        <div>
            <div className={classes.searchWrapper}></div>

            <div className={classes.manager}>
                <Button
                    color={window.innerWidth > 959 ? 'transparent' : 'white'}
                    justIcon={window.innerWidth > 959}
                    simple={!(window.innerWidth > 959)}
                    aria-owns={openProfile ? 'profile-menu-list-grow' : undefined}
                    aria-haspopup="true"
                    onClick={handleClickProfile}
                    className={classes.buttonLink}
                >
                    <Avatar
                        src={user?.profile_thumbnail_url || '/'}
                        alt={user?.first_name}
                        style={{ backgroundColor: PRIMARY_PURPLE }}
                    />
                    <Hidden mdUp implementation="css">
                        <p className={classes.linkText}>Profile</p>
                    </Hidden>
                </Button>
                <Poppers
                    open={Boolean(openProfile)}
                    anchorEl={openProfile}
                    transition
                    disablePortal
                    className={classNames({ [classes.popperClose]: !openProfile }) + ' ' + classes.popperNav}
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={() => null}>
                                    <MenuList role="menu">
                                        <MenuItem onClick={handleLogout} className={classes.dropdownItem}>
                                            Logout
                                        </MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Poppers>
            </div>
        </div>
    );
};

export default AdminNavbarLinks;
