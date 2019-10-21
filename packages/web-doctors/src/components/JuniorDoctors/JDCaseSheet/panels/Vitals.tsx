import React from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphTextField, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
  },
  sectionGroup: {
    paddingBottom: 0,
  },
  sectionTitle: {
    opacity: 0.6,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: 0.02,
    paddingBottom: 5,
    color: '#02475b',
  },
  listContainer: {
    paddingBottom: 16,
  },
  contentBox: {
    borderRadius: 5,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 12,
    color: '#02475b',
    position: 'relative',
    '& textarea': {
      border: 'none',
      padding: 0,
      fontSize: 15,
      fontWeight: 500,
      paddingRight: 60,
    },
  },
  noDataFound: {
    borderRadius: 5,
    border: 'solid 1px rgba(2, 71, 91, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 16,
    paddingTop: 14,
    color: '#02475b',
  },
  boxActions: {
    position: 'absolute',
    right: 12,
    top: 12,
    display: 'flex',
    alignItems: 'center',
    '& button': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      minWidth: 'auto',
      padding: 0,
      marginLeft: 12,
      '&:hover': {
        backgroundColor: 'transparent',
      },
      '& img': {
        maxWidth: 20,
        maxHeight: 20,
      },
    },
  },
}));

export const Vitals: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Height</div>
            <div className={classes.contentBox}>
              <AphTextField fullWidth multiline placeholder="160 cms" value="160 cms" />
              <div className={classes.boxActions}>
                <AphButton>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton>
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Weight</div>
            <div className={classes.contentBox}>
              <AphTextField fullWidth multiline placeholder="67 kgs" value="67 kgs" />
              <div className={classes.boxActions}>
                <AphButton>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton>
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>BP</div>
            <div className={classes.contentBox}>
              <AphTextField fullWidth multiline placeholder="120/80 mm Hg" value="120/80 mm Hg" />
              <div className={classes.boxActions}>
                <AphButton>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton>
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            </div>
          </div>
        </Grid>
        <Grid item sm={6}>
          <div className={classes.sectionGroup}>
            <div className={classes.sectionTitle}>Temperature</div>
            <div className={classes.contentBox}>
              <AphTextField fullWidth multiline placeholder="-" value="-" />
              <div className={classes.boxActions}>
                <AphButton>
                  <img src={require('images/round_edit_24_px.svg')} alt="" />
                </AphButton>
                <AphButton>
                  <img src={require('images/ic_cancel_green.svg')} alt="" />
                </AphButton>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
