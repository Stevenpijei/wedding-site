import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import styled from 'styled-components'
import theme from '../styledComponentsTheme';
import SearchRefinementForm from '/components/Forms/SearchRefinementForm'
import { FONT_WEIGHT_BLACK } from '/global/globals'
import { useMediaReady } from '/utils/LSTVUtils';

const Container = styled.div`
    display: flex;
    flex-direction: column-reverse;

    @media ${theme.breakpoints.tablet} {        
        flex-direction: column;
    }

    @media ${theme.breakpoints.laptop} {
        justify-content: space-between;
        flex-direction: row;
        align-items: center;
    }
`

interface Props {
  count: number,
  defaultType?: string[],
  style?: React.CSSProperties
}

const GridResultsTItle = ({ count, defaultType, style }: Props) => {
  const [isMobile] = useMediaReady(theme.breakpoints.isMobile)
  const [isTablet] = useMediaReady(theme.breakpoints.isTablet)

  // https://app.clubhouse.io/lovestoriestv/story/10/updated-search-experience
  // Remove 'search filter' bar for the wedding videos page because it currently makes the user
  // feel like they can filter videos. https://lstvtest.com/wedding-videos
  const location = useLocation()
  const [hideSearch, setHideSearch] = useState(false)
  useEffect(() => {
    if(location.pathname === '/wedding-videos') setHideSearch(true)
  }, [location])

  const titleStr = count > 0 ? `${count.toLocaleString('en-US', { maximumFractionDigits: 2 })} Results` : "";
  let title = isMobile ? 
        <h5 style={{ margin: '20px 0' }}>{ titleStr }</h5> :
        <h4 style={{
            marginBottom: isTablet ? 12 : 0,
            // don't know why this is non-standard type
            fontSize: 32,
            fontWeight: FONT_WEIGHT_BLACK
        }}>
            { titleStr }
        </h4>

  return (
    <Container style={style}>
        { title }
        { !hideSearch && <SearchRefinementForm defaultTypeValue={defaultType} /> }
    </Container>
  )
}

export default GridResultsTItle