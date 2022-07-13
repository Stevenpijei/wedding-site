import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import SwiperCore, { Navigation, Scrollbar as SwiperScrollbar } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.scss';

import theme from '../styledComponentsTheme'
import { ArrowLeft } from '../components/Utility/LSTVSVG';
import LSTVCard from './cards/LSTVCard';

const Container = styled('div')`
    margin: 0px auto;
    box-shadow: ${(props) => (props.showOutline ? '0px 0px 14px rgba(222, 222, 222, 0.25)' : 'none')};
    border: ${(props) => (props.showOutline ? `1px solid ${theme.midGrey}` : 'none')};
    border-radius: 10px;

    .swiper-container {
        height: auto;
    }

    @media ${theme.breakpoints.tablet} {
        padding: 16px;
    }
`;

const Content = styled('div')`
    margin: 20px 0 0 0;
`;

const Header = styled('div')`
    display: flex;
    height: 40px;
    line-height: 2.5rem;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const CardsContainer = styled('div')`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-gap: 8px;
`;

const Title = styled('h2')`
    font-size: 2rem;
    font-weight: 900;
    font-family: 'Heldane Display', sans-serif;
    line-height: 2.5rem;
    margin: ${props => props.center ? '0 auto' : 'none'};
`;

const Scrollbar = styled('div')`
    .swiper-scrollbar-drag {
        height: 4px;
        background: ${(props) => props.theme.primaryPurple};
        border-radius: 4px;
    }
`;

const CardContainer = styled('div')``;

const ArrowContainer = styled('button')`
    width: 0.925rem;
    height: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
`;

const ArrowRight = styled(ArrowLeft)`
    transform: rotate(180deg);
`;

const splitArrayByColumns = (array, columns) => {
    const clone = Array(Math.ceil(array.length / columns));

    return clone.fill('').reduce((result, current, index) => {
        return [...result, [...array].splice(index * columns, columns)];
    }, []);
};

const WeddingCarousel = ({ title, businesses, showOutline, centerTitle }) => {
    SwiperCore.use([Navigation, SwiperScrollbar]);
    const sortedBusinesses = sortBusinessByLoveClubFirst(businesses)

    const slides = splitArrayByColumns(sortedBusinesses || [], 8);
    const hasSwipe = slides && slides.length > 1;

    function sortBusinessByLoveClubFirst(businesses) {
        return businesses.sort(function(x, y) {
            return (x.premium === y.premium)? 0 : x.premium? -1 : 1;
        });
    }

    const settings = {
        init: true,
        speed: 300,
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 10,
        grabCursor: true,
        navigation: {
            nextEl: '.wedding-carousel__next',
            prevEl: '.wedding-carousel__prev',
        },
        scrollbar: {
            el: '.wedding-craousel__scrollbar',
        },
    };

    return (
        <Container showOutline={showOutline}>
            <Header>
                {hasSwipe ? (
                    <ArrowContainer className="wedding-carousel__prev">
                        <ArrowLeft fillColor="black" />
                    </ArrowContainer>
                ) : null}
                <Title center={centerTitle}>{title}</Title>
                {hasSwipe ? (
                    <ArrowContainer className="wedding-carousel__next">
                        <ArrowRight fillColor="black" />
                    </ArrowContainer>
                ) : null}
            </Header>
            <Scrollbar className="wedding-craousel__scrollbar" />
            <Content>
                {sortedBusinesses && sortedBusinesses.length ? (
                    <Swiper {...settings}>
                        {slides.map((businesses, index) => (
                            <SwiperSlide key={index}>
                                <CardsContainer>
                                    {businesses.map((business) => (
                                        <CardContainer key={`${business.name}${business.role_name}`}>
                                        {/* {console.log(business)} */}

                                            <LSTVCard
                                                key={business.name}
                                                options={{
                                                    cardType: 'wedding-business',
                                                    orientation: 'portrait',
                                                    containerMode: 'grid',
                                                    bg_color: business.bg_color,
                                                    cardSlug: `/business/${business.slug}`,
                                                }}
                                                data={{
                                                    premium: business.premium,
                                                    name: business.name,
                                                    role_name: business.business_capacity_type_name || business.role_name,
                                                    role_slug: business.role_slug,
                                                    role_family:  business.role_family,
                                                }}
                                            />
                                        </CardContainer>
                                    ))}
                                </CardsContainer>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : null}
            </Content>
        </Container>
    );
};

WeddingCarousel.propTypes = {
    businesses: PropTypes.array,
    title: PropTypes.string,
    showOutline: PropTypes.bool,
    centerTitle: PropTypes.bool
};

WeddingCarousel.defaultProps = {
    title: 'Wedding Team',
    businesses: [],
    showOutline: true,
    centerTitle: true
};

export default WeddingCarousel;
