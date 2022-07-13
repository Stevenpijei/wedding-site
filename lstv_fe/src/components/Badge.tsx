import React, { CSSProperties } from 'react'
import styled from 'styled-components'
import theme from '../styledComponentsTheme'

const Container = styled.div`
  width: 23px;
  height: 23px;
  border-radius: 50%;
  background-color: ${theme.primaryPurple};
  display: flex;
  align-items: center;
  justify-content: center;
`

// obviously add ids as we build out this component
type Ids = 'avatar' | 'arrowRight' | 'upload'

/**
 * Purple circle component with a white icon centered inside.
 * Matches nomenclature as used by Oliviar in ZeroHeight.
 */
const Badge = ({ id, style }: { id: Ids, style?: CSSProperties }) => {
  let icon

  switch(id) {
    case 'avatar':
      icon = 
        <svg width="9" height="9" viewBox="0 0 23 23">
          <path fill="white" stroke="white" strokeWidth="2" fillRule="evenodd" clipRule="evenodd" d="M22,20.5c-1-2-2.6-3.6-4.4-4.8c-0.6-0.4-1.2-0.7-1.8-0.9c2-1.4,3.3-3.7,3.3-6.3c0-4.2-3.4-7.6-7.6-7.6
            c-4.2,0-7.6,3.4-7.6,7.6c0,2.6,1.3,4.9,3.3,6.3C6.6,15,6,15.3,5.4,15.7c-1.8,1.2-3.4,2.8-4.4,4.8C0.7,21,0.9,21.7,1.5,22
            C2,22.3,2.7,22.1,3,21.5c0.9-1.7,2.1-3,3.6-4c1.5-0.9,3.2-1.4,4.9-1.4c1.7,0,3.4,0.5,4.9,1.4c1.5,0.9,2.8,2.3,3.6,4
            c0.3,0.5,0.9,0.7,1.5,0.5C22.1,21.7,22.3,21,22,20.5z M11.5,3.1c3,0,5.4,2.4,5.4,5.4c0,3-2.4,5.4-5.4,5.4c-3,0-5.4-2.4-5.4-5.4
            C6.1,5.5,8.5,3.1,11.5,3.1z"/>
        </svg>
      break
    case 'arrowRight':
      icon = 
        <svg width="9" height="9" viewBox="0 0 13 13" fill="none">
          <path fill="white" fillRule="evenodd" clipRule="evenodd" d="M7.81939 1.43697C7.44814 1.07536 6.84621 1.07536 6.47496 1.43697C6.10371 1.79858 6.10371 2.38486 6.47496 2.74647L9.37811 5.57418L1.32706 5.57418C0.802028 5.57418 0.376407 5.98875 0.376407 6.50014C0.376406 7.01153 0.802029 7.4261 1.32706 7.4261L9.37754 7.4261L6.47496 10.2533C6.10371 10.6149 6.10371 11.2012 6.47496 11.5628C6.84622 11.9244 7.44814 11.9244 7.81939 11.5628L12.3451 7.15462C12.7164 6.79301 12.7164 6.20673 12.3451 5.84512L7.81939 1.43697Z" />
        </svg>
      break
    case 'upload':
      icon = 
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M4.60258 20C2.06099 20 0 17.9917 0 15.5153L0 10.9072C0 8.43001 2.06081 6.42155 4.60258 6.42155H5.50749C6.07554 6.42155 6.53604 6.87035 6.53604 7.42397C6.53604 7.9776 6.07554 8.4264 5.50749 8.4264H4.60258C3.19692 8.4264 2.05711 9.53725 2.05711 10.9072V15.5153C2.05711 16.8841 3.19674 17.9951 4.60258 17.9951H15.3974C16.8033 17.9951 17.9429 16.8841 17.9429 15.5153V10.8978C17.9429 9.53312 16.8076 8.4264 15.4081 8.4264L14.4935 8.4264C13.9254 8.4264 13.4649 7.9776 13.4649 7.42397C13.4649 6.87035 13.9254 6.42155 14.4935 6.42155L15.4081 6.42155C17.9444 6.42155 20 8.42658 20 10.8978V15.5153C20 17.9917 17.939 20 15.3974 20H4.60258Z" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M9.99926 13.3871C9.4312 13.3871 8.9707 12.9383 8.9707 12.3847V1.003C8.9707 0.449375 9.4312 0.000574112 9.99926 0.000574112C10.5673 0.000574112 11.0278 0.449375 11.0278 1.003V12.3847C11.0278 12.9383 10.5673 13.3871 9.99926 13.3871Z" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.44838 4.48049C6.04582 4.08989 6.04437 3.45519 6.44515 3.06285L9.27237 0.29517C9.46537 0.106235 9.72764 1.09673e-05 10.0012 -1.19209e-05C10.2747 -3.48091e-05 10.537 0.106145 10.7301 0.295049L13.5583 3.06273C13.9591 3.45501 13.9578 4.08971 13.5553 4.48037C13.1528 4.87104 12.5015 4.86974 12.1007 4.47746L10.0014 2.4231L7.90298 4.47734C7.5022 4.86968 6.85095 4.87109 6.44838 4.48049Z" fill="white"/>
      </svg>
  }

  return <Container style={style}>{ icon }</Container>
}

export default Badge
