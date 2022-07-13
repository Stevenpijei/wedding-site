import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import capitalize from '@material-ui/core/utils/capitalize';
import { GridCellParams, GridColumns, GridRowsProp } from '@material-ui/x-grid';
import StopIcon from '@material-ui/icons/Stop';
import { format } from 'date-fns';

import DataTable from 'components/DataTable';
import { usePagination } from 'utils/pagination';
import { useAllBusinesses, useBusinessRoleTypes } from 'service/hooks/business';
import { IBusinessAdmin, IBusinessRole, IBusinessVendor, IError, IBusinessScope } from 'interface';
import ErrorAlert from 'components/ErrorAlert';
import MultiSelect from 'components/MultiSelect';
import SubscriptionToggle from './SubscriptionToggle';
import TitleCell from 'components/DataTable/TitleCell';
import BusinessMenu from './BusinessMenu';
import { PrivateRoutes } from 'config/routes';
import { APP_URL } from 'config/env';

interface Props {
    scope?: IBusinessScope;
}

const BusinessTable: React.FC<Props> = ({ scope }: Props) => {
    const pageSize = 50;
    const [isPaid, setIsPaid] = useState<boolean>(false);
    const { offset, page, search, sortItem, setSortItem, setPage, setSearch } = usePagination(pageSize);
    const [roles, setRoles] = useState<IBusinessRole[]>([]);
    const { data, isLoading, isError, error, refetch } = useAllBusinesses({
        offset,
        size: pageSize,
        verbosity: 'admin_list',
        sort_field: sortItem?.field,
        sort_order: sortItem?.sort || undefined,
        search_term: search,
        scope,
        roles: roles.map((role) => role.slug).join(','),
        paid: isPaid,
    });
    const { data: roleTypes, isLoading: roleTypesLoading } = useBusinessRoleTypes();

    useEffect(() => {
        setPage(1);
    }, [roles, isPaid]);

    let columns: GridColumns = [];

    let rows: GridRowsProp = [];

    if (scope === 'suspended_dmz') {
        rows =
            (data &&
                (data?.result as IBusinessVendor[]).map(
                    ({
                        name,
                        created_at,
                        suggested_by,
                        in_video_title,
                        slug,
                        video_thumbnail,
                        in_video_slug,
                        account_claim_url,
                        account_claimed_at,
                        claim_status,
                    }) => ({
                        id: slug,
                        created_at: format(new Date(created_at), 'MMM dd yyyy'),
                        name,
                        suggested_by,
                        video_title: in_video_title,
                        video_thumbnail,
                        in_video_slug,
                        slug,
                        account_claim_url,
                        account_claimed_at,
                        claim_status,
                    })
                )) ||
            [];
        columns = [
            {
                field: 'name',
                headerName: 'Suggested Business',
                flex: 1,
                disableClickEventBubbling: true,
                // eslint-disable-next-line react/display-name
                renderCell: (params: GridCellParams) => {
                    const name = params.row.name;
                    return (
                        <Box display="flex" alignItems="center" justifyContent="flex-start" height="100%">
                            {name}
                        </Box>
                    );
                },
            },
            { field: 'created_at', headerName: 'Suggested On', flex: 1 },
            { field: 'suggested_by', headerName: 'Suggested By', flex: 1 },
            {
                field: 'video_title',
                headerName: 'Suggested For',
                flex: 1,
                // eslint-disable-next-line react/display-name
                renderCell: (params: GridCellParams) => {
                    const video_title = params.row.video_title;
                    const thumbnailUrl = params.row.video_thumbnail as string;
                    const in_video_slug = params.row.in_video_slug;

                    return (
                        <TitleCell
                            thumbnailUrl={thumbnailUrl}
                            title={video_title}
                            onClick={() => window.open(`${APP_URL}/${in_video_slug}`, '_blank')}
                        />
                    );
                },
            },
            {
                field: 'claim_status',
                headerName: 'Claim Status',
                sortable: false,
                width: 150,
            },
            {
                field: '',
                headerName: '',
                // eslint-disable-next-line react/display-name
                renderCell: (params: GridCellParams) => {
                    const accountClaimUrl = params.row.account_claim_url;
                    return (
                        <BusinessMenu
                            id={params.row.id as string}
                            isCreated={!!accountClaimUrl}
                            slug={params.row.slug}
                            link={accountClaimUrl}
                            refetchTable={refetch}
                        />
                    );
                },
                width: 80,
            },
        ];
    } else {
        columns = [
            {
                field: 'name',
                headerName: 'Name',
                flex: 1,
                // eslint-disable-next-line react/display-name
                renderCell: (params: GridCellParams) => {
                    const name = params.row.name;
                    const color = params.row.bg_color;
                    const id = params.row.id;
                    return (
                        <Box display="flex" alignItems="center" justifyContent="flex-start">
                            <StopIcon fontSize="small" style={{ color, marginRight: '5px' }} />
                            <Link to={`${PrivateRoutes.BUSINESSES}/${id}`}>{name}</Link>
                        </Box>
                    );
                },
            },
            { field: 'created_at', headerName: 'Join Date', flex: 1 },
            ...(scope === 'deleted' ? [{ field: 'deleted_at', headerName: 'Delete At', flex: 1 }] : []),
            { field: 'roles', headerName: 'Roles', flex: 1 },
            ...(['active_review', 'suspended_review', 'suspended'].includes(scope || '')
                ? [{ field: 'issue', headerName: 'Issue', flex: 1 }]
                : []),
            { field: 'subscription_level', headerName: 'Subscription Level', width: 150 },
            { field: 'location', headerName: 'Location', flex: 1 },
            { field: 'weight_videos', headerName: 'Total Videos', width: 120, type: 'number' },
            { field: 'weight_photos', headerName: 'Total Photos', width: 120, type: 'number' },
            {
                field: 'claim_status',
                headerName: 'Claim Status',
                sortable: false,
                width: 150,
            },
            {
                field: '',
                headerName: '',
                // eslint-disable-next-line react/display-name
                renderCell: (params: GridCellParams) => {
                    const accountClaimUrl = params.row.account_claim_url;
                    return (
                        <BusinessMenu
                            id={params.row.id as string}
                            isCreated={!!accountClaimUrl}
                            slug={params.row.slug}
                            link={accountClaimUrl}
                            refetchTable={refetch}
                        />
                    );
                },
                width: 80,
            },
        ];
        rows =
            (data &&
                (data?.result as IBusinessAdmin[]).map(
                    ({
                        id,
                        name,
                        weight_photos,
                        weight_videos,
                        roles,
                        display_location,
                        subscription_level,
                        created_at,
                        bg_color,
                        issue,
                        deleted_at,
                        slug,
                        account_claim_url,
                        account_claimed_at,
                        claim_status,
                    }) => ({
                        id,
                        created_at: format(new Date(created_at), 'MMM dd yyyy'),
                        name,
                        roles: roles.map((role) => role.name).join(', '),
                        subscription_level: capitalize(subscription_level),
                        weight_photos,
                        weight_videos,
                        location: display_location,
                        bg_color,
                        issue,
                        deleted_at: deleted_at && format(new Date(deleted_at), 'MMM dd yyyy'),
                        slug,
                        account_claim_url,
                        account_claimed_at,
                        claim_status,
                    })
                )) ||
            [];
    }

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
                total={(data && data?.scope.total) || 0}
                loading={isLoading}
                sortItem={sortItem}
                setSortItem={setSortItem}
                searchPlaceHolder="Business Name"
                actionBar={
                    scope !== 'suspended_dmz' && (
                        <>
                            <MultiSelect<IBusinessRole>
                                loading={roleTypesLoading}
                                title="Roles"
                                values={roles}
                                setValues={setRoles}
                                list={roleTypes?.result || []}
                                properties={{
                                    name: 'name',
                                    slug: 'slug',
                                }}
                            />
                            <SubscriptionToggle isPaid={isPaid} setIsPaid={setIsPaid} />
                        </>
                    )
                }
            />
        </Box>
    );
};

export default BusinessTable;
