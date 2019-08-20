import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphLinearProgress } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: theme.palette.common.white,
      padding: 10,
      display: 'flex',
      marginBottom: 10,
    },
    prescriptionGroup: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      width: 'calc(100% - 44px)',
    },
    closeBtn: {
      marginLeft: 'auto',
      paddingLeft: 20,
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    imgThumb: {
      paddingRight: 14,
      '& img': {
        maxWidth: 30,
        verticalAlign: 'middle',
      },
    },
    fileInfo: {
      width: 'calc(90% - 44px)',
    },
    progressRoot: {
      height: 2,
      marginTop: 5,
    },
  };
});

export const PrescriptionCard: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.prescriptionGroup}>
        <div className={classes.imgThumb}>
          <img src={require('images/ic_prescription_thumbnail.png')} alt="" />
        </div>
        <div className={classes.fileInfo}>
          IMG_20190726
          <AphLinearProgress
            color="secondary"
            variant="determinate"
            className={classes.progressRoot}
          />
        </div>
      </div>
      <div className={classes.closeBtn}>
        <AphButton>
          <img src={require('images/ic_cross_onorange_small.svg')} alt="" />
        </AphButton>
      </div>
    </div>
  );
};
