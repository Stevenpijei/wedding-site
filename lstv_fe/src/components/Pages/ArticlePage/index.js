import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';

import { useMediaReady } from '../../../utils/LSTVUtils';
import theme from '../../../styledComponentsTheme';
import { usePublicContentService } from '../../../rest-api/hooks/usePublicContentService';
import {
    CONTENT_GRID_CONTENT_SORT_METHOD_RANDOM,
    CONTENT_GRID_CONTENT_TYPE_BUSINESS,
    CONTENT_GRID_CONTENT_SEARCH_TYPE_FIXED_VENDOR_LIST,
} from '../../../global/globals';
import { buildFixedContentItemsFromSlugArray } from '../../../utils/LSTVUtils';

import ConditionalWrapper from '../../../newComponents/ConditionalWrapper';
import WeddingCarousel from '../../../newComponents/WeddingCarousel';
import ContentGrid from '../../Content/ContentGrid';
import {
    Container,
    Content,
    DesktopContainer,
    Sidebar,
    Section,
    SectionTitle,
    SectionHeader,
    InfoCardContainer,
    StickyInfoCardContainer
} from '../../../newComponents/layout/TwoColumnLayoutBlocks';

import ArticleHero from './ArticleHero';
import ArticleInfo from './ArticleInfo';
import ArticleContent from './ArticleContent'
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en'
TimeAgo.addDefaultLocale(en)

const StyledWeddingCarousel = styled(WeddingCarousel)`
    padding: 0px;
`;

const StyledSectionTitle = styled(SectionTitle)`
    margin: 0 0 24px 0;
` 


const Seperator = styled.div`
    height: 1px;
    background: ${theme.midGrey};
    margin: 40px 0;
`;

const ArticleDetails = ({ title, description, id, thumbnail_url, businesses, isMobile }) => {
    const [businessCards, setBusinessCards] = useState(undefined)
    const { getSlugContent } = usePublicContentService()

    const slugify = (businesses) => (
        businesses.map(busi => (
            `/business/${busi.slug}`
        )).join(",")
    )

    useEffect(() => {
        getSlugContent({ slug: slugify(businesses), verbosity: "card" }).then((data)=> {
            if(data) {
                Array.isArray(data) ? setBusinessCards(data) : setBusinessCards([data])
            }
        })
    }, [])


    return (
        <>
        <InfoCardContainer>
                <ArticleInfo
                    title={title}
                    description={description}
                    id={id}
                    image={thumbnail_url}
                />
            </InfoCardContainer>
            <Seperator />
            {businessCards && <StyledWeddingCarousel
                showOutline={false}
                title={isMobile ? 'Related Businesses' : 'Pros Featured in this article'}
                businesses={businessCards || []}
            />}
        </>
    );
}

const ArticlePage = ({ post }) => {
    // eslint-disable-next-line react/prop-types
    const { title, description, id, thumbnail_url, short_url_token, businesses, content } = post
    const [isMobile, ready] = useMediaReady(theme.breakpoints.isMobileOrTablet, false);
    // const { getShoppingItems } = usePublicContentService();
    
    const contents = content?.map(({ content }) => content).join('');
    const { ref, inView } = useInView({
        threshold: 0.2,
    });
    // const contentUnescaped = unescape(contents);

    useEffect(() => {
        getShopItems();
    }, []);

    const getShopItems = async () => {
        // const response = await getShoppingItems(post?.article?.id, 'article');
    };

    return ready ? (
        <Container>
            <ConditionalWrapper condition={!isMobile} Wrapper={DesktopContainer}>
                <ArticleHero image={thumbnail_url} />
                <Content>
                    {isMobile ? 
                        <ArticleDetails
                            title={title} 
                            description={description} 
                            id={id} 
                            thumbnail_url={thumbnail_url} 
                            businesses={businesses}
                            isMobile={isMobile} 
                        /> : null
                    }
                    <ArticleContent content={content} />
                    {(businesses && businesses.length > 0) && <Section>
                        <StyledSectionTitle>Related Vendors</StyledSectionTitle>
                        <ContentGrid
                            contentType={CONTENT_GRID_CONTENT_TYPE_BUSINESS}
                            contentSearchType={CONTENT_GRID_CONTENT_SEARCH_TYPE_FIXED_VENDOR_LIST}
                            contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_RANDOM}
                            fixedContentItems={buildFixedContentItemsFromSlugArray(businesses)}
                            offset={0}
                            size={4}
                            options={{ showRoles: true }}
                        />
                    </Section>}
                    {/* <Section>
                        <SectionHeader>
                            <StyledSectionTitle>Related Articles</StyledSectionTitle>
                        </SectionHeader>
                        <ContentGrid
                            contentType={CONTENT_GRID_CONTENT_TYPE_ARTICLE}
                            contentSearchType={CONTENT_GRID_CONTENT_SEARCH_TYPE_NONE}
                            searchItems={'the-highlight-reel'}
                            contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_MOST_RECENT}
                            excludeItems={post?.slug}
                            offset={0}
                            size={4}
                        />
                    </Section> */}
                    {/* <Section>
                        <SectionTitle>Shop Now</SectionTitle>
                        <ShopItems items={mockShopping} style={shopItemsStyle} />
                    </Section> */}
                </Content>
            </ConditionalWrapper>
            {!isMobile ? (
                <Sidebar>
                    <div ref={ref}>
                      {(businesses && businesses.length > 0) &&   <ArticleDetails
                            title={title} 
                            description={description} 
                            id={id} 
                            thumbnail_url={thumbnail_url} 
                            businesses={businesses}
                            isMobile={isMobile} 
                        />}
                    </div>
                    {!inView ? (
                        <StickyInfoCardContainer>
                            <ArticleInfo
                                title={title}
                                description={description}
                                id={id}
                                image={thumbnail_url}
                                // token={.short_url_token}
                            />
                        </StickyInfoCardContainer>
                    ) : null}
                </Sidebar>
            ) : null}
        </Container>
    ) : null;
};

const shopItemsStyle = {
    gridTemplateColumns: 'repeat(4, 0.25fr)',
};
export default ArticlePage;
