import {
    IGetAllBusinessRequest,
    IBusinessAdminListResponse,
    IBusinessCountResponse,
    IBusinessRoleResponse,
    IBusinessResponse,
    IBusinessPhoneUpdateRequest,
    IBusinessGeneralInfoRequest,
    IBusinessRoleUpdateRequest,
    IBusinessPhoneCreateRequest,
    IBusinessSlugSocialLinkId,
    IBusinessSocialLinkUpdateRequest,
    IBusinessPhotoResponse,
    IDeleteBusinessPhotoRequest,
    IUpdateBusinessPhotoRequest,
    IAddBusinessPhotoRequest,
    ICapacityResponse,
    IBusinessReviewResponse,
    IDeleteBusinessReviewRequest,
    IAddBusinessReviewRequest,
    IPatchBusinessReviewRequest,
} from 'interface';
import { getRequest, API_URL, postRequest, patchRequest, deleteRequest } from '.';

export const getFilteredBusinesses = (term: string, type: string) =>
    getRequest(`/search`, {
        term,
        type,
    });

export const getAllBusinesses = ({ search_term, roles, paid, ...rest }: IGetAllBusinessRequest) =>
    getRequest<IBusinessAdminListResponse>(`${API_URL.BUSINESS}`, {
        ...rest,
        ...(search_term ? { search_term } : {}),
        ...(roles ? { roles } : {}),
        ...(paid ? { paid } : {}),
    });

export const getBusinessCounts = () => getRequest<IBusinessCountResponse>(`${API_URL.BUSINESS}/_count`);

export const getAllBusinessRoleTypes = () => getRequest<IBusinessRoleResponse>(`/businessRoleTypes`);

export const businessAccountClaim = ({ slug }: { slug: string }) =>
    postRequest(`${API_URL.BUSINESS}/${slug}/accountClaim`);

export const getBusiness = (id: string) => getRequest<IBusinessResponse>(`${API_URL.BUSINESS}/${id}`);

export const updateBusinessPhone = ({ country, number, businessId, phoneId }: IBusinessPhoneUpdateRequest) =>
    patchRequest(`${API_URL.BUSINESS}/${businessId}/${phoneId}`, {
        country,
        number,
        type: 'business',
    });

export const updateBusinessGeneralInfo = ({ businessId, ...payload }: IBusinessGeneralInfoRequest) =>
    patchRequest(`${API_URL.BUSINESS}/${businessId}`, payload);

export const updateBusinessRoles = ({ businessId, roles }: IBusinessRoleUpdateRequest) =>
    patchRequest(`${API_URL.BUSINESS}/${businessId}/roles`, roles);

export const postBusinessPhone = ({ businessId, ...payload }: IBusinessPhoneCreateRequest) =>
    postRequest(`${API_URL.BUSINESS}/${businessId}/phones`, payload);

export const deleteSocialLink = ({ businessSlug, socialLinkId }: IBusinessSlugSocialLinkId) =>
    deleteRequest(`${API_URL.BUSINESS}/${businessSlug}/socialLinks/${socialLinkId}`);

export const patchSocialLink = ({ businessSlug, socialLinkId, ...payload }: IBusinessSocialLinkUpdateRequest) =>
    patchRequest(`${API_URL.BUSINESS}/${businessSlug}/socialLinks/${socialLinkId}`, payload);

export const postSocialLink = ({ businessSlug, type, account }: IBusinessSocialLinkUpdateRequest) =>
    postRequest(`${API_URL.BUSINESS}/${businessSlug}/socialLinks`, { type, account });

export const getBusinessPhotos = (businessSlug: string) =>
    getRequest<IBusinessPhotoResponse>(`/business/${businessSlug}/photos`);

export const deleteBusinessPhoto = ({ slug, photoId }: IDeleteBusinessPhotoRequest) =>
    deleteRequest(`${API_URL.BUSINESS}/${slug}/photos/${photoId}`);

export const addNewBusinessPhoto = ({ slug, ...payload }: IAddBusinessPhotoRequest) =>
    postRequest(`${API_URL.BUSINESS}/${slug}/photos`, payload);

export const patchBusinessPhoto = ({ slug, photoId, ...payload }: IUpdateBusinessPhotoRequest) =>
    patchRequest(`${API_URL.BUSINESS}/${slug}/photos/${photoId}`, payload);

export const getBusinessCapacityTypes = () => getRequest<ICapacityResponse>(`/businessCapacityTypes`);

export const getRolesFromBusiness = (businessSlug: string) =>
    getRequest<IBusinessRoleResponse>(`${API_URL.BUSINESS}/${businessSlug}/roles`);

export const getBusinessReviews = (slug: string) =>
    getRequest<IBusinessReviewResponse>(`${API_URL.BUSINESS}/${slug}/reviews`);

export const deleteBusinessReview = ({ businessSlug, reviewId }: IDeleteBusinessReviewRequest) =>
    deleteRequest(`${API_URL.BUSINESS}/${businessSlug}/reviews/${reviewId}`);

export const addBusinessReview = ({
    request,
    businessSlug,
}: {
    request: IAddBusinessReviewRequest;
    businessSlug: string;
}) => postRequest(`${API_URL.BUSINESS}/${businessSlug}/reviews`, request);

export const patchBusinessReview = ({
    request,
    reviewId,
    businessSlug,
}: {
    request: IPatchBusinessReviewRequest;
    businessSlug: string;
    reviewId: string;
}) => patchRequest(`${API_URL.BUSINESS}/${businessSlug}/reviews/${reviewId}`, request);
