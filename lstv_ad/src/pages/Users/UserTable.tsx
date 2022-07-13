import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import { GridCellParams, GridColumns, GridRowsProp } from '@material-ui/x-grid';

import DataTable from 'components/DataTable';
import { usePagination } from 'utils/pagination';
import MultiSelect from 'components/MultiSelect';
import UserMenu from './UserMenu';
import { IError, IUserScope, IUserType } from 'interface';
import { useListUsers } from 'service/hooks/user';
import { format } from 'date-fns';
import ErrorAlert from 'components/ErrorAlert';

interface Props {
    scope?: IUserScope;
}

interface IUserTypeSelect {
    value: IUserType;
    name: string;
}

const userTypeList: IUserTypeSelect[] = [
    {
        value: 'admin',
        name: 'Admin',
    },
    {
        value: 'business_team_member',
        name: 'Business Team Member',
    },
    {
        value: 'consumer',
        name: 'Consumer',
    },
];

const UserTable: React.FC<Props> = ({ scope }: Props) => {
    const pageSize = 50;
    const [userTypes, setUserTypes] = useState<IUserTypeSelect[]>([]);
    const { offset, page, search, sortItem, setSortItem, setPage, setSearch } = usePagination(pageSize);
    const { data, isLoading, error, isError } = useListUsers({
        offset,
        size: pageSize,
        search,
        scope,
        sort_field: sortItem?.field,
        sort_order: sortItem?.sort || undefined,
        user_type: userTypes.map((v) => v.value).join(','),
    });

    const columns: GridColumns = [
        { field: 'created_at', headerName: 'Joined On', flex: 1 },
        ...(scope === 'deleted' ? [{ field: 'deleted_at', headerName: 'Delete At', flex: 1 }] : []),
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'full_name', headerName: 'Name', flex: 1 },
        ...(['active_review', 'suspended_review', 'suspended'].includes(scope || '')
            ? [{ field: 'issue', headerName: 'Issue', flex: 1 }]
            : []),
        { field: 'user_type', headerName: 'User Type', flex: 1 },
        { field: 'user_business_name', headerName: 'Business Name', flex: 1 },
        { field: 'user_location', headerName: 'Location', flex: 1 },
        { field: 'user_phone', headerName: 'Phone', flex: 1 },
        {
            field: '',
            headerName: '',
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => <UserMenu userId={params.row.id as string} />,
            width: 80,
        },
    ];

    const rows: GridRowsProp =
        data?.result.map(({ id, name, joined, location, deleted_at, business_name, phone, ...rest }) => ({
            id,
            created_at: format(new Date(joined), 'MMM dd yyyy'),
            deleted: deleted_at && format(new Date(deleted_at), 'MMM dd yyyy'),
            user_location: location,
            user_business_name: business_name,
            user_phone: phone,
            full_name: name,
            ...rest,
        })) || [];

    return (
        <Box mt="50px">
            <ErrorAlert isError={isError} error={error as IError} />

            <DataTable
                columns={columns}
                pageSize={pageSize}
                isError={isError}
                rows={rows}
                page={page}
                search={search}
                setPage={setPage}
                setSearch={setSearch}
                loading={isLoading}
                total={(data && data?.scope.total) || 0}
                sortItem={sortItem}
                setSortItem={setSortItem}
                searchPlaceHolder="Name/Email"
                actionBar={
                    <MultiSelect<IUserTypeSelect>
                        loading={false}
                        title="User Type"
                        values={userTypes}
                        setValues={setUserTypes}
                        list={userTypeList}
                        properties={{ name: 'name', slug: 'value' }}
                    />
                }
            />
        </Box>
    );
};

export default UserTable;
