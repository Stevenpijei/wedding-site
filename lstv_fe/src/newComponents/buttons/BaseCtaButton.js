import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { LSTVSVG } from '../../components/Utility/LSTVSVG';
import { PRIMARY_PURPLE } from '../../global/globals';
import LoadingGif from '../../images/button-loading-white.gif';

const BaseCTAButton = ({
    title,
    size,
    disabled,
    loading,
    icon,
    hideIcon,
    style,
    iconLeft,
    onClick,
    lightMode,
    className,
    type,
    dsm
 }) => {
    return (
        <Button
            type={type}
            size={size}
            center={hideIcon}
            disabled={disabled}
            onClick={(loading || disabled) ? () => null : onClick}
            iconLeft={iconLeft}
            style={style}
            lightMode={lightMode}
            className={className}
            dsm={dsm}
        >
            { (!hideIcon && iconLeft) &&
                <Ripple size={size} lightMode={lightMode} className="base-cta__ripple">
                    <IconContainer size={size} iconLeft={iconLeft} isCustom={icon}>
                        { icon ?
                            icon :
                            <LSTVSVG
                                icon="arrow-right"
                                fillColor={lightMode ? PRIMARY_PURPLE: "white"}
                                strokeColor={lightMode ? PRIMARY_PURPLE: "white"}
                            />
                        }
                    </IconContainer>
                </Ripple>
            }            
            { title && !loading &&
                <Text {...{ iconLeft, hideIcon, lightMode, dsm }}>{ title }</Text>
            }
            { loading &&
                <Loading>
                    <img src={LoadingGif} style={{ width: 40 }} />
                </Loading>
            }
            { (!hideIcon && !iconLeft) &&
                <Ripple {...{ lightMode, size, dsm }} className="base-cta__ripple">
                    <IconContainer size={size}>
                        { icon ?
                            icon :
                            <LSTVSVG icon="arrow-right" fillColor={lightMode ? PRIMARY_PURPLE: "white"}/>
                        }
                    </IconContainer>
                </Ripple>
            }
        </Button>
    );
};

const getSizeStyles = (size, isIconLeft, hideIcon, dsm) => {
    const style = { ...(dsm ? sizeStylesDsm : sizeStyles)[size] };

    if (hideIcon) {
        style.paddingRight = 0;
        style.paddingLeft = 0;
    }

    if (isIconLeft) {
        style.paddingLeft = 0;
        style.paddingRight = 23;
    }

    return style;
};


const sizeStyles = {
    small: {
        width: '100%',
        height: 41,
        paddingLeft: 23,
    },
    medium: {
        width: 185,
        height: 41,
        paddingLeft: 25,
    },
    large: {
        width: 244,
        height: 51,
        paddingLeft: 27,
    },
    fullWidth: {
        width: '100%',
        height: 51,
        paddingLeft: 27,
    },
    fullWidthMedium: {
        width: '100%',
        height: 41,
        paddingLeft: 25,
    },
    iconOnly: {
        width: 'auto',
        height: 51,
        paddingLeft: 0,
    }
};

// For now only tested size=medium, other sizes likely need adjustments.
const sizeStylesDsm = {
  small: {
      width: '100%',
      height: 34,
      paddingLeft: 23,
  },
  medium: {
      width: 182,
      height: 43,
      paddingLeft: 25,
  },
  large: {
      width: 244,
      height: 54,
      paddingLeft: 27,
  },
  fullWidth: {
      width: '100%',
      height: 54,
      paddingLeft: 27,
  },
  fullWidthMedium: {
      width: '100%',
      height: 43,
      paddingLeft: 25,
  },
  iconOnly: {
      width: 'auto',
      height: 54,
      paddingLeft: 0,
  }
};

const largeIconSize = {
    width: '1.25rem',
    height: '1.25rem',
};

const iconSizeStyles = {
    small: {
        width: '1rem',
        height: '1rem',
    },
    medium: {
        width: '1rem',
        height: '1rem',
    },
    large: largeIconSize,
    fullWidth: largeIconSize,
    fullWidthMedium: {
        width: '1rem',
        height: '1rem',
    },
    iconOnly: largeIconSize,
};

const Button = styled('button')(({ theme, center, iconLeft, lightMode, size, dsm }) => ({
    display: 'flex',
    alignItems: 'center',
    textAlign: center ? 'center' : 'left',
    ...getSizeStyles(size, iconLeft, center, dsm),
    borderRadius: 50,
    background:  lightMode ? 'white' : theme.primaryPurple,
    transition: 'transform .2s ease-out',
    cursor: 'pointer',    
    ':hover': {
        background: lightMode ? 'white' : theme.secondaryPurple,
        '.base-cta__ripple': {
            backgroundColor: lightMode ? theme.midGrey : theme.primaryPurple,
        },
    },
    ':focus': {
        'box-shadow': `0px 0px 6px 0px ${theme.cardDropShadow}`,
    }, 
    ':disabled': {
        opacity: 0.2,
        cursor: 'not-allowed',
        background: `${lightMode ? 'white' : theme.primaryPurple} !important`,
    },   
}));

const Text = styled('span')(({ theme, hideIcon, iconLeft, lightMode, dsm }) => ({
    display: 'block',
    flex: '1',
    width: '100%',
    paddingRight: hideIcon || iconLeft ? '0' : '5px',
    paddingLeft: iconLeft ? '8px' : '0',
    fontWeight: '600',
    color:  lightMode ? theme.primaryPurple : 'white',
    ...dsm ? { fontSize: '21px' } : {}
}));

const Loading = styled.div`
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: center;
`

export const Ripple = styled('div')(({ theme, size, lightMode, dsm }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    height: (dsm ? sizeStylesDsm : sizeStyles)[size].height,
    width: (dsm ? sizeStylesDsm : sizeStyles)[size].height,
    backgroundColor: lightMode ? theme.midGrey : size === 'iconOnly' ? theme.primaryPurple : theme.secondaryPurple,
    transition: 'transform .2s ease-out',
}));

const IconContainer = styled('div')(({ size, iconLeft, isCustom }) => ({
    height: iconSizeStyles[size].height,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: !isCustom && iconLeft ? 'rotate(180deg)' : null,
    marginBottom: !isCustom && iconLeft ? '3px' : 0
}));

BaseCTAButton.propTypes = {
    title: PropTypes.string,
    size: PropTypes.oneOf(Object.keys(sizeStyles)),
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    lightMode: PropTypes.bool,
    loading: PropTypes.bool,
};

BaseCTAButton.defaultProps = {
    size: 'large',
    disabled: false,
    iconLeft: false,
    lightMode: false,
};

export default BaseCTAButton;
