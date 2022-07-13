import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../../../styledComponentsTheme';
import { ArrowRight } from '../../../components/Utility/LSTVSVG'

import CustomizedMobileStickyPanel from './CustomizedMobileStickyPanel';


const ThumbnailImageSrc = 'https://images.unsplash.com/photo-1577036421869-7c8d388d2123?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80';

const sideBarData = [
  {
    thumbnail: ThumbnailImageSrc,
    name: 'Link 1',
    count: '121 Videos'
  },
  {
    thumbnail: ThumbnailImageSrc,
    name: 'Link 2',
    count: '30 Videos'
  },
  {
    thumbnail: ThumbnailImageSrc,
    name: 'Link 1',
    count: '3940 Videos'
  }
]
const StickyLayout = styled.div`
    margin-left: 20px;
    margin-right: 20px;
`

const SearchStickyPanel = (props) => {
    const [isOpen, setIsOpen] = useState(true);
    const [hasOpened, setHasOpened] = useState(false);

    const handleClick = () => {
        if (!isOpen && !hasOpened) {
            setIsOpen(true);
            setHasOpened(true);
        } else {
            setIsOpen(!isOpen);
        }
    };

    const Header = () => (
        <StickyHeader>
               <Actions>
                <button onClick={() => handleClick()}>
                    <IconContainer className={`${isOpen && hasOpened && 'open'} ${!isOpen && hasOpened && 'closing'}`}>
                        <ArrowRight fillColor={theme.white} strokeColor={'none'} />
                    </IconContainer>
                </button>
            </Actions>
            <StickyHeaderTitle>
                <h5>Back</h5>
            </StickyHeaderTitle>

         
        </StickyHeader>
    );

    return (
        <CustomizedMobileStickyPanel isOpen={isOpen} header={<Header/>} containerHeight="auto" headerHeight="75px">
            <StickyLayout>
                {props.children}
            </StickyLayout>
        </CustomizedMobileStickyPanel>
    );
};

const StickyHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    z-index: 10;
    button {
        height: 50px;
        width: 50px;
        border-radius: 25px;
        color: white;
        margin-right: 10px;
        background-color: ${theme.primaryPurple};
        box-shadow: 0px 0px 24px 0px #000000 25%;
    }
`;

const StickyHeaderTitle = styled.div`
    display: flex;
    flex-direction: column;

    div {
        display: flex;
        flex-direction: row;
    }
`;

const rotateAnimation = keyframes`
    0% { transform: rotate(-90deg); }
    100% {transform: rotate(90deg); }
`;

const IconContainer = styled('div')`
    height: 24px;
    width: 24px;
    margin: auto;
    transform: rotate(-90deg);
    height: 18px;
    width: 18px;
    &.open {
        transform: rotate(90deg);
        animation-name: ${rotateAnimation};
        animation-duration: 0.6s;
    }
    &.closing {
        animation-name: ${rotateAnimation};
        transform: rotate(-90deg);
        animation-direction: reverse;
        animation-duration: 0.6s;
        animation-timing-function: ease-in;
    }
`;

const Actions = styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export default SearchStickyPanel;
