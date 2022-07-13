import { useMutation, useQuery, UseQueryOptions } from 'react-query';

import {
    IUpdateBusinessPhotoRequest,
    IBusinessAccountClaimResponse,
    IBusinessAdminListResponse,
    IBusinessCountResponse,
    IBusinessGeneralInfoRequest,
    IBusinessPhoneCreateRequest,
    IBusinessPhoneUpdateRequest,
    IBusinessPhotoResponse,
    IBusinessResponse,
    IBusinessRoleResponse,
    IBusinessRoleUpdateRequest,
    IBusinessSlugSocialLinkId,
    IBusinessSocialLinkUpdateRequest,
    IDeleteBusinessPhotoRequest,
    IError,
    IGetAllBusinessRequest,
    IAddBusinessPhotoRequest,
    ICapacityResponse,
    IBusinessReviewResponse,
    IDeleteBusinessReviewRequest,
    IPatchBusinessReviewRequest,
    IAddBusinessReviewRequest,
} from 'interface';

import {
    getAllBusinesses,
    getFilteredBusinesses,
    getBusinessCounts,
    getAllBusinessRoleTypes,
    businessAccountClaim,
    getBusiness,
    updateBusinessGeneralInfo,
    updateBusinessRoles,
    updateBusinessPhone,
    postBusinessPhone,
    deleteSocialLink,
    patchSocialLink,
    postSocialLink,
    getBusinessPhotos,
    deleteBusinessPhoto,
    addNewBusinessPhoto,
    patchBusinessPhoto,
    getBusinessCapacityTypes,
    getRolesFromBusiness,
    getBusinessReviews,
    deleteBusinessReview,
    patchBusinessReview,
    addBusinessReview,
} from 'service/api/business';

export const BusinessQueryKeys = {
    GET_ALL_BUSINESSES: 'GET_ALL_BUSINESSES',
    GET_FILTERED_BUSINESSES: 'GET_FILTERED_BUSINESSES',
    GET_BUSINESS_COUNTS: 'GET_BUSINESS_COUNTS',
    GET_BUSINESS_ROLE_TYPES: 'GET_BUSINESS_ROLE_TYPES',
    GET_BUSINESS_CAPACITY_TYPES: 'GET_BUSINESS_CAPACITY_TYPES',
    GET_BUSINESS: 'GET_BUSINESS',
    GET_BUSINESS_PHOTO: 'GET_BUSINESS_PHOTO',
    GET_BUSINESS_ROLES: 'GET_BUSINESS_ROLES',
    GET_BUSINESS_REVIEWS: 'GET_BUSINESS_REVIEWS',
};

export const useAllBusinesses = (
    payload: IGetAllBusinessRequest,
    config?: UseQueryOptions<IBusinessAdminListResponse, IError>
) =>
    useQuery<IBusinessAdminListResponse, IError>(
        [BusinessQueryKeys.GET_ALL_BUSINESSES, payload],
        () => getAllBusinesses(payload),
        config
    );

export const useFilteredBusinesses = (term: string, type: string, config?: UseQueryOptions) =>
    useQuery(
        [BusinessQueryKeys.GET_FILTERED_BUSINESSES, { term, type }],
        () => getFilteredBusinesses(term, type),
        config
    );

export const useBusinessCount = (config?: UseQueryOptions<IBusinessCountResponse, IError>) =>
    useQuery<IBusinessCountResponse, IError>(
        [BusinessQueryKeys.GET_BUSINESS_COUNTS],
        () => getBusinessCounts(),
        config
    );

export const useBusinessRoleTypes = (config?: UseQueryOptions<IBusinessRoleResponse, IError>) =>
    useQuery<IBusinessRoleResponse, IError>(
        [BusinessQueryKeys.GET_BUSINESS_ROLE_TYPES],
        () => getAllBusinessRoleTypes(),
        config
    );

export const useBusinessAccountClaim = () =>
    useMutation<IBusinessAccountClaimResponse, IError, { slug: string }>(businessAccountClaim);

export const useBusiness = (id: string) =>
    useQuery<IBusinessResponse, IError>([BusinessQueryKeys.GET_BUSINESS, id], () => getBusiness(id));

export const useUpdateBusinessGeneralInfo = () =>
    useMutation<undefined, IError, IBusinessGeneralInfoRequest>(updateBusinessGeneralInfo);

export const useUpdateBusinessRoles = () =>
    useMutation<undefined, IError, IBusinessRoleUpdateRequest>(updateBusinessRoles);

export const useUpdateBusinessPhone = () =>
    useMutation<undefined, IError, IBusinessPhoneUpdateRequest>(updateBusinessPhone);

export const useCreateBusinessPhone = () =>
    useMutation<undefined, IError, IBusinessPhoneCreateRequest>(postBusinessPhone);

export const useRemoveSocialLink = () => useMutation<undefined, IError, IBusinessSlugSocialLinkId>(deleteSocialLink);

export const useUpdateSocialLink = () =>
    useMutation<undefined, IError, IBusinessSocialLinkUpdateRequest>(patchSocialLink);

export const useCreateSocialLink = () =>
    useMutation<undefined, IError, IBusinessSocialLinkUpdateRequest>(postSocialLink);

export const useBusinessPhotos = (businessSlug: string) =>
    useQuery<IBusinessPhotoResponse, IError>([BusinessQueryKeys.GET_BUSINESS_PHOTO, businessSlug], () =>
        getBusinessPhotos(businessSlug)
    );

export const useDeleteBusinessPhoto = () =>
    useMutation<undefined, IError, IDeleteBusinessPhotoRequest>(deleteBusinessPhoto);

export const useAddBusinessPhoto = () => useMutation<undefined, IError, IAddBusinessPhotoRequest>(addNewBusinessPhoto);

export const usePatchBusinessPhoto = () =>
    useMutation<undefined, IError, IUpdateBusinessPhotoRequest>(patchBusinessPhoto);

export const useBusinessCapacityTypes = (config?: UseQueryOptions<ICapacityResponse, IError>) =>
    useQuery<ICapacityResponse, IError>(
        [BusinessQueryKeys.GET_BUSINESS_CAPACITY_TYPES],
        () => getBusinessCapacityTypes(),
        config
    );

export const useRolesFromBusiness = (businessSlug: string, config?: UseQueryOptions<IBusinessRoleResponse, IError>) =>
    useQuery<IBusinessRoleResponse, IError>(
        [BusinessQueryKeys.GET_BUSINESS_ROLE_TYPES, { businessSlug }],
        () => getRolesFromBusiness(businessSlug),
        config
    );

export const useBusinessReviews = (slug: string, config?: UseQueryOptions<IBusinessReviewResponse, IError>) =>
    useQuery<IBusinessReviewResponse, IError>(
        [BusinessQueryKeys.GET_BUSINESS_REVIEWS, { slug }],
        () => getBusinessReviews(slug),
        config
    );

export const useDeleteBusinessReview = () =>
    useMutation<undefined, IError, IDeleteBusinessReviewRequest>(deleteBusinessReview);

export const usePatchBusinessReview = () =>
    useMutation<
        undefined,
        IError,
        {
            request: IPatchBusinessReviewRequest;
            businessSlug: string;
            reviewId: string;
        }
    >(patchBusinessReview);

export const useAddBusinessReview = () =>
    useMutation<
        undefined,
        IError,
        {
            request: IAddBusinessReviewRequest;
            businessSlug: string;
        }
    >(addBusinessReview);
