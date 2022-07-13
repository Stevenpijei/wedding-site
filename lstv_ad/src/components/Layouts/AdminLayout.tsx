import React from 'react';
// creates a beautiful scrollbar
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
// core components
import Navbar from 'components/Navbar/Header';
import Sidebar from 'components/Sidebar';

import { SidebarRoutes } from 'config/routes';

import styles from 'assets/tss/material-dashboard-pro-react/layouts/adminStyle';

import bgImage from 'assets/img/sidebar-2.jpg';
import { MainLogo } from 'components/SVGComponents';

let ps: PerfectScrollbar;

const useStyles = makeStyles(styles as any);

interface Props {
    children: React.ReactNode | React.ReactNode[];
}

const Admin: React.FC<Props> = ({ children }: Props) => {
    // styles
    const classes = useStyles();
    // ref to help us initialize PerfectScrollbar on windows devices
    const mainPanel = React.createRef<HTMLDivElement>();
    // states and functions
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const resizeFunction = () => {
        if (window.innerWidth >= 960) {
            setMobileOpen(false);
        }
    };
    // initialize and destroy the PerfectScrollbar plugin
    React.useEffect(() => {
        if (navigator.platform.indexOf('Win') > -1) {
            ps = new PerfectScrollbar(mainPanel.current as Element, {
                suppressScrollX: true,
                suppressScrollY: false,
            });
            document.body.style.overflow = 'hidden';
        }
        window.addEventListener('resize', resizeFunction);
        // Specify how to clean up after this effect:
        return function cleanup() {
            if (navigator.platform.indexOf('Win') > -1) {
                ps.destroy();
            }
            window.removeEventListener('resize', resizeFunction);
        };
    }, [mainPanel]);
    return (
        <div className={classes.wrapper}>
            <Sidebar
                routes={SidebarRoutes}
                logo={<MainLogo />}
                image={bgImage}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
            />
            <div className={classes.mainPanel} ref={mainPanel}>
                <Navbar routes={SidebarRoutes} handleDrawerToggle={handleDrawerToggle} />
                <div className={classes.content}>
                    <div className={classes.container}>{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
