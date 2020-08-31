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
      background: '#e5e5e5',
      //   padding: 20,
      position: 'relative',
      height: '100%',
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
      bottom: -55,
      left: 0,
      right: 0,
      background: '#fff',
      padding: '12px 16px',
      '& a, button': {
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
      //   padding: '20px 0 50px',
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
    tabsRoot: {
      borderBottom: '1px solid rgba(2, 71, 91, .3)',
      background: '#ffffff',
      boxShadow: '0px 5px 20px rgba(128, 128, 128, 0.2);',
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
      padding: 16,
    },
    couponContent: {},
    couponDetails: {
      padding: '5px 0',
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
      margin: 0,
      listStyle: 'none',
      '& >li': {
        background: '#fff',
        borderRadius: 10,
        padding: 16,
        margin: '0 0 16px',
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
        '& a, button': {
          fontSize: 13,
          color: '#FC9916',
          margin: '0 0 0 auto',
          boxShadow: 'none',
          display: 'block',
          textAlign: 'right',
        },
      },
    },
    couponInactive: {
      padding: '10px 16px 0',
      '& p': {
        fontSize: 10,
        color: '#EA5F65',
        fontWeight: 500,
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
        <div className={classes.pcContent}>
          <div className={`${classes.planCard} ${classes.gold}`}>
            <img src={require('images/hdfc/medal.svg')} alt="Gold MemberShip" />
            <Typography component="h1">Gold + Plan</Typography>
            <Typography className={classes.benefitDesc}>Availing Benefits worth</Typography>
            <Typography className={classes.cardWorth}>Rs. 38K+</Typography>
            <Typography className={classes.cardDesc}>
              A host of benefits await you with our Gold+ Plan curated for HDFC customers
            </Typography>
          </div>
          <div className={classes.couponInactive}>
            <Typography>
              Your Plan is Currently INACTIVE. To activate your plan, make a transaction greater
              than Rs 499 on Apollo 24/7
            </Typography>
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
                    <Typography className={classes.panelHeading}>Active Coupons</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <div className={classes.detailsContent}>
                      <Typography>
                        You are eligible for the following coupons on Apollo 24|7
                      </Typography>

                      <div className={classes.couponContent}>
                        <div className={classes.couponDetails}>
                          <Typography component="h3">HDFCGold1</Typography>
                          <Typography>
                            Discount of Rs 249 on Virtual Consultations for HDFC customers
                          </Typography>
                        </div>
                        <div className={classes.couponDetails}>
                          <Typography component="h3">HDFCGold2</Typography>
                          <Typography>
                            Discount on Medicines and Apollo Private Label for HDFC customers
                          </Typography>
                        </div>
                        <div className={classes.couponDetails}>
                          <Typography component="h3">HDFCGold3</Typography>
                          <Typography>Discount on Medicines for HDFC customers</Typography>
                        </div>
                      </div>
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                {/* Show this title when tab is not active */}
                <Typography component="h2" className={classes.sectionTitle}>
                  Benefits Available
                </Typography>
                <ul className={classes.couponList}>
                  <li>
                    <Typography component="h2">
                      24/7 Access to a General Physician on Call
                    </Typography>
                    <Typography>
                      Round-the-clock doctor availability at a click of a button
                    </Typography>
                    <AphButton href={clientRoutes.welcome()}>Redeem</AphButton>
                  </li>
                  <li>
                    <Typography component="h2">Concierge for 24|7 services</Typography>
                    <Typography>Priority Chat Support on Whatsapp with our Executives</Typography>
                    <AphButton href={clientRoutes.welcome()}>Redeem</AphButton>
                  </li>
                  <li>
                    <Typography component="h2">Covid-19 Care</Typography>
                    <ul className={classes.benefitList}>
                      <li>Preferential Access to Pre &amp; Post COVID assessments</li>
                      <li>Preferential Access to COVID Home Testing </li>
                      <li>Preferential Access To Home &amp; Hotel Care </li>
                    </ul>
                    <AphButton href={clientRoutes.covidLanding()}>Redeem</AphButton>
                  </li>
                  <li>
                    <Typography component="h2">
                      Access to Apollo doctors through 24|7 App
                    </Typography>
                    <Typography>
                      Choose a Doctor and Book an Online Consultation instantly on our App
                    </Typography>
                    <AphButton href={clientRoutes.welcome()}>Redeem</AphButton>
                  </li>
                  <li>
                    <Typography component="h2">Free Medicine Delivery</Typography>
                    <Typography>No delivery charges for orders greater than Rs 300</Typography>
                    <AphButton href={clientRoutes.medicines()}>Redeem</AphButton>
                  </li>
                  <li>
                    <Typography component="h2">Digital Vault for health records</Typography>
                    <Typography>
                      Store all your medical documents in your personal digital vault
                    </Typography>
                    <AphButton href={clientRoutes.healthRecords()}>Redeem</AphButton>
                  </li>
                  <li>
                    <Typography component="h2">Free Health Assesment Consultation</Typography>
                    <Typography>Get a free medical consultation from Top Apollo Doctors</Typography>
                    <AphButton href={clientRoutes.welcome()}>Redeem</AphButton>
                  </li>
                </ul>

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
            </TabPanel>
            <TabPanel value={value} index={1}>
              {/* Item two */}
            </TabPanel>
          </div>
        </div>

        <div className={classes.btnContainer}>
          <AphButton color="primary" variant="contained" href={clientRoutes.welcome()}>
            Explore Now
          </AphButton>
        </div>
      </div>
    </div>
  );
};
