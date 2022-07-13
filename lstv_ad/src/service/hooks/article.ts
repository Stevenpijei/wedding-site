import { useMutation, useQuery, UseQueryOptions } from 'react-query';

import { IError } from 'interface';
import { IArticleCountResponse, IArticlesResponse, IGetAllArticlesRequest } from 'interface/article';
import { deleteArticle, getAllArticles, getArticleCounts } from 'service/api/article';

export const ArticleQueryKeys = {
    GET_ALL_ARTICLES: 'GET_ALL_ARTICLES',
    GET_ARTICLES_COUNT: 'GET_ARTICLES_COUNT',
};

export const useArticles = (request: IGetAllArticlesRequest) =>
    useQuery<IArticlesResponse, IError>([ArticleQueryKeys.GET_ALL_ARTICLES, request], () => getAllArticles(request));

export const useArticleCount = (config?: UseQueryOptions<IArticleCountResponse, IError>) =>
    useQuery<IArticleCountResponse, IError>([ArticleQueryKeys.GET_ARTICLES_COUNT], () => getArticleCounts(), config);

export const useDeleteArticle = () => useMutation<undefined, IError, { id: string }>(deleteArticle);
