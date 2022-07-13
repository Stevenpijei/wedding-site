import React from 'react';
import dayjs from 'dayjs';
import advancedFormat from "dayjs/plugin/advancedFormat";
import styled from 'styled-components';
import theme from '../../styledComponentsTheme';
import { LSTVSVG, LocationIcon, TimeIcon } from '../../components/Utility/LSTVSVG';

const Container = styled.div`
    * {
        box-sizing: border-box;
    }

    box-sizing: border-box;
    padding: 16px;
    background: ${theme.primaryPurple};
    width: auto;
    border-radius: 10px;
    height: 100%;

    @media ${theme.breakpoints.laptop} {
        max-width: 280px;
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const Date = styled.p`
    max-width: 100%;
    line-height: 2rem;
    font-family: Calibre;
    font-weight: 600;
    font-size: 2.125rem;
    color: white;
    margin-bottom: 30px;
`;

const ThruLabel = styled(Date)`
    font-family: Calibre;
    font-weight: 300;
    font-size: 1.125rem;
    line-height: 1rem;
    text-align: center;
    padding-top: 2px;
`;


const CtaContainer = styled.div`
    display: flex;
    align-items: center;
`;

const CtaText = styled.p`
    padding: 0 8px 0 0;
    margin: 0 0 8px 0;
    color: white;
    font-size: 1.15em;
    font-weight: 600;
`;

const CtaIcon = styled.div``;

const CtaLink = styled.a`
    text-decoration: none;
`;

const Content = styled.div`
   // margin: 10px 0 0 0;
`;

const Title = styled.h5`
    font-size: 1.25em;
    margin: 16px 0;
    font-weight: 600;
    color: white;
`;

const Badge = styled.div`
    padding: 4px;
    width: auto;
    max-width: 150px;
    border-radius: 3px;
    background: ${theme.white};
    color: ${theme.primaryPurple};
    text-align: center;
    font-weight: 500;
    font-size: 0.85em;
`;

const Info = styled.div`
    display: flex;
    align-items: center;
    margin: 0 0 4px 0;
`;
const InfoIcon = styled.div`
    height: 18px;
    width: 18px;
`;
const InfoText = styled.p`
    margin: 0 0 0 8px;
    color: white;
    font-size: 1em;
    font-family: 'Calibre';
    font-weight: 500;
`;


const EventCard = ({ event }) => {
    dayjs.extend(advancedFormat);
    let dateLabel = dayjs(event?.event_start_date).format('MMM D');
    if (event?.event_end_date)
        if (dayjs(event?.event_start_date).format('MMM') === dayjs(event?.event_end_date).format('MMM'))
            dateLabel += " - " + dayjs(event?.event_end_date).format('D');
        else
                dateLabel += " - " + dayjs(event?.event_end_date).format('MMM D');
    let locationBreakdown = null;
    if (event?.location?.display_name) {
        let str = event?.location?.display_name;//.replace(/, /g,"^");

        let locArray = str.split('^')
        locationBreakdown = locArray.map( (d, index) => {
            if (index === 0) {
                return <Info>
                    <InfoIcon>
                        <LocationIcon imageHeight="22px" imageWidth="22px" fillColor={theme.white} />
                    </InfoIcon>
                    <InfoText>{event?.isVirtual ? 'Online' : d}</InfoText>
                </Info>
            } else {
                return <Info>
                    <InfoIcon>
                    </InfoIcon>
                    <InfoText>{d}</InfoText>
                </Info>
            }
        });
    }

    return (
        <Container>
            <Header>

                <CtaLink href={event?.cta_url} target="_blank">
                    <CtaContainer>
                        <CtaText>Learn More</CtaText>
                        <CtaIcon>
                            <LSTVSVG
                                flex="1"
                                imageWidth={'42px'}
                                imageHeight={'42px'}
                                icon={'wedding-business-arrow'}
                            />
                        </CtaIcon>
                    </CtaContainer>
                </CtaLink>
            </Header>

            <Content>
                <Date>
                    {dateLabel}
                </Date>
                <Badge>{event?.name_short}</Badge>
                <Title>{event?.name_long}</Title>
                {event?.event_start_time && <Info>
                    <InfoIcon>
                        <TimeIcon imageHeight="32px" imageWidth="32px" fillColor={theme.white} />
                    </InfoIcon>
                    <InfoText>
                        {dayjs(event?.event_start_time).format('H:mmA')}
                        {dayjs(event?.event_end_time) && <>
                            {' - '}{dayjs(event?.event_end_time).format('H:mmA')}
                            </>}
                    </InfoText>
                </Info>}
                {locationBreakdown}


            </Content>
        </Container>
    );
};

export default EventCard;
