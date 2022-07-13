import React from 'react';
import { GridCellParams, GridColDef } from '@material-ui/x-grid';
import { format } from 'date-fns';

import DataTable from 'components/DataTable';
import { useBusinessReviews } from 'service/hooks/business';
import ReviewTableMenu from './ReviewTableMenu';
import { IBusinessReview } from 'interface';

interface Props {
    businessSlug: string;
}

const columns: GridColDef[] = [
    {
        field: 'created_at',
        headerName: 'Date',
        width: 200,
    },
    {
        field: 'author',
        headerName: 'Author',
        width: 200,
    },
    {
        field: 'title',
        headerName: 'Title',
        width: 200,
    },
    {
        field: 'rating',
        headerName: 'Rating',
        width: 200,
    },
    {
        field: 'content',
        headerName: 'Content',
        flex: 1,
    },
    {
        field: '',
        headerName: '',
        // eslint-disable-next-line react/display-name
        renderCell: (params: GridCellParams) => (
            <ReviewTableMenu businessSlug={params.row.businessSlug} data={(params.row as unknown) as IBusinessReview} />
        ),
        width: 80,
    },
];

const ReviewTable: React.FC<Props> = ({ businessSlug }: Props) => {
    const { data, isFetching, isError, error } = useBusinessReviews(businessSlug);

    const rows =
        (data &&
            data.result.reviews &&
            data.result.reviews.map((review) => ({
                ...review,
                businessSlug,
                id: review.review_id,
                created_at: format(new Date(review.created_at), 'MMM dd yyyy'),
            }))) ||
        [];

    return (
        <div>
            <DataTable
                rows={rows}
                columns={columns}
                loading={isFetching}
                error={error}
                isError={isError}
                total={(data && data.result.reviews && data.result.reviews.length) || 0}
                hideSearch
                hidePagination
            />
        </div>
    );
};

export default ReviewTable;
