import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { useMediaReady } from '../../../utils/LSTVUtils';
import Header from './Header';
import Results from './Results';
import { SectionSeperator } from '/components/Pages/VideoPage/LayoutComps';
import { UserDevice } from '/global/globals';
import { useQueryParams } from '/newComponents/Search/useQueryParams';

const HeaderContainer = styled.div`
    @media ${UserDevice.tablet} {
        padding: 20px 20px 5px 20px;
    }
`

const DirectoryPage = ({ directory }) => {
    const { name, subtitle_name_plural, description, bg_color, content_type, role_types, role_capacity_types } = directory;
    const [location] = useQueryParams();
    const [isMobile] = useMediaReady(UserDevice.isMobile, false)

    return (
        <div>
            <HeaderContainer>
                <Header
                    title={subtitle_name_plural || name}
                    description={description}
                    bg_color={bg_color}
                    location={location}
                />
                { isMobile &&
                    <SectionSeperator style={{ margin: '0px 0' }} />
                }
            </HeaderContainer>
            <Results
                title={subtitle_name_plural || name}
                content_type={content_type}
                role_types={role_types}
                role_capacity_types={role_capacity_types}
            />
        </div>
    );
};

DirectoryPage.propTypes = {
    directory: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,  
    }).isRequired,
};

export default DirectoryPage;