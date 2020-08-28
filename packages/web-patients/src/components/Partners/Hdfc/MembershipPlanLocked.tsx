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
      height: '100%',
    },
    container: {
      width: 1064,
      margin: '0 auto',
      height: '100%',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    header: {
      width: 1064,
      margin: '0 auto',
      padding: '12px 16px',
      background: '#fff',
      boxShadow: ' 0px 2px 5px rgba(128, 128, 128, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        padding: '22px 16px',
      },
    },
    headerFixed: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'space-between',
      },
      '& h1': {
        fontSize: 16,
        lineHeight: '21px',
        fontWeight: 600,
        textTransform: 'uppercase',
        margin: '0 0 0 50px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
    },
    mainContent: {
      background: '#fff',
      padding: 0,
      position: 'relative',
      height: '100%',
    },
    pcContent: {
      padding: 20,
    },
    planCardContent: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
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
      margin: '10px 0',
      padding: '0 0 0 20px',

      transition: '0.5s ease',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridColumnGap: 30,
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        margin: 0,
      },
      '& li': {
        position: 'relative',
        fontSize: 14,
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
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
    },
    btnContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,

      [theme.breakpoints.down('sm')]: {
        bottom: -55,
        left: 0,
        padding: '12px 16px',
        background: '#fff',
      },
      '& button': {
        color: '#FC9916',
        position: 'relative',
        background: '#fff',
        borderRadius: 0,
        width: 160,
        boxShadow: 'none',
        '&:hover': {
          background: '#fff',
          color: '#FC9916',
          boxShadow: 'none',
        },
        [theme.breakpoints.down('sm')]: {
          width: '100%',

          background: '#FC9916',
          borderRadius: 5,
          color: '#fff',
          '&:hover': {
            background: '#FC9916',
            boxShadow: 'none',
          },
        },
      },
    },
    expansionContainer: {
      padding: '20px 0 50px',
      [theme.breakpoints.down('sm')]: {
        padding: 20,
      },
    },
    panelRoot: {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.16)',
      borderTop: '1px solid rgba(2, 71, 91, .2)',
      borderRadius: '0 !important',
      margin: '0 !important',
      [theme.breakpoints.down('sm')]: {
        margin: '0 0 16px !important',
      },
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '0 30px',
      [theme.breakpoints.down('sm')]: {
        padding: '0 16px',
      },
    },
    summaryContent: {},
    expandIcon: {
      margin: 0,
      [theme.breakpoints.down('sm')]: {
        color: '#FC9916',
      },
    },
    panelExpanded: {
      //   margin: 0,
    },
    panelDetails: {
      padding: '0 30px 20px',
      [theme.breakpoints.down('sm')]: {
        padding: '0 16px 20px',
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
    },
    panelHeading: {
      margin: 0,
      fontSize: 17,
      fontWeight: 500,
      color: '#07AE8B',
    },
    detailsContent: {
      width: '100%',
    },
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
      position: 'relative',
      width: 400,
      height: 200,
      borderRadius: 4,
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        height: 160,
        position: 'static',
        // borderRadius: 10,
      },
      '& img': {
        position: 'absolute',
        top: 16,
        right: 16,
        [theme.breakpoints.down('sm')]: {
          top: 30,
          right: 30,
        },
      },
      '& h1': {
        fontsize: 28,
        fontWeight: 700,
        textTransform: 'uppercase',
        [theme.breakpoints.down('sm')]: {
          fontsize: 18,
        },
      },
    },
    gold: {
      background: `url(${require('images/hdfc/gold.svg')}) no-repeat 0 0`,
      backgroundSize: 'cover',
    },
    platinum: {
      background: `url(${require('images/hdfc/platinum.svg')}) no-repeat center center`,
      backgroundSize: 'cover',
    },
    benefitDesc: {
      fontSize: 16,
      fontWeight: 500,
      letterSpacing: 2,
      [theme.breakpoints.down('sm')]: {
        fontSize: 12,
      },
    },
    cardWorth: {
      fontSize: 24,
      fontWeight: 500,
      letterSpacing: 1,
      padding: '10px 0',
      lineHeight: '28px',
      [theme.breakpoints.down('sm')]: {
        fontSize: 12,
      },
    },
    cardDesc: {
      fontSize: 14,
      lineHeight: '18px',
      fontWeight: 300,
      width: '50%',
      [theme.breakpoints.down('sm')]: {
        fontSize: 12,
        width: '100%',
      },
    },
    hideMobile: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    showMobile: {
      display: 'block',
    },
    hideWeb: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    tncList: {
      margin: 0,
      padding: '0 0 0 20px',
      listStyle: 'decimal',
      '& li': {
        fontSize: 16,
        padding: '10px 0 10px 10px',
        '& a': {
          fontWeight: 700,
          color: '#FC9916',
        },
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
    },
    availSection: {
      position: 'absolute',
      top: 20,
      right: 30,
      width: 580,
      [theme.breakpoints.down('sm')]: {
        position: 'static',
        width: '100%',
      },
    },
    tncHeading: {
      color: '#02457b',
      textTransform: 'uppercase',
      fontWeight: 700,
    },
    tncHeader: {
      '& svg': {
        color: '#fc9916',
      },
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
        <div className={classes.headerContent}>
          <Link to="/" className={classes.hideMobile}>
            <img
              src={require('images/ic_logo.png')}
              title={'My Membership'}
              alt={'Back To Membership'}
              width="77"
            />
          </Link>
          <Link to="/" className={classes.hideWeb}>
            <img
              src={require('images/ic_back.svg')}
              title={'My Membership'}
              alt={'Back To Membership'}
            />
          </Link>
          <Typography component="h1" className={classes.pageHeader}>
            Membership Plan Detail
          </Typography>
        </div>
        <div>
          <Link to="/" className={classes.hideMobile}>
            <img
              src={require('images/hdfc/hdfc-logo.svg')}
              title={'Information'}
              alt={'Information'}
              width="100"
            />
          </Link>
          <Link to="/" className={classes.hideWeb}>
            <img src={require('images/hdfc/info.svg')} title={'Information'} alt={'Information'} />
          </Link>
        </div>
      </header>
      <div className={classes.container}>
        <div className={classes.mainContent}>
          <div className={classes.pcContent}>
            <div className={classes.planCardContent}>
              <div className={`${classes.planCard} ${classes.platinum}`}>
                <img src={require('images/hdfc/medal.svg')} alt="Gold MemberShip" />
                <Typography component="h1">Platinum + Plan</Typography>
                <Typography className={classes.benefitDesc}>Availing Benefits worth</Typography>
                <Typography className={classes.cardWorth}>Rs. 38K+</Typography>
                <Typography className={classes.cardDesc}>
                  A host of benefits await you with our Gold+ Plan curated for HDFC customers
                </Typography>
                <div className={classes.btnContainer}>
                  <AphButton variant="contained">Explore Now</AphButton>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.expansionContainer}>
            <ExpansionPanel defaultExpanded className={classes.panelRoot}>
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
              defaultExpanded
              className={`${classes.panelRoot} ${classes.availSection}`}
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
                      Duration of membership is 1 year. It will be auto renewed if you spend more
                      than Rs 25000 within 1 year on Apollo 24/7
                    </li>
                  </ul>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={expanded === 'panel3'}
              onChange={handleChange('panel3')}
              className={`${classes.panelRoot} ${classes.tncHeader}`}
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
                <Typography className={`${classes.panelHeading} ${classes.tncHeading}`}>
                  Terms &amp; Conditions
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul className={classes.tncList}>
                    <li>
                      The Healthy Life offering is the marketing program offered by Apollo 24/7, an
                      app managed by Apollo Hospitals Enterprise Limited (AHEL) only for HDFC Bank
                      customers.
                    </li>
                    <li>
                      The validity of the program (“Term”) is till 31st August 2021, unless extended
                      by Apollo 24/7 and HDFC Bank.
                    </li>
                    <li>
                      The discounts applicable as per the Healthy Life program shall be applied at
                      the time of payment checkout by the customer.
                    </li>
                    <li>
                      This program is designed for select HDFC customers and offerings will vary
                      with the different categories of HDFC customers. However, membership schemes
                      can be upgraded on the basis of the spending on the Apollo 24/7 app as
                      mentioned in the offer grid.
                    </li>
                    <li>
                      The Healthy Life Program is open to all HDFC customers with a valid Indian
                      mobile number only.
                    </li>
                    <li>
                      The T&amp;C’s of the silver, gold and platinum membership offered in the
                      Healthy Life program shall be governed by the terms &amp; conditions of the
                      website -{' '}
                      <a href="https://www.oneapollo.com/terms-conditions/">
                        https://www.oneapollo.com/terms-conditions/
                      </a>
                    </li>
                    <li>
                      The Healthy Life offering will be applicable to all HDFC customers, whether
                      they are existing customers of Apollo 24/7 or not. However, all the customers
                      shall adhere to the offerings as mentioned in this marketing program.
                    </li>
                    <li>The Healthy Life program is non-transferable.</li>
                    <li>
                      The activation of the benefits for the Healthy Life program will be completed
                      24 hours post the service delivery/fulfillment of the qualifying transaction.
                      For e.g., to unlock benefits, the user is needed to make a qualifying
                      transaction of INR 499, amount subject to change as per different tiers
                    </li>
                    <li>
                      By enrolling for the Healthy Life program, a member consents to allow use and
                      disclosure by Apollo Health centres, along with his/her personal and other
                      information as provided by the member at the time of enrolment and/or
                      subsequently.
                    </li>
                    <li>
                      As a prerequisite to becoming a member, a customer will need to provide
                      mandatory information including full name, valid and active Indian mobile
                      number. He/she shall adhere to such terms and conditions as may be prescribed
                      for membership from time to time.
                    </li>
                    <li>
                      The Healthy Life membership program will be issued solely at the discretion of
                      the management and the final discretion on all matters relating to the
                      membership shall rest with Apollo 24/7(AHEL).
                    </li>
                    <li>
                      Healthy Life program is a corporate offering exclusively for HDFC bank
                      customers and not for individuals.
                    </li>
                    <li>
                      Apollo 24/7 reserves the right to add, alter, amend and revise terms and
                      conditions as well as rules and regulations governing the Healthy Life
                      membership program without prior notice.
                    </li>
                    <li>
                      Benefits and offers available through the program may change or be withdrawn
                      without prior intimation. Apollo 24/7 will not be responsible for any
                      liability arising from such situations or use of such offers.
                    </li>
                    <li>
                      Any disputes arising out of the offer shall be subject to arbitration by a
                      sole arbitrator appointed by Apollo 24/7 for this purpose. The proceedings of
                      the arbitration shall be conducted as per the provisions of Arbitration and
                      Conciliation Act, 1996. The place of arbitration shall be at Chennai and
                      language of arbitration shall be English. The existence of a dispute, if at
                      all, shall not constitute a claim against Apollo 24/7.
                    </li>
                  </ul>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
