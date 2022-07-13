import React from 'react';
import styled from 'styled-components';

import ContentShareWidget from '../../Utility/ContentShareWidget';
import BaseChip from '../../../newComponents/BaseTag'
import { ACTION_BAR_OWNER_TYPE_ARTICLE } from '../../../global/globals';
import ShareModal from '../../../newComponents/ShareModal';

const Container = styled('div')`
    height: 100%;
    padding 32px 16px;
    max-width: 100%;
`;

const Title = styled('h1')`
    font-size: 2em;
    font-weight: 800;
    padding: 0 16px;
`;

const Description = styled('h2')`
    font-size: 1.125em;
    font-weight: 400;
`;

const VibesContainer = styled('div')`
    margin: 32px 0 0 0;
`;

const ShareIconContainer = styled('div')`
    height: 24px;
    width: 24px;
    margin: 0 0 40px auto;
`;

const ArticleInfo = ({
    id,
    title,
    description,
    tags,
    token,
    image,
}) => {
    return (
        <Container>
            <ShareIconContainer>
                <ContentShareWidget
                    ownerType={ACTION_BAR_OWNER_TYPE_ARTICLE}
                    ownerId={id}
                    shareOptions={{
                        shortUrlToken: token,
                        title: `Share: ${title}`,
                        shareLinkLabel: 'Direct Link',
                        shareThumbnailUrl: image,
                    }}
                />
            </ShareIconContainer>
            <Title>{title}</Title>
            <Description>{description}</Description>
            <VibesContainer>
                {tags?.map((tag) => (
                    <BaseChip key={tag} title={tag} />
                ))}
            </VibesContainer>
            <ShareModal />
        </Container>
    );
};

export default ArticleInfo;
