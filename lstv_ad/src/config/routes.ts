import DashboardIcon from '@material-ui/icons/Dashboard';
import BusinessIcon from '@material-ui/icons/Business';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import PeopleIcon from '@material-ui/icons/People';
import DescriptionIcon from '@material-ui/icons/Description';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import SettingsIcon from '@material-ui/icons/Settings';
import FolderIcon from '@material-ui/icons/Folder';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

export interface ISidebarRoute {
    path: string;
    name: string;
    icon: any;
}

export const PublicRoutes = {
    LOGIN: '/login',
};

export const PrivateRoutes = {
    DASHBOARD: '/dashboard',
    BUSINESSES: '/businesses',
    VIDEOS: '/videos',
    PHOTOS: '/photos',
    USERS: '/users',
    ARTICLES: '/articles',
    TAGS: '/tags',
    SETTINGS: '/settings',
    DIRECTORIES: '/directories',
};

export const SidebarRoutes: ISidebarRoute[] = [
    {
        path: PrivateRoutes.DASHBOARD,
        name: 'Dashboard',
        icon: DashboardIcon,
    },
    {
        path: PrivateRoutes.BUSINESSES,
        name: 'Businesses',
        icon: BusinessIcon,
    },
    {
        path: PrivateRoutes.VIDEOS,
        name: 'Wedding Videos',
        icon: VideoLibraryIcon,
    },
    {
        path: PrivateRoutes.PHOTOS,
        name: 'Wedding Photos',
        icon: PhotoLibraryIcon,
    },
    {
        path: PrivateRoutes.USERS,
        name: 'Users',
        icon: PeopleIcon,
    },
    {
        path: PrivateRoutes.ARTICLES,
        name: 'Articles',
        icon: DescriptionIcon,
    },
    {
        path: PrivateRoutes.TAGS,
        name: 'Tags',
        icon: LocalOfferIcon,
    },
    {
        path: PrivateRoutes.DIRECTORIES,
        name: 'Directories',
        icon: FolderIcon,
    },
    {
        path: PrivateRoutes.SETTINGS,
        name: 'Site Settings',
        icon: SettingsIcon,
    },
];
