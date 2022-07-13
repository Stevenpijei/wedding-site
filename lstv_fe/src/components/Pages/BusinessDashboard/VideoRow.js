import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme';
import LSTVLink from '../../Utility/LSTVLink';
import { DeleteIcon, EditIcon, HamburgerIcon, ReorderIcon } from '../../Utility/LSTVSVG';
import { DeleteTip, DragTip, ReorderTip, VisibilityTip } from './Tooltips';

const Container = styled.div`
    display: flex;
    position: relative;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 20px;
    background-color: ${props => props.featured ? "rgba(153,128,253,0.2)" : theme.lightGrey};
    border: 1px solid  ${props => props.pinned ? theme.primaryPurple: theme.midGrey};
    margin-bottom: 10px;
    border-radius: 10px;
`

const Left = styled.div`
    flex-basis: 15%;    
    justify-content: center;
    display: flex;
    margin-right: 5px;
`

const Thumbnail = styled.img`
    height: 51px;
    width: 91px;
    border-radius: 7px;
`

const Title = styled.p`
    flex-basis: 50%;
    margin-right: 5px;
`

const Status = styled.p`
    flex-basis: 15%;
    text-transform: capitalize;
`

const Upload = styled.p`
    flex-grow: 1;
    text-align: left;
`

const Menu = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-grow: 1;
`

const IconCont = styled.div`
    cursor: pointer;
    height: 40px;
    width: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const HamCont = styled.div`
    cursor: pointer;
    width: 20px;
    margin: 0px 15px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const TitleContainer = styled(Container)`
    margin: 10px 0;
    background-color: unset;
    border: none;
    height: 56px;

    * {
        font-weight: 500;
        text-align: left;
    }   
`

export const ColumnHeaders = () =>
    <TitleContainer>
        <Left></Left>
        <Title>Title</Title>
        <Status>Visibility</Status>
        <Upload>Added</Upload>
    </TitleContainer>

export const VideoRow = ({ video, onMenuClick, onReorderClick, pinned, featured, reorderable }) => {
    const { id, video_id, video_type, draft, visibility, title, uploaded_at, thumbnail_url, link } = video;
    const [hover, setHover] = useState(false);

    const status = draft ? 'draft' : visibility
    const videoUrl = link && `/${link.split('/')[link.split('/').length - 1]}`
    let uploadStatus

    if(pinned) {
        if(featured) {
            uploadStatus = 'Featured Video'
        } else {
            uploadStatus = 'Custom Order'
        }
    } else {
        uploadStatus = dayjs(uploaded_at).format('MM/DD/YYYY  h:mmA')
    }
    
    useEffect(() => {
        if(hover) ReactTooltip.rebuild();
    }, [hover]);

    const handleDelete = () => {
        onMenuClick(id, 'delete', { video_type })
        ReactTooltip.hide()
    }
    
    const handleEdit = () => {
        onMenuClick(id, 'edit')
    }
    
    const handleReorder = () => {
        onReorderClick(video_id, pinned, status)
        ReactTooltip.hide()
    }

    return (
        <>
            <ReorderTip />
            <VisibilityTip />
            <DeleteTip />
            <DragTip />
            <Container
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                pinned={pinned}
                featured={featured}            
            >
                <Left>
                    {pinned && <HamCont data-tip data-for='dragIcon'><HamburgerIcon /></HamCont> }
                    <Thumbnail src={thumbnail_url} />
                </Left>
                <Title>
                    {/* temporary workaround for the presence of promo vids which have no link */}
                    { videoUrl ?
                        <LSTVLink noStyle to={videoUrl}>
                            { title }
                        </LSTVLink> : 
                        <>{ title }</>
                    }                
                </Title>
                { hover ?
                    <Menu>
                        { reorderable &&
                            <IconCont data-tip data-for='reorderIcon' onClick={handleReorder}>
                                <ReorderIcon color={theme.black}/>
                            </IconCont>
                        }
                        <IconCont onClick={handleEdit}>
                            <EditIcon fillColor={theme.black} />
                        </IconCont>
                        <IconCont data-tip data-for='deleteIcon' onClick={handleDelete}>
                            <DeleteIcon fillColor={theme.black} />
                        </IconCont>
                    </Menu> :
                    <> 
                        <Status>{status}</Status>
                        <Upload>{uploadStatus}</Upload>
                    </>
                }
            </Container>
        </>
    )
}
