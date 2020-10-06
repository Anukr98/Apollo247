import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Radio, { RadioProps } from '@material-ui/core/Radio';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      margin: 0,
      padding: 0,
      paddingRight: 18,
    },
    colorPrimary: {
      color: '#00b38e',
      '&$checked': {
        color: '#00b38e',
      },
    },
    checked: {
      color: '#00b38e',
    },
  };
});

export const AphRadio: React.FC<RadioProps> = (props) => {
  const defaultClasses = useStyles({});
  const classes = props.classes || defaultClasses;

  return (
    <Radio
      icon={<img src={require('images/ic_radio_unselected.svg')} alt="" />}
      checkedIcon={<img src={require('images/ic_radio.svg')} alt="" />}
      classes={classes}
      {...props}
    />
  );
};

export default AphRadio;
