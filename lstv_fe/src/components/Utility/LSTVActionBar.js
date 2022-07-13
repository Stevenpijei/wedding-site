import React from 'react';
import * as LSTVGlobals from '../../global/globals';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import LSTVLink from '../Utility/LSTVLink';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import LikableHeart from './LikableHeart';

export const LSTVActionBar = (props) => {
    return (
        <React.Fragment>
            {props.showLike ? (
                <LikableHeart
                    ownerType={props.ownerType}
                    heartAnimStyle={props.likeAnimStyle}
                    textColor={props.textColor}
                    heartOutlineColor={props.textColor}
                    ownerId={props.ownerId}
                />
            ) : null}
        </React.Fragment>
    );
};
