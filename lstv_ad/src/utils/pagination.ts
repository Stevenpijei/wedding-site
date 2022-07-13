import { useEffect, useState } from 'react';
import { GridSortItem } from '@material-ui/x-grid';

export const usePagination = (_size: number) => {
    const [offset, setOffset] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [sortItem, setSortItem] = useState<GridSortItem>();

    useEffect(() => {
        setOffset(_size * (page - 1));
    }, [page]);

    return {
        offset,
        page,
        search,
        sortItem,
        setPage,
        setSearch,
        setSortItem,
    };
};
