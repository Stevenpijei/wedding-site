import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import * as LSTVGlobals from '../../global/globals';
import { Flex, GenericContainer, ordinalSuffixOf, shortHandValue } from '../../utils/LSTVUtils';
import { schemeGreens } from 'd3-scale-chromatic';
import { scaleQuantile, scaleThreshold } from 'd3-scale';
import { isBrowser } from 'react-device-detect';
import { ComposableMap, Geographies, Geography, Marker, Annotation } from 'react-simple-maps';

import { geoCentroid } from 'd3-geo';
import LoadSpinner from '../Utility/LoadSpinner';
import ReactPlaceholder from 'react-placeholder';
import * as RestAPI from '../../rest-api/Call';
import USSCounties from '../../images/geomaps/us-counties.json';
import USStates from '../../images/geomaps/us-states.json';
import World from '../../images/geomaps/countries.json';

export const mapTypes = {
    US_STATES: 'us_states',
    US_COUNTY: 'us-county',
    WORLD: 'world',
};

export const datasetTypes = {
    US_STATE_EVENT_STORY_WEIGHT: 'us-state-es-weight',
    US_STATE_VENDOR_BASED_AT_WEIGHT: 'us-state-business-based-weight',
    US_STATE_VENDOR_WORKS_AT_WEIGHT: 'us-state-business-work-weight',

    US_COUNTY_EVENT_STORY_WEIGHT: 'us-county-es-weight',
    US_COUNTY_VENDOR_BASED_AT_WEIGHT: 'us-county-business-based-weight',
    US_COUNTY_VENDOR_WORKS_AT_WEIGHT: 'us-county--business-work-weight',

    WORLD_EVENT_STORY_WEIGHT: 'world-es-weight',
    WORLD_VENDOR_BASED_AT_WEIGHT: 'world-business-based-weight',
    WORLD_VENDOR_WORKS_AT_WEIGHT: 'world-business-work-weight',
};

const TitleBar = styled.div`
    width: 100%;
    height: 2.5rem;
    line-height: 2.5rem;
    font-size: 1.5rem;
    font-weight: ${LSTVGlobals.FONT_WEIGHT_BOLD};
    text-align: center;

    @media ${LSTVGlobals.UserDevice.isMobile} {
        font-size: 1rem;
        line-height: 1.5rem;
    }
`;

const defaultColorRange = schemeGreens[8];

export const StatsGeoMap = React.memo(
    (props) => {
        const [data, setData] = useState(undefined);

        useEffect(() => {
            RestAPI.call(
                'get',
                null,
                RestAPI.LSTV_API_V1.GET_STATS,
                (data) => {
                    setData(data.result);
                },
                (error) => {
                    //console.error("problem with test bed nav bar content fetching!")
                },
                (error) => {},
                {
                    type: props.dataset,
                    datasetConstraints: props.datasetConstraints,
                }
            );
        }, []);

        let colorScale;
        let legend;

        if (data) {
            let uniqueValues = data.map((d) => d.weight).filter((d, index, arr) => arr.indexOf(d) === index);

            if (uniqueValues.length <= defaultColorRange.length) {
                //console.log(uniqueValues.length);
                colorScale = scaleThreshold()
                    .domain(uniqueValues.filter((d) => d !== 0).reverse())
                    .range(props.colorRange || defaultColorRange);
            } else if (props.thresholds) {
                colorScale = scaleThreshold()
                    .domain(props.thresholds)
                    .range(props.colorRange || defaultColorRange);
            } else if (props.linearThreshold) {
                let ticks = Math.trunc(data[0].weight / (defaultColorRange.length - 1));

                colorScale = scaleThreshold()
                    .domain([1, ticks, ticks * 2, ticks * 3, ticks * 4, ticks * 5, ticks * 6])
                    .range(props.colorRange || defaultColorRange);
            } else {
                colorScale = scaleQuantile()
                    .domain(data.map((d) => d.weight))
                    .range(props.colorRange || defaultColorRange);
            }

            legend = colorScale.range().map((r, index) => {
                let lhs = Math.trunc(colorScale.invertExtent(r)[0])
                    ? shortHandValue(Math.trunc(colorScale.invertExtent(r)[0]))
                    : null;
                let rhs = Math.trunc(colorScale.invertExtent(r)[1])
                    ? shortHandValue(Math.trunc(colorScale.invertExtent(r)[1]))
                    : null;

                return rhs || lhs ? (
                    <GenericContainer
                        key={index}
                        flex={'1'}
                        display={'block'}
                        textAlign={'center'}
                        color={LSTVGlobals.TEXT_AND_SVG_BLACK}
                        fontSize={'0.6rem'}
                        fontWeight={LSTVGlobals.FONT_WEIGHT_SEMIBOLD}
                        lineHeight={'0.7rem'}
                        borderTop={`10px solid ${r}`}
                        margin={'0 5px 5px 5px'}
                    >
                        {lhs || (rhs > 1 ? 'below ' : '0')}
                        {lhs && rhs && ' - '}
                        {!lhs && rhs === 1 ? '' : rhs}
                        {!rhs && ' and above'}
                    </GenericContainer>
                ) : null;
            });
        }

        const offsets = {
            VT: [50, -8],
            NH: [34, 2],
            MA: [30, -1],
            RI: [28, 2],
            CT: [35, 10],
            NJ: [34, 1],
            DE: [33, 0],
            MD: [47, 10],
            DC: [49, 21],
        };

        const mapProperties = {
            [mapTypes.US_STATES]: {
                width: 900,
                height: 550,
                viewBox: '0 20 840 580',
                mapData: USStates,
                projection: 'geoAlbersUsa',
                strokeColor: '#666',
            },
            [mapTypes.WORLD]: {
                viewBox: '0 60 840 425',
                mapData: World,
                projection: 'geoEqualEarth',
                strokeColor: '#eeeeeeaa',
            },
            [mapTypes.US_COUNTY]: {
                width: 900,
                height: 550,
                viewBox: '0 50 800 550',
                mapData: USSCounties,
                projection: 'geoAlbersUsa',
                strokeColor: '#ddd',
            },
        };

        //console.log('render');

        return (
            <ReactPlaceholder
                ready={data}
                customPlaceholder={<LoadSpinner isVisible={true} color={LSTVGlobals.SECONDARY_CARD_TEXT_COLOR} />}
            >
                <GenericContainer backgroundImage={props.background} width={'100%'} height={'100%'}>
                    {props.showTitle && <TitleBar>{props.title}</TitleBar>}

                    <ComposableMap
                        data-tip=""
                        viewBox={mapProperties[props.mapType].viewBox}
                        projection={mapProperties[props.mapType].projection}
                    >
                        <filter x="0" y="0" width="1" height="1" id="solid">
                            <feFlood floodColor="black" />
                            <feComposite in="SourceGraphic" />
                        </filter>
                        <Geographies transform="translate(15,0)" geography={mapProperties[props.mapType].mapData}>
                            {({ geographies }) => (
                                <>
                                    {geographies.map((geo) => {
                                        let cur = data.find((s) => {
                                            if (props.mapType === mapTypes.US_COUNTY) {
                                                return s.code === geo.id;
                                            } else if (props.mapType === mapTypes.WORLD) {
                                                return s.code === geo.id;
                                            } else if (props.mapType === mapTypes.US_STATES) {
                                                return s.name === geo.properties.name;
                                            } else {
                                                return false;
                                            }
                                        });

                                        if (!cur && geo.properties.NAME_LONG === 'Somaliland') {
                                            cur = data.find((s) => s.name === 'Somalia');
                                        }

                                        let fillColor = cur ? colorScale(cur.weight) : '#EEE';
                                        let strokeColor = mapProperties[props.mapType].strokeColor;
                                        let strokeWidth = '0.5';

                                        if (
                                            cur &&
                                            cur.place === 1 &&
                                            cur.weight > 0 &&
                                            props.mapType === mapTypes.US_COUNTY
                                        ) {
                                            fillColor = LSTVGlobals.HEART_RED;
                                        }

                                        return cur ? (
                                            <Geography
                                                key={geo.rsmKey}
                                                stroke={strokeColor}
                                                strokeWidth={strokeWidth}
                                                geography={geo}
                                                fill={fillColor}
                                                onMouseEnter={
                                                    isBrowser
                                                        ? () => {
                                                              let place =
                                                                  cur.weight > 0
                                                                      ? `(${ordinalSuffixOf(cur.place)} place)`
                                                                      : ``;
                                                              let state = cur.state ? ` (${cur.state})` : ``;
                                                              props.setContent(
                                                                  `${cur.name}${state} - ${cur.weight || 'No'} ${
                                                                      props.measuredElement
                                                                  } ${place}`
                                                              );
                                                          }
                                                        : null
                                                }
                                                onMouseLeave={
                                                    isBrowser
                                                        ? () => {
                                                              props.setContent('');
                                                          }
                                                        : null
                                                }
                                                style={{
                                                    hover: {
                                                        fill: LSTVGlobals.PRIMARY_COLOR,
                                                        outline: 'none',
                                                    },
                                                }}
                                            />
                                        ) : null;
                                    })}

                                    {props.mapType === mapTypes.US_STATES &&
                                        geographies.map((geo) => {
                                            const centroid = geoCentroid(geo);
                                            const cur = data.find((s) => s.name === geo.properties.name);

                                            let textColor = LSTVGlobals.ABSOLUTE_WHITE;
                                            let textFontSize = '12';
                                            let textFontWeight = LSTVGlobals.FONT_WEIGHT_BOLD;

                                            if (cur && cur.place === 1 && cur.weight > 0) {
                                                textColor = LSTVGlobals.PRIMARY_COLOR;
                                                textFontWeight = LSTVGlobals.FONT_WEIGHT_BLACK;
                                            }
                                            3;
                                            return (
                                                <g key={geo.rsmKey + '-name'}>
                                                    {cur &&
                                                        centroid[0] > -160 &&
                                                        centroid[0] < -67 &&
                                                        (Object.keys(offsets).indexOf(cur.code) === -1 ? (
                                                            <Marker coordinates={centroid}>
                                                                <text
                                                                    pointerEvents={'none'}
                                                                    fill={textColor}
                                                                    filter="url(#solid)"
                                                                    x="9"
                                                                    y="3"
                                                                    fontSize={textFontSize}
                                                                    fontWeight={textFontWeight}
                                                                    textAnchor="middle"
                                                                >
                                                                    {cur.code}{' '}
                                                                    {props.showValuesOnMap &&
                                                                        '(' + shortHandValue(cur.weight) + ')'}
                                                                </text>
                                                            </Marker>
                                                        ) : (
                                                            <Annotation
                                                                subject={centroid}
                                                                dx={offsets[cur.code][0]}
                                                                dy={offsets[cur.code][1]}
                                                            >
                                                                <text
                                                                    x={'4'}
                                                                    pointerEvents={'none'}
                                                                    fill={
                                                                        cur && cur.place === 1 && cur.weight > 0
                                                                            ? LSTVGlobals.PRIMARY_COLOR
                                                                            : LSTVGlobals.BLACK
                                                                    }
                                                                    fontSize={textFontSize}
                                                                    fontWeight={textFontWeight}
                                                                    alignmentBaseline="middle"
                                                                >
                                                                    {cur.code}{' '}
                                                                    {props.showValuesOnMap &&
                                                                        '(' + shortHandValue(cur.weight) + ')'}
                                                                </text>
                                                            </Annotation>
                                                        ))}
                                                </g>
                                            );
                                        })}
                                </>
                            )}
                        </Geographies>
                    </ComposableMap>
                    {props.showLegend && (
                        <Flex flexWrap={'wrap'} alignItems="stretch" width={'100%'}>
                            {legend}
                        </Flex>
                    )}
                </GenericContainer>
            </ReactPlaceholder>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.title === nextProps.title;
    }
);

StatsGeoMap.defaultProps = {
    showLegend: true,
    showValuesOnMap: true,
    background: '#eeeeee',
    showTitle: true,
    colorRange: null,
    thresholds: null,
    linearThreshold: false,
};
