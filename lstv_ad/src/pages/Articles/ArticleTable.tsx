import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { GridCellParams, GridColumns, GridRowsProp } from '@material-ui/x-grid';
import { format } from 'date-fns';

import { IArticleScope, IError } from 'interface';

import ErrorAlert from 'components/ErrorAlert';
import DataTable from 'components/DataTable';
import TitleCell from 'components/DataTable/TitleCell';
import ArticleMenu from './ArticleMenu';

import { usePagination } from 'utils/pagination';

import { useArticles } from 'service/hooks/article';
import { PrivateRoutes } from 'config/routes';

interface Props {
    scope?: IArticleScope;
}

const ArticleTable: React.FC<Props> = ({ scope }: Props) => {
    const pageSize = 50;
    const { offset, page, search, sortItem, setSortItem, setSearch, setPage } = usePagination(pageSize);
    const { data, isLoading, error, isError } = useArticles({
        verbosity: 'admin_full',
        offset,
        size: pageSize,
        scope,
    });

    const columns: GridColumns = [
        { field: 'created_at', headerName: 'Post Date', flex: 1 },
        { field: 'updated_at', headerName: 'Update Date', flex: 1 },
        ...(scope === 'deleted' ? [{ field: 'deleted_at', headerName: 'Delete Date', flex: 1 }] : []),
        { field: 'author_info', headerName: 'Author', flex: 1 },
        {
            field: 'title',
            headerName: 'Title',
            width: 300,
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => {
                const articleTitle = params.row.title;
                const thumbnailUrl = params.row.thumbnail_url;
                const articleId = params.row.id;
                return (
                    <TitleCell
                        thumbnailUrl={thumbnailUrl}
                        title={<Link to={`${PrivateRoutes.ARTICLES}/${articleId}`}>{articleTitle}</Link>}
                    />
                );
            },
        },
        ...(['active_review', 'suspended_review', 'suspended'].includes(scope || '')
            ? [{ field: 'issue', headerName: 'Issue', flex: 1 }]
            : []),
        { field: 'views', headerName: 'Views', width: 80 },
        { field: 'likes', headerName: 'Likes', width: 80 },
        { field: 'tag_list_string', headerName: 'Tags', flex: 1 },
        { field: 'tag_business_string', headerName: 'Tagged Businesses', flex: 1 },
        { field: 'tag_location_string', headerName: 'Tagged Locations', flex: 1 },
        {
            field: '',
            headerName: '',
            // eslint-disable-next-line react/display-name
            renderCell: (params: GridCellParams) => (
                <ArticleMenu id={params.row.id as string} hideDeleteItem={scope === 'deleted'} />
            ),
            width: 80,
        },
    ];

    const rows: GridRowsProp =
        (data &&
            data?.result.map(({ id, created_at, updated_at, deleted_at, ...rest }) => ({
                id,
                created_at: format(new Date(created_at), 'MMM dd yyyy'),
                updated_at: format(new Date(updated_at), 'MMM dd yyyy'),
                deleted_at: deleted_at ? format(new Date(deleted_at), 'MMM dd yyyy') : '',
                author_info: rest.author_name || rest.author_email,
                tag_list_string: rest.tags.map((t) => t.name).join(', '),
                tag_business_string: rest.businesses.map((b) => b.slug).join(', '),
                tag_location_string: rest.location.map((l) => l.state_province).join(', '),
                ...rest,
            }))) ||
        [];

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
                searchPlaceHolder="Article Title"
            />
        </Box>
    );
};

export default ArticleTable;
