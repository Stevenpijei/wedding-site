import React, {useEffect, useState} from 'react';
import styled from 'styled-components'
import theme from '../../../styledComponentsTheme'
import { useHistory } from 'react-router-dom';
import CardSection from '../../Content/Cards/CardSection';
import { usePublicContentService } from '../../../rest-api/hooks/usePublicContentService';
import { BeatLoader } from 'react-spinners';

const Container = styled.div`
    grid-column: 1 / 3; 
    @media ${theme.breakpoints.isMobileOrTablet} {
        padding: 20px;
        .lstvLinkNoStyle {
            display: block;
            margin: 16px 0;
        }
    }
`;
const LoaderContainer = styled.div`
    margin: 16px 0 0 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Recommended = () => {
    // const [offset, setOffset] = useState(0);
    const now = Date.now()
    const oneHour = 3600000
    const [offsetObj, setOffsetObj] = useLocalStorage('recommendedOffset', {date: now, offset: -4});
    const [size, setSize] = useState(4);
    const [content, setContent] = useState(undefined);
    const [error, setError] = useState(undefined)
    
    const history = useHistory()
    const { contentSearch } = usePublicContentService();

    const config = {
        header: "Recommended For You",
        //  "slug": "most-recent",
        //  "sub_header": "sub_header",
        card_type: "video",
        // Where the see all button navs to
        url: "/wedding-videos",
        // "cta": "All Recent Videos",
        content: []
    }

    const checkOffset = () => {
        // If the offset is too clsoe to 100, the current limit
        if(offsetObj.offset >= 90) {
            // start over at zero and reset date to now
            setOffsetObj({date: now, offset: 0})
            return 0;
        } else if(now - offsetObj.date > oneHour){
            // If the offset is older than 1 hour
            // start over at zero and reset date to now
            setOffsetObj({date: now, offset: 0})
            return 0;
        } else {
            // Add four to the offset
            setOffsetObj({...offsetObj, offset: offsetObj.offset + 4})
            return offsetObj.offset + 4;
        }  
    }

    useEffect(() => {
        
        contentSearch({
            content_type: 'video',
            content_sort_method: 'most_watched_30d',
            offset: checkOffset(),
            size: size,
        }).then(data => {
            if(data.success) {
                setContent(data.result)
            } else {
                setError("There was an error")
            }
        })
    }, [])

    return (
         content ? 
            <Container>
                {content && <CardSection even={false} index={0} data={{...config, content: content}} options={{ showBlogName: false }} history={history}/>}
            </Container>
            : 
            <LoaderContainer>
                {error ? <p>There was a network error</p> : <BeatLoader size={24} color={"#fff072"} loading={true} />}
            </LoaderContainer>
    );
};

// Hook
function useLocalStorage(key, initialValue) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        // If error also return initialValue
        console.log(error);
        return initialValue;
      }
    });
  
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = value => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    };
  
    return [storedValue, setValue];
  }

export default Recommended;



