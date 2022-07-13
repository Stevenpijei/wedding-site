import React, { useCallback } from 'react';
import classNames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';

import AdminNavbarLinks from '../Navbar/AdminNavbarLinks';
import styles from 'assets/tss/material-dashboard-pro-react/components/sidebarStyle';
import { ISidebarRoute } from '../../config/routes';

const useStyles = makeStyles(styles as any);

interface Props {
    handleDrawerToggle: () => void;
    open: boolean;
    image: string;
    routes: ISidebarRoute[];
    logo: React.ReactNode;
}

const Sidebar: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const location = useLocation();
    // verifies if routeName is the one active (in browser input)
    const activeRoute = useCallback(
        (routeName: string) => {
            return location.pathname.indexOf(routeName) > -1 ? true : false;
        },
        [location.pathname]
    );
    const color = 'blue';
    const bgColor = 'black';
    const { logo, image, routes } = props;

    const drawerPaper = classes.drawerPaper;

    const links = (
        <List className={classes.list}>
            {routes.map((prop, key) => {
                let activePro = ' ';
                let listItemClasses;
                const RouteIcon = prop.icon;
                if (prop.path === '/upgrade-to-pro') {
                    activePro = classes.activePro + ' ';
                    listItemClasses = classNames({
                        [' ' + classes[color]]: true,
                    });
                } else {
                    listItemClasses = classNames({
                        [' ' + classes[color]]: activeRoute(prop.path),
                    });
                }
                const whiteFontClasses = classNames({
                    [' ' + classes.whiteFont]: activeRoute(prop.path),
                });
                return (
                    <NavLink to={prop.path} className={activePro + classes.item} activeClassName="active" key={key}>
                        <ListItem button className={classes.itemLink + listItemClasses}>
                            {typeof prop.icon === 'string' ? (
                                <Icon className={classNames(classes.itemIcon, whiteFontClasses)}>{prop.icon}</Icon>
                            ) : (
                                <RouteIcon className={classNames(classes.itemIcon, whiteFontClasses)} />
                            )}
                            <ListItemText
                                primary={prop.name}
                                className={classNames(classes.itemText, whiteFontClasses)}
                                disableTypography={true}
                            />
                        </ListItem>
                    </NavLink>
                );
            })}
        </List>
    );
    const brand = (
        <div className={classes.logo}>
            <a
                href="https://lovestoriestv.com"
                className={classNames(classes.logoLink)}
                target="_blank"
                rel="noreferrer"
            >
                {logo}
            </a>
        </div>
    );
    return (
        <div>
            <Hidden mdUp implementation="css">
                <Drawer
                    variant="temporary"
                    anchor="right"
                    open={props.open}
                    classes={{
                        paper: classNames(classes.drawerPaper),
                    }}
                    onClose={props.handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                >
                    {brand}
                    <div className={classes.sidebarWrapper}>
                        <AdminNavbarLinks />
                        {links}
                    </div>
                    {image !== undefined ? (
                        <div className={classes.background} style={{ backgroundImage: 'url(' + image + ')' }} />
                    ) : null}
                </Drawer>
            </Hidden>
            <Hidden smDown implementation="css">
                <Drawer
                    anchor="left"
                    variant="permanent"
                    open
                    classes={{
                        paper: drawerPaper + ' ' + classes[bgColor + 'Background'],
                    }}
                >
                    {brand}
                    <div className={classes.sidebarWrapper}>{links}</div>
                    {image !== undefined ? (
                        <div className={classes.background} style={{ backgroundImage: 'url(' + image + ')' }} />
                    ) : null}
                </Drawer>
            </Hidden>
        </div>
    );
};

export default Sidebar;
