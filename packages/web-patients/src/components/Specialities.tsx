import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Grid, Avatar } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      width: '100%',
    },
    searchList: {
      paddingBottom: 20,
    },
    contentBox: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      fontSize: 12,
      marginTop: 5,
      fontWeight: 500,
      color: '#02475b',
      textAlign: 'center',
      cursor: 'pointer',
    },
    bigAvatar: {
      width: 48,
      height: 48,
      margin: 'auto',
      marginTop: -20,
      marginBottom: 5,
    },
  });
});

export const Specialities: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.searchList}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              General Physician
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Pulmonology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Endocrinology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Urology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Dermatology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Paediatrics
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Orthopaedics
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Gynaecology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              General Physician
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Pulmonology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Endocrinology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Urology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Dermatology
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Paediatrics
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Orthopaedics
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.contentBox}>
              <Avatar alt="" src={require('images/ic_mascot.png')} className={classes.bigAvatar} />
              Gynaecology
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
