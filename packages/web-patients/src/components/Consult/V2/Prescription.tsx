import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, MenuItem, Popover, CircularProgress, Avatar } from '@material-ui/core';
import { Header } from 'components/Header';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) => {
  return {
    prescriptionContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    prescriptionContent: {
      background: '#f7f8f5',
      padding: '0 20px 20px',
      borderRadius: '0 0 10px 10px',
    },
    pageHeader: {
      padding: '15px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('sm')]: {
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
      },
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        padding: 20,
        zIndex: 999,
        background: '#fff',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        height: 72,
      },
    },
    backArrow: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        padding: '0 20px 0 0',
      },
    },
    breadcrumbs: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      '& li': {
        '& a': {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#fca317',
          textTransform: 'uppercase',
          padding: '0 5px',
          position: 'relative',
          '&:after': {
            content: "''",
            position: 'absolute',
            top: 4,
            right: -8,
            border: '4px solid transparent',
            borderLeftColor: '#00889e',
          },
        },
        '&.active': {
          '& a': {
            color: '#007c93',
          },
        },
        '&:first-child': {
          '& a': {
            paddingLeft: 0,
          },
        },
        '&:last-child': {
          '& a:after': {
            display: 'none',
          },
        },
        [theme.breakpoints.down('xs')]: {
          display: 'none',
          '&:last-child': {
            display: 'block',
          },
        },
      },
    },
    drConsultContent: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      margin: '0 0 10px',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    consultDetails: {
      display: 'flex',
      alignItems: 'flex-end',
      padding: '16px 0 10px',
      '& h2': {
        fontSize: 20,
        fontWeight: 700,
        padding: '10px 30px 0 0 ',
        borderRight: '1px solid rgba(1,71,91,0.2)',
      },
      '& p': {
        fontSize: 14,
        color: '#0087BA',
        padding: '0 40px',
        fontWeight: 500,
        margin: '0 0 5px',
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottom: '1px solid rgba(1,71,91,0.2)',
        width: '100%',
        '& h2': {
          padding: 0,
          border: 'none',
        },
        '& p': {
          padding: 0,
        },
      },
    },
    viewConsult: {
      fontSize: 14,
      color: '#FC9916',
      fontWeight: 700,
      textTransform: 'uppercase',
      display: 'block',
      padding: '0 10px 10px',
      [theme.breakpoints.down('xs')]: {
        textAlign: 'right',
        margin: '10px 0 0',
        display: 'block',
        width: '100%',
      },
    },
    consultOptions: {
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    optionList: {
      display: 'flex',
      alignItems: 'center',
      margin: '0 0 10px',
      padding: 0,
      listStyle: 'none',
      '& li': {
        '& a': {
          padding: '0 10px',
          display: 'block',
          minWidth: 60,
          textAlign: 'center',
          '&:last-child': {
            paddingRight: 0,
          },
        },
      },
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 999,
      },
    },
    expansionContainer: {
      borderTop: '1px solid rgba(2, 71, 91, .2)',
    },
    panelRoot: {
      boxShadow: 'none',
      borderRadius: '0 !important',
      background: 'none',
      margin: '0 !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: 0,
      minHeight: '40px !important',
    },
    summaryContent: {},
    expandIcon: {
      color: '#02475b',
      margin: 0,
    },
    panelExpanded: {
      margin: 0,
    },
    panelDetails: {
      padding: 0,
      '& p': {
        fontSize: 12,
        fontWeight: 500,
      },
    },
    panelHeading: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
    },
    detailsContent: {
      background: '#fff',
      boxShadow: ' 0px 5px 20px rgba(128, 128, 128, 0.3)',
      padding: '15px 20px',
      width: '100%',
      borderRadius: 10,
      '& p': {
        margin: '0 0 10px',
        '&:last-child': {
          margin: 0,
        },
      },
      '& a': {
        fontSize: 14,
        color: '#FC9916',
        fontWeight: 700,
        textTransform: 'uppercase',
        display: 'block',
        textAlign: 'right',
        margin: '10px 0 0',
      },
      [theme.breakpoints.down('xs')]: {
        padding: 15,
      },
    },
    adviceList: {
      margin: 0,
      padding: '0 0 0 20px',
      listStyle: 'decimal',
      '& li': {
        color: '#0087BA',
        fontSize: 14,
        padding: '5px 0',
      },
    },
    cdContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        margin: 0,
        width: '25%',
      },
      '&:first-child': {
        paddingTop: 0,
      },
      '&:last-child': {
        paddingBottom: 0,
        border: 'none',
      },

      '& a': {
        fontSize: 14,
        color: '#FC9916',
        fontWeight: 700,
        textTransform: 'uppercase',
        display: 'block',
        width: '25%',
        textAlign: 'right',
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        border: 'none',
        '& p': {
          width: '100%',
          borderBottom: '1px solid rgba(1,71,91,0.3)',
          padding: '0 0 10px',
          margin: '0 0 10px',
        },
        '& a': {
          width: '100%',
          textAlign: 'right',
          margin: '10px 0 0',
        },
      },
    },
    consultList: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: '1 0 auto',
      '& li': {
        fontSize: 14,
        fontWeight: 500,
        color: '#0087BA',
        minWidth: '20%',
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        '& li': {
          width: '100%',
          padding: ' 3px 0',
        },
      },
    },
  };
});
export const Prescription: React.FC = (props) => {
  const classes = useStyles({});
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className={classes.prescriptionContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.prescriptionContent}>
          <div className={classes.pageHeader}>
            <Link to="#" className={classes.backArrow}>
              <img src={require('images/ic_back.svg')} alt="" />
            </Link>
            <ol className={classes.breadcrumbs}>
              <li>
                <Link to="#">Appointments </Link>
              </li>
              <li>
                <Link to="#">Consult Room </Link>
              </li>
              <li>
                <Link to="#">Prescription </Link>
              </li>
            </ol>
          </div>
          <div className={classes.drConsultContent}>
            <div className={classes.consultDetails}>
              <Typography component="h2">Dr. Simran Rai</Typography>
              <Typography>03 Aug 2019, Online Consult</Typography>
            </div>
            <div className={classes.consultOptions}>
              <Link to="#" className={classes.viewConsult}>
                View Consult
              </Link>
              <ul className={classes.optionList}>
                <li>
                  <Link to="#">
                    <img src={require('images/ic_round-share.svg')} alt="Share" />
                  </Link>
                </li>
                <li>
                  <Link to="#">
                    <img src={require('images/ic_download.svg')} alt="download" />
                  </Link>
                </li>
              </ul>
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
                <Typography className={classes.panelHeading}>Symptoms</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <div className={classes.cdContainer}>
                    <Typography>Cold &amp; Cough</Typography>
                    <ul className={classes.consultList}>
                      <li>Since: Last 4 days</li>
                      <li>How Often: Throughout the day</li>
                      <li>Severity: Moderate</li>
                    </ul>
                  </div>
                  <div className={classes.cdContainer}>
                    <Typography>Fever</Typography>
                    <ul className={classes.consultList}>
                      <li>Since: Last 4 days</li>
                      <li>How Often: Throughout the day</li>
                      <li>Severity: Moderate</li>
                    </ul>
                  </div>
                  <div className={classes.cdContainer}>
                    <Typography>Nausea</Typography>
                    <ul className={classes.consultList}>
                      <li>Since: Last 4 days</li>
                      <li>How Often: Throughout the day</li>
                      <li>Severity: Moderate</li>
                    </ul>
                  </div>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
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
                <Typography className={classes.panelHeading}>Medicines</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <div className={classes.cdContainer}>
                    <Typography>Sompraz-D Cap </Typography>
                    <ul className={classes.consultList}>
                      <li>1 Tab</li>
                      <li>Morning, Before food</li>
                      <li>7 days</li>
                    </ul>
                  </div>
                  <div className={classes.cdContainer}>
                    <Typography>Redixin Plus Mouthwash</Typography>
                    <ul className={classes.consultList}>
                      <li>Throat Gargles</li>
                      <li>Morning, Afternoon, Night</li>
                      <li>5 days</li>
                    </ul>
                  </div>
                  <Link to="#">Order Medicines </Link>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
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
                <Typography className={classes.panelHeading}>Diagnosis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>Acute Pharyngitis (unspecified)</Typography>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
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
                <Typography className={classes.panelHeading}>General Advice</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <ul className={classes.adviceList}>
                    <li>Take adequate rest</li>
                    <li>Take warm fluids / soft food, more frequently in small quantities</li>
                    <li>Avoid cold / refrigerated food</li>
                    <li>Follow Prescription</li>
                  </ul>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
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
                <Typography className={classes.panelHeading}>Follow Up</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <div className={classes.cdContainer}>
                    <Typography>Online Consult / Clinic Visit </Typography>
                    <ul className={classes.consultList}>
                      <li>Recommended after 5 days</li>
                    </ul>
                    <Link to="#">Book Follow Up </Link>
                  </div>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
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
                <Typography className={classes.panelHeading}>Payment &amp; Invoice</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <div className={classes.cdContainer}>
                    <Typography>Paid — Rs. 299 </Typography>
                    <ul className={classes.consultList}>
                      <li>Debit Card</li>
                      <li>5546 **** **** ***1</li>
                    </ul>
                    <Link to="#">Order Summary </Link>
                  </div>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
