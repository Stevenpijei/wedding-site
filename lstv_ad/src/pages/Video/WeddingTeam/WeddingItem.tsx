import React, { useEffect, useState } from 'react';
import { Box, Grid, IconButton } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { useDebouncedCallback } from 'use-debounce';

import { useAllBusinesses, useBusinessCapacityTypes, useRolesFromBusiness } from 'service/hooks/business';
import { IBusinessAdmin, ISlugWithName, IVideoWeddingTeam } from 'interface';
import SingleSelect from 'components/SingleSelect';

interface Props {
    data: IVideoWeddingTeam;
    idx: number;
    onRemove: (idx: number) => void;
    onUpdate: (
        idx: number,
        business: ISlugWithName | null,
        role: ISlugWithName | null,
        capacity: ISlugWithName | null
    ) => void;
}

const WeddingItem: React.FC<Props> = ({ data, idx, onRemove, onUpdate }: Props) => {
    const [search, setSearch] = useState<string>(data.name || '');
    const [role, setRole] = useState<ISlugWithName | null>(
        (data.role_slug && {
            name: data.role_name,
            slug: data.role_slug,
        }) ||
            null
    );
    const [business, setBusiness] = useState<ISlugWithName | null>(
        (data.slug && {
            name: data.name,
            slug: data.slug,
        }) ||
            null
    );
    const [capacity, setCapacity] = useState<ISlugWithName | null>(
        (data.business_capacity_type_slug &&
            data.business_capacity_type_name && {
                slug: data.business_capacity_type_slug,
                name: data.business_capacity_type_name,
            }) ||
            null
    );

    const { data: roleTypes, isLoading: roleTypesLoading, refetch: fetchRoles } = useRolesFromBusiness(
        business?.slug as string,
        {
            enabled: false,
        }
    );
    const { data: capacityTypes, isLoading: capacityTypesLoading } = useBusinessCapacityTypes();
    const { data: businesses, isLoading: businessesLoading, refetch: fetchBusinesses } = useAllBusinesses(
        {
            offset: 0,
            size: 25,
            verbosity: 'admin_list',
            search_term: search,
        },
        { enabled: false }
    );

    useEffect(() => {
        if (search) fetchBusinesses();
    }, [search]);

    useEffect(() => {
        if (business) fetchRoles();
    }, [business]);

    useEffect(() => {
        onUpdate(idx, business, role, capacity);
    }, [business, role, capacity]);

    const debounced = useDebouncedCallback((text: string) => {
        setSearch(text);
    }, 800);

    const handleBusinessSearchChange = (event: React.ChangeEvent<any>, value: string) => {
        debounced(value);
    };

    const handleRemoveClick = () => {
        onRemove(idx);
    };

    const BUSINESS_OPTION_LIST: ISlugWithName[] =
        (businesses &&
            (businesses.result as IBusinessAdmin[]).map((b: IBusinessAdmin) => ({
                name: b.name,
                slug: b.slug,
            }))) ||
        [];
    const ROLE_OPTION_LIST: ISlugWithName[] =
        (roleTypes &&
            roleTypes.result.map((r) => ({
                name: r.name,
                slug: r.slug,
            }))) ||
        [];
    const ROLE_SLUG_LIST = ROLE_OPTION_LIST.map((r) => r.slug);
    const CAPACITY_OPTION_LIST: ISlugWithName[] =
        (capacityTypes &&
            capacityTypes.result
                .filter((r) => ROLE_SLUG_LIST.includes(r.role_slug))
                .map((r) => ({
                    name: r.name,
                    slug: r.slug,
                }))) ||
        [];

    return (
        <Box display="flex" justifyContent="space-between" alignItems="flex-end">
            <Grid container spacing={3}>
                <Grid item xs={12} md={4} className="white_multi_select">
                    {idx === 0 && <label>Business</label>}
                    <SingleSelect<ISlugWithName>
                        loading={businessesLoading}
                        title=""
                        value={BUSINESS_OPTION_LIST.length === 0 ? null : business}
                        setValue={setBusiness}
                        list={BUSINESS_OPTION_LIST}
                        properties={{
                            name: 'name',
                            slug: 'slug',
                        }}
                        onChange={handleBusinessSearchChange}
                        style={{ width: '100%', minWidth: 'auto' }}
                        required
                    />
                </Grid>
                <Grid item xs={12} md={4} className="white_multi_select">
                    {idx === 0 && <label>Role</label>}
                    <SingleSelect<ISlugWithName>
                        loading={roleTypesLoading}
                        title=""
                        value={role}
                        setValue={setRole}
                        list={ROLE_OPTION_LIST}
                        properties={{
                            name: 'name',
                            slug: 'slug',
                        }}
                        style={{ width: '100%', minWidth: 'auto' }}
                        required
                    />
                </Grid>
                <Grid item xs={12} md={4} className="white_multi_select">
                    {idx === 0 && <label>Optional: Role Capacity</label>}
                    <SingleSelect<any>
                        loading={capacityTypesLoading}
                        title=""
                        value={capacity}
                        setValue={setCapacity}
                        list={CAPACITY_OPTION_LIST}
                        properties={{
                            name: 'name',
                            slug: 'slug',
                        }}
                        style={{ width: '100%', minWidth: 'auto' }}
                    />
                </Grid>
            </Grid>
            <IconButton aria-label="delete" onClick={handleRemoveClick}>
                <DeleteIcon />
            </IconButton>
        </Box>
    );
};

export default WeddingItem;
