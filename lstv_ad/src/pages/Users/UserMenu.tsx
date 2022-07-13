import React from 'react';

import KebabMenu from 'components/DataTable/EditRowMenu';

interface Props {
    userId: string;
}

const UserMenu: React.FC<Props> = ({ userId }: Props) => {
    const handleGeneratePassword = async () => {
        // TODO: handle generate password action
        console.log('Generate clicked ', userId);
    };

    return (
        <KebabMenu
            items={[
                {
                    title: 'Generate Password',
                    action: handleGeneratePassword,
                },
            ]}
        />
    );
};

export default UserMenu;
