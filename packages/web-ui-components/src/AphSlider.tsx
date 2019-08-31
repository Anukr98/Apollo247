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
      borderRadius: 2,
      backgroundImage: 'linear-gradient(to right, #0087ba, #0087ba)',
    },
    track: {
      backgroundImage: 'linear-gradient(to right, #0087ba, #0087ba)',
      height: 4,
      borderRadius: 2,
    },
    mark: {
      backgroundImage: 'linear-gradient(to right, #0087ba, #0087ba)',
      display: 'none',
    },
    thumb: {
      width: 20,
      height: 20,
      backgroundColor: '#00b38e',
      marginTop: -8,
      marginLeft: -8,
      boxShadow: '0px 0px 0px 4px rgba(0,179,142,0.2)',
      '&:hover': {
        boxShadow: '0px 0px 0px 4px rgba(0,179,142,0.2)',
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
  };
});

export const AphSlider: React.FC<SliderProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return <Slider classes={classes} {...props} />;
};

export default AphSlider;
