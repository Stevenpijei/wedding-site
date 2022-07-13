import React, { useState } from 'react';
import { BeatLoader } from 'react-spinners';
import styled from 'styled-components';
import * as LSTVGlobals from '../../../global/globals';
import { CARD_TYPE_BUSINESS } from '../../../newComponents/cards/LSTVCard';
import { OutlinedCTAButton } from '../../../newComponents/common/OutlinedCTALink';
import NoResult from '../../../newComponents/Search/SearchResults/NoResults';
import theme from '../../../styledComponentsTheme';
import CardGrid from '../../Content/Cards/CardGrid';
import Header from '../DirectoryPage/Header';

const GridContainer = styled.div`
    display: ${(props) => (props.isHidden ? 'none' : 'block')};
    
    @media ${theme.breakpoints.isMobileOrTablet} {
        .lstvLinkNoStyle {
            display: block;
            margin: 16px 0;
        }
    }
`;

const Container = styled.div`
    padding: 24px;
    min-height: 300px;
`

const LoaderContainer = styled.div`
    margin: 16px 0 0 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
`;

const LoadMoreContainer = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding-top: 50px;
`;
const Title = styled.h3`
    margin: 24px 0;
`;

const FreeSearchResults = ({ content, total, query, locationName, isLoading }) => {
    const [numCards, setNumCards] = useState(15);
    const [localLoading, setLocalLoading] = useState()

    const loadMore = () => {
        if (total >= numCards) {
            setNumCards(numCards + 15);
            setLocalLoading(true);
        }
    };

    const handleNewData = () => {
        setLocalLoading(false)
    }

    return (
        <Container>
            {isLoading || localLoading ? (
                <LoaderContainer>
                    <BeatLoader size={24} color={LSTVGlobals.LSTV_YELLOW} loading={isLoading || localLoading} />
                </LoaderContainer>
            ) : total && total > 0 ?
            (
                <>
                    <Header
                        hideDescription
                        title={`'${query}' ${locationName && ` in ${locationName}`}`}
                    />
                    <Title>
                        { total ? total.toLocaleString('en-US', { maximumFractionDigits: 2 }) : ''} Results                    
                    </Title>
                </>
            ) : (
                <NoResult hideBirds />
            )}
            <GridContainer isHidden={isLoading || localLoading || total === 0 || !total}>
                <CardGrid
                    forceChangeCards
                    numCards={numCards}
                    content={content}
                    cardType={CARD_TYPE_BUSINESS}
                    onNewData={handleNewData}
                />
            </GridContainer>
            {total > numCards ? (
                <LoadMoreContainer>
                    <OutlinedCTAButton onClick={loadMore}>Load More</OutlinedCTAButton>
                </LoadMoreContainer>
            ) : null}
        </Container>
    );
};

export default FreeSearchResults;
