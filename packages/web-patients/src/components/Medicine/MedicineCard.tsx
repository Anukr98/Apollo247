import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: 10,
      fontSize: 14,
      fontWeight: 500,
      marginTop: 5,
      color: '#02475b',
      textAlign: 'center',
      cursor: 'pointer',
    },
    bigAvatar: {
      width: 48,
      height: 48,
      lineHeight: '60px',
      textAlign: 'center',
      backgroundColor: '#dcdfcf',
      margin: 'auto',
      marginTop: -20,
      marginBottom: 5,
      borderRadius: '50%',
    },
  };
});

export const MedicineCard: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} sm={6} md={4} lg={3}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/ic_tablets.svg')} alt="" />
          </div>
          Metformin
        </div>
      </Grid>
      <Grid item xs={6} sm={6} md={4} lg={3}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/ic_tablets.svg')} alt="" />
          </div>
          Sulfonylureas
        </div>
      </Grid>
      <Grid item xs={6} sm={6} md={4} lg={3}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/ic_tablets.svg')} alt="" />
          </div>
          Crocin
        </div>
      </Grid>
      <Grid item xs={6} sm={6} md={4} lg={3}>
        <div className={classes.root}>
          <div className={classes.bigAvatar}>
            <img src={require('images/ic_tablets.svg')} alt="" />
          </div>
          DPP-4 Inhibitors
        </div>
      </Grid>
    </Grid>
  );
};
