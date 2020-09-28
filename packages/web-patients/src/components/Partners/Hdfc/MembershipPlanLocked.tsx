import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { AphButton } from '@aph/web-ui-components';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import Gold from './images/hdfc/gold.svg';
// import Platinum from './images/hdfc/platinum.svg';
import { useApolloClient } from 'react-apollo-hooks';
import { clientRoutes } from 'helpers/clientRoutes';
import {
  GetAllUserSubscriptionsWithPlanBenefits,
  GetAllUserSubscriptionsWithPlanBenefitsVariables,
} from 'graphql/types/GetAllUserSubscriptionsWithPlanBenefits';
import { GET_ALL_USER_SUBSCRIPTIONS_WITH_BENEFITS } from 'graphql/profiles';

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
    loadingContainer: {
      width: '100%',
      height: '100%',
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    couponCard: {
      background: '#fafafa',
      padding: 16,
      borderRadius: 10,
      transition: '0.5s ease-in-out',
      height: 220,
      overflow: 'hidden',
      position: 'relative',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        background: '#fff',
        margin: '0 0 16px',
        width: '100%',
        textAlign: 'left',
        height: 'auto',
        boxShadow: '0px 0px 32px rgba(0, 0, 0, 0.1)',
      },
      '& h2': {
        fontSize: 14,
        // color: '#07AE8B',
        fontWeight: 600,
        margin: '0 0 5px',
      },
      '& p': {
        fontSize: 11,
        lineHeight: '18px',
        width: '80%',
      },
      '&:hover': {
        boxShadow: ' 0px 1px 12px rgba(128, 128, 128, 0.2)',
        '& a': {
          background: '#FC9916',
          color: '#FFF',
          [theme.breakpoints.down('sm')]: {
            background: '#fff',
            color: '#FC9916',
          },
        },
      },
      '& a': {
        background: '#fff',
        color: '#FC9916',
        width: '100%',
        transition: '0.5s ease-in-out',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 0,
        [theme.breakpoints.down('sm')]: {
          fontSize: 13,
          background: '#fff',
          color: '#FC9916',
          margin: '0px 0 0 auto',
          boxShadow: 'none',
          borderRadius: 5,
          display: 'block',
          width: 'auto',
          position: 'static',
          '&:hover': {
            background: '#fff',
            color: '#FC9916',
          },
        },
      },
      '& ul': {
        margin: '0 0 30px ',
        [theme.breakpoints.down('sm')]: {
          margin: 0,
        },
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
    couponList: {
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'flex-start',

      flexWrap: 'wrap',
      margin: '0 -10px',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        margin: 0,
      },
      '& >li': {
        padding: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '25%',
        [theme.breakpoints.down('sm')]: {
          width: '100%',
          display: 'block',
          padding: 0,
        },
      },
    },
    btnContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      [theme.breakpoints.down('sm')]: {
        bottom: 0,
        left: 0,
        padding: '12px 16px',
        background: '#fff',
        position: 'fixed',
        zIndex: 999,
      },

      '& a': {
        background: '#fff',
        position: 'relative',
        color: '#FC9916',
        width: '100%',
        boxShadow: 'none',
        borderRadius: '0 0 5px 5px',
        '&:hover': {
          background: '#fff',
          color: '#FC9916',
          boxShadow: 'none',
        },
        [theme.breakpoints.down('sm')]: {
          width: '100%',
          background: '#fff',
          borderRadius: 5,
          color: '#FC9916',
          '&:hover': {
            background: '#FC9916',
          },
        },
      },
    },
    expansionContainer: {
      padding: '20px 0 50px',
      [theme.breakpoints.down('sm')]: {
        padding: 0,
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
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
    },
    panelHeading: {
      margin: 0,
      fontSize: 17,
      fontWeight: 500,
      // color: '#07AE8B',
      textAlign: 'center',
      '& img': {
        margin: '0 10px 0 0',
      },
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
    cardContent: {},
    planCard: {
      padding: 16,
      position: 'relative',
      width: 400,
      height: 230,
      boxShadow: '0px 0px 32px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        height: 160,
        position: 'static',
        // borderRadius: 10,
        boxShadow: 'none',
        padding: 0,
      },
      '& img': {
        margin: '0 auto 0',
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
    silver: {
      '& p': {
        '&:before': {
          borderColor: '#C7C7C7',
        },
        '& span': {
          color: '#898989, 100%',
        },
      },
    },
    gold: {
      '& p': {
        '&:before': {
          borderColor: '#E7BB65',
        },
        '& span': {
          color: '#B45807',
        },
      },
    },
    platinum: {
      '& p': {
        '&:before': {
          borderColor: '#C7C7C7',
        },
        '& span': {
          color: '#606060',
        },
      },
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
      height: 230,
      border: 'none',
      boxShadow: '0px 0px 32px rgba(0, 0, 0, 0.1)',
      background: '#fff',
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
    planName: {
      textAlign: 'center',
      position: 'relative',
      margin: '5px 0',
      '&:before': {
        content: "''",
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        borderBottom: '1px solid transparent',
      },
      '& span': {
        padding: '5px 15px',
        background: '#fff',
        display: 'inline-block',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: 600,
        position: 'relative',
        zIndex: 2,
      },
    },
    ciContent: {
      boxShadow: '0px 0px 32px rgba(0, 0, 0, 0.1)',
      background: '#fff',
      padding: 40,
      height: 230,
      '& h2': {
        fontSize: 20,
        fontWeight: 700,
        margin: '0 0 20px',
      },
      '& h5': {
        fontSize: 18,
        fontWeight: 600,
        margin: '0 0 10px',
      },
    },
    availContent: {
      '& p': {
        color: '#007C9D',
        fontSize: 18,
        fontWeight: 500,
      },
    },
  };
});

interface upgradableSubscriptionType {
  name: String;
  benefits: Array<string>;
  min_transaction_value: String;
}

export const MembershipPlanLocked: React.FC = (props) => {
  const classes = useStyles({});
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const [subscriptionInclusions, setSubscriptionInclusions] = React.useState([]);
  const [upgradableSubscription, setUpgradableSubscription] = React.useState<
    upgradableSubscriptionType
  >();
  const [planName, setPlanName] = React.useState<string>('');
  const [benefitsWorth, setBenefitsWorth] = React.useState<string>('');
  const [minimumTransactionValue, setMinimumTransactionValue] = React.useState<string>('');
  const [upgradableTransactionValue, setUpgradableTransactionValue] = React.useState<string>('');
  const apolloClient = useApolloClient();

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const cardBg = (plan: String) => {
    if (plan === 'GOLD+ PLAN') {
      return classes.gold;
    }
    if (plan === 'PLATINUM+ PLAN') {
      return classes.platinum;
    } else {
      return classes.gold;
    }
  };
  const getMedalImage = (planName: String) => {
    if (planName == 'GOLD+ PLAN') {
      return require('images/hdfc/gold.svg');
    }
    if (planName == 'PLATINUM+ PLAN') {
      return require('images/hdfc/platinum.svg');
    } else return require('images/hdfc/silver.svg');
  };

  useEffect(() => {
    apolloClient
      .query<
        GetAllUserSubscriptionsWithPlanBenefits,
        GetAllUserSubscriptionsWithPlanBenefitsVariables
      >({
        query: GET_ALL_USER_SUBSCRIPTIONS_WITH_BENEFITS,
        variables: {
          mobile_number: localStorage.getItem('userMobileNo'),
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setUpgradableSubscription(
          // response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].can_upgrade_to
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].can_upgrade_to
        );
        setPlanName(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].can_upgrade_to.name
        );
        setBenefitsWorth(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].can_upgrade_to
            .benefits_worth
        );
        setMinimumTransactionValue(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].can_upgrade_to
            .min_transaction_value
        );
        setUpgradableTransactionValue(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0]
            .upgrade_transaction_value
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed fetching Subscription Inclusions' + error);
      });
  }, []);

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
            Membership Details
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
        {loading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress size={30} />
          </div>
        ) : (
          <div className={classes.mainContent}>
            <div className={classes.pcContent}>
              <div className={classes.planCardContent}>
                <div className={classes.planCard + ' ' + cardBg(planName)}>
                  <div className={classes.cardContent}>
                    <img src={getMedalImage(planName)} alt="" />
                    <Typography className={classes.planName}>
                      <span>{planName.split('+')[0]}</span>
                    </Typography>
                  </div>
                  <div className={classes.btnContainer}>
                    <AphButton variant="contained" href={clientRoutes.welcome()}>
                      Explore Now
                    </AphButton>
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
                    <ul className={classes.couponList}>
                      {upgradableSubscription &&
                        upgradableSubscription.benefits.map((item: any) => {
                          return (
                            <li>
                              <div className={classes.couponCard}>
                                <Typography component="h2">{item.header_content}</Typography>
                                <Typography>{item.description}</Typography>
                              </div>
                            </li>
                          );
                        })}
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
                  <Typography className={classes.panelHeading}>
                    <img src={require('images/hdfc/info-avail.svg')} alt="" /> How To Avail?
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.panelDetails}>
                  <div className={`${classes.detailsContent} ${classes.availContent}`}>
                    <Typography>
                      Complete transactions worth Rs. {upgradableTransactionValue} or more on the
                      Apollo 24|7 app to unlock platinum+ plan membership
                    </Typography>
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
                        The Healthy Life offering is the marketing program offered by Apollo 24|7,
                        an app managed by Apollo Hospitals Enterprise Limited (AHEL) only for HDFC
                        Bank customers.
                      </li>
                      <li>
                        The validity of the program (“Term”) is till 31st August 2021, unless
                        extended by Apollo 24|7 and HDFC Bank.
                      </li>
                      <li>
                        The discounts applicable as per the Healthy Life program shall be applied at
                        the time of payment checkout by the customer.
                      </li>
                      <li>
                        This program is designed for select HDFC customers and offerings will vary
                        with the different categories of HDFC customers. However, membership schemes
                        can be upgraded on the basis of the spending on the Apollo 24|7 app as
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
                        they are existing customers of Apollo 24|7 or not. However, all the
                        customers shall adhere to the offerings as mentioned in this marketing
                        program.
                      </li>
                      <li>The Healthy Life program is non-transferable.</li>
                      <li>
                        The activation of the benefits for the Healthy Life program will be
                        completed 24 hours post the service delivery/fulfillment of the qualifying
                        transaction. For e.g., to unlock benefits, the user is needed to make a
                        qualifying transaction of INR 499, amount subject to change as per different
                        tiers
                      </li>
                      <li>
                        By enrolling for the Healthy Life program, a member consents to allow use
                        and disclosure by Apollo Health centres, along with his/her personal and
                        other information as provided by the member at the time of enrolment and/or
                        subsequently.
                      </li>
                      <li>
                        As a prerequisite to becoming a member, a customer will need to provide
                        mandatory information including full name, valid and active Indian mobile
                        number. He/she shall adhere to such terms and conditions as may be
                        prescribed for membership from time to time.
                      </li>
                      <li>
                        The Healthy Life membership program will be issued solely at the discretion
                        of the management and the final discretion on all matters relating to the
                        membership shall rest with Apollo 24|7(AHEL).
                      </li>
                      <li>
                        Healthy Life program is a corporate offering exclusively for HDFC bank
                        customers and not for individuals.
                      </li>
                      <li>
                        Apollo 24|7 reserves the right to add, alter, amend and revise terms and
                        conditions as well as rules and regulations governing the Healthy Life
                        membership program without prior notice.
                      </li>
                      <li>
                        Benefits and offers available through the program may change or be withdrawn
                        without prior intimation. Apollo 24|7 will not be responsible for any
                        liability arising from such situations or use of such offers.
                      </li>
                      <li>
                        Any disputes arising out of the offer shall be subject to arbitration by a
                        sole arbitrator appointed by Apollo 24|7 for this purpose. The proceedings
                        of the arbitration shall be conducted as per the provisions of Arbitration
                        and Conciliation Act, 1996. The place of arbitration shall be at Chennai and
                        language of arbitration shall be English. The existence of a dispute, if at
                        all, shall not constitute a claim against Apollo 24|7.
                      </li>
                    </ul>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
