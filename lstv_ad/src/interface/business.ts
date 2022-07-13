import { ESocialLink } from 'config/enum';
import { IGenericResponse, ILocation, IPaginatedRequest, IPaginatedResponse, IPhoto } from './general';

export type IBusinessScope =
    | 'active'
    | 'active_review'
    | 'suspended_review'
    | 'suspended'
    | 'deleted'
    | 'suspended_dmz';

export type IBusinessTab = { id: number; name: IBusinessScope };

export interface IBusinessId {
    businessId?: string;
}

export interface IBusinessSlugSocialLinkId {
    businessSlug: string;
    socialLinkId?: string;
}

export interface IBusinessRole {
    bg_color: string;
    family: string;
    family_slug: string;
    name: string;
    plural: string;
    singular: string;
    slug: string;
}

export interface ICapacity {
    bg_color: string;
    business_role_type: string;
    name: string;
    plural: string;
    role_name: string;
    role_slug: string;
    singular: string;
    slug: string;
}

export interface IBusinessPhone {
    country: string;
    country_iso2: string;
    country_iso3: string;
    display_phone_number: string;
    id: string;
    link_phone_number: string;
    type: string;
}

export interface ISocialLink {
    id: string;
    type: ESocialLink | undefined;
    link: string;
}

export interface IBusiness {
    alt_contact_cta_label: string;
    alt_contact_cta_link: string;
    article_views: number;
    associate_brands: any[];
    bg_color: string;
    business_locations: ILocation[];
    card_impressions: number;
    card_thumbnail_url: string;
    channel_views: number;
    cohorts: any[];
    coverage_locations: any[];
    description: string;
    faq: any[];
    id: string;
    inquiry_email: string;
    likes: number;
    name: string;
    organized_events: any[];
    phones: IBusinessPhone[];
    photos: IPhoto[];
    premium: boolean;
    profile_image: string;
    promo_videos: any[];
    publicTeam: any[];
    publicTeamFaq: any[];
    reviews: any[];
    roles: IBusinessRole[];
    shares: number;
    shopping: any[];
    slug: string;
    social_links: ISocialLink[];
    sold_at_businesses: any[];
    subscribers: number;
    subscription_level: string;
    tags: any[];
    venue_types: any[];
    video_views: number;
    website: string;
    weight_articles: number;
    weight_photos: number;
    weight_videos: number;
}

export interface IBusinessAdmin {
    id: string;
    name: string;
    created_at: string;
    slug: string;
    display_location: string;
    weight_videos: number;
    weight_articles: number;
    weight_photos: number;
    subscription_level: string;
    roles: IBusinessRole[];
    bg_color: string;
    issue?: string;
    deleted_at?: string;
    account_claim_url: string | null;
    account_claimed_at: string | null;
    claim_status: string;
}

export interface IBusinessVendor {
    id: string;
    created_at: string;
    name: string;
    slug: string;
    suggested_by: string;
    suggested_by_slug: string;
    suggested_by_id: string;
    in_video_title: string;
    in_video_slug: string;
    in_video_id: string;
    video_thumbnail: string;
    account_claim_url: string | null;
    account_claimed_at: string | null;
    claim_status: string;
}

export interface IBusinessCounts {
    active_count: number;
    active_review_count: number;
    suspended_review_count: number;
    suspended_count: number;
    deleted_count: number;
    vendor_suggested: number;
}

export interface IBusinessReview {
    author: string;
    author_id: string;
    author_thumbnail_url: string;
    content: string;
    created_at: string;
    edited_at: string;
    likes: number;
    posted_at: number;
    posted_at_label: string;
    rating: number;
    review_id: string;
    title: string;
}

export interface IGetAllBusinessRequest extends IPaginatedRequest {
    sort_field?: string;
    sort_order?: 'asc' | 'desc';
    search_term?: string;
    scope?: IBusinessScope;
    roles?: string;
    paid?: boolean;
    verbosity: string;
}

export interface IBusinessPhoneUpdateRequest extends IBusinessId {
    phoneId: string;
    country: string;
    number: string;
    type: string;
}

export interface IBusinessGeneralInfoRequest extends IBusinessId {
    business_name?: string;
    description?: string;
    inquiry_email?: string | null;
    business_location?: any;
    subscription_level?: string;
    profile_image?: string;
    card_thumbnail_url?: string;
}

export interface IBusinessRoleUpdateRequest extends IBusinessId {
    roles: string[];
}

export interface IBusinessPhoneCreateRequest extends IBusinessId {
    number: string;
    country: string;
    type: string;
}

export interface IBusinessLocationUpdateRequest extends IBusinessId {
    business_location: any;
}

export interface IBusinessSocialLinkUpdateRequest extends IBusinessSlugSocialLinkId {
    type: string;
    account: string;
}

export interface IAddBusinessReviewRequest extends IPatchBusinessReviewRequest {
    from_first_name?: string;
    from_last_name?: string;
    from_profile_image_url?: string;
}

export interface IAddBusinessPhotoRequest {
    slug: string;
    photo_url?: string;
    title?: string;
    description?: string;
}

export interface IDeleteBusinessReviewRequest {
    businessSlug: string;
    reviewId: string;
}

export interface IDeleteBusinessReviewRequest {
    businessSlug: string;
    reviewId: string;
}

export interface IPatchBusinessReviewRequest {
    title: string;
    content: string;
    rating: number;
}

export interface IDeleteBusinessPhotoRequest {
    slug: string;
    photoId: string;
}

export interface IUpdateBusinessPhotoRequest extends IAddBusinessPhotoRequest {
    photoId: string;
}

export type IBusinessCountResponse = IGenericResponse<IBusinessCounts>;

export type IBusinessAdminListResponse = IPaginatedResponse<IBusinessAdmin[] | IBusinessVendor[]>;

export type IBusinessRoleResponse = IGenericResponse<IBusinessRole[]>;

export type IBusinessPhotoResponse = IGenericResponse<IPhoto[]>;

export type IBusinessResponse = {
    result: IBusiness;
    success: boolean;
    timestamp: string;
};

export type ICapacityResponse = IGenericResponse<ICapacity[]>;

export type IBusinessReviewResponse = IGenericResponse<{
    reviews: IBusinessReview[];
    summary: {
        average_rating: number;
        num_reviews: number;
    };
}>;

export interface IBusinessAccountClaimResponse {
    success: boolean;
    timestamp: number;
    result: {
        business_id: string;
        business_slug: string;
        account_claim_url_created_at: string;
        account_claim_url: string;
    };
}
