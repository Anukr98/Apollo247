import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { AphButton } from '@aph/web-ui-components';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import Gold from './images/hdfc/gold.svg';
// import Platinum from './images/hdfc/platinum.svg';

const useStyles = makeStyles((theme: Theme) => {
  return {
    mainContainer: {
      width: 360,
      margin: '0 auto',
      paddingBottom: 0,
    },
    header: {
      width: 360,
      margin: '0 auto',
      padding: '12px 16px',
      background: '#fff',
      boxShadow: ' 0px 2px 5px rgba(128, 128, 128, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerFixed: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
    },
    mainContent: {
      background: '#fff',
      padding: 20,
      position: 'relative',
    },
    pageHeader: {
      fontSize: 13,
      fontWeight: 600,
      textTransform: 'uppercase',
      lineHeight: '17px',
    },
    membershipCard: {
      borderRadius: 10,
      background: '#fff',
      margin: '0 0 10px',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.16)',
      overflow: 'hidden',
      position: 'relative',
      '& >img': {
        position: 'absolute',
        top: 16,
        right: 16,
      },
      '& h4': {
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '18px',
        color: '#00B38E',
        textTransform: 'uppercase',
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 10,
        color: '#000',
        lineHeight: '16px',
      },
    },
    benefitList: {
      listStyle: 'none',
      margin: 0,
      padding: '0 0 0 20px',
      '& li': {
        position: 'relative',
        fontSize: 12,
        color: 'rgb(0 124 157 / 0.8)',
        fontWeight: 700,
        padding: '5px 0',
        '&:before': {
          content: "''",
          position: 'absolute',
          top: 10,
          left: -20,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: ' rgba(51, 150, 177, 0.2)',
        },
      },
    },

    btnContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      padding: '12px 16px',
      '& button': {
        boxShadow: 'none',
        position: 'relative',
        background: '#FC9916',
        width: '100%',
        '&:hover': {
          background: '#FC9916',
          boxShadow: 'none',
        },
      },
    },
    expansionContainer: {
      padding: '20px 0 50px',
    },
    panelRoot: {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.16)',
      borderTop: '1px solid rgba(2, 71, 91, .2)',
      borderRadius: 10,
      margin: '0 0 16px',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '0 16px',
    },
    summaryContent: {},
    expandIcon: {
      color: '#FC9916',
      margin: 0,
    },
    panelExpanded: {
      //   margin: 0,
    },
    panelDetails: {
      padding: '0 16px 20px',
      '& p': {
        fontSize: 12,
        fontWeight: 500,
      },
    },
    panelHeading: {
      margin: 0,
      fontSize: 17,
      fontWeight: 500,
      color: '#07AE8B',
    },
    detailsContent: {},
    availList: {
      margin: 0,
      padding: '0 0 0 35px',
      listStyle: 'none',
      counterReset: 'my-counter',
      '& li': {
        padding: '10px 0',
        fontSize: 12,
        color: '#007C9D',
        fontWeight: 500,
        position: 'relative',
        counterIncrement: 'my-counter',
        '&:before': {
          content: 'counter(my-counter)',
          position: 'absolute',
          top: 10,
          left: -35,
          width: 24,
          height: 24,
          borderRadius: 5,
          background: '#007C9D',
          fontSize: 14,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    },
    planCard: {
      padding: 16,
      borderRadius: 10,
      position: 'relative',
      height: 156,
      overflow: 'hidden',
      '& img': {
        position: 'absolute',
        top: 16,
        right: 16,
      },
      '& h1': {
        fontsize: 18,
        fontWeight: 700,
        textTransform: 'uppercase',
      },
    },
    gold: {
      background: `url(${require('images/hdfc/gold.svg')}) no-repeat 0 0`,
      backgroundSize: 'cover',
    },
    platinum: {
      background: `url(${require('images/hdfc/platinum.svg')}) no-repeat 0 0`,
      backgroundSize: 'cover',
    },
    benefitDesc: {
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: 2,
    },
    cardWorth: {
      fontSize: 20,
      fontWeight: 500,
      letterSpacing: 1,
      padding: '10px 0',
      lineHeight: '28px',
    },
    cardDesc: {
      fontSize: 12,
      lineHeight: '18px',
      fontWeight: 300,
    },
  };
});

export const MembershipPlanLocked: React.FC = (props) => {
  const classes = useStyles({});
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className={classes.mainContainer}>
      <header className={`${classes.header} ${classes.headerFixed}`}>
        <Link to="/">
          <img
            src={require('images/ic_back.svg')}
            title={'My Membership'}
            alt={'Back To Membership'}
          />
        </Link>
        <Typography component="h2" className={classes.pageHeader}>
          Membership Plan Detail
        </Typography>
        <Link to="/">
          <img src={require('images/hdfc/info.svg')} title={'Information'} alt={'Information'} />
        </Link>
      </header>
      <div className={classes.mainContent}>
        <div className={`${classes.planCard} ${classes.platinum}`}>
          <img src={require('images/hdfc/locked.svg')} alt="Gold MemberShip" />
          <Typography component="h1">Platinum + Plan</Typography>
          <Typography className={classes.benefitDesc}>Availing Benefits worth</Typography>
          <Typography className={classes.cardWorth}>Rs. 38K+</Typography>
          <Typography className={classes.cardDesc}>
            A host of benefits await you with our Gold+ Plan curated for HDFC customers
          </Typography>
        </div>
        <div className={classes.expansionContainer}>
          <ExpansionPanel
            expanded={expanded === 'panel1'}
            onChange={handleChange('panel1')}
            className={classes.panelRoot}
          >
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              classes={{
                root: classes.panelHeader,
                content: classes.summaryContent,
                expandIcon: classes.expandIcon,
                expanded: classes.panelExpanded,
              }}
            >
              <Typography className={classes.panelHeading}>What will you get?</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.panelDetails}>
              <div className={classes.detailsContent}>
                <ul className={classes.benefitList}>
                  <li>One Apollo Membership</li>
                  <li>Preferential access to COVID-19 home testing</li>
                  <li>Preffrential access to home and hotel care</li>
                  <li>Health essentials hamper gift</li>
                  <li>2 Vouchers for Doctor Consultation worth Rs 249 each </li>
                  <li>3 Vouchers of Rs 100 each for Apollo Pharmacy</li>
                  <li>15% Off on Apollo Labeled Products</li>
                  <li>Digital Vault for health records </li>
                  <li>Health assesment consultation by apollo Doctor </li>
                  <li>Base Diabetes management program </li>
                </ul>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel
            expanded={expanded === 'panel2'}
            onChange={handleChange('panel2')}
            className={classes.panelRoot}
          >
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              classes={{
                root: classes.panelHeader,
                content: classes.summaryContent,
                expandIcon: classes.expandIcon,
                expanded: classes.panelExpanded,
              }}
            >
              <Typography className={classes.panelHeading}>How To Avail?</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.panelDetails}>
              <div className={classes.detailsContent}>
                <Typography>Please follow these steps</Typography>
                <ul className={classes.availList}>
                  <li>Complete transactions worth Rs 25000+ on Apollo 24/7</li>
                  <li>
                    Duration of membership is 1 year. It will be auto renewed if you spend more than
                    Rs 25000 within 1 year on Apollo 24/7
                  </li>
                </ul>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel
            expanded={expanded === 'panel3'}
            onChange={handleChange('panel3')}
            className={classes.panelRoot}
          >
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              classes={{
                root: classes.panelHeader,
                content: classes.summaryContent,
                expandIcon: classes.expandIcon,
                expanded: classes.panelExpanded,
              }}
            >
              <Typography className={classes.panelHeading}>Terms &amp; Conditions</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.panelDetails}>
              <div className={classes.detailsContent}>
                <ul className={classes.benefitList}>
                  <li>One Apollo Membership</li>
                  <li>Preferential access to COVID-19 home testing</li>
                  <li>Preffrential access to home and hotel care</li>
                  <li>Health essentials hamper gift</li>
                  <li>2 Vouchers for Doctor Consultation worth Rs 249 each </li>
                  <li>3 Vouchers of Rs 100 each for Apollo Pharmacy</li>
                  <li>15% Off on Apollo Labeled Products</li>
                  <li>Digital Vault for health records </li>
                  <li>Health assesment consultation by apollo Doctor </li>
                  <li>Base Diabetes management program </li>
                </ul>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
        <div className={classes.btnContainer}>
          <AphButton color="primary" variant="contained">
            How To Avail
          </AphButton>
        </div>
      </div>
    </div>
  );
};
