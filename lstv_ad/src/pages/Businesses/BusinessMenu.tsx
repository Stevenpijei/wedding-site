import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { QueryObserverResult, RefetchOptions } from 'react-query';

import { IBusinessAdminListResponse, IError } from 'interface';
import KebabMenu from 'components/DataTable/EditRowMenu';
import { useBusinessAccountClaim } from 'service/hooks/business';
import { PrivateRoutes } from 'config/routes';
import { ToastContext } from 'contexts/ToastContext';

interface Props {
    id: string;
    slug: string;
    isCreated: boolean;
    link: string | null;
    refetchTable: (
        options?: RefetchOptions | undefined
    ) => Promise<QueryObserverResult<IBusinessAdminListResponse, IError>>;
}

const BusinessMenu: React.FC<Props> = ({ slug, isCreated, link, id, refetchTable }: Props) => {
    const history = useHistory();
    const { showToast } = useContext(ToastContext);
    const { mutateAsync: requestAccountClaim } = useBusinessAccountClaim();

    const handleCreateClaimLink = async () => {
        try {
            const res = await requestAccountClaim({ slug });
            await refetchTable();
            if (res.success) {
                navigator.clipboard.writeText(res.result.account_claim_url);
                showToast({
                    type: 'success',
                    message: 'Successfully created a claim link and copied it to clipboard',
                });
            }
        } catch (e) {
            showToast({
                type: 'error',
                message: e.message,
            });
        }
    };

    const handleCopyAccountClaimLink = () => {
        navigator.clipboard.writeText(link as string);
        showToast({
            type: 'success',
            message: 'Successfully copied the claim link to clipboard',
        });
    };

    const handleEditClick = () => {
        history.push(`${PrivateRoutes.BUSINESSES}/${id}`);
    };

    return (
        <KebabMenu
            items={[
                {
                    title: isCreated ? 'Copy Account Claim Link' : 'Create claim link',
                    action: isCreated ? handleCopyAccountClaimLink : handleCreateClaimLink,
                },
                {
                    title: 'Edit',
                    action: handleEditClick,
                },
            ]}
        />
    );
};

export default BusinessMenu;
