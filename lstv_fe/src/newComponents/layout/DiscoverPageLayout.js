import React, { useState, useEffect } from 'react';
import useMedia from 'use-media';
import useScrollPosition from '@react-hook/window-scroll'
import breakpoints from '../../global/breakpoints';
import { Switch, Route, Link, useRouteMatch, useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import DiscoverSideBar from './DiscoverSideBar';
import { ButtonGroup, MenuButton} from '../buttons/BaseMenuButton.js';
import * as LSTVGlobals from '../../global/globals';
import DiscoverStickyPanel from './DiscoverStickyPanel';
import { ArrowRight } from '../../components/Utility/LSTVSVG';
import theme from '../../styledComponentsTheme';

const IconContainer = styled('div')`
  height: 25px;
  width: 25px;
  padding-left: 3px;
  transform: rotate(-180deg);
`
const InlineDiv = styled('div')`
  display: flex;
  flex-direction: row;
  position: relative;
  top: 325px;
  left: 20px;
  @media ${LSTVGlobals.UserDevice.isMobile} {
    top: 135px;
    left: 10px;
    &.collapse {
      top: 10px;
    }
  }
  
  align-items: center;
`
const HeroButton = styled.button`
  background: transparent;
  width: 50px;
  height: 50px;
  border: 2px white solid;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  @media ${LSTVGlobals.UserDevice.isMobile} {
    border: none;
    width: 30px;
    height: 30px;
    &.collapse {
    }
  }
  
`
const HeroHeader = styled.h2`
  font-weight: 800;
  color: white;
  padding-left: 10px;
  @media ${LSTVGlobals.UserDevice.isMobile} {
    border: none;
    padding-left: 0px;
    font-family: Heldane Display Test;
    font-size: 21px;
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0em;
  }
  &.collapse {
    @media ${LSTVGlobals.UserDevice.isMobile} {
      color: black;
      border: none;
      font-size: 21px;
      font-weight: 600;
      letter-spacing: 0em;
    
    }
    
  }
`
const HeroContainer = styled.div`
  height: ${props => props.collapse ? '60px' : '400px'};
  background: url(${props => props.srcLarge}), linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(119, 119, 119, 0.534722) 40.97%, #000000 100%, #0C090A 100%);
  background-position: center center;
  transition: all fade .5sec;
  @media ${LSTVGlobals.UserDevice.isMobile}{
    background-image: url(${props => props.srcSmall});
    height: 168px;
  }
  &.collapse {
    @media ${LSTVGlobals.UserDevice.isMobile}{

      position: fixed;
      top: 60px;
      z-index: 5;
      width: 100%;
      background-image: none;
      background-color: white;
      height: 60px;
    }
  }
  
  
`
const DiscoverMainDiv = styled.div`
  display: flex;
`
const DiscoverContentDiv = styled.div`
  padding-left: 20px;
  margin-left: 20px;
  margin-right: 40px;
  // border: 1px red solid;
  @media ${LSTVGlobals.UserDevice.isMobile} {
    margin-left: auto;
    margin-right: auto;
    padding-left: 20px;
    padding-right: 20px;
    overflow-x: hidden;
  }
  flex-grow: 1;
`
const StyledTabContainer = styled.div`
  display: flex;
  flex-direction: column;
`
const P = styled.p`
`
const H3 = styled.h3`
  margin-top: 40px;
  border-bottom: 2px grey solid;
  margin-bottom: 30px;
`

const SmallFolderCard = styled.div`
  width: 250px;
  height: 250px;
  border: 1px white solid;
  margin-right: 20px;
  background-image: url(${props => props.src});
  @media ${LSTVGlobals.UserDevice.isMobile} {
    margin-right: 0px;
  }
  margin-bottom: 20px;
  border-radius: 10px;
  :hover {
    border: 1px purple solid;
  }
`
const SmallFolderCardTitle = styled.h3`
  position: relative;
  top: 200px;
  left: 20px;
  color: white;
  a {
    text-decoration: none;
  }
`
const MyCardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  
  background-position: center center;
  justify-content: center; 
  @media ${LSTVGlobals.UserDevice.laptop} {
    justify-content: space-between;
  }
  @media max-width {
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  a {
    text-decoration: none;
  }
`
const FolderContainer = styled('div')`
  display: flex;
  flex-direction: column;
`
const MySelectedCardContainer = styled(MyCardContainer)`
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 40px;
`
const PlaceholderCard = styled.div`
  min-width: 485px;
  height: 274px;
  border: 1px blue solid;
  margin-bottom: 40px;
  border-radius: 20px;
  @media ${LSTVGlobals.UserDevice.isMobile} {
    min-width: 300px;
    margin-right: 0px;
  }
  background-image: url(${props => props.src});
`
const DiscoverHeader = styled.div`
  margin-top: 50px;
  margin-bottom: 30px;
  
`
const Text = styled.h2`
`
const FolderTitle = styled.h3`
  font-family: Heldane Display Test;
  font-style: normal;
  font-weight: bold;
  font-size: 32px;
  position: relative;
  top: 200px;
  left: 30px;
  color: white;
`
const tabs = [
  {
    name: "Videos",
    categories: [
      {
        name: "Wedding Vibes",
        path: "wedding-vibes",
        folderItems : [
          { name: "Boho"},
          { name: 'Star wars'},
          { name: 'Classic'},
          { name: 'Elegant'},
          { name: 'Destination'},
          { name: 'Rustic'},
          { name: 'Jewish'},
          { name: 'Chinese'},
          
        ]
      },
      {
        name: "Religion/Culture",
        path: "religion-culture",
        folderItems : [
          { name: "Jewish"},
          { name: 'Star wars'},
          { name: 'Christian'},
          { name: 'No DATA'},
        ],
      },
      {
        name: "Popular Locations",
        path: 'popular-locations',
        folderItems : [
          { name: "Denver" },
          { name: "NYC" },
          { name: "Toronto" },

        ],
      },
      {
        name: "Other Categories",
        path: 'other-categories',
        
      }
    ]
  },
  {
    name: "Businesses",
    categories: []
  },
  {
    name: "Favorites",
    categories: []

  },
  {
    name: "Venues",
    categories: []

  }
]
const CategoryTabs = ({tabs, openSideBar, selected, handleClick, isExpanded}) => {
  
  return (
    <>
      <ButtonGroup>
        {tabs.map((tab, i) => ( <CategoryTab selected={selected == i} key={i} name={tab.name} handleClick={() => handleClick(i)}/>))}
      </ButtonGroup>
      {isExpanded &&<FolderCardContainer folderContainerContent={tabs[selected]} openSideBar={openSideBar}/>}
    </>
  )
}
const CategoryTab = ({name, handleClick, selected}) => (<MenuButton selected={selected} onClick={handleClick} style={selected ? {color: 'black'} : {color: 'grey'}}>{name}</MenuButton>)
const FolderCardContainer = ({folderContainerContent, openSideBar}) => {
  const {name, categories} = folderContainerContent;
  const cards = categories.map((category, i) => <FolderCard category={category} index={i}/>)

  return (
    <>
      <H3>{name}</H3>
      <MyCardContainer>
        {cards}
      </MyCardContainer>
    </>
  )
}
const FolderCard = ({category, index}) => {
  const { url } = useRouteMatch();
  
  return (
    <>
      <Link to={`${url}/${category.path}`}>
        <PlaceholderCard category={category} src={'https://www.fillmurray.com/485/485'}>
            <FolderTitle>
              {category.name}
            </FolderTitle>
        </PlaceholderCard>
      </Link>

    </>
  )
}
const SelectedFolderCardContainer = ({tab, folderName, isMobile}) => {
  const scrollY = useScrollPosition(60);
  const { categories } = tabs[tab];
  const folder = categories.filter(folder => folder.path == folderName)
  const cards = folder.map((folder, i) => <SelectedFolderCard key={i} category={folder.folderItems} />)

  return (
    <>
      <HeroContainer
        srcLarge='https://www.fillmurray.com/1200/400'
        srcSmall='https://www.fillmurray.com/400/200'
        className={scrollY >=10 ? 'collapse': null}
      >
        <InlineDiv className={scrollY >=10 ? 'collapse': null}>
        <HeroButton
          className={scrollY >=10 ? 'collapse': null}
        ><Link to="/discover">
          <IconContainer>
            <ArrowRight fillColor={scrollY >= 10 && isMobile ? theme.black : theme.white} strokeColor={'none'} viewBox={isMobile ? '-2 -4 23 21' : '0 -1 18 17'}/>
          </IconContainer>

          </Link></HeroButton>
          <HeroHeader
            className={scrollY >=10 ? 'collapse': null}
          >{folder[0].name}</HeroHeader>
        </InlineDiv>

      </HeroContainer>
      <StyledTabContainer>
        <MySelectedCardContainer>
          {cards}
        </MySelectedCardContainer>
      </StyledTabContainer>
    </>
  )
}
const SelectedFolderCard = ({category, folderName}) => {

  const folderLinks = category && category.map((folderItem) => (
    <Link to="/nowhere" style={{'text-decoration': 'none'}}>

      <SmallFolderCard
        src='https://www.fillmurray.com/250/250'
      >
        <SmallFolderCardTitle>
            {folderItem.name}
        </SmallFolderCardTitle>
      </SmallFolderCard>
    </Link>

  ))
  return (
    <>
      {folderLinks}
    </>
  ) 
}
const FolderView = ({ isMobile }) => {
  const { id } = useParams();
  return (
    <SelectedFolderCardContainer tab={0} folderName={id} isExpanded={true} isMobile={isMobile}/>
  )
}

const DiscoverPageLayout = ({data}) => {
  const isMobile = useMedia(breakpoints.UserDevice.isMobile);
  const [show, setShow] = useState(false); 
  const [selected, setSelected] = useState(0);
  let history = useHistory();

  const handleClick = (i) => {
    history.push("/discover");
    setSelected(i)
  }
  
  return (
    <>
      <DiscoverMainDiv>

        {!isMobile ? <DiscoverSideBar/> : <DiscoverStickyPanel/>}
        <Switch>
          <Route exact path='/discover'>
            <DiscoverContentDiv>
              <DiscoverHeader isExpanded={true}>
                <Text>Discover</Text>
              </DiscoverHeader>
              <CategoryTabs tabs={tabs} isExpanded={true} openSideBar={show} selected={selected} handleClick={handleClick}/>
            </DiscoverContentDiv>
          </Route>
          <Route path='/discover/:id'>
              <FolderContainer>
                <FolderView isMobile={isMobile}/>
              </FolderContainer>
          </Route>
          
        </Switch>
      </DiscoverMainDiv>
    </>
  )
}
export default DiscoverPageLayout;