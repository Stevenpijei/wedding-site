import styled from 'styled-components';
import { SimpleCardGrid } from '../components/Pages/VideoPage/LayoutComps';
import theme from '../styledComponentsTheme';

export const Container = styled.div`
    position: relative;
    margin-bottom: 40px;
`

export const MorePhotos = styled.button`
    box-sizing: border-box;
    position: absolute;
    bottom: 24px;
    right: 24px;
    outline: none;
    background: ${theme.primaryPurple};
    padding: 8px;
    width: 126px;
    height: 37px;
    font-weight: 500;
    cursor: pointer;
    font-family: Calibre;
    color: white;
    border-radius: 100px;
`
export const MobilePhotoRow = styled(SimpleCardGrid)`
    margin: 0px -20px 30px -5px;
    max-height: calc(50vh + 20px);
    padding: 0px;
    overflow-y: hidden;
    flex-wrap: nowrap;
    overflow-x: auto;
    div {
        height: 30vh;
        flex-grow: 1;
        margin: 5px;
    }
`
export const Counter = styled.span`
    font-family: Calibre;
    font-weight: 500;
    font-size: 0.937rem;
    line-height: 1.125rem;
    text-align: center;
    border-radius: 4px;
    padding: 4px 5px;
    min-width: 32px;
    background-color: black;
    color: white;
    position: absolute;
    bottom: 12px;
    right: 20px;
`;

export const GalleryImage = styled.img`
    height: 100%;
    border-radius: 4px;
    margin: 5px 15px 5px 0px;
`