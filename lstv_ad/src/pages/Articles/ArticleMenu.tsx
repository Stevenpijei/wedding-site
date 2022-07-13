import React, { useContext } from 'react';

import KebabMenu from 'components/DataTable/EditRowMenu';
import { ArticleQueryKeys, useDeleteArticle } from 'service/hooks/article';
import { ModalContext } from 'contexts/ModalContext';
import { ToastContext } from 'contexts/ToastContext';
import { useQueryClient } from 'react-query';

interface Props {
    id: string;
    hideDeleteItem: boolean;
}

const ArticleMenu: React.FC<Props> = ({ id, hideDeleteItem }: Props) => {
    const { showConfirmModal } = useContext(ModalContext);
    const { showToast } = useContext(ToastContext);
    const queryClient = useQueryClient();

    const { mutateAsync: requestDeleteArticle } = useDeleteArticle();

    const handleDelete = async () => {
        try {
            await requestDeleteArticle({ id });
            showToast({
                type: 'success',
                message: 'Successfully deleted the article',
            });
            await queryClient.refetchQueries([ArticleQueryKeys.GET_ARTICLES_COUNT]);
            await queryClient.refetchQueries([ArticleQueryKeys.GET_ALL_ARTICLES]);
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
    };

    const handleDeleteClick = () => {
        showConfirmModal({
            content: null,
            header: `Are you sure to delete this article?`,
            confirmButton: { name: 'Delete', action: handleDelete },
        });
    };

    return (
        <KebabMenu
            items={[
                ...(!hideDeleteItem
                    ? [
                          {
                              title: 'Delete',
                              action: handleDeleteClick,
                          },
                      ]
                    : []),
            ]}
        />
    );
};

export default ArticleMenu;
