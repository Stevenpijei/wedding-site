import React from 'react';
import Badge from '@material-ui/core/Badge';

interface Props {
    className: string;
    count: number | undefined;
    label: string;
}

const TabBadgeCount: React.FC<Props> = ({ className, count, label }: Props) => {
    return (
        <Badge badgeContent={count?.toLocaleString()} className={className} showZero max={9999999}>
            {label}
        </Badge>
    );
};

export default TabBadgeCount;
