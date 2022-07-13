import React, { useState, useMemo, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import { GridCellParams, GridColumns, GridRowsProp, GridSortItem } from '@material-ui/x-grid';
import { useDebouncedCallback } from 'use-debounce/lib';
import format from 'date-fns/format';

import { ModalContext } from 'contexts/ModalContext';
import { ToastContext } from 'contexts/ToastContext';

import DataTable from 'components/DataTable';
import KebabMenu from 'components/DataTable/EditRowMenu';
import TitleCell from 'components/DataTable/TitleCell';
import ErrorAlert from 'components/ErrorAlert';
import SearchInput from 'components/SearchInput';

import { PrivateRoutes } from 'config/routes';
import { IError, ITagScope } from 'interface';
import { useDeleteTag, useListTags } from 'service/hooks/tag';
import { usePagination } from 'utils/pagination';

interface Props {
    scope?: ITagScope;
}

const pageSize = 20;

const getSortField = (sortItem?: GridSortItem) => {
    if (!sortItem?.field) return undefined;
    const fields = ['created_at', 'deleted_at', 'name', 'type', 'subscribers'];
    if (fields.includes(sortItem.field)) return sortItem.field === 'type' ? 'tag_type' : sortItem.field;
    return undefined;
};

const TagTable: React.FC<Props> = ({ scope }: Props) => {
    const { offset, page, search, sortItem, setSortItem, setSearch, setPage } = usePagination(pageSize);
    const [typeSearch, setTypeSearch] = useState<string>();
    const history = useHistory();

    const { data, isLoading, isError, error, refetch: refetchTags } = useListTags({
        offset,
        scope,
        size: pageSize,
        sort_field: getSortField(sortItem),
        sort_order: sortItem?.sort || undefined,
        tag: search,
        type: typeSearch,
        verbosity: 'admin_list',
    });
    const { mutateAsync: requestDeleteTag } = useDeleteTag();
    const { showConfirmModal } = useContext(ModalContext);
    const { showToast } = useContext(ToastContext);

    console.log('data', data);

    const rows: GridRowsProp = useMemo(() => {
        return (
            data?.result.map((item, index) => ({
                ...item,
                id: index,
                created_at: format(new Date(item.created_at), 'MMM dd yyyy'),
                deleted_at: item.deleted_at ? format(new Date(item.deleted_at), 'MMM dd yyyy') : '',
            })) || []
        );
    }, [data]);

    const getMenuItems = (params: GridCellParams) => {
        if (scope === 'deleted') return [];
        return [
            {
                title: 'Edit',
                action: () => history.push(`${PrivateRoutes.TAGS}/${params.row.slug}`),
            },
            {
                title: 'Delete',
                action: () => handleDeleteClick(params.row.slug),
            },
        ];
    };

    const columns: GridColumns = [
        { field: 'created_at', headerName: 'Created', flex: 1 },
        ...(scope === 'deleted' ? [{ field: 'deleted_at', headerName: 'Delete At', flex: 1 }] : []),
        {
            field: 'name',
            headerName: 'Name',
            width: 300,
        },
        { field: 'type', headerName: 'Type', flex: 1 },
        { field: 'weight_videos', headerName: 'Videos', flex: 0.75, sortable: false },
        { field: 'subscribers', headerName: 'Subscribers', flex: 0.75 },
        {
            field: 'thumbnail_url',
            headerName: 'Thumbnail',
            width: 100,
            sortable: false,
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => {
                return <TitleCell thumbnailUrl={params.row.thumbnail_url || ''} title="" />;
            },
        },
        {
            field: '',
            headerName: '',
            sortable: false,
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => <KebabMenu items={getMenuItems(params)} />,
            width: 70,
        },
    ];

    const debounced = useDebouncedCallback((text: string) => {
        setPage(1);
        setTypeSearch(text);
    }, 800);

    const handleDeleteClick = (slug: string) => {
        showConfirmModal({
            content: null,
            header: `Are you sure to delete this tag?`,
            confirmButton: { name: 'Delete', action: () => handleDelete(slug) },
        });
    };

    const handleDelete = async (slug: string) => {
        try {
            await requestDeleteTag(slug);
            showToast({
                type: 'success',
                message: 'Successfully deleted a tag',
            });
            refetchTags();
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
                pageSize={pageSize}
                rows={rows}
                page={page}
                search={search}
                setPage={setPage}
                setSearch={setSearch}
                total={data?.scope.total || 0}
                loading={isLoading}
                sortItem={sortItem}
                setSortItem={setSortItem}
                searchPlaceHolder="Name"
                actionBar={
                    <SearchInput
                        label="Type"
                        style={{ width: '250px' }}
                        defaultValue={typeSearch}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => debounced(event.target.value)}
                    />
                }
            />
        </Box>
    );
};

export default TagTable;
