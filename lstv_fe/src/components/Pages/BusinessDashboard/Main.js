import React from 'react';
import styled from 'styled-components';
import { Route } from 'react-router';
import VideoUploadContainer from './VideoUploadContainer';
import BusinessInfo from './BusinessInfo';
import Videos from './Videos';

const Container = styled.div`
    flex: 1;
`;

const Main = () => {
    return (
        <Container>
            <Route path="/dashboard/info" exact component={BusinessInfo} />
            <Route path="/dashboard/videos" exact component={Videos} />
            <Route path="/dashboard/upload-video" exact component={VideoUploadContainer} />
            {/* <Route path="/dashboard/photos" exact component={() => <div>photos</div>} />
            <Route path="/dashboard/team" exact component={() => <div>team</div>} /> */}
        </Container>
    );
};

export default Main;
