import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      padding: 20,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginTop: 20,
      fontSize: 14,
      lineHeight: '23px',
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '25px',
      },      
    },
    panelRoot: {
      marginBottom: '0px !important',
      marginTop: '0 !important',
      boxShadow: 'none',
      width: '100%',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      borderRadius: '0 !important',
      '&:before': {
        display: 'none',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    panelHeader: {
      fontSize: 14,
      padding: '16px 0',
      fontWeight: 600,
      color: '#02475b',
      alignItems: 'flex-start',
      minHeight: 'auto',
    },
    summaryContent: {
      margin: 0,
      display: 'block',
    },
    expandIcon: {
      padding: 0,
      margin: 0,
    },
    panelExpanded: {
      minHeight: 'auto !important',
      margin: '0 !important',
    },
    panelDetails: {
      padding: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      paddingBottom: 16,
    },
  });
});

export const FrequentlyQuestions: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <h3>Frequently asked questions</h3>
      <ExpansionPanel
        className={classes.panelRoot}
      >
        <ExpansionPanelSummary
          expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
          classes={{
            root: classes.panelHeader,
            content: classes.summaryContent,
            expandIcon: classes.expandIcon,
            expanded: classes.panelExpanded,
          }}
        >
          How do I book a diagnostic test on Apollo 24/7?
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          To book a test on Apollo 24/7, click on the ‘Order Tests’ section on the website/app, select the test, and click on ‘Add to Cart’. Then go to the cart and choose either ‘Home Visit’ or ‘Clinic Visit’ and click on ‘Proceed to Payment. Please note that currently all the tests booked on Apollo 24/7 will be Cash on Delivery (COD).
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel
        className={classes.panelRoot}
      >
        <ExpansionPanelSummary
          expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
          classes={{
            root: classes.panelHeader,
            content: classes.summaryContent,
            expandIcon: classes.expandIcon,
            expanded: classes.panelExpanded,
          }}
        >
          Can I cancel a test that I have booked and how do I do it?
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          To book a test on Apollo 24/7, click on the ‘Order Tests’ section on the website/app, select the test, and click on ‘Add to Cart’. Then go to the cart and choose either ‘Home Visit’ or ‘Clinic Visit’ and click on ‘Proceed to Payment. Please note that currently all the tests booked on Apollo 24/7 will be Cash on Delivery (COD).
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel
        className={classes.panelRoot}
      >
        <ExpansionPanelSummary
          expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
          classes={{
            root: classes.panelHeader,
            content: classes.summaryContent,
            expandIcon: classes.expandIcon,
            expanded: classes.panelExpanded,
          }}
        >
          How do I reschedule a test?
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          To book a test on Apollo 24/7, click on the ‘Order Tests’ section on the website/app, select the test, and click on ‘Add to Cart’. Then go to the cart and choose either ‘Home Visit’ or ‘Clinic Visit’ and click on ‘Proceed to Payment. Please note that currently all the tests booked on Apollo 24/7 will be Cash on Delivery (COD).
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};

