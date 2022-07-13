import React from 'react';
import { connect } from 'react-redux';
import * as LSTVGlobals from '../../global/globals';
import LSTVLink from './LSTVLink';
import styled, { css } from 'styled-components';
import slugify from 'slugify';
import AwardBadge from './AwardBadge';
import { Link } from 'react-router-dom';
import { Router, withRouter } from 'react-router';

export const TAG_CLOUD_MODE_PILL = 'pill';
export const TAG_CLOUD_MODE_LINK = 'link';
export const TAG_CLOUD_MODE_TICKET = 'ticket';
export const TAG_CLOUD_MODE_TEXT = 'text';
export const TAG_CLOUD_MODE_BADGE = 'badge';
import ReactTooltip from 'react-tooltip';
import LabelAndContent from './LabelAndContent';
import MediaQuery from 'react-responsive';
import MainContent from '../Pages/PageSupport/MainContent';

const Tag = styled.div`
    background: ${(props) => props.background};
    border-radius: ${(props) => props.borderRadius};
    border-top: ${(props) => props.borderTop};
    border-bottom: ${(props) => props.borderBottom};
    border-left: ${(props) => props.borderLeft};
    border-right: ${(props) => props.borderRight};
    border-radius: 0 5px 5px 0;
    padding: ${(props) => props.padding};
    display: flex;
    margin-right: 7px;
    margin-top: ${(props) => props.marginBottom || '7px'};
    position: relative;
    transition: background ${LSTVGlobals.FAST_EASE_OUT_ANIM};
    font-size: ${(props) => props.fontSize || '0.8rem'};
    font-weight: ${(props) => props.fontWeight || LSTVGlobals.FONT_WEIGHT_SEMIBOLD};
    line-height: ${(props) => props.lineHeight || '1.0rem'};

    ${(props) =>
        props.ticketMode &&
        css`
            padding-left: 20px;

            clip-path: polygon(0% 50%, 10px 0%, 100% 0%, 100% 100%, 10px 100%, 0% 50%);
            mask-image: radial-gradient(circle farthest-side at 10px, transparent 3px, white 3px);
            a {
                z-index: ${LSTVGlobals.Z_INDEX_5_OF_100};
            }

            &:hover {
                background: ${LSTVGlobals.PRIMARY_COLOR};
                color: ${LSTVGlobals.ABSOLUTE_WHITE};
            }
        `};
`;

const Hole = styled.div`
    display: none;
    position: absolute;
    z-index: ${LSTVGlobals.Z_INDEX_6_OF_100};
    top: 50%;
    left: 8px;
    width: 6px;
    height: 6px;
    background: ${(props) => props.holeBackgroundColor};
    border-top: 1px solid ${LSTVGlobals.TAG_HOLE_SHADOW};
    border-radius: 999px;
    transform: translateY(-50%);
`;

const CloudTagContainer = styled.div`
    display: ${(props) => props.display || 'inline-flex'};
    margin: ${(props) => props.margin};
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: ${(props) => props.justifyContent};
    width: 100%;
    line-height: 1.6rem;
`;

const TextTag = styled.div`
    display: inline;
    line-height: 1.3rem;
    font-size: ${(props) => props.fontSize};
    color: ${(props) => props.color};
    margin-right: ${(props) => (props.rightMargin ? '5px' : '0')};
`;

class TagCloud extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {}

    render() {
        let tags = this.props.tags.slice(
            0,
            this.props.limit ? this.props.limit : LSTVGlobals.MAX_VIBES_IN_EVENT_STORY_DISPLAY
        );

        return (
            <CloudTagContainer
                justifyContent={this.props.justifyContent}
                display={this.props.mode === TAG_CLOUD_MODE_TEXT ? 'inline' : 'inline-flex'}
                margin={this.props.margin}
            >
                <React.Fragment>
                    {this.props.mode === TAG_CLOUD_MODE_TEXT && this.props.prefix && (
                        <TextTag rightMargin fontSize={this.props.fontSize} color={this.props.color}>
                            <span
                                style={{
                                    color: this.props.color,
                                }}
                            >
                                {this.props.prefix}
                            </span>
                        </TextTag>
                    )}

                    {tags.map((data, index) => {
                        let linkProps = {
                            fontSize: this.props.fontSize,
                            fontWeight: this.props.fontWeight,
                            color: this.props.color,
                            key: index,
                            link: (data.slugPrefix ? data.slugPrefix : this.props.slugPrefix) + data.slug,
                            title: data.name,
                            dataTip: data.type,
                            dataFor: 'mainTooltip',
                            display: 'inline-flex',
                            appendix:
                                this.props.mode === TAG_CLOUD_MODE_LINK
                                    ? index < tags.length - 1 && tags.length > 1
                                    : false,
                        };

                        if (this.props.mode === TAG_CLOUD_MODE_LINK)
                            return (
                                <Tag
                                    background={'transparent'}
                                    borderRadius={this.props.borderRadius}
                                    borderColor={this.props.borderColor}
                                    borderTop={'none'}
                                    borderBottom={'none'}
                                    borderLeft={'none'}
                                    borderRight={'none'}
                                    padding={'0'}
                                    margin={'0 5px 0 0'}
                                    marginBottom={'0'}
                                    color={this.props.color}
                                    key={index}
                                >
                                    <LSTVLink {...linkProps} />
                                </Tag>
                            );

                        if (this.props.mode === TAG_CLOUD_MODE_PILL)
                            return (
                                <Tag
                                    background={this.props.backgroundColor}
                                    borderRadius={this.props.borderRadius}
                                    borderColor={this.props.borderColor}
                                    borderTop={this.props.borderTop}
                                    borderBottom={this.props.borderBottom}
                                    borderLeft={this.props.borderLeft}
                                    borderRight={this.props.borderRight}
                                    padding={this.props.padding}
                                    color={this.props.color}
                                    key={index}
                                >
                                    <LSTVLink {...linkProps} />
                                </Tag>
                            );

                        if (this.props.mode === TAG_CLOUD_MODE_TICKET)
                            return (
                                <Link key={index} style={{ textDecoration: 'none' }} to={linkProps.link}>
                                    <Tag
                                        background={this.props.backgroundColor}
                                        borderRadius={0}
                                        borderTop={'none'}
                                        borderBottom={'none'}
                                        borderLeft={'none'}
                                        borderRight={'none'}
                                        padding={'2px 10px 2px 10px'}
                                        data-tip={data.type}
                                        data-for={'mainTooltip'}
                                        fontSize={this.props.fontSize}
                                        fontWeight={this.props.fontWeight}
                                        ticketMode
                                    >
                                        {linkProps.title}
                                        <Hole holeBackgroundColor={this.props.holeBackgroundColor} />
                                    </Tag>
                                </Link>
                            );

                        if (this.props.mode === TAG_CLOUD_MODE_TEXT)
                            return (
                                <TextTag
                                    color={this.props.color}
                                    rightMargin={index < this.props.tags.length - 1}
                                    {...linkProps}
                                >
                                    <span
                                        style={{
                                            color: this.props.color,
                                        }}
                                    >
                                        {index === this.props.tags.length - 1 && this.props.tags.length > 1 ? '' : ''}
                                    </span>
                                    {data.name}
                                    <span
                                        style={{
                                            color: this.props.color,
                                        }}
                                    >
                                        {index < this.props.tags.length - 1 ? ' &' : ' '}
                                    </span>
                                </TextTag>
                            );

                        if (this.props.mode === TAG_CLOUD_MODE_BADGE)
                            return (
                                <Link
                                    key={index}
                                    style={{ textDecoration: 'none' }}
                                    to={(data.slugPrefix ? data.slugPrefix : this.props.slugPrefix) + data.slug}
                                >
                                    <AwardBadge
                                        text={data.name}
                                        slug={data.slug}
                                        fontSize={this.props.fontSize}
                                        fontWeight={this.props.fontWeight}
                                    />
                                </Link>
                            );
                    })}
                </React.Fragment>
            </CloudTagContainer>
        );
    }
}

TagCloud.defaultProps = {
    tags: [],
    slugPrefix: '/style/',
    mode: TAG_CLOUD_MODE_PILL,
    limit: LSTVGlobals.DEFAULT_VIDEO_DATA_POINTS_VIBE_LIMIT,
    filterTypes: [],
    fontSize: '1rem',
    borderTop: '1px solid ' + LSTVGlobals.DEFAULT_PILL_BORDER_COLOR,
    borderBottom: '1px solid ' + LSTVGlobals.DEFAULT_PILL_BORDER_COLOR,
    borderRight: '1px solid ' + LSTVGlobals.DEFAULT_PILL_BORDER_COLOR,
    borderLeft: '1px solid ' + LSTVGlobals.DEFAULT_PILL_BORDER_COLOR,
    prefix: null,
    fontWeight: LSTVGlobals.FONT_WEIGHT_SEMIBOLD,
    backgroundColor: LSTVGlobals.DEFAULT_PILL_BG_COLOR,
    holeBackgroundColor: LSTVGlobals.HOLE_BG_COLOR,
    borderColor: LSTVGlobals.DEFAULT_PILL_BORDER_COLOR,
    borderRadius: LSTVGlobals.DEFAULT_PILL_RADIUS,
    padding: '2px 13px 2px 10px',
    showEditorial: 'yes',
    justifyContent: 'flex-start',
    color: LSTVGlobals.TEXT_AND_SVG_BLACK,
    margin: '0',
};

export default withRouter(TagCloud);
