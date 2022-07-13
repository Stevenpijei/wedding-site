import { IGenericResponse } from './general';

export type IHomeCardSectionTarget = 'logged_out_home_page' | 'logged_in_home_page';

export interface IHomeCardSection {
    content_type: string;
    content_type_display_name: string;
    cta_text?: string;
    cta_url?: string;
    group?: number;
    header?: string;
    items: IHomeCardContentType[];
    order?: number;
    target: IHomeCardSectionTarget;
}

export interface IHomeCardSections {
    sections: IHomeCardSection[];
}

export interface IHomeCardContentType {
    display_name: string;
    slug: string;
}

export interface IGetHomeCardSectionsRequest {
    target?: IHomeCardSectionTarget;
    verbosity: string;
}

export type IGetHomeCardSectionsResponse = IGenericResponse<IHomeCardSections>;

export interface IUpdateHomeCardSectionsRequest {
    sections: IHomeCardSection[];
}
