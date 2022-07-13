import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import { GridCellParams, GridColumns, GridRowsProp } from '@material-ui/x-grid';
import { useDebouncedCallback } from 'use-debounce/lib';
import format from 'date-fns/format';

import DataTable from 'components/DataTable';
import { usePagination } from 'utils/pagination';
import { useListVideos } from 'service/hooks/video';
import { IError, IVideoScope } from 'interface';
import TitleCell from 'components/DataTable/TitleCell';
import SearchInput from 'components/SearchInput';
import ErrorAlert from 'components/ErrorAlert';
import VideoMenu from './VideoMenu';
import { PrivateRoutes } from 'config/routes';

interface Props {
    scope?: IVideoScope;
}

const VideoTable: React.FC<Props> = ({ scope }: Props) => {
    const pageSize = 50;
    const { offset, page, search, sortItem, setSortItem, setSearch, setPage } = usePagination(pageSize);
    const [locationSearch, setLocationSearch] = useState<string>();
    const { data, isLoading, isError, error } = useListVideos({
        offset,
        size: pageSize,
        content_sort_method: 'most_recent',
        verbosity: 'admin_list',
        sort_field: sortItem?.field,
        sort_order: sortItem?.sort || undefined,
        title: search,
        location: locationSearch,
        scope,
    });

    const debounced = useDebouncedCallback((text: string) => {
        setPage(1);
        setLocationSearch(text);
    }, 800);

    const columns: GridColumns = [
        { field: 'created_at', headerName: 'Published', flex: 1 },
        ...(scope === 'deleted' ? [{ field: 'deleted_at', headerName: 'Delete At', flex: 1 }] : []),
        {
            field: 'title',
            headerName: 'Title',
            width: 300,
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => {
                const video_title = params.row.title;
                const thumbnailUrl = params.row.thumbnail_url;
                const in_video_id = params.row.id;
                return (
                    <TitleCell
                        thumbnailUrl={thumbnailUrl}
                        title={<Link to={`${PrivateRoutes.VIDEOS}/${in_video_id}`}>{video_title}</Link>}
                    />
                );
            },
        },
        ...(['active_review', 'suspended_review', 'suspended'].includes(scope || '')
            ? [{ field: 'video_issue', headerName: 'Issue', flex: 1 }]
            : []),
        { field: 'event_date', headerName: 'Event Date', flex: 1 },
        { field: 'video_location', headerName: 'Location', flex: 1 },
        { field: 'video_owner', headerName: 'Owner', flex: 1 },
        { field: 'views', headerName: 'Views', width: 80 },
        { field: 'likes', headerName: 'Likes', width: 80 },
        { field: 'photos', headerName: 'Photos', width: 80 },
        { field: 'q_and_a', headerName: 'Q&A', width: 80 },
        { field: 'tags', headerName: 'Tags', flex: 1 },
        {
            field: '',
            headerName: '',
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => (
                <VideoMenu videoId={params.row.id as string} slug={params.row.slug as string} />
            ),
            width: 80,
        },
    ];

    const rows: GridRowsProp =
        data?.result.map(
            ({
                id,
                created_at,
                location,
                event_date,
                owner,
                views,
                likes,
                num_photos,
                num_q_and_a,
                issue,
                ...rest
            }) => ({
                id,
                created_at: format(new Date(created_at), 'MMM dd yyyy'),
                event_date: format(new Date(event_date), 'MMM dd yyyy'),
                video_location: location,
                video_owner: owner,
                views,
                likes,
                photos: num_photos,
                q_and_a: num_q_and_a,
                video_issue: issue,
                ...rest,
            })
        ) || [];

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
                searchPlaceHolder="Video Title"
                actionBar={
                    <SearchInput
                        label="Video location"
                        style={{ width: '300px' }}
                        defaultValue={locationSearch}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => debounced(event.target.value)}
                    />
                }
            />
        </Box>
    );
};

export default VideoTable;
