import PropTypes from 'prop-types';
import React, { useState } from 'react';
import theme from '../../../styledComponentsTheme';
import { Articles, Styles, VendorsByLocation, VideosByLocation } from './Grids';
import GridResultsTitle from '/components/GridResultsTitle';
import { SectionSeperator } from '/components/Pages/VideoPage/LayoutComps';
import { useMediaReady } from '/utils/LSTVUtils';

// TODO: would be nice to change props to camelCase but beware
// how role_ props are used in search object in ContentGrid
const Results = ({ content_type, location, onData, role_types, role_capacity_types }) => {
    const [count, setCount] = useState(0)
    const [isMobile] = useMediaReady(theme.breakpoints.isMobile, false)

    const handleDataReady = (data) => {
       if(data?.scope?.total) {
            setCount(data.scope.total)
            onData && onData(data)
       }
    }
  
    let grid
    switch (content_type) {
        // AK: what is the point of passing in isMobile = false here?
        // you don't know what size the viewport's gonna be ...
        case 'style':
            grid = <Styles isMobile={false} onData={handleDataReady} />
            break
        case 'business':
            grid = (
                <VendorsByLocation
                    isMobile={false}
                    location={location}
                    role_types={role_types}
                    role_capacity_types={role_capacity_types}
                    onData={handleDataReady}
                />
            )
            break
        case 'video':
            grid = <VideosByLocation isMobile={false} location={location} onData={handleDataReady} />
            break
        case 'article':
            grid = <Articles isMobile={false} onData={handleDataReady} />
            break
        default:
            console.warn('You need to add your grid type to the Results.js file')
    }

    return (
        <div style={{ padding: '20px' }}>
            <GridResultsTitle count={count} defaultType={role_types} />
            { !isMobile &&
                <SectionSeperator
                    style={{
                        margin: '20px 0 27px',
                        width: '100%'
                    }}
                />
            }
            { grid }
        </div>
    )
}

Results.propTypes = {
    role_types: PropTypes.array,
    role_capacity_types: PropTypes.array,
    content_type: PropTypes.oneOf(['style', 'business', 'video', 'article']),
    location: PropTypes.string,
    onData: PropTypes.func,
}

export default Results
