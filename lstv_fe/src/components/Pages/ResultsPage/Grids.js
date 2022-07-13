import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import theme from '../../../styledComponentsTheme';
import { useMediaReady } from '/utils/LSTVUtils';
import ContentGrid from '../../Content/ContentGrid';
import Header from '../DirectoryPage/Header';
import { SectionSeperator } from '../VideoPage/LayoutComps';
import GridResultsTitle from '/components/GridResultsTitle';
import {
    CONTENT_CARD_VERBOSITY_LEVEL_SLUG, CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT, CONTENT_GRID_CONTENT_TYPE_BUSINESS
} from '/global/globals';
import { OutlinedCTAButton } from '/newComponents/common/OutlinedCTALink';
import { useSearch } from '/newComponents/Search/use-search';

const { tablet, isMobile } = theme.breakpoints

const Container = styled.div`    
    min-height: 300px;

    @media ${tablet} {
        padding: 24px;
    }

    @media ${isMobile} {
        .lstvLinkNoStyle {
            display: block;
            margin: 0 0 16px;
        }
    }
`;

const Content = styled.div`
    padding: 24px;

    @media ${tablet} {
        padding: 24px 0;
    }
`

const LoadMoreContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding-top: 50px;
`;

const GridContainer = styled.div`
    display: ${(props) => (props.isHidden ? 'none' : 'block')};
`;

export const VendorsByLocation = ({ name, locationUrl, locationName, role_types, role_capacity_types }) => {
    const size = 20
    const { roleDirectories, directories } = useSearch()
    const [offset, setOffset] = useState(0)
    const [total, setTotal] = useState(0)
    const [directory, setDirectory] = useState()

    // AK: i don't know how/why the isMobile prop is being used. I don't *think* it even works ...
    const [isActualMobile] = useMediaReady(theme.breakpoints.isMobile, false)
    const [isTablet] = useMediaReady(theme.breakpoints.isTablet, false)

    const locationSansUSA = locationName?.replace(', USA', '')
    const locationStr = locationName ? `serving ${locationSansUSA}` : ''
    let description = ''
    if(directory) {
        description = directory.description_location ?
            directory.description_location.replace('{location}', locationSansUSA) :
            directory.description
    }
    
    const gridTemplateColumns = isActualMobile ? '1fr' : isTablet ?  '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr'  

    useEffect(() => {
        if(role_types) {
            let dir
            // a search term that's a known categoruy could come from either global nav (directores)
            // or our search filtering dropdown (roleDirectories)
            if(directories?.length) {
                dir = directories.find(d => isEqual(d.role_types, role_types))
                if(dir) setDirectory(dir)
            }

            if(!dir && roleDirectories?.length) {
                dir = roleDirectories.find(r => isEqual(r.role_types, role_types))
                if(dir) setDirectory(dir)
            }
        }
    }, [directories, roleDirectories, role_types])

    // AK: i can't figure out why this was here ...
    // Pay attn to any odd behavior here when we QA.
    // useEffect(() => {
    //     setTotal(0);
    // }, [role_types, role_capacity_types, locationUrl]);

    const handleDataReady = (data) => {
        if (data?.scope?.total) {
            setTotal(data.scope.total);
        }
    };

    const loadMore = () => {
        setOffset(offset + 20);
    };

    const grids = [];
    for (let i = 0; i <= offset; i = i + size) {
        grids.push(
            <div style={{ marginBottom: 15 }} key={i}>
                <ContentGrid                    
                    onDataReady={handleDataReady}
                    contentType={CONTENT_GRID_CONTENT_TYPE_BUSINESS}
                    limitToBusinessRoles={role_capacity_types && role_types.length > 0 ? role_types.join(',') : null}
                    limitToBusinessRoleCapacity={
                        role_capacity_types && role_capacity_types.length > 0 ? role_capacity_types.join(',') : null
                    }
                    contentSortMethod={CONTENT_GRID_CONTENT_SORT_METHOD_WEIGHT}
                    gridTemplateColumns={gridTemplateColumns}
                    containerMode="grid"
                    offset={i}
                    size={size}
                    verboisty={CONTENT_CARD_VERBOSITY_LEVEL_SLUG}
                    limitToLocations={locationUrl ? locationUrl : null}
                />
            </div>
        );
    }

    return (
        <Container>
            { directory && 
                <>
                    <Header
                        title={`${name} ${locationStr}`}
                        description={description}
                        bg_color={directory.bg_color}
                    />
                    { isActualMobile &&
                        <SectionSeperator style={{ margin: '0 0 0px', width: '100%' }} />
                    }
                </>
            }
            <Content>                
                <GridResultsTitle count={total} defaultType={role_types} />
                { !isActualMobile &&
                    <SectionSeperator style={{ margin: '20px 0', width: '100%' }} />
                }            
                <GridContainer>{ grids }</GridContainer>                
                { (total !== 0 && total > offset + 20) &&
                    <LoadMoreContainer>
                        <OutlinedCTAButton onClick={loadMore}>Load More</OutlinedCTAButton>
                    </LoadMoreContainer>
                }
            </Content>
        </Container>
    );
};

VendorsByLocation.propTypes = {
    role_types: PropTypes.array,
    role_capacity_types: PropTypes.array,
    name: PropTypes.string,    
    locationName: PropTypes.string,
    locationUrl: PropTypes.string,
};