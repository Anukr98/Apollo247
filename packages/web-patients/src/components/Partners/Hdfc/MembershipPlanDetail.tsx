import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
// import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import WarningModel from 'components/WarningModel';
import { AphButton, AphDialog } from '@aph/web-ui-components';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { clientRoutes } from 'helpers/clientRoutes';
import { useApolloClient } from 'react-apollo-hooks';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import {
  GetAllUserSubscriptionsWithPlanBenefits,
  GetAllUserSubscriptionsWithPlanBenefitsVariables,
} from 'graphql/types/GetAllUserSubscriptionsWithPlanBenefits';

import {
  initiateCallForPartner,
  initiateCallForPartnerVariables,
} from 'graphql/types/initiateCallForPartner';
import {
  GET_ALL_USER_SUBSCRIPTIONS_WITH_BENEFITS,
  INITIATE_CALL_FOR_PARTNER,
} from 'graphql/profiles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    mainContainer: {
      height: 'calc(100vh - 90px)',
    },
    container: {
      width: 1064,
      margin: '0 auto',
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
    loadingContainer: {
      width: '100%',
      height: '100%',
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    mainContent: {
      background: '#fff',
      padding: 0,
      position: 'relative',
    },
    pcContent: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      padding: '0 0 10px',
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
        background: '#FC9916',
        position: 'relative',
        color: '#fff',
        width: '100%',
        boxShadow: 'none',
        borderRadius: '0 0 5px 5px',
        '&:hover': {
          background: '#FC9916',
          color: '#fff',
          boxShadow: 'none',
        },
        [theme.breakpoints.down('sm')]: {
          width: '100%',
          background: '#FC9916',
          borderRadius: 5,
          color: '#fff',
          '&:hover': {
            background: '#FC9916',
          },
        },
      },
    },
    expansionContainer: {
      padding: 30,
      [theme.breakpoints.down('sm')]: {
        padding: 16,
      },
    },
    panelRoot: {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.16)',
      borderTop: '1px solid rgba(2, 71, 91, .2)',
      borderRadius: '0 !important',
      margin: '0 0 16px',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '0 16px',
      borderRadius: 0,
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
      display: 'block',
      '& p': {
        fontSize: 12,
        fontWeight: 500,
      },
    },
    panelHeading: {
      margin: 0,
      fontSize: 17,
      fontWeight: 500,
      // color: '#07AE8B',
      textTransform: 'uppercase',
    },
    detailsContent: {
      padding: 20,
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
        boxShadow: 'none',
        // borderRadius: 10,
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
    tabsRoot: {
      borderTop: '1px solid rgba(2, 71, 91, .3)',
      borderBottom: '1px solid rgba(2, 71, 91, .3)',
      background: '#ffffff',
      boxShadow: '0px 5px 20px rgba(128, 128, 128, 0.2)',
      '& >div': {
        '& >div': {
          justifyContent: 'space-around',
          [theme.breakpoints.down('sm')]: {
            justifyContent: 'flex-start',
          },
        },
      },
      '& button': {
        flex: '1 0 auto',
      },
    },
    tabRoot: {
      textTransform: 'none',
      fontWeight: 'bold',
      fontSize: 14,
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    tabContainer: {
      overflow: 'hidden',
      position: 'relative',
    },
    tabContent: {
      // padding: 30,
      [theme.breakpoints.down('sm')]: {
        // padding: 16,
      },
    },
    couponContent: {
      display: 'grid',
      gridTemplateColumns: 'auto auto auto',
      gridGap: 10,
      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      padding: '10px 0 0',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        padding: 0,
        border: 'none',
      },
    },
    couponDetails: {
      [theme.breakpoints.down('sm')]: {
        padding: '5px 0',
      },
      '& h3': {
        fontSize: 12,
        fontWeight: 700,
        color: '#007C9D',
        lineHeight: '16px',
        margin: '0 0 5px',
      },
      '& p': {
        fontSize: 11,
        fontWeight: 300,
        lineHeight: '15px',
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
        color: '#07AE8B',
        fontWeight: 600,
        lineHeight: '16px',
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
      '& a, button': {
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
          bottom: 10,
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
    disabledButton: {
      color: 'grey !important',
    },
    couponInactive: {
      padding: '0 30px',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 0',
        flex: 'auto',
      },
      '& p': {
        fontSize: 14,
        color: '#007C9D',
        fontWeight: 500,
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
        },
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
    planCardContent: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    couponContainer: {
      padding: 24,
      width: '100% ',
      margin: '0 0 0 30px',
      boxShadow: '0px 0px 32px rgba(0, 0, 0, 0.1)',
      '& h2': {
        fontsize: 18,
        lineHeight: '18px',
        color: '#07AE8B',
        fontWeight: 600,
        margin: '0 0 5px',
      },
      '& >p': {
        fontSize: 12,
        lineHeight: '16px',
        padding: '0 0 10px',
      },
      [theme.breakpoints.down('sm')]: {
        margin: '20px 0 0',
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
    benefitsConsumedContainer: {},
    benefitsContent: {
      padding: 30,
      [theme.breakpoints.down('sm')]: {
        padding: 16,
      },
    },
    table: {
      '& th': {
        fonsSize: 14,
        fontWeight: 700,
        color: '#00B38E',
        textTransform: 'uppercase',
      },
      '& td': {
        fontSize: 12,
        fontWeight: 500,
        color: '#000',
        textTransform: 'uppercase',
      },
    },
    tableContainer: {
      boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.16)',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        overflowX: 'auto',
      },
    },
    dialogHeader: {
      padding: '16px 16px 10px',
      '& h3': {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '21px',
      },
      '& p': {
        fontSize: 10,
        lineHeight: '13px',
      },
    },
    connectDoctorContent: {
      display: 'flex',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    },
    cdDetails: {
      width: '50%',
      padding: 12,
      '& img': {
        margin: '0 auto 10px',
      },
      '& h5': {
        fontSize: 12,
        color: '#00B38E',
        linHeight: '16px',
        '& span': {
          fontWeight: 700,
        },
      },
    },
    btncContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '10px 16px 16px',
      '& button': {
        margin: '0 0 0 10px',
        '&:first-child': {
          boxShadow: 'none',
          color: '#FC9916',
        },
      },
    },
    callNote: {
      fontSize: 12,
      linrHeight: '16px',
      '& span': {
        display: 'block',
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
    benefitIcon: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        position: 'absolute',
        top: 10,
        right: 10,
      },
    },
    beneContent: {
      [theme.breakpoints.down('sm')]: {
        width: '90%',
      },
    },
  };
});
interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};

export const MembershipPlanDetail: React.FC = (props) => {
  const classes = useStyles({});
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [value, setValue] = React.useState(0);
  const [subscriptionInclusions, setSubscriptionInclusions] = React.useState([]);
  const [coupons, setCoupons] = React.useState([]);
  const [active, setActive] = React.useState<boolean>(false);
  const [planName, setPlanName] = React.useState<string>('');
  const [benefitsWorth, setBenefitsWorth] = React.useState<string>('');
  const [minimumTransactionValue, setMinimumTransactionValue] = React.useState<string>('');
  const [successMessage, setSuccessMessage] = React.useState<object>();
  const [callDoctorPopup, setCallDoctorPopup] = React.useState<boolean>(false);
  const [exotelBenefitId, setExotelBenefitId] = React.useState<string>('');

  const apolloClient = useApolloClient();
  // const history = useHistory();

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleTabChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const cardBg = (plan: String) => {
    if (plan === 'GOLD+ PLAN') {
      return classes.gold;
    }
    if (plan === 'PLATINUM+ PLAN') {
      return classes.platinum;
    } else {
      return classes.silver;
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
        setSubscriptionInclusions(response.data.GetAllUserSubscriptionsWithPlanBenefits.response);

        setPlanName(response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].name);
        setBenefitsWorth(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].benefits_worth
        );
        setMinimumTransactionValue(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].min_transaction_value
        );
        setActive(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].subscriptionStatus ===
            'active'
        );
        setCoupons(response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].coupons);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed fetching Subscription Inclusions');
      });
  }, []);

  const initiateExotelCall = (mobileNumber: string, benefitId: string) => {
    apolloClient
      .query<initiateCallForPartner, initiateCallForPartnerVariables>({
        query: INITIATE_CALL_FOR_PARTNER,
        variables: {
          mobileNumber: mobileNumber,
          benefitId: benefitId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        response.data.initiateCallForPartner.success
          ? setSuccessMessage({ message: `You'll be connected to the Doctor in a while` })
          : setSuccessMessage({
              message: `Error while connecting to the Doctor, Please try again`,
            });
        setCallDoctorPopup(false);
      })
      .catch((error) => {
        console.log(error);
        setCallDoctorPopup(false);
        setSuccessMessage({ message: `Error while connecting to the Doctor, Please try again` });
      });
  };

  const handleWhatsappChat = (number: String, message: String) => {
    window.open(`https://api.whatsapp.com/send?phone=91${number}&text=${message}`);
  };

  const handleCTAClick = (item: any) => {
    // const cta_action = item.cta_action;
    // if (cta_action.type == 'REDIRECT') {
    //   if (cta_action.meta.action == 'SPECIALITY_LISTING') {
    //     history.push(clientRoutes.specialityListing());
    //   } else if (cta_action.meta.action == 'PHARMACY_LANDING') {
    //     history.push(clientRoutes.medicines());
    //   } else if (cta_action.meta.action == 'PHR') {
    //     history.push(clientRoutes.healthRecords());
    //   } else if (cta_action.meta.action == 'DOC_LISTING_WITH_PAYROLL_DOCS_SELECTED') {
    //     history.push(clientRoutes.doctorsLanding());
    //   } else if (cta_action.meta.action == 'DIAGNOSTICS_LANDING') {
    //     history.push(clientRoutes.tests());
    //   }
    // } else if (cta_action.type == 'CALL_API') {
    //   if (cta_action.meta.action == 'CALL_EXOTEL_API') {
    //     console.log('call exotel api');
    //     if (item.available_count > 0) {
    //       setExotelBenefitId(item._id);
    //       setCallDoctorPopup(true);
    //     } else {
    //       setSuccessMessage({
    //         message: `You have exhausted all your attempts to reach our doctors, Please try again next month.`,
    //       });
    //     }
    //     // initiateExotelCall(localStorage.getItem('userMobileNo'), item._id);
    //   }
    // } else if (cta_action.type == 'WHATSAPP_OPEN_CHAT') {
    //   handleWhatsappChat(cta_action.meta.action, cta_action.meta.message);
    // } else {
    //   history.push(clientRoutes.welcome());
    // }
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
            Subscription Plan Detail
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
      {loading ? (
        <div className={classes.loadingContainer}>
          <CircularProgress size={30} />
        </div>
      ) : (
        <div className={classes.container}>
          <div className={classes.mainContent}>
            <div className={classes.pcContent}>
              <div className={classes.planCardContent}>
                <div className={classes.planCard + ' ' + cardBg(planName)}>
                  <div className={classes.cardContent}>
                    <img src={getMedalImage(planName)} alt="" />
                    <Typography className={classes.planName}>
                      <span>Gold</span>
                    </Typography>
                  </div>
                  <div className={classes.btnContainer}>
                    <AphButton variant="contained" href={clientRoutes.welcome()} color="primary">
                      {active ? 'Explore Now' : 'Activate Now'}
                    </AphButton>
                  </div>
                </div>

                {active ? (
                  <div className={classes.couponContainer}>
                    <Typography component="h2">Active Coupons</Typography>
                    <Typography>
                      You are eligible for the following coupons on Apollo 24|7
                    </Typography>
                    <div className={classes.couponContent}>
                      {coupons.map((item) => {
                        return (
                          <div className={classes.couponDetails}>
                            <Typography component="h3">{item.coupon}</Typography>
                            <Typography>{item.message}</Typography>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={classes.couponInactive}>
                    <div className={classes.ciContent}>
                      <Typography component="h2">
                        Complete your first transaction to unlock your benefits
                      </Typography>
                      <Typography component="h5">How to Unlock</Typography>
                      <Typography>
                        Transact for Rs. {minimumTransactionValue} or more on Virtual Consultations
                        or Pharmacy Orders
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={classes.tabContainer}>
              <Tabs
                value={value}
                classes={{
                  root: classes.tabsRoot,
                  indicator: classes.tabsIndicator,
                }}
                onChange={handleTabChange}
                indicatorColor="primary"
              >
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Available Benefits"
                />
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Benefits Consumed"
                />
              </Tabs>
              <div className={classes.tabContent}>
                <TabPanel value={value} index={0}>
                  <div className={classes.expansionContainer}>
                    {/* Show this title when tab is not active */}
                    <Typography component="h2" className={classes.sectionTitle}>
                      Benefits Available
                    </Typography>
                    <ul className={classes.couponList}>
                      {subscriptionInclusions &&
                        subscriptionInclusions[0] &&
                        subscriptionInclusions[0].benefits.map((item: any, index: any) => {
                          return (
                            <li key={index}>
                              <div className={classes.couponCard}>
                                <img
                                  src={item.icon}
                                  className={classes.benefitIcon}
                                  alt="Benefits Available"
                                />
                                <div className={classes.beneContent}>
                                  <Typography component="h2">{item.header_content}</Typography>
                                  <Typography>{item.description}</Typography>
                                </div>
                                {item.cta_label != 'NULL' && (
                                  <AphButton
                                    disabled={!active}
                                    className={active ? '' : classes.disabledButton}
                                    onClick={() => handleCTAClick(item)}
                                    // href={clientRoutes.welcome()}
                                  >
                                    {item.cta_label}
                                  </AphButton>
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <div className={classes.benefitsConsumedContainer}>
                    <div className={classes.benefitsContent}>
                      <TableContainer className={classes.tableContainer}>
                        <Table className={classes.table} aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Benefits)</TableCell>
                              <TableCell>What You Get</TableCell>
                              <TableCell>Redemption Limit</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {subscriptionInclusions &&
                              subscriptionInclusions[0] &&
                              subscriptionInclusions[0].benefits.map((item: any, index: any) => {
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{item.header_content}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>once</TableCell>
                                    <TableCell>{item.attribute_type.remaining}</TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </div>
                </TabPanel>
              </div>
            </div>
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
      )}
      <AphDialog open={callDoctorPopup} maxWidth="sm">
        <div>
          <div className={classes.dialogHeader}>
            <Typography component="h3">Connect to the Doctor </Typography>
            <Typography>Please follow the steps to connect to Doctor </Typography>
          </div>
          <div className={classes.connectDoctorContent}>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/call-incoming.svg')} alt="" />
              <Typography component="h5">
                Answer the call from <span>‘040-482-17258’</span> to connect.
              </Typography>
            </div>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/call-outgoing.svg')} alt="" />
              <Typography component="h5">The same call will connect to the Doctor.</Typography>
            </div>
            <div className={classes.cdDetails}>
              <img src={require('images/hdfc/group.svg')} alt="" />
              <Typography component="h5">Wait for the Doctor to connect over the call.</Typography>
            </div>
            <div className={classes.cdDetails}>
              <Typography className={classes.callNote}>
                <span>*Note : </span>Your personal phone number will not be shared.
              </Typography>
            </div>
          </div>
          <div className={classes.btncContainer}>
            <AphButton onClick={() => setCallDoctorPopup(false)}>Cancel</AphButton>
            <AphButton
              color="primary"
              onClick={() => {
                initiateExotelCall(localStorage.getItem('userMobileNo'), exotelBenefitId);
              }}
            >
              Proceed To Connect
            </AphButton>
          </div>
        </div>
      </AphDialog>
      <WarningModel
        error={successMessage}
        onClose={() => {
          setSuccessMessage(null);
        }}
      />
    </div>
  );
};
