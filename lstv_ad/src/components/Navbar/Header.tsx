import React from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
// @material-ui/icons
import Menu from '@material-ui/icons/Menu';
// core components
import AdminNavbarLinks from './AdminNavbarLinks';

import styles from 'assets/tss/material-dashboard-pro-react/components/adminNavbarStyle';
import { ISidebarRoute } from '../../config/routes';
import { selectPageBreadCrumbs } from 'store/reducers/pageBreadCrumb';

const useStyles = makeStyles(styles as any);

interface Props {
    color?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
    handleDrawerToggle: () => void;
    routes: ISidebarRoute[];
}

const Header: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const { value: breadCrumbs } = useSelector(selectPageBreadCrumbs);

    function makeBrand() {
        let name;
        props.routes.map((prop: ISidebarRoute) => {
            if (window.location.href.indexOf(prop.path) !== -1) {
                name = prop.name;
            }
            return null;
        });
        return name;
    }

    const appBarClasses = classNames();
    return (
        <AppBar className={classes.appBar + appBarClasses}>
            <Toolbar className={classes.container}>
                <div className={classes.flex} style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Here we create navbar brand, based on route name */}
                    {breadCrumbs.length > 1 &&
                        breadCrumbs.map((breadCrumb, idx) => (
                            <React.Fragment key={breadCrumb.link}>
                                <a
                                    href={breadCrumb.link}
                                    className={classes.title}
                                    target={idx === 0 ? '_self' : '_target'}
                                    rel="noreferrer"
                                >
                                    {breadCrumb.title}
                                    {idx === 1 && (
                                        <img
                                            src="/assets/external_link.svg"
                                            alt=""
                                            style={{ width: 28, marginLeft: '10px' }}
                                        />
                                    )}
                                </a>
                                {idx < breadCrumbs.length - 1 && <>&nbsp;&nbsp;⮕&nbsp;&nbsp;</>}
                            </React.Fragment>
                        ))}
                    {breadCrumbs.length <= 1 && <div className={classes.title}>{makeBrand()}</div>}
                </div>
                <Hidden smDown implementation="css">
                    <AdminNavbarLinks />
                </Hidden>
                <Hidden mdUp implementation="css">
                    <IconButton color="inherit" aria-label="open drawer" onClick={props.handleDrawerToggle}>
                        <Menu />
                    </IconButton>
                </Hidden>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
