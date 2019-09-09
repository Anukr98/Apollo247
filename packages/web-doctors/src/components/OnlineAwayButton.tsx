import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    toggleBtnGroup: {
      backgroundColor: '#f7f7f7',
      minWidth: 208,
      borderRadius: 20,
      marginRight: 10,
    },
    toggleBtn: {
      width: '50%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 600,
      textTransform: 'none',
      textAlign: 'center',
      height: 30,
      '& span': {
        padding: 0,
        width: 'auto',
      },
    },
    toggleBtnActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      borderRadius: '20px !important',
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
  };
});

export interface OnlineAwayButtonProps {}

export const OnlineAwayButton: React.FC<OnlineAwayButtonProps> = (props) => {
  enum Values {
    ONLINE = 'ONLINE',
    AWAY = 'AWAY',
  }
  const classes = useStyles();
  const [selectedValue, setSelectedValue] = useState<Values>(Values.ONLINE);
  console.log(selectedValue);
  return (
    <ToggleButtonGroup
      className={classes.toggleBtnGroup}
      exclusive
      value={selectedValue}
      onChange={(e, val?: Values) => (val ? setSelectedValue(val) : null)}
    >
      <ToggleButton
        className={`${classes.toggleBtn} ${
          selectedValue === Values.ONLINE ? classes.toggleBtnActive : ''
        }`}
        value={Values.ONLINE}
      >
        Online
      </ToggleButton>
      <ToggleButton
        className={`${classes.toggleBtn} ${
          selectedValue === Values.AWAY ? classes.toggleBtnActive : ''
        }`}
        value={Values.AWAY}
      >
        Away
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
