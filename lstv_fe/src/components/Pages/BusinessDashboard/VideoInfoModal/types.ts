// TODO: abstract these to core when we migrate to Next / monorepo
interface IWeddingBasicInfo {
  name_spouse_1?: string,
  name_spouse_2?: string,
  event_date?: string | Date,
  event_location?: any, // TSFIXME - a google place object with address_components, formatted_address, et al
}

interface IPromoBasicInfo {
  title?: string,
  /**
   * formerly `description`
   */
  content?: string
}

export interface IBasicInfo extends IWeddingBasicInfo, IPromoBasicInfo {
  thumbnail_url?: string
}

export interface ITag {
  __isNew__?: string | boolean, // not sure
  name: string,
  slug?: string
}

export interface IBusinessRow {
  /**
   * If a new business we'll have the name the user entered
   */
  name?: string,
  /**
   * Email can be optionally entered for a new business
   */
  email?: string,
  /**
   * If an existing selected business we can get the slug
   * Either this or name is required
   */
  slug?: string,
  role_slug?: string,
  // Only used by the f/e. Will be stripped out before data is sent to the b/e.
  key?: string
}

export interface IWeddingDetails {
  businesses?: IBusinessRow[],
  tags?: ITag[],
  content?: string
}

export interface IVisibility {
  visibility?: 'public' | 'unlisted',
  opt_in_for_social_and_paid?: boolean,
  bride_email?: string,
  bride_instagram?: string,
  /**
   * DEPRECATED
   */
  opt_in_for_social?: boolean,
  /**
   * DEPRECATED
   */
  opt_in_for_paid_partners?: boolean
}

export type VideoType = 'wedding' | 'promo'

export interface IVideo extends IBasicInfo, IWeddingDetails, IVisibility {
  // respon from the b/e for existing videos not
  // already covered in the screen data types we're extending
  draft?: boolean,
  duration?: number,
  height?: number,
  id?: string,
  link?: string,
  thumbnail_url?: string,
  uploaded_at?: string, // or Date?
  video_id?: string,
  video_type?: VideoType,
  width?: number,
  // not included in b/e response but required to create videos
  video_upload_token?: string,
}
