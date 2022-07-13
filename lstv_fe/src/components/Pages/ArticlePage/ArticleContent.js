import React from 'react';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme'

const MainDiv = styled.div`
    font-family: 'Calibre';
    margin: 64px auto 0 auto;
    font-weight: 400;
    font-size: 1.125rem;
    padding: 0 16px;
    line-height: 1.5rem

    b,
    h1,h2,
    h3,
    h4, h5, h6 {
        margin: 16px 0;
        font-family: 'Heldane';
        font-weight: 700;
        font-size: 2rem;
        line-height: 2.375rem
        /* color: ${theme.primaryPurple}; */
    }

    ul {
        display: block;
        list-style-type: disc;
        margin-block-start: 1em;
        margin-block-end: 1em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        padding-inline-start: 40px;
    }

    .lstv-post-img-div {
        margin-top: 10px;
        text-align: center;
        text-justify: left;
        width: 100%;

        img {
            box-shadow: 0 4px 10px -2px #000;
            border-radius: 5px 5px 5px 5px;
            width: 50%;
            margin-right: 25%;
            margin-left: 25%;

            @media ${theme.breakpoints.isMobile} {
                width: 90%;
                margin-right: 5%;
                margin-left: 5%;
            }
        }
    }
`;

const ArticleContent = ({content}) => {
    
// 
    const contents = content.map(({ content }) => content).join('');
    

    let contentUnescaped = unescape(contents)
    const replaced = contentUnescaped.replace(/(?:\\r\\n|\\r|\/n)/g, '<br>');
    const replacedImages = replaced.replace(/(?:\\")/g, '');
    // console.log(unescape(contents))

    return (
        <>
        <MainDiv  dangerouslySetInnerHTML={{ __html: replacedImages }} />
        {/* {text.split("\n").map((value, index) => (
          <Fragment key={index}>
            {value}
            <br />
          </Fragment>
        ));
        const printableText = text.replace(/(?:\r\n|\r|\n)/g, "<br />");

const dangerousText = { __html: printableText };
    } */}
        {/* {content.map((cont, index) => (<p key={index} dangerouslySetInnerHTML={{ __html: unescape(cont.content).replace(/(?:\r\n|\r|\n)/g, "<br />") }}></p>))}        
        <MainDiv  /> */}
        </>
    )
    
}

export default ArticleContent
