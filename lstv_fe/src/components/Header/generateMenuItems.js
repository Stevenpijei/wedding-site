import { USER_TYPE_VENDOR_TEAM_MEMBER, USER_TYPE_CONSUMER, USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING } from '../../global/globals';

/**
 * Get items to make up links in a user menu dropdown
 * @param {*} user
 * @param {boolean} excludeDashboard On mobile, for example, you may want to exclude links to Dashboard features because they're not supported for that viewport
 * @returns Array of objects that can be used for react-router-dom Links
 */
export const generateMenuItems = (user, excludeDashboard) => {
    const defaultItems = [
        {
            type: 'PROFILE',
            title: `${user.firstName} ${user.lastName}`,
            subTitle: user.email,
            to: user.userType === USER_TYPE_VENDOR_TEAM_MEMBER ? `/dashboard/info`: `/edit-profile`,
            imageSrc: user.profileThumbnail,
        },
    ];

    if (user.userType === USER_TYPE_VENDOR_TEAM_MEMBER_ONBOARDING) {
        defaultItems.push(
            { type: 'STANDARD', name: 'Set Up Profile', to: '/edit-profile-pro' },
        )
    }

    if (user.userType === USER_TYPE_CONSUMER) {
        defaultItems.push(
            { type: 'STANDARD', name: 'Edit Profile and Settings', to: '/edit-profile' },
        )
    }

    if (user.userType === USER_TYPE_VENDOR_TEAM_MEMBER) {
        let roles = [];
        if (user.businessRoles) {
            roles = user.businessRoles.map((role) => role.name);
        }

        defaultItems.push({
            type: 'PROFILE',
            title: user.businessName,
            to: `/business/${user.businessSlug}`,
            imageSrc: user.businessThumbnail,
        });

        if(!excludeDashboard) {
            defaultItems.push({
                type: 'STANDARD',
                name: 'Dashboard',
                to: '/dashboard/info'
            });
        }

        defaultItems.push({
            type: 'STANDARD',
            name: 'My Business Page',
            to: `/business/${user.businessSlug}`
        });

        if(roles.includes('Videographer') && !excludeDashboard) {
            defaultItems.push({
                type: 'STANDARD',
                name: 'Upload Videos',
                to: '/dashboard/upload-video'
            });
        }
    }

    return defaultItems;
};
