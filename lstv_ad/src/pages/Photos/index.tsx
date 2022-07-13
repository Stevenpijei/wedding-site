import React, { useContext } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { ModalContext } from 'contexts/ModalContext';

import RegularButton from 'components/CustomBtns/Button';
import TabBadgeCount from 'components/TabBadgeCount';
import TabPanel from 'components/TabPanel';

import { usePhotoCount } from 'service/hooks/photo';

import PhotoTable from './PhotoTable';
import UploadPhotos from './UploadPhotos';

const Photos: React.FC = () => {
    const { showModal, closeModal } = useContext(ModalContext);
    const { data: photoCounts } = usePhotoCount();

    const [value, setValue] = React.useState<number>(0);

    const { active_count } = photoCounts?.result || {};

    const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
        setValue(newValue);
    };

    const handleClick = () => {
        showModal({
            header: 'Upload photos',
            content: <UploadPhotos onClose={closeModal} />,
        });
    };

    return (
        <div className="table-page">
            <Box display="flex" justifyContent="flex-end">
                <RegularButton variant="contained" className="round_btn" onClick={handleClick}>
                    Upload
                </RegularButton>
            </Box>
            <Paper style={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                <Tabs value={value} onChange={handleTabChange} indicatorColor="primary">
                    <Tab label={<TabBadgeCount label="Active" count={active_count} className="badge-active" />} />
                    {/* <Tab
                        label={
                            <TabBadgeCount
                                label="Active/Review"
                                count={active_review_count}
                                className="badge-active-review"
                            />
                        }
                    />
                    <Tab
                        label={
                            <TabBadgeCount
                                label="Suspended/Review"
                                count={suspended_review_count}
                                className="badge-suspended-review"
                            />
                        }
                    />
                    <Tab
                        label={<TabBadgeCount label="Suspended" count={suspended_count} className="badge-suspended" />}
                    />
                    <Tab label={<TabBadgeCount label="Deleted" count={deleted_count} className="badge-deleted" />} /> */}
                </Tabs>
            </Paper>
            <TabPanel value={value} index={0}>
                <PhotoTable />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <PhotoTable scope="active_review" />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <PhotoTable scope="suspended_review" />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <PhotoTable scope="suspended" />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <PhotoTable scope="deleted" />
            </TabPanel>
        </div>
    );
};

export default Photos;
