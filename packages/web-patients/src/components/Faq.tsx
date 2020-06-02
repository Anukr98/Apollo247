import React from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { BottomLinks } from 'components/BottomLinks';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
      // padding: 20,
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f0f1ec',
        // padding: 40,
      },
    },
    textCenter: {
      textAlign: 'center',
    },
    faqHeader: {
      padding: 30,
      background: '#ffffff',
      boxShadow: ' 0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      '& h1': {
        fontSize: 50,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        color: '#02475b',
      },
      '& h5': {
        fontSize: 17,
        color: '#0087ba',
      },
    },
    faqBody: {
      padding: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabsRoot: {
      borderBottom: '1px solid rgba(2, 71, 91, .3)',
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
      background: '#f7f8f5',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    tabContainer: {
      width: 700,
      borderRadius: 10,
      background: '#ffffff',
      overflow: 'hidden',
    },
    tabContent: {},
    heading: {
      margin: '0 !important',
      width: '100%',
      fontSize: 18,
      fontWeight: 'bold',
    },
    expansionContainer: {
      padding: '10px 0',
    },
    expansionPanel: {
      boxShadow: 'none',
      borderBottom: '1px solid rgba(2, 71, 91, .3)',
      borderRadius: '0 !important',
      margin: '0 !important',
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    expansionSummary: {
      minHeight: 'auto !important',
      padding: '16px 20px',
      '& svg': {
        color: '#02475b',
      },
      '& >div': {
        margin: '0 !important',
        padding: '0 !important',
      },
    },
    expansionDetails: {
      '& p': {
        fontSize: 16,
        margin: '0 !important',
      },
    },
    fontBold: {
      fontWeight: 'bold',
    },
    faqList: {
      listStyleType: 'decimal',
      margin: 0,
      '& li': {
        padding: '10px 0',
        fontSize: 16,
      },
    },
    pt0: {
      paddingTop: '0 !important',
    },
  };
});

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index: Number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
export const Faq: React.FC = (props) => {
  const classes = useStyles({});
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.faqHeader}>
            <Typography component="h1">how can we help you?</Typography>
            <Typography component="h5">
              We are here to answer all your Frequently Asked Questions
            </Typography>
          </div>
          <div className={classes.faqBody}>
            <div className={classes.tabContainer}>
              <Tabs
                value={value}
                classes={{
                  root: classes.tabsRoot,
                  indicator: classes.tabsIndicator,
                }}
                onChange={handleChange}
                aria-label="simple tabs example"
              >
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Online Consultation"
                  {...a11yProps(0)}
                />
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Pharmacy"
                  {...a11yProps(1)}
                />
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="PHR"
                  {...a11yProps(2)}
                />
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="diagnostics"
                  {...a11yProps(3)}
                />
              </Tabs>
              <div className={classes.tabContent}>
                <TabPanel value={value} index={0}>
                  <div className={classes.expansionContainer}>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography className={classes.heading}>
                          How do I book a online consultation?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>You can book an online consultation in two ways:</Typography>
                          <ul className={classes.faqList}>
                            <li>
                              If you're you looking for a specialist, you may start by going to the
                              Homepage. Click Find a Doctor, select a specialty and click Online
                              Consults. Select an appointment card and click Consult Now.
                            </li>
                            <li>
                              If you're looking for a doctor based on your symptoms, you may start
                              by going to the Homepage. Click Track Symptoms, search for your
                              symptoms or select a few of them based on your current situation.
                              Click Show Doctors and select an appointment card and click Consult
                              Now.
                            </li>
                          </ul>
                          <Typography>
                            You can also book an appointment by going to Appointments and clicking
                            Book an Appointment.
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          How much time will I get to speak to a doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            You can consult with your assigned doctor for about 15 minutes,
                            depending on your health status. The timings may increase if you have
                            further queries.
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          Can I get a free consultation with the same doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            Once you have successfully consulted with the doctor,{' '}
                            <span className={classes.fontBold}>
                              ou can avail one free follow-up consultation.
                            </span>{' '}
                            (Applicable within the seven days after the date of your first
                            consultation)
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          How do I book my follow-up session in the app with the doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            After you've successfully consulted with the assigned doctor, you can
                            avail a free follow-up* session by following the given steps:-
                          </Typography>
                          <Typography>
                            {' '}
                            Go to Appointments -> Select Active Select an Appointment Card -> Click
                            Schedule a Follow-up{' '}
                          </Typography>
                          or
                          <Typography>
                            Go to Health Records -> Select Consults &amp; Rx Select an Appointment
                            Card -> Click Book Follow-Up (You can avail one free follow-up session
                            with the doctor within seven days after the date of consultation)*
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <div className={classes.expansionContainer}>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography className={classes.heading}>
                          Ordering Medicines (With Prescription)
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>You can book an online consultation in two ways:</Typography>
                          <ul className={classes.faqList}>
                            <li>
                              If you're you looking for a specialist, you may start by going to the
                              Homepage. Click Find a Doctor, select a specialty and click Online
                              Consults. Select an appointment card and click Consult Now.
                            </li>
                            <li>
                              If you're looking for a doctor based on your symptoms, you may start
                              by going to the Homepage. Click Track Symptoms, search for your
                              symptoms or select a few of them based on your current situation.
                              Click Show Doctors and select an appointment card and click Consult
                              Now.
                            </li>
                          </ul>
                          <Typography>
                            You can also book an appointment by going to Appointments and clicking
                            Book an Appointment.
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          How much time will I get to speak to a doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            You can consult with your assigned doctor for about 15 minutes,
                            depending on your health status. The timings may increase if you have
                            further queries.
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          Can I get a free consultation with the same doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            Once you have successfully consulted with the doctor,{' '}
                            <span className={classes.fontBold}>
                              ou can avail one free follow-up consultation.
                            </span>{' '}
                            (Applicable within the seven days after the date of your first
                            consultation)
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          How do I book my follow-up session in the app with the doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            After you've successfully consulted with the assigned doctor, you can
                            avail a free follow-up* session by following the given steps:-
                          </Typography>
                          <Typography>
                            {' '}
                            Go to Appointments -> Select Active Select an Appointment Card -> Click
                            Schedule a Follow-up{' '}
                          </Typography>
                          or
                          <Typography>
                            Go to Health Records -> Select Consults &amp; Rx Select an Appointment
                            Card -> Click Book Follow-Up (You can avail one free follow-up session
                            with the doctor within seven days after the date of consultation)*
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </div>
                </TabPanel>
                <TabPanel value={value} index={2}>
                  <div className={classes.expansionContainer}>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography className={classes.heading}>
                          How do I book a online consultation?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>You can book an online consultation in two ways:</Typography>
                          <ul className={classes.faqList}>
                            <li>
                              If you're you looking for a specialist, you may start by going to the
                              Homepage. Click Find a Doctor, select a specialty and click Online
                              Consults. Select an appointment card and click Consult Now.
                            </li>
                            <li>
                              If you're looking for a doctor based on your symptoms, you may start
                              by going to the Homepage. Click Track Symptoms, search for your
                              symptoms or select a few of them based on your current situation.
                              Click Show Doctors and select an appointment card and click Consult
                              Now.
                            </li>
                          </ul>
                          <Typography>
                            You can also book an appointment by going to Appointments and clicking
                            Book an Appointment.
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          How much time will I get to speak to a doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            You can consult with your assigned doctor for about 15 minutes,
                            depending on your health status. The timings may increase if you have
                            further queries.
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          Can I get a free consultation with the same doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            Once you have successfully consulted with the doctor,{' '}
                            <span className={classes.fontBold}>
                              ou can avail one free follow-up consultation.
                            </span>{' '}
                            (Applicable within the seven days after the date of your first
                            consultation)
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          How do I book my follow-up session in the app with the doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            After you've successfully consulted with the assigned doctor, you can
                            avail a free follow-up* session by following the given steps:-
                          </Typography>
                          <Typography>
                            {' '}
                            Go to Appointments -> Select Active Select an Appointment Card -> Click
                            Schedule a Follow-up{' '}
                          </Typography>
                          or
                          <Typography>
                            Go to Health Records -> Select Consults &amp; Rx Select an Appointment
                            Card -> Click Book Follow-Up (You can avail one free follow-up session
                            with the doctor within seven days after the date of consultation)*
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </div>
                </TabPanel>
                <TabPanel value={value} index={3}>
                  <div className={classes.expansionContainer}>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography className={classes.heading}>
                          How do I book a online consultation?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>You can book an online consultation in two ways:</Typography>
                          <ul className={classes.faqList}>
                            <li>
                              If you're you looking for a specialist, you may start by going to the
                              Homepage. Click Find a Doctor, select a specialty and click Online
                              Consults. Select an appointment card and click Consult Now.
                            </li>
                            <li>
                              If you're looking for a doctor based on your symptoms, you may start
                              by going to the Homepage. Click Track Symptoms, search for your
                              symptoms or select a few of them based on your current situation.
                              Click Show Doctors and select an appointment card and click Consult
                              Now.
                            </li>
                          </ul>
                          <Typography>
                            You can also book an appointment by going to Appointments and clicking
                            Book an Appointment.
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          How much time will I get to speak to a doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            You can consult with your assigned doctor for about 15 minutes,
                            depending on your health status. The timings may increase if you have
                            further queries.
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          Can I get a free consultation with the same doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            Once you have successfully consulted with the doctor,{' '}
                            <span className={classes.fontBold}>
                              ou can avail one free follow-up consultation.
                            </span>{' '}
                            (Applicable within the seven days after the date of your first
                            consultation)
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel className={classes.expansionPanel}>
                      <ExpansionPanelSummary
                        className={classes.expansionSummary}
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2a-content"
                        id="panel2a-header"
                      >
                        <Typography className={classes.heading}>
                          How do I book my follow-up session in the app with the doctor?
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.pt0}>
                        <div className={classes.expansionDetails}>
                          <Typography>
                            After you've successfully consulted with the assigned doctor, you can
                            avail a free follow-up* session by following the given steps:-
                          </Typography>
                          <Typography>
                            {' '}
                            Go to Appointments -> Select Active Select an Appointment Card -> Click
                            Schedule a Follow-up{' '}
                          </Typography>
                          or
                          <Typography>
                            Go to Health Records -> Select Consults &amp; Rx Select an Appointment
                            Card -> Click Book Follow-Up (You can avail one free follow-up session
                            with the doctor within seven days after the date of consultation)*
                          </Typography>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </div>
                </TabPanel>
              </div>
            </div>
          </div>
          {/* <h1 className={classes.textCenter}>Frequently Asked Questions</h1>
          <h1 className={classes.textCenter}>Online Consultation FAQs</h1>
          <div>
            <p>
              <strong> Online Consultation Related Queries </strong>
            </p>
            <ul>
              <li>
                <b>How do I book a online consultation?</b>
                <br />
                You can book an online consultation in two ways:
                <br />
                <br />
                1) If you're you looking for a specialist, you may start by going to the Homepage.
                Click Find a Doctor, select a specialty and click Online Consults. Select an
                appointment card and click Consult Now.
                <br />
                <br />
                2) If you're looking for a doctor based on your symptoms, you may start by going to
                the Homepage. Click Track Symptoms, search for your symptoms or select a few of them
                based on your current situation. Click Show Doctors and select an appointment card
                and click Consult Now.
                <br />
                <br />
                You can also book an appointment by going to Appointments and clicking Book an
                Appointment.
                <br />
                <br />
              </li>
              <li>
                <b>How much time will I get to speak to a doctor?</b>
                <br />
                You can consult with your assigned doctor for about 15 minutes, depending on your
                health status. The timings may increase if you have further queries.
                <br />
                <br />
              </li>
              <li>
                <b>Can I get a free consultation with the same doctor?</b>
                <br />
                Once you have successfully consulted with the doctor,{' '}
                <b>you can avail one free follow-up consultation.</b> (Applicable within the seven
                days after the date of your first consultation)
                <br />
                <br />
              </li>
              <li>
                <b>Can I get a free consultation with the same doctor?</b>
                <br />
                Once you have successfully consulted with the doctor,{' '}
                <b>you can avail one free follow-up consultation.</b> (Applicable within the seven
                days after the date of your first consultation)
                <br />
                <br />
              </li>
              <li>
                <b>How do I book my follow-up session in the app with the doctor?</b>
                <br />
                After you've successfully consulted with the assigned doctor, you can avail a free
                follow-up* session by following the given steps:-
                <br />
                Go to Appointments -> Select Active Select an Appointment Card -> Click Schedule a
                Follow-up
                <br />
                or
                <br />
                Go to Health Records -> Select Consults & Rx Select an Appointment Card -> Click
                Book Follow-Up (You can avail one free follow-up session with the doctor within
                seven days after the date of consultation)*
                <br />
                <br />
              </li>
              <li>
                <b>Can I get a free consultation with the same doctor?</b>
                <br />
                Once you have successfully consulted with the doctor,{' '}
                <b>you can avail one free follow-up consultation.</b> (Applicable within the seven
                days after the date of your first consultation)
                <br />
                <br />
              </li>
              <li>
                <b>Can I get a free consultation with the same doctor?</b>
                <br />
                Once you have successfully consulted with the doctor,{' '}
                <b>you can avail one free follow-up consultation.</b> (Applicable within the seven
                days after the date of your first consultation)
                <br />
                <br />
              </li>
              <li>
                <b>Can I get a free consultation with the same doctor?</b>
                <br />
                Once you have successfully consulted with the doctor,{' '}
                <b>you can avail one free follow-up consultation.</b> (Applicable within the seven
                days after the date of your first consultation)
                <br />
                <br />
              </li>
            </ul>
            <p>
              <strong> Payment Related Queries </strong>
            </p>
            <p>
              <strong> Online Consultation Issues Related Queries </strong>
            </p>
            <p>
              <strong> E- Prescription Related Queries </strong>
            </p>
          </div>
          <div>
            <h1 className={classes.textCenter}>Medicine Order FAQs</h1>

            <div>
              <p>
                <strong> Ordering Medicines (With Prescription) </strong>
              </p>
              <p>
                <strong> E-Prescription Related Queries </strong>
              </p>
              <p>
                <strong> Order Related Queries </strong>
              </p>
            </div>
          </div>
          <div>
            <h1 className={classes.textCenter}>Diagnostic Test Booking FAQs</h1>

            <div>
              <p>
                <strong> Booking Tests Related Queries </strong>
              </p>
              <p>
                <strong> About Diagnostic Tests Related Queries </strong>
              </p>
              <p>
                <strong> Diagnostic Tests Issues </strong>
              </p>
              <p>
                <strong> Payment Related Queries </strong>
              </p>
            </div>
          </div>*/}
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};
