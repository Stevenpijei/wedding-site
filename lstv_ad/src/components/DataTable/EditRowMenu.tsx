import React from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { Menu, MenuItem, IconButton } from '@material-ui/core';

interface Props {
    items: {
        title: string;
        action: () => void;
    }[];
}

const KebabMenu: React.FC<Props> = ({ items }: Props) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                <MoreVertIcon />
            </IconButton>
            {!!items.length && (
                <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                    {items.map((item, idx) => (
                        <MenuItem
                            key={idx}
                            onClick={() => {
                                item.action();
                                handleClose();
                            }}
                        >
                            {item.title}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </div>
    );
};

export default KebabMenu;
