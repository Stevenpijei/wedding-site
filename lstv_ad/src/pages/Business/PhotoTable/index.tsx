import React, { useContext } from 'react';
import { Box } from '@material-ui/core';
import { GridCellParams, GridColDef } from '@material-ui/x-grid';

import { useBusinessPhotos } from 'service/hooks/business';
import DataTable from 'components/DataTable';
import TitleCell from 'components/DataTable/TitleCell';
import PhotoTableMenu from './PhotoTableMenu';
import { IError } from 'interface';
import ErrorAlert from 'components/ErrorAlert';
import RegularButton from 'components/CustomBtns/Button';
import { ModalContext } from 'contexts/ModalContext';
import AddEditPhotoModal from './AddNewModal';
import LoadingIndicator from 'components/LoadingIndicator';

interface Props {
    slug: string;
    name: string;
}

const columns: GridColDef[] = [
    {
        field: 'title_thumbnail',
        headerName: 'Title',
        // eslint-disable-next-line react/display-name
        renderCell: (params: GridCellParams) => {
            const title = params.row.title as string;
            const url = params.row.url as string;
            const description = params.row.description as string;
            const handleEditClick = params.row.handleEditClick as (
                title: string,
                description: string,
                photoUrl: string,
                photoId: string
            ) => void;
            return (
                <TitleCell
                    thumbnailUrl={url}
                    title={title}
                    onClick={() => handleEditClick(title, description, url, params.row.id as string)}
                />
            );
        },
        width: 200,
    },
    {
        field: 'description',
        headerName: 'Description',
        flex: 1,
    },
    {
        field: '',
        headerName: '',
        // eslint-disable-next-line react/display-name
        renderCell: (params: GridCellParams) => (
            <PhotoTableMenu
                slug={params.row.slug}
                photoId={params.row.id as string}
                photoUrl={params.row.url as string}
                description={params.row.description as string}
                title={params.row.title as string}
            />
        ),
        width: 80,
    },
];

const PhotoTable: React.FC<Props> = ({ slug, name }: Props) => {
    const { showModal } = useContext(ModalContext);
    const { data, isFetching, isError, error } = useBusinessPhotos(slug);

    const handleAddNewClick = () => {
        showModal({
            header: `Add New Photo to ${name}`,
            content: <AddEditPhotoModal slug={slug} />,
        });
    };

    const handleEditClick = (title: string, description: string, photoUrl: string, photoId: string) => {
        showModal({
            header: `Update the photo`,
            content: (
                <AddEditPhotoModal
                    slug={slug}
                    defaultValues={{
                        title,
                        description,
                        photoUrl,
                        photoId,
                    }}
                />
            ),
        });
    };

    const rows =
        data?.result.map((photo) => ({
            ...photo,
            slug,
            handleEditClick,
        })) || [];

    return (
        <Box mt="50px">
            <Box textAlign="right">
                <RegularButton className="round_btn" onClick={handleAddNewClick}>
                    Add new
                </RegularButton>
            </Box>
            <ErrorAlert isError={isError} error={error as IError} />
            {isFetching && <LoadingIndicator />}
            {!isFetching && (
                <DataTable
                    rows={rows}
                    columns={columns}
                    loading={isFetching}
                    error={error}
                    isError={isError}
                    total={(data && data?.result.length) || 0}
                    hideSearch
                    hidePagination
                />
            )}
        </Box>
    );
};

export default PhotoTable;
