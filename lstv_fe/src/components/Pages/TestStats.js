import React, {useState} from "react";
import styled, {css} from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import {Helmet} from "react-helmet";
import Header from "../Header";
import PageContent from "./PageContent";
import {StatsGeoMap, datasetTypes, mapTypes} from "./StatsGeoMap";
import ReactTooltip from "react-tooltip";

const StatGrid = styled.div`
    display: grid;
    grid-gap: 15px;
    grid-template-columns:  1fr 1fr;
    ${props => props.single && css`
         grid-template-columns:  1fr;
    `}
    padding: 10px;
    
    @media ${LSTVGlobals.UserDevice.isMobile} {
     grid-template-columns:  1fr;
    }
`;

const StatGridItem = styled.div`
    min-height: 300px;
    position: relative;
`;

export const TestStats = () => {
    const [content, setContent] = useState(undefined);

    return (

        <>

            <Helmet>
                <meta charSet="utf-8" />
                <title>LSTV U.S./World Stats</title>
            </Helmet>
            <PageContent>
                <StatGrid single={true}>
                    <StatGridItem>
                        <StatsGeoMap
                            title="Number of Event Stories In U.S. Counties"
                            mapType={mapTypes.US_COUNTY}
                            dataset={datasetTypes.US_COUNTY_EVENT_STORY_WEIGHT}
                            measuredElement={'Event Stories From Here'}
                            thresholds={[1, 5, 10, 20, 40, 80, 160, 300]}
                            setContent={setContent}
                        />
                    </StatGridItem>
                </StatGrid>

                <StatGrid>
                    <StatGridItem>
                        <StatsGeoMap
                            title="Where Has NST Pictures Worked"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_VENDOR_WORKS_AT_WEIGHT}
                            datasetConstraints={{ business_slugs: 'nst-pictures' }}
                            measuredElement={'event stories by NST Pictures'}
                            linearThreshold={true}
                            showLegend={true}
                            showTitle={true}
                            showValuesOnMap={false}
                            setContent={setContent}
                        />
                    </StatGridItem>

                    <StatGridItem>
                        <StatsGeoMap
                            title="Number of Event Stories (formerly: Video Posts)"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_EVENT_STORY_WEIGHT}
                            measuredElement={'event stories from here'}
                            setContent={setContent}
                        />
                    </StatGridItem>

                    <StatGridItem>
                        <StatsGeoMap
                            title="Number of Businesses Based here"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_VENDOR_BASED_AT_WEIGHT}
                            measuredElement={'businesses based here'}
                            setContent={setContent}
                        />
                    </StatGridItem>

                    <StatGridItem>
                        <StatsGeoMap
                            title="Number of Unique Businesses Who Worked Here"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_VENDOR_WORKS_AT_WEIGHT}
                            measuredElement={'businesses worked here'}
                            setContent={setContent}
                        />
                    </StatGridItem>

                    <StatGridItem>
                        <StatsGeoMap
                            title="Where Do we Have Guest Accommodation Businesses?"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_VENDOR_WORKS_AT_WEIGHT}
                            datasetConstraints={{ business_types: 'guest-accommodations' }}
                            measuredElement={'Guest accommodation providers who worked here'}
                            setContent={setContent}
                        />
                    </StatGridItem>

                    <StatGridItem>
                        <StatsGeoMap
                            title="Where Do We have Jewish Weddings?"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_EVENT_STORY_WEIGHT}
                            datasetConstraints={{ vibe_slugs: 'jewish' }}
                            measuredElement={'Jewish Weddings'}
                            linearThreshold={true}
                            setContent={setContent}
                        />
                    </StatGridItem>

                    <StatGridItem>
                        <StatsGeoMap
                            title="Where Is Bohemian Style Popular?"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_EVENT_STORY_WEIGHT}
                            datasetConstraints={{ vibe_slugs: 'bohemian' }}
                            measuredElement={'Bohemian  Weddings'}
                            setContent={setContent}
                        />
                    </StatGridItem>

                    <StatGridItem>
                        <StatsGeoMap
                            title="Where Is Black-Tie Style Popular?"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_EVENT_STORY_WEIGHT}
                            datasetConstraints={{ vibe_slugs: 'wedding-style-black-tie' }}
                            measuredElement={'Black Tie Weddings'}
                            setContent={setContent}
                        />
                    </StatGridItem>

                    <StatGridItem>
                        <StatsGeoMap
                            title="Where are Same-Sex-Weddings Popular?"
                            mapType={mapTypes.US_STATES}
                            dataset={datasetTypes.US_STATE_EVENT_STORY_WEIGHT}
                            datasetConstraints={{ vibe_slugs: 'gay,lesbian' }}
                            measuredElement={'Same-Sex Weddings In the state'}
                            linearThreshold={true}
                            setContent={setContent}
                        />
                    </StatGridItem>
                </StatGrid>

                <StatGrid single={true}>
                    <StatGridItem>
                        (
                        <StatsGeoMap
                            title="Number of Event Stories Worldwide"
                            mapType={mapTypes.WORLD}
                            dataset={datasetTypes.WORLD_EVENT_STORY_WEIGHT}
                            datasetConstraints={'guest-accommodations'}
                            measuredElement={'Event Stories From Here'}
                            thresholds={[1, 10, 25, 50, 100, 500, 1000, 5000]}
                            setContent={setContent}
                        />
                    </StatGridItem>
                </StatGrid>
            </PageContent>
            <ReactTooltip>{content}</ReactTooltip>
        </>
    );
};

