import React from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '12px !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '4px 20px',
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      textTransform: 'uppercase',
    },
    panelExpanded: {
      minHeight: 'auto !important',
      '& >div:first-child': {
        marginTop: 12,
        marginBottom: 12,
      },
    },
    panelDetails: {
      padding: 20,
      paddingTop: 0,
      display: 'inline-block',
      width: '100%',
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      letterSpacing: 0.02,
      paddingBottom: 8,
      opacity: 0.8,
    },
    cardSection: {
      padding: 16,
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      lineHeight: 1.43,
      minHeight: 75,
    },
    bottomActions: {
      paddingTop: 20,
      paddingBottom: 10,
      textAlign: 'right',
      '& button': {
        color: '#fc9916',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: 'none',
        padding: 0,
        border: 'none',
        backgroundColor: 'transparent',
      },
    },
    resultGroup: {
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    result: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.04,
      color: '#0087ba',
    },
    resultError: {
      color: '#d10001',
    },
  };
});

export const DetailedFindings: React.FC = (props) => {
  const classes = useStyles();
  return (
    <ExpansionPanel className={classes.root} defaultExpanded={true}>
      <ExpansionPanelSummary
        expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
        classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
      >
        Detailed Findings
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12}>
            <div className={classes.cardTitle}>Lymphocytes</div>
            <div className={classes.cardSection}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Result</label>
                    <div className={`${classes.result} ${classes.resultError}`}>15</div>
                  </div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Units</label>
                    <div className={classes.result}>%</div>
                  </div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Normal Range</label>
                    <div className={`${classes.result}`}>20 - 40</div>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Grid item xs={12} sm={12}>
            <div className={classes.cardTitle}>
              Haemoglobin (Optical Light Scatter / Cyanmethaemoglobin)
            </div>
            <div className={classes.cardSection}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Result</label>
                    <div className={`${classes.result}`}>11.4</div>
                  </div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Units</label>
                    <div className={classes.result}>gm/dl</div>
                  </div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Normal Range</label>
                    <div className={`${classes.result}`}>13.0 - 18.0</div>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Grid item xs={12} sm={12}>
            <div className={classes.cardTitle}>Lymphocytes</div>
            <div className={classes.cardSection}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Result</label>
                    <div className={`${classes.result} ${classes.resultError}`}>15</div>
                  </div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Units</label>
                    <div className={classes.result}>%</div>
                  </div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Normal Range</label>
                    <div className={`${classes.result}`}>20 - 40</div>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Grid item xs={12} sm={12}>
            <div className={classes.cardTitle}>
              Haemoglobin (Optical Light Scatter / Cyanmethaemoglobin)
            </div>
            <div className={classes.cardSection}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Result</label>
                    <div className={`${classes.result}`}>11.4</div>
                  </div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Units</label>
                    <div className={classes.result}>gm/dl</div>
                  </div>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <div className={classes.resultGroup}>
                    <label>Normal Range</label>
                    <div className={`${classes.result}`}>13.0 - 18.0</div>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
