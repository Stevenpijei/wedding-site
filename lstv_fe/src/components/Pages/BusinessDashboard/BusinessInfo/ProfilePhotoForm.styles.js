import styled from 'styled-components';
import theme from '../../../../styledComponentsTheme';

export const Content = styled.div`
    display: flex;
    flex-direction: row;
    /* max-width: 500px; */
    margin-bottom: 50px;
    justify-content: space-between;
`

export const H3 = styled.h3`
    font-family: 'Calibre';
    font-size: 1.312rem;
    line-height: 1.5rem;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
`;

export const PreviewCont = styled.div`
    display: flex;
    justify-content: space-between;
    text-align: left;
    
`
export const PlaceHolder = styled.div`
     height: 80px;
    width: 80px;
    border-radius: 100%;
    margin: auto;
    background-color: ${theme.darkerGrey};
`

export const PreviewRight = styled.div`
    /* display: flex; */
    background-color: ${theme.lightGrey};
    min-width: 300px;
    padding: 30px;
    text-align: center;
    height: 200px;
    margin-left: 30px;
    border-radius: 10px;
    
`
export const PreviewRightCard = styled.div`
    /* display: flex; */
    background-color: ${theme.lightGrey};
    min-width: 250px;
    padding: 30px;
    /* text-align: center; */
    height: 400px;
    margin-left: 30px;
    border-radius: 10px;
`
export const CardCont = styled.div`
    /* display: flex; */
    
    height: 300px;
   width: 300px;
`