import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingRight: 15,
    },
    panelRoot: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '12px !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '4px 16px',
      fontSize: 17,
      fontWeight: 500,
      color: '#02475b',
    },
    panelExpanded: {
      minHeight: 'auto !important',
      '& >div:first-child': {
        marginTop: 12,
        marginBottom: 12,
      },
    },
    panelDetails: {
      padding: 16,
      paddingTop: 0,
      display: 'inline-block',
      width: '100%',
      paddingBottom: 4,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
      paddingBottom: 8,
    },
    historyBox: {
      padding: '12px 16px',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      color: '#01475b',
      borderRadius: 5,
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      marginBottom: 16,
    },
    addButton: {
      paddingTop: 4,
      paddingBottom: 16,
      '& button': {
        boxShadow: 'none',
        border: 'none',
        padding: 0,
        minWidth: 'auto',
        fontSize: 14,
        fontWeight: 600,
        color: '#fc9916',
        '& img': {
          verticalAlign: 'middle',
          marginRight: 8,
        },
      },
    },
    symptomsBox: {
      borderRadius: 5,
      border: 'solid 1px rgba(2, 71, 91, 0.15)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      padding: '16px 20px 16px 16px',
      marginBottom: 16,
    },
    boxTitle: {
      fontSize: 15,
      fontWeight: 500,
      color: '#01475b',
      paddingBottom: 5,
      display: 'flex',
      alignItems: 'center',
    },
    boxContent: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 1.43,
      color: '#01475b',
    },
    boxActions: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        minWidth: 'auto',
        padding: 0,
      },
      '& button:last-child': {
        marginLeft: 16,
      },
    },
  };
});

export const CaseSheet: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 430px' }}>
      <div className={classes.root}>
        <ExpansionPanel className={classes.panelRoot} defaultExpanded={true}>
          <ExpansionPanelSummary
            expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
            classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
          >
            Symptoms
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.panelDetails}>
            <div className={classes.symptomsBox}>
              <div className={classes.boxTitle}>
                <span>Fever</span>
                <div className={classes.boxActions}>
                  <AphButton>
                    <img src={require('images/round_edit_24_px.svg')} alt="" />
                  </AphButton>

                  <AphButton>
                    <img src={require('images/ic_cancel_green.svg')} alt="" />
                  </AphButton>
                </div>
              </div>
              <div className={classes.boxContent}>
                Since: Last 2 days
                <br />
                How often: Nights
                <br />
                Severity: High, 102°F
              </div>
            </div>
            <div className={classes.addButton}>
              <AphButton>
                <img src={require('images/ic_round-add.svg')} alt="" />
                Add Symptom
              </AphButton>
            </div>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel className={classes.panelRoot} defaultExpanded={true}>
          <ExpansionPanelSummary
            expandIcon={<img src={require('images/ic_accordion_up.svg')} alt="" />}
            classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
          >
            Patient History & Lifestyle
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.panelDetails}>
            <div className={classes.sectionTitle}>Family History</div>
            <div className={classes.historyBox}>
              Father: Cardiac patient
              <br /> Mother: Severe diabetes
              <br /> Married, No kids
            </div>
            <div className={classes.sectionTitle}>Allergies</div>
            <div className={classes.historyBox}>Paracetamol, Dairy, Dust</div>
            <div className={classes.sectionTitle}>Lifestyle & Habits</div>
            <div className={classes.historyBox}>
              Patient doesn’t smoke, She recovered from chickenpox 6 months ago
            </div>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    </Scrollbars>
  );
};
