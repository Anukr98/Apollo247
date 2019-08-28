import { makeStyles } from '@material-ui/styles';
import { Theme, Slider } from '@material-ui/core';
import React from 'react';
import { SliderProps } from '@material-ui/core/Slider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      color: '#0087ba',
      verticalAlign: 'middle',
      '& span:nth-child(5)': {
        paddingLeft: 8,
      },
      '& span:nth-child(7)': {
        left: 'auto !important',
        right: -10,
      },
    },
    rail: {
      height: 4,
      opacity: 0.5,
      backgroundColor: 'rgba(229,0,0,0.2)',
    },
    track: {
      backgroundColor: '#0087ba',
      height: 4,
    },
    mark: {
      backgroundColor: '#0087ba',
      display: 'none',
    },
    thumb: {
      width: 28,
      height: 28,
      backgroundImage: 'url(' + require('images/ic_hold.svg') + ')',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'transparent',
      marginTop: -12,
      marginLeft: -12,
      boxShadow: 'none',
      '&:hover': {
        boxShadow: 'none',
      },
    },
    markLabel: {
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
      opacity: 0.6,
      marginTop: 5,
      lineHeight: 1.67,
    },
    markLabelActive: {
      opacity: 1,
    },
    valueLabel: {
      fontSize: 12,
      fontWeight: 500,
      color: 'transparent',
      top: 'auto',
      bottom: -31,
      left: 'auto',
      '& span': {
        height: 'auto',
        '& span': {
          color: '#01475b',
        },
      },
    },
    disabled: {
      '& span:last-child': {
        display: 'none',
      },
      '& span:first-child': {
        height: 2,
        backgroundColor: 'rgba(2,71,91,0.1)',
      },
    },
  };
});

export const AphOnHoldSlider: React.FC<SliderProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return <Slider classes={classes} {...props} />;
};

export default AphOnHoldSlider;
