import React, {useState} from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../../styledComponentsTheme';
import { ArrowRight, ToggleChannel } from '../../components/Utility/LSTVSVG';

import DiscoverSideBarContents from './DiscoverSideBarContents';

//Todo Remove hardcoded data and images
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

const rotateAnimation = keyframes`
    0% { transform: rotate(-180deg); }
    100% {transform: rotate(0deg); }
`;
const IconContainer = styled('div')`
    height: 24px;
    width: 24px;
    min-height: 24px;
    min-width: 24px;
    margin: auto;
    transform: rotate(-180deg);
    &.open {
        transform: rotate(0deg);
        animation-name: ${rotateAnimation};
        animation-duration: 0.6s;
    }
    &.closing {
        animation-name: ${rotateAnimation};
        transform: rotate(-180deg);
        animation-direction: reverse;
        animation-duration: 0.6s;
        animation-timing-function: ease-in;
    }
`;

const SideBarContainerDiv = styled.div`
  width: ${props => props.isOpen ? '240px' : '62px'};
  transition: width 0.6s ease-out;
  box-shadow: 0px 1px 6px 1px rgba(210,210,210,0.25);
  height: calc(100vh - 60px);
  position: sticky;
  flex-grow: 0;
  button {
    min-height: 45px;
    min-width: 45px;
    border-radius: 50%;
    color: white;
    margin-right: 10px;
    background-color: ${theme.primaryPurple};
    box-shadow: 0px 0px 24px 0px #000000 25%;
  }
`
const P = styled.p`
  width: 100px;
`
const TopButtonDiv = styled('div')`
    display: flex;
    justify-contents: flex-start;
    margin-top: 20px;
    margin-left: 10px;
`
const DiscoverSideBar = (props) => {
  //gets links from parent
  //state of page should be consistent or debugging is gonna be a bitch 
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const handleClick = () => {
    if (!isOpen && !hasOpened) {
        setIsOpen(true);
        setHasOpened(true);
    } else {
        setIsOpen(!isOpen);
    }
  };
  
  return (
    <>
      <SideBarContainerDiv isOpen={isOpen}>
        <TopButtonDiv>

          <button onClick={() => handleClick()}>
            <IconContainer className={`${isOpen && hasOpened && 'open'} ${!isOpen && hasOpened && 'closing'}`}>
              <ToggleChannel fillColor={theme.white} strokeColor={'none'} />
            </IconContainer>
          </button>
          {isOpen &&<P>Popular Categories</P>}

        </TopButtonDiv>
        {isOpen &&<DiscoverSideBarContents contents={sideBarData}/>}
      </SideBarContainerDiv>
    </>
  )
}
export default DiscoverSideBar;
