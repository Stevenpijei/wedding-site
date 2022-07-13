import React, { useState, useContext } from 'react';
import Box from '@material-ui/core/Box';
import { GridCellParams, GridColumns, GridRowsProp } from '@material-ui/x-grid';
import { useDebouncedCallback } from 'use-debounce/lib';

import { ModalContext } from 'contexts/ModalContext';
import { ToastContext } from 'contexts/ToastContext';

import DataTable from 'components/DataTable';
import KebabMenu from 'components/DataTable/EditRowMenu';
import ErrorAlert from 'components/ErrorAlert';
import SearchInput from 'components/SearchInput';
import TitleCell from 'components/DataTable/TitleCell';

import { PrivateRoutes } from 'config/routes';
import { IError, IPhotoScope } from 'interface';
import { useDeletePhoto, useListPhotos } from 'service/hooks/photo';
import { usePagination } from 'utils/pagination';

interface Props {
    scope?: IPhotoScope;
}

const PhotoTable: React.FC<Props> = ({ scope }: Props) => {
    const pageSize = 20;
    const { offset, page, search, sortItem, setSortItem, setSearch, setPage } = usePagination(pageSize);
    const [photographerSearch, setPhotographerSearch] = useState<string>('');
    const { data, isLoading, isError, error, refetch: refetchPhotos } = useListPhotos({
        offset,
        sort_field: sortItem?.field,
        sort_order: sortItem?.sort || undefined,
        scope,
        size: pageSize,
        title: search,
        business: photographerSearch,
        verbosity: 'admin_full',
    });
    const { mutateAsync: requestDeletePhoto } = useDeletePhoto();
    const { showConfirmModal } = useContext(ModalContext);
    const { showToast } = useContext(ToastContext);

    const columns: GridColumns = [
        {
            field: 'title',
            headerName: 'Video',
            width: 450,
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => {
                const video_title = params.row.video_title;
                const thumbnailUrl = params.row.video_thumbnail;
                const videoId = params.row.video_id;
                return (
                    <TitleCell
                        thumbnailUrl={thumbnailUrl}
                        title={
                            <a rel="noreferrer" target="_blank" href={`${PrivateRoutes.VIDEOS}/${videoId}`}>
                                {video_title}
                            </a>
                        }
                    />
                );
            },
        },
        { field: 'owner_business', headerName: 'Photographer', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        { field: 'credit', headerName: 'Credit', flex: 1 },
        {
            field: 'preview',
            headerName: 'Preview',
            width: 100,
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => {
                const previewUrl = params.row.url;
                return <TitleCell thumbnailUrl={previewUrl} title="" />;
            },
        },
        {
            field: '',
            headerName: '',
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => (
                <KebabMenu
                    items={[
                        {
                            title: 'Delete',
                            action: () => handleDeleteClick(params.row.id as string),
                        },
                    ]}
                />
            ),
            width: 80,
        },
    ];

    const rows: GridRowsProp = data?.result || [];

    const debounced = useDebouncedCallback((text: string) => {
        setPage(1);
        setPhotographerSearch(text);
    }, 800);

    const handleDeleteClick = (photoId: string) => {
        showConfirmModal({
            content: null,
            header: `Are you sure to delete this photo?`,
            confirmButton: { name: 'Delete', action: () => handleDelete(photoId) },
        });
    };

    const handleDelete = async (photoId: string) => {
        try {
            await requestDeletePhoto(photoId);
            showToast({
                type: 'success',
                message: 'Successfully deleted a photo',
            });
            refetchPhotos();
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
    };

    return (
        <Box mt="50px">
            <ErrorAlert isError={isError} error={error as IError} />
            <DataTable
                columns={columns}
                isError={isError}
                loading={isLoading}
                pageSize={pageSize}
                page={page}
                rows={rows}
                search={search}
                searchPlaceHolder="Video Title"
                setPage={setPage}
                setSearch={setSearch}
                setSortItem={setSortItem}
                sortItem={sortItem}
                total={(data && data?.scope.total) || 0}
                actionBar={
                    <SearchInput
                        label="Photographer"
                        style={{ width: '300px' }}
                        defaultValue={photographerSearch}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => debounced(event.target.value)}
                    />
                }
            />
        </Box>
    );
};

export default PhotoTable;
