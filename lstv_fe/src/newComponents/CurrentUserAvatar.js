import React from 'react'

import Avatar from './Avatar'
import {useAuthService} from '../rest-api/hooks/useAuthService'

export const CurrentUserAvatar = () => {
    const { user } = useAuthService()

    return <Avatar imageSrc={user.profileThumbnail} initial={user.firstName?.slice(0, 1)?.toUpperCase()} />;
}

export default CurrentUserAvatar