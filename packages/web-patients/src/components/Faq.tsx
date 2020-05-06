import React from 'react';
import { Theme, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { BottomLinks } from 'components/BottomLinks';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { AphButton, AphTextField } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      fontSize: 18,
      '& p': {
        marginBottom: 20,
        lineHeight: 1.5,
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
      },
    },
    sectionTop: {
      backgroundColor: '#fff',
      padding: '20px 16px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.up('sm')]: {
        padding: '20px 40px',
      },
      '& h1': {
        fontSize: 28,
        lineHeight: '36px',
        fontWeight: 600,
        color: '#02475b',
        margin: 0,
        [theme.breakpoints.up('sm')]: {
          fontSize: 50,
          lineHeight: '65px',  
        },
      },
      '& p': {
        fontSize: 14,
        margin: 0,
        paddingTop: 8,
        [theme.breakpoints.up('sm')]: {
          fontSize: 16,
        },
      },
    },
    contentGroup: {
      padding: 20,
    },
    faqGroup: {
      backgroundColor: '#fff',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 10,
      overflow: 'hidden',
      maxWidth: 720,
      margin: 'auto',
    },
    panelRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: '0 !important',
      marginBottom: '0px !important',
      marginTop: '0 !important',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      width: '100%',
      '&:before': {
        display: 'none',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    panelsGroup: {
      '& >div:last-child': {
        marginBottom: '0 !important',
      },
      [theme.breakpoints.up('sm')]: {
        '& >div:nth-child(even)': {
          backgroundColor: 'transparent',
        },
      },
    },
    panelHeader: {
      padding: 16,
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      alignItems: 'flex-start',
      [theme.breakpoints.up('sm')]: {
        padding: 20,
      },
    },
    summaryContent: {
      margin: 0,
      display: 'block',
      '& h3': {
        fontSize: 18,
        margin: 0,
        color: '#0087ba',
        fontWeight: 500,
      },
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
      fontSize: 14,
      lineHeight: 22,
      padding: '0 16px',
      display: 'inherit',
      [theme.breakpoints.up('sm')]: {
        padding: '0 20px',
        fontSize: 16,
        lineHeight: '26px',
      },
      '& p': {
        marginTop: 0,
        marginBottom: 16,
      },
    },
    faqSearchForm: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px 10px 12px',
      marginTop: 20,
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    searchInput: {
      '& input': {
        [theme.breakpoints.down('xs')]: {
          backgroundColor: '#f7f8f5',
          padding: '15px 33px 15px 12px',
          borderBottom: '2px solid transparent',
          '&:focus': {
            backgroundColor: '#fff',
            borderBottom: '2px solid #00b38e',
            paddingLeft: 0,
          },
        },
      },
      '& >div': {
        '&:after': {
          display: 'none',
        },
        '&:before': {
          display: 'none',
        },
      },
    },
    searchBtn: {
      marginLeft: 'auto',
      padding: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent !important',
      minWidth: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: -30,
      },
    },
    searchBtnDisabled: {
      opacity: 0.5,
    },
  };
});

export const Faq: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.sectionTop}>
            <h1>how can we help you?</h1>
            <p>We are here to answer all your Frequently Asked Questions</p>
            <div className={classes.faqSearchForm}>
              <AphTextField
                placeholder="Search for your queries here"
                className={classes.searchInput}
              />
              <AphButton
                className={classes.searchBtn}
                classes={{
                  disabled: classes.searchBtnDisabled,
                }}
              >
                <img src={require('images/ic_send.svg')} alt="" />
              </AphButton>
            </div>
          </div>
          <div className={classes.contentGroup}>
            <div className={classes.faqGroup}>
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
                <h3>What is the first question here?</h3>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <p>Here, we will answer the questions you’ve raised over the time. And we will be very happy to help you. These questions are based on your queries.</p>
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
                <h3>What is the second question?</h3>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <p>Here, we will answer the questions you’ve raised over the time. And we will be very happy to help you. These questions are based on your queries.</p>
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
                <h3>What is the third question?</h3>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <p>Here, we will answer the questions you’ve raised over the time. And we will be very happy to help you. These questions are based on your queries.</p>
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
                <h3>What is the fourth question?</h3>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <p>Here, we will answer the questions you’ve raised over the time. And we will be very happy to help you. These questions are based on your queries.</p>
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
                <h3>What is the fifth question?</h3>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <p>Here, we will answer the questions you’ve raised over the time. And we will be very happy to help you. These questions are based on your queries.</p>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            </div>
          </div>
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};
