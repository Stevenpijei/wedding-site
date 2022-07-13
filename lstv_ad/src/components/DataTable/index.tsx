import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, createStyles, LinearProgress, makeStyles } from '@material-ui/core';
import { XGrid, XGridProps, GridOverlay, GridSortItem, GridRowsProp, GridColParams } from '@material-ui/x-grid';
import { Pagination } from '@material-ui/lab';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';

import './styles.scss';
import SearchInput from 'components/SearchInput';
interface Props extends XGridProps {
    total?: number;
    hideSearch?: boolean;
    clickable?: boolean;
    pageSize?: number;
    isError?: boolean;
    page?: number;
    sortItem?: GridSortItem | undefined;
    searchPlaceHolder?: string;
    search?: string;
    actionBar?: React.ReactNode | React.ReactNode[];
    hidePagination?: boolean;
    setSortItem?: React.Dispatch<React.SetStateAction<GridSortItem | undefined>>;
    setPage?: React.Dispatch<React.SetStateAction<number>>;
    setSearch?: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '100%',
        },
        pagination: {
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        searchBar: {
            minWidth: '300px',
            marginRight: '25px',
            marginLeft: '5px',
        },
    })
);

function CustomLoadingOverlay() {
    return (
        <GridOverlay>
            <div style={{ position: 'absolute', top: 0, width: '100%' }}>
                <LinearProgress />
            </div>
        </GridOverlay>
    );
}

const TABLE_HEADER_FOOTER_HEIGHT = 110; // px
const TABLE_ROW_HEIGHT = 52; // px

const DataTable: React.FC<Props> = ({
    rows,
    columns,
    total = 0,
    clickable = false,
    hideSearch = false,
    pageSize = 10,
    loading,
    isError,
    page,
    sortItem,
    search,
    actionBar = '',
    searchPlaceHolder = 'Search',
    hidePagination,
    setSortItem,
    setPage,
    setSearch,
    ...restProps
}: Props) => {
    const classes = useStyles();
    const [totalPages, setTotalPages] = useState<number>(0);
    const [tableRows, setTableRows] = useState<GridRowsProp>([]);

    useEffect(() => {
        if (!loading) {
            if (!isError) {
                setTableRows(rows);
            } else {
                setTableRows([]);
            }
        }
    }, [rows, isError, loading]);

    useEffect(() => {
        if (!loading) {
            setTotalPages(Math.ceil(total / pageSize));
        } else if (isError) {
            setTotalPages(1);
        }
    }, [total, isError]);

    const handlePageChange = (event: React.ChangeEvent<any>, page: number) => {
        if (setPage) setPage(page);
    };

    const handleColumnHeaderClick = (params: GridColParams) => {
        if (setSortItem)
            setSortItem((prev) => {
                if (prev?.field === params.field) {
                    return {
                        field: params.field,
                        sort: prev.sort === 'asc' ? 'desc' : 'asc',
                    };
                } else {
                    return {
                        field: params.field,
                        sort: 'asc',
                    };
                }
            });
    };

    const debounced = useDebouncedCallback((text: string) => {
        if (setPage && setSearch) {
            setPage(1);
            setSearch(text);
        }
    }, 800);

    const _columns = columns.map((c) => ({
        ...c,
        sortComparator: () => 0,
    }));

    return (
        <div className={clsx(classes.root, 'data-table')}>
            <Box my="20px" display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" flexWrap="wrap" alignItems="flex-end" justifyContent="flex-start">
                    {!hideSearch && (
                        <SearchInput
                            label={searchPlaceHolder}
                            className={classes.searchBar}
                            defaultValue={search}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => debounced(event.target.value)}
                        />
                    )}
                    {actionBar}
                </Box>
                <div className={classes.pagination} style={{ display: hidePagination ? 'none' : 'flex' }}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                    {loading && <CircularProgress color="primary" size={20} style={{ marginRight: '15px' }} />}
                </div>
            </Box>
            <div style={{ height: `${TABLE_HEADER_FOOTER_HEIGHT + TABLE_ROW_HEIGHT * tableRows.length}px` }}>
                <XGrid
                    rows={tableRows}
                    columns={_columns}
                    pageSize={pageSize}
                    checkboxSelection={false}
                    disableExtendRowFullWidth={false}
                    hideFooter
                    hideFooterPagination
                    disableColumnMenu
                    className={clsx({ clickable })}
                    onColumnHeaderClick={handleColumnHeaderClick}
                    sortModel={sortItem ? [sortItem] : []}
                    components={{
                        LoadingOverlay: CustomLoadingOverlay,
                    }}
                    loading={loading}
                    {...restProps}
                />
            </div>
            {!hidePagination && (
                <div className={classes.pagination}>
                    {loading && <CircularProgress color="primary" size={20} style={{ marginRight: '15px' }} />}
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                </div>
            )}
        </div>
    );
};

export default DataTable;
