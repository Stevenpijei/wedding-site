// export {
//     UserDevice
// } from './globals'

/* RESPONSIVE definitions */

// Already defined in ./globals — Refactor in here, or import and export
export const size = {
	mobileS: "320px",
	mobileSLimit: "374px",
	mobileM: "375px",
	mobileMLimit: "424px",
	mobileL: "425px",
	mobileDeviceWidthLimit: "767px",
	tablet: "768px",
    laptop: "1025px",
	laptopL: "1440px",
	desktop: "1800px",
	desktopL: "2560px",
	mobileResponsiveWidthLimit: "767px",
	tabletWidthLimit: "1024px",
	smallLaptopWidthLimit: "1439px",
	laptopWidthLimit: "1440px",
};

export const UserDevice = {
    isMobileS: `(min-width: ${size.mobileS}) and (max-width: ${size.mobileSLimit})`,
    isMobileM: `(min-width: ${size.mobileM}) and (max-width: ${size.mobileMLimit})`,
    isMobileL: `(min-width: ${size.mobileL}) and (max-width: ${size.mobileDeviceWidthLimit})`,
    mobileS: `(min-width: ${size.mobileS})`,
    mobileM: `(min-width: ${size.mobileM})`,
    mobileL: `(min-width: ${size.mobileL})`,
    tablet: `(min-width: ${size.tablet})`,
    laptop: `(min-width: ${size.laptop})`,
    laptopL: `(min-width: ${size.laptopL})`,
    desktop: `(min-width: ${size.desktop})`,
    desktopL: `(min-width: ${size.desktopL})`,
    isTinyMobile: `(max-width: ${size.mobileS})`,
    isWithinTablet: `(min-width: ${size.tablet}) and (max-width: ${size.laptop})`,
    isWithinMobile: `(max-width: ${size.mobileDeviceWidthLimit})`,
    isMobile: `(min-width: ${size.mobileS}) and (max-width: ${size.mobileDeviceWidthLimit})`,
    isMobileOrTablet: `(min-width: ${size.mobileS}) and (max-width: ${size.tabletWidthLimit})`,
    isMobileOrTabletOrSmallLaptop: `(min-width: ${size.mobileS}) and (max-width: ${size.smallLaptopWidthLimit})`,
    isWithinLaptop: `(max-width: ${size.laptopWidthLimit})`,
    isTablet: `(min-width: ${size.tablet}) and (max-width: ${size.tabletWidthLimit})`,
    isLaptop: `(min-width: ${size.laptop}) and (max-width: ${size.laptopWidthLimit})`,
    isDesktop: `(min-width: ${size.desktop})`,
    notTablet: `(min-width: ${size.mobileS}) and (max-width: ${size.mobileDeviceWidthLimit}), 
		(min-width: ${size.laptop})`,
};

export default {
	UserDevice
}