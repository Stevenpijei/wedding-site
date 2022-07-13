import { CTOptions } from 'cogo-toast';
import { IArticleTab, IBusinessTab, IUserTab, IVideoTab, ITagTab } from 'interface';

export const TOAST_OPTIONS: CTOptions = {
    hideAfter: 7,
    position: 'top-right',
};

export const IMG_EXTENSIONS = ['image/png', 'image/jpg', 'image/jpeg'];

export const IMG_PLACEHOLDER = 'https://cdn.lovestoriestv.com/images/site/nothumb.jpg';

export const businessTabs: IBusinessTab[] = [
    { id: 0, name: 'active' },
    { id: 1, name: 'active_review' },
    { id: 2, name: 'suspended_review' },
    { id: 3, name: 'suspended' },
    { id: 4, name: 'deleted' },
    { id: 5, name: 'suspended_dmz' },
];

export const videoTabs: IVideoTab[] = [
    { id: 0, name: 'active' },
    { id: 1, name: 'active_review' },
    { id: 2, name: 'suspended_review' },
    { id: 3, name: 'suspended' },
    { id: 4, name: 'deleted' },
];

export const userTabs: IUserTab[] = [
    { id: 0, name: 'active' },
    { id: 1, name: 'active_review' },
    { id: 2, name: 'suspended_review' },
    { id: 3, name: 'suspended' },
    { id: 4, name: 'deleted' },
];

export const articleTabs: IArticleTab[] = [
    { id: 0, name: 'active' },
    { id: 1, name: 'active_review' },
    { id: 2, name: 'suspended_review' },
    { id: 3, name: 'suspended' },
    { id: 4, name: 'deleted' },
];

export const tagTabs: ITagTab[] = [
    { id: 0, name: 'active' },
    { id: 1, name: 'deleted' },
    { id: 2, name: 'suspended_dmz' },
];
