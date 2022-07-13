import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { VideoRow } from './VideoRow';

const VideoList = React.memo(function VideoList({ videos, onMenuClick, onReorderClick }) {
    return videos.map((video, index) => (
        <Draggable draggableId={video.video_id} index={index} key={video.video_id}>
            {(provided) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <VideoRow
                        pinned
                        reorderable
                        key={video.id}
                        index={index}
                        video={video}
                        onMenuClick={onMenuClick}
                        onReorderClick={onReorderClick}                        
                        featured={index === 0}
                    />
                </div>
            )}
        </Draggable>
    ));
});

const PinnedVideos = ({ pinnedVideos, onMenuClick, onReorderClick, onDragEnd }) => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        <VideoList videos={pinnedVideos} onMenuClick={onMenuClick} onReorderClick={onReorderClick} />
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default PinnedVideos;
