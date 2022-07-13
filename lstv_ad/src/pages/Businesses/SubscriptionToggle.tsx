import React from 'react';
import Switch from '@material-ui/core/Switch/Switch';
import Grid from '@material-ui/core/Grid';

interface Props {
    isPaid: boolean;
    setIsPaid: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubscriptionToggle = ({ isPaid, setIsPaid }: Props) => {
    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsPaid(event.target.checked);
    };

    return (
        <Grid
            component="label"
            alignItems="center"
            container
            style={{ color: 'black', width: 'auto', marginLeft: '20px' }}
        >
            <Grid item>All</Grid>
            <Grid item>
                <Switch checked={isPaid} onChange={handleToggle} color="primary" />
            </Grid>
            <Grid item>Paid</Grid>
        </Grid>
    );
};

export default SubscriptionToggle;
