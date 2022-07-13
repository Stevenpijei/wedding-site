import { IArticleCountResponse, IArticlesResponse, IGetAllArticlesRequest } from 'interface/article';
import { API_URL, deleteRequest, getRequest } from '.';

export const getAllArticles = (payload: IGetAllArticlesRequest) =>
    getRequest<IArticlesResponse>(`${API_URL.ARTICLES}`, payload);

export const getArticleCounts = () => getRequest<IArticleCountResponse>(`${API_URL.ARTICLES}/_count`);

export const deleteArticle = ({ id }: { id: string }) => deleteRequest(`${API_URL.ARTICLES}/${id}`);
