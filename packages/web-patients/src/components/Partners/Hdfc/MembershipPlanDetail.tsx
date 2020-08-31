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
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { clientRoutes } from 'helpers/clientRoutes';
import { HDFC_SUBSCRIPTION_GOLD } from 'helpers/constants';

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
      bottom: 16,
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
          },
        },
      },
    },
    expansionContainer: {
      //   padding: '20px 0 50px',
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
    planCard: {
      padding: 16,
      position: 'relative',
      width: 400,
      height: 230,
      flex: '1 0 auto',
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
      background: `url(${require('images/hdfc/platinum.svg')}) no-repeat 0 0`,
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
      padding: 30,
      [theme.breakpoints.down('sm')]: {
        padding: 16,
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
        margin: '0 0 5px',
      },
      '& p': {
        fontSize: 11,
        lineHeight: '18px',
        width: '80%',
      },
      '&:hover': {
        boxShadow: ' 0px 1px 12px rgba(128, 128, 128, 0.2)',
        '& button': {
          background: '#FC9916',
          color: '#FFF',
          [theme.breakpoints.down('sm')]: {
            background: '#fff',
            color: '#FC9916',
          },
        },
      },
      '& button': {
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
    couponInactive: {
      padding: '0 30px',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 16px 0',

        flex: 'auto',
      },
      '& p': {
        fontSize: 18,
        color: '#EA5F65',
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
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [value, setValue] = React.useState(0);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleTabChange = (event: any, newValue: any) => {
    setValue(newValue);
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
              <div className={`${classes.planCard} ${classes.gold}`}>
                <img src={require('images/hdfc/medal.svg')} alt="Gold MemberShip" />
                <Typography component="h1">Gold + Plan</Typography>
                <Typography className={classes.benefitDesc}>Availing Benefits worth</Typography>
                <Typography className={classes.cardWorth}>Rs. 38K+</Typography>
                <Typography className={classes.cardDesc}>
                  A host of benefits await you with our Gold+ Plan curated for HDFC customers
                </Typography>
                <div className={classes.btnContainer}>
                  <AphButton variant="contained">Explore Now</AphButton>
                </div>
              </div>

              <div className={classes.couponContainer}>
                <Typography component="h2">Active Coupons</Typography>
                <Typography>You are eligible for the following coupons on Apollo 24|7</Typography>
                <div className={classes.couponContent}>
                  <div className={classes.couponDetails}>
                    <Typography component="h3">Coupon Name 1</Typography>
                    <Typography>Get Rs. 249/- Off on 2 Virtual Consultations Bookings</Typography>
                  </div>
                  <div className={classes.couponDetails}>
                    <Typography component="h3">Coupon Name 2</Typography>
                    <Typography>Get Rs. 249/- Off on 2 Virtual Consultations Bookings</Typography>
                  </div>
                  <div className={classes.couponDetails}>
                    <Typography component="h3">Coupon Name 3</Typography>
                    <Typography>Get Rs. 249/- Off on 2 Virtual Consultations Bookings</Typography>
                  </div>
                  <div className={classes.couponDetails}>
                    <Typography component="h3">Coupon Name 4</Typography>
                    <Typography>Get Rs. 249/- Off on 2 Virtual Consultations Bookings</Typography>
                  </div>
                </div>
              </div>
              <div className={classes.couponInactive}>
                <Typography>
                  Your Plan is Currently INACTIVE. To activate your plan, make a transaction greater
                  than Rs 499 on Apollo 24/7
                </Typography>
              </div>
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
                    <li>
                      <div className={classes.couponCard}>
                        <Typography component="h2">
                          24/7 Access to a General Physician on Call
                        </Typography>
                        <Typography>
                          Round-the-clock doctor availability at a click of a button
                        </Typography>
                        <AphButton>Redeem</AphButton>
                      </div>
                    </li>
                    <li>
                      <div className={classes.couponCard}>
                        <Typography component="h2">Concierge for 24|7 services</Typography>
                        <Typography>
                          Priority Chat Support on Whatsapp with our Executives
                        </Typography>
                        <AphButton>Redeem</AphButton>
                      </div>
                    </li>
                    <li>
                      <div className={classes.couponCard}>
                        <Typography component="h2">Covid-19 Care</Typography>
                        <ul className={classes.benefitList}>
                          <li>Preferential Access to Pre &amp; Post COVID assessments</li>
                          <li>Preferential Access to COVID Home Testing </li>
                          <li>Preferential Access To Home &amp; Hotel Care </li>
                        </ul>
                        <AphButton>Redeem</AphButton>
                      </div>
                    </li>
                    <li>
                      <div className={classes.couponCard}>
                        <Typography component="h2">
                          Access to Apollo doctors through 24|7 App
                        </Typography>
                        <Typography>
                          Choose a Doctor and Book an Online Consultation instantly on our App
                        </Typography>
                        <AphButton>Redeem</AphButton>
                      </div>
                    </li>
                    <li>
                      <div className={classes.couponCard}>
                        <Typography component="h2">Free Medicine Delivery</Typography>
                        <Typography>No delivery charges for orders greater than Rs 300</Typography>
                        <AphButton>Redeem</AphButton>
                      </div>
                    </li>
                    <li>
                      <div className={classes.couponCard}>
                        <Typography component="h2">Digital Vault for health records</Typography>
                        <Typography>
                          Store all your medical documents in your personal digital vault
                        </Typography>
                        <AphButton>Redeem</AphButton>
                      </div>
                    </li>
                    <li>
                      <div className={classes.couponCard}>
                        <Typography component="h2">Free Health Assesment Consultation</Typography>
                        <Typography>
                          Get a free medical consultation from Top Apollo Doctors
                        </Typography>
                        <AphButton>Redeem</AphButton>
                      </div>
                    </li>
                  </ul>
                </div>
              </TabPanel>
              <TabPanel value={value} index={1}>
                Item two
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
                    The discounts applicable as per the Healthy Life program shall be applied at the
                    time of payment checkout by the customer.
                  </li>
                  <li>
                    This program is designed for select HDFC customers and offerings will vary with
                    the different categories of HDFC customers. However, membership schemes can be
                    upgraded on the basis of the spending on the Apollo 24/7 app as mentioned in the
                    offer grid.
                  </li>
                  <li>
                    The Healthy Life Program is open to all HDFC customers with a valid Indian
                    mobile number only.
                  </li>
                  <li>
                    The T&amp;C’s of the silver, gold and platinum membership offered in the Healthy
                    Life program shall be governed by the terms &amp; conditions of the website -{' '}
                    <a href="https://www.oneapollo.com/terms-conditions/">
                      https://www.oneapollo.com/terms-conditions/
                    </a>
                  </li>
                  <li>
                    The Healthy Life offering will be applicable to all HDFC customers, whether they
                    are existing customers of Apollo 24/7 or not. However, all the customers shall
                    adhere to the offerings as mentioned in this marketing program.
                  </li>
                  <li>The Healthy Life program is non-transferable.</li>
                  <li>
                    The activation of the benefits for the Healthy Life program will be completed 24
                    hours post the service delivery/fulfillment of the qualifying transaction. For
                    e.g., to unlock benefits, the user is needed to make a qualifying transaction of
                    INR 499, amount subject to change as per different tiers
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
                    Healthy Life program is a corporate offering exclusively for HDFC bank customers
                    and not for individuals.
                  </li>
                  <li>
                    Apollo 24/7 reserves the right to add, alter, amend and revise terms and
                    conditions as well as rules and regulations governing the Healthy Life
                    membership program without prior notice.
                  </li>
                  <li>
                    Benefits and offers available through the program may change or be withdrawn
                    without prior intimation. Apollo 24/7 will not be responsible for any liability
                    arising from such situations or use of such offers.
                  </li>
                  <li>
                    Any disputes arising out of the offer shall be subject to arbitration by a sole
                    arbitrator appointed by Apollo 24/7 for this purpose. The proceedings of the
                    arbitration shall be conducted as per the provisions of Arbitration and
                    Conciliation Act, 1996. The place of arbitration shall be at Chennai and
                    language of arbitration shall be English. The existence of a dispute, if at all,
                    shall not constitute a claim against Apollo 24/7.
                  </li>
                </ul>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </div>
      </div>
    </div>
  );
};
