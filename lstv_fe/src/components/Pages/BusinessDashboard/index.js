import React from 'react'
import styled from 'styled-components'
import Menu from './Menu'
import Main from './Main'
import theme from '../../../styledComponentsTheme'

const DesktopOnlyContainer = styled.div`
    @media ${theme.breakpoints.laptop} {
        display: none;
    }
`

const DesktopOnlyExperience = () =>
    <DesktopOnlyContainer>
        <h4 style={{
            textAlign: 'center',
            margin: '100px 30px',
        }}>
            Please revisit the dashboard from a large tablet or computer.
        </h4>
    </DesktopOnlyContainer>


const Container = styled.div`    
    display: none;

    @media ${theme.breakpoints.laptop} {
        display: flex;
    }
`

const Dashboard = () => {
    return (
        <>
            <Container>
                <Menu />
                <Main />
            </Container>
            <DesktopOnlyExperience />
        </>
    )
}

export default Dashboard;