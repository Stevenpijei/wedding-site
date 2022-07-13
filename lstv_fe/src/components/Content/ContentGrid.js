import React, { useState, useEffect } from 'react';
import * as LSTVGlobals from '../../global/globals';
import styled from 'styled-components';
import { BeatLoader } from 'react-spinners';

import CardGrid from './Cards/CardGrid';
import { withRouter } from 'react-router';
import { usePublicContentService } from '../../rest-api/hooks/usePublicContentService';

const LoaderContainer = styled.div`
    margin: 16px 0 0 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

// Brandon: I converted this to Functional, have not tested it.
const ContentGrid = ({
    contentType,
    contentSearchType,
    fixedContentItems,
    contentSortMethod,
    limitToBusinessRoles,
    limitToBusinessRoleCapacity,
    limitToLocations,
    businessLocationScope,
    forceChangeCards,
    size,
    verbosity,
    context,
    fixedItems,
    options,
    title,
    containerMode,
    searchItems,
    onDataReady,
    payload,
    excludeItems,
    offset,
    allowMore,
    moreMethod,
    gridTemplateColumns,
}) => {
    const { contentSearch } = usePublicContentService();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [fullResponse, setFullResponse] = useState(null)
    const [error, setError] = useState(false);
    // const [ready, setReady] = useState(contentType === LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_PHOTO && fixedItems);
    const [ready, setReady] = useState(false);



    // I move this code to the useEffect below, it still work  for load more
    // useEffect(() => {
    //     if (contentType !== LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_PHOTO && !fixedItems) {
    //         setLoading(true);
    //         console.log("this was called")
    //         contentSearch({
    //             content_type: contentType,
    //             content_search_type: contentSearchType,
    //             search_items: searchItems,
    //             fixed_content_items: fixedContentItems,
    //             content_sort_method: contentSortMethod,
    //             exclude_items: excludeItems,
    //             offset: offset,
    //             size: size,
    //         }).then((response) => {
    //             if (response) {
    //                 if (data && Array.isArray(response)) {
    //                     setData([...data, ...response]);
    //                 } else {
    //                     setData(response);
    //                 }
    //                 setError(false);
    //                 // setReady(true);
    //                 if (onDataReady) onDataReady(data);
    //             }
    //         });
    //         return () => {
    //             // cancel()
    //         };
    //     }
    // }, [offset]);

    useEffect(() => {
        if (contentType !== LSTVGlobals.CONTENT_GRID_CONTENT_TYPE_PHOTO && !fixedItems) {
            const searchobj = {
                content_type: contentType === 'vibe' ? 'tag' : contentType,
                content_search_type: contentSearchType,
                search_items: searchItems,
                fixed_content_items: fixedContentItems,
                content_sort_method: contentSortMethod,
                exclude_items: excludeItems,
                offset: offset,
                size: size,
                
            };

            if (limitToBusinessRoles) {
                searchobj.limit_to_business_roles = limitToBusinessRoles;
            } else if (limitToBusinessRoleCapacity) {
                searchobj.limit_to_business_role_capacity = limitToBusinessRoleCapacity;
            } else {
                // if no limits, we can assume that this is the catch-all wedding-vendors directory
                // https://app.clubhouse.io/lovestoriestv/story/185/remove-dress-designers-within-vendors
                searchobj.exclude_business_roles = 'dress-designer'
            }
            
            // Location filtering
            if (limitToLocations) {
                searchobj['limit_to_locations'] = limitToLocations;
                searchobj['business_location_scope'] = 'worked_or_based_at';
            }

            if(businessLocationScope) {
                searchobj['business_location_scope'] = businessLocationScope;
                searchobj['limit_to_locations'] = searchItems
                searchobj['search_items'] = null
            }
            
            setLoading(true);
            
            contentSearch(searchobj).then((response) => {
                const { result } = response;
                setFullResponse(response);
                if (result?.success === false) {
                    setError(true);
                } else {
                    if (result?.length < 1) {
                        setData(result);
                        setLoading(false);
                        
                        if (onDataReady) {
                            onDataReady(result);
                        }
                    }
                    if (data && offset > 0) {
                        setData([...data, ...result]);
                    } else {
                        setData(result);
                    }
                    setReady(true);
                    setError(false);
                }
            });
            return () => {
                // cancel()
            };
        } else {
            //console.log("skip");
        }
    }, [searchItems, excludeItems, offset, limitToBusinessRoles, limitToBusinessRoleCapacity, limitToLocations]);

    const handleNewCardGridData  = () => {
        setLoading(false)
        if (onDataReady) {
            onDataReady(fullResponse);
        }
    }

    return (
        ready && (
            <>
                {data?.length > 0 ? (
                    <CardGrid
                        forceChangeCards={forceChangeCards}
                        title={title}
                        payload={payload}
                        numCards={size + offset}
                        content={data}
                        fixedItems={fixedItems}
                        cardType={contentType}
                        verbosity={verbosity}
                        gridTemplateColumns={gridTemplateColumns}
                        {...options}
                        containerMode={containerMode}
                        onNewData={handleNewCardGridData}
                    />
                ) : (
                    <div>
                        {/*<h2>No results</h2>*/}
                    </div>
                )}
                <LoaderContainer>
                    {error ? (
                        <p>There was a network error</p>
                    ) : (
                        <BeatLoader size={24} color={LSTVGlobals.LSTV_YELLOW} loading={loading} />
                    )}
                </LoaderContainer>
            </>
        )
    );
};

ContentGrid.defaultProps = {
    title: null,
    mode: 'grid',
    onDataReady: null,
    payload: null,
    verbosity: LSTVGlobals.CONTENT_CARD_VERBOSITY_LEVEL_MAXIMUM,
    contentType: null,
    contentSearchType: null,
    businessLocationScope: null,
    searchItems: null,
    contentSortMethod: null,
    excludeItems: null,
    context: null,
    offset: 0,
    size: 8,
    allowMore: false,
    moreMethod: LSTVGlobals.INFINITY_GRID_MORE_METHOD_BUTTON,
    //backgroundImage: LSTVGlobals.DIAGONAL_BACKGROUND,
    gridTemplateColumns: null,
    options: {},
};

export default withRouter(ContentGrid);
