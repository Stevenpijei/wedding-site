import React from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, useDispatch } from 'react-redux';
import Header from '../Header';
import store from '../../store/store';
import { userLoginSuccess, userLogout } from '../../store/actions';
import { adaptResponseToUser } from '../../rest-api/hooks/useAuthService'


export default {
    title: 'Layout/Header',
    component: Header,
    decorators: [(Story, context) => (
        <MemoryRouter initialEntries={['/']}>
            <Story {...context} />
        </MemoryRouter>
    ),
    (Story, context) => (
        <Provider store={store}>
            <Story {...context} />
        </Provider>
    )
    ]
}

export const header = (args) => {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(userLogout())
    })

    return (<>
        <Header {...args} />
    </>
    )
}

const sampleUserResponse = {
    "first_name": "Matthew",
    "last_name": "Weeks",
    "email": "materx80@gmail.com",
    "profile_thumbnail_url": "http://lorempixel.com/output/people-q-c-320-240-9.jpg",
}

export const authenticatedHeader = (args) => {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(userLoginSuccess(adaptResponseToUser(args.userResponse)))
    })

    return (<>
        <Header {...args} />
    </>
    )
}

authenticatedHeader.args = {
    userResponse: sampleUserResponse
}


export const authenticatedHeaderWithoutProfileImage = (args) => {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(userLoginSuccess(adaptResponseToUser(args.userResponse)))
    })

    return (<>
        <SideBar />
        <Header {...args} />
    </>
    )
}

authenticatedHeaderWithoutProfileImage.args = {
    userResponse: {
        ...sampleUserResponse,
        profile_thumbnail_url: null
    }
}

