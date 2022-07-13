import React, { useState } from 'react'
import styled from 'styled-components'
import StaticPageLayout from '../StaticPageLayout'
import FaqMenuBar from './FaqMenuBar'
import FaqQuestions from './FaqQuestions'
import faqs from './content'
import theme from '../../../../styledComponentsTheme'

const Content = styled.div`
    display: flex;
    flex-direction: column;

    @media ${theme.breakpoints.laptop} {
        flex-direction: row;
        margin-top: 30px;
    }
`

const Faq = () => {
    const [selected, setSelected] = useState(faqs[0].id)
    return (
        <StaticPageLayout wideContent headerText='Frequently Asked Questions'>
            <Content>
                <FaqMenuBar faqs={faqs} selected={selected} onChange={id => setSelected(id)} />
                <FaqQuestions faqs={faqs} selected={selected} />
            </Content>
        </StaticPageLayout>
    )
}

export default Faq
