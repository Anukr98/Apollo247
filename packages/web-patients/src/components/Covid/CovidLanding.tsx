import React from 'react';
import { Theme, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { Banner } from 'components/Covid/Banner';
import { AphButton } from '@aph/web-ui-components';
import { ArticleCard } from 'components/Covid/ArticleCard';
import { CheckRiskLevel } from 'components/Covid/CheckRiskLevel';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f7f8f5',
      paddingBottom: 20,
      [theme.breakpoints.up('sm')]: {
        borderRadius: '0 0 10px 10px',
      }
    },
    sectionGroup: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        padding: 0,
      },
    },
    panelRoot: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '10px !important',
      marginTop: '0 !important',
      width: '100%',
      '&:before': {
        display: 'none',
      },
      [theme.breakpoints.up('sm')]: {
        borderRadius: '0 !important',
        boxShadow: 'none',
        marginBottom: '0 !important',
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
    },
    summaryContent: {
      margin: 0,
      display: 'block',
      '& h3': {
        fontSize: 17,
        margin: 0,
        color: '#01475b',
        fontWeight: 500,
        [theme.breakpoints.up('sm')]: {
          color: '#0087ba',
        },
      },
      '& p': {
        fontSize: 12,
        margin: 0,
        paddingTop: 5,
        color: '#01475b',
        opacity: 0.6,
      },
    },
    expandIcon: {
      padding: 0,
      margin: 0,
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    panelExpanded: {
      minHeight: 'auto !important',
      margin: '0 !important',
    },
    panelDetails: {
      padding: '16px 0',
      margin: '0 16px',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      display: 'inherit',
    },
    bottomActions: {
      textAlign: 'center',
    },
    viewmoreBtn: {
      backgroundColor: 'transparent',
      color: '#fc9916',
      boxShadow: 'none',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
      },
    },
  };
});

export const CovidLanding: React.FC = (props) => {
  const classes = useStyles();
  const isDesktopOnly = useMediaQuery('(min-width:768px)');

  return (
    <div className={classes.root}>
      {isDesktopOnly ? <Header /> : ''}
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <Banner />
          <div className={classes.sectionGroup}>
            <div className={classes.panelsGroup}>
              <ExpansionPanel
                className={classes.panelRoot}
                defaultExpanded={true}
              >
                <ExpansionPanelSummary
                  expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
                  classes={{
                    root: classes.panelHeader,
                    content: classes.summaryContent,
                    expandIcon: classes.expandIcon,
                    expanded: classes.panelExpanded
                  }}
                >
                  <h3>How can I stay safe?</h3>
                  <p>Articles and videos about basic protective measures against the coronavirus</p>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails
                  className={classes.panelDetails}
                >
                  <ArticleCard />
                  <div className={classes.bottomActions}>
                    <AphButton className={classes.viewmoreBtn}>View More</AphButton>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                className={classes.panelRoot}
                defaultExpanded={true}
              >
                <ExpansionPanelSummary
                  expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
                  classes={{
                    root: classes.panelHeader,
                    content: classes.summaryContent,
                    expandIcon: classes.expandIcon,
                    expanded: classes.panelExpanded
                  }}
                >
                  <h3>What to do if I have symptoms?</h3>
                  <p>Know more about the symptoms and preventions through articles and videos.</p>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails
                  className={classes.panelDetails}
                >
                  <ArticleCard />
                  <div className={classes.bottomActions}>
                    <AphButton className={classes.viewmoreBtn}>View More</AphButton>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
              <ExpansionPanel
                className={classes.panelRoot}
                defaultExpanded={true}
              >
                <ExpansionPanelSummary
                  expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
                  classes={{
                    root: classes.panelHeader,
                    content: classes.summaryContent,
                    expandIcon: classes.expandIcon,
                    expanded: classes.panelExpanded
                  }}
                >
                  <h3>How are we getting ahead?</h3>
                  <p>Learn how Apollo is making a difference to help the world against coronavirus.</p>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails
                  className={classes.panelDetails}
                >
                  <ArticleCard />
                  <div className={classes.bottomActions}>
                    <AphButton className={classes.viewmoreBtn}>View More</AphButton>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
            <CheckRiskLevel />
          </div>
        </div>
      </div>
    </div>
  );
};
