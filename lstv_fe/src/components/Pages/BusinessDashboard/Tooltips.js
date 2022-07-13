import React from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    justify-content: flex-start;
    background-color: ${theme.primaryPurple};

    p {
        font-size: 1rem;
        font-weight: 500;
        max-width: 175px;
        margin-bottom: 6px;
    }
`;

const ToolTip = ({ children, ...props }) => (
    <ReactTooltip
        {...props}
        delayShow={1000}
        backgroundColor={theme.primaryPurple}
        arrowColor={theme.primaryPurple}
    >
        <Container>{ children }</Container>
    </ReactTooltip>
);

export const ReorderTip = () =>
    <ToolTip id="reorderIcon" place="left">
        <p>Activate/Deactivate ordering of videos</p>
    </ToolTip>

export const VisibilityTip = () =>
    <ToolTip id="visibilityIcon" place="left">
        <p>Change video visibility</p>
    </ToolTip>

export const DeleteTip = () =>
    <ToolTip id="deleteIcon" place="left">
        <p>Delete video file</p>
    </ToolTip>

export const DragTip = () =>
    <ToolTip id="dragIcon" place="right">
        <p>Drag up and down for video position</p>
    </ToolTip>
