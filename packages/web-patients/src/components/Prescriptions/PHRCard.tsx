import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphLinearProgress } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      display: 'flex',
      marginBottom: 10,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
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

export const PHRCard: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.prescriptionGroup}>
        <div className={classes.imgThumb}>
          <img src={require('images/apollo-logo.jpg')} alt="" />
        </div>
        <div className={classes.fileInfo}>
          <a href="" target="_blank" title="Download Document" rel="noopener noreferrer">
            IMG_20190726
          </a>
          <AphLinearProgress
            color="secondary"
            variant="determinate"
            className={classes.progressRoot}
            value={10}
          />
        </div>
      </div>
      <div className={classes.closeBtn}>
        <AphButton>
          <img src={require('images/ic_cross_onorange_small.svg')} alt="Remove Document" />
        </AphButton>
      </div>
    </div>
  );
};
