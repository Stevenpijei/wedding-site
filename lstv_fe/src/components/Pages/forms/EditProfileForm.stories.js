import React from 'react';

import { PostGuestSignUpForm } from './PostGuestSignUpForm';

const Template = (args) => <PostGuestSignUpForm {...args} />;

export const editProfileForm = Template;

export default {
    title: "Forms/PostGuestSignUpForm",
    component: PostGuestSignUpForm,
    parameters: { actions: { argTypesRegex: '^on.*' } },
}

editProfileForm.args = {
    onSubmit:
        (something, ...other) => console.log('stuff', something, other)
};