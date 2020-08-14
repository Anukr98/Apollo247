import React from 'react';
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
      padding: 20,
    },
    pageHeader: {
      padding: '15px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('sm')]: {
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
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
      },
    },
    drConsultContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    consultDetails: { display: 'flex', alignItems: 'center' },
    consultOptions: { display: 'flex', alignItems: 'center' },
    expansionContainer: {
      borderTop: '1px solid rgba(2, 71, 91, .2)',
    },
    panelRoot: {
      boxShadow: 'none',
      borderRadius: '0 !important',
      background: 'none',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: 0,
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
            <ol className={classes.breadcrumbs}>
              <li>
                <a href="">Appointments </a>
              </li>
              <li>
                <a href="">Consult Room</a>
              </li>
              <li>
                <a href="">Prescription</a>
              </li>
            </ol>
          </div>
          <div className={classes.drConsultContent}>
            <div className={classes.consultDetails}>
              <Typography component="h2">Dr. Simran Rai</Typography>
              <Typography>03 Aug 2019, Online Consult</Typography>
            </div>
            <ul className={classes.consultOptions}>
              <li>
                <a href="">View Consult</a>
              </li>
              <li>
                <a href="">
                  <img src={require('images/ic_round-share.svg')} alt="Share" />
                </a>
              </li>
              <li>
                <a href="">
                  <img src={require('images/ic_download.svg')} alt="download" />
                </a>
              </li>
            </ul>
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
                <Typography className={classes.panelHeading}>Symptoms</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <div>
                    <ul></ul>
                  </div>
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
                <Typography className={classes.panelHeading}>Medicines</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    Stay I@HOME is a monitored home isolation service offered by Apollo Homecare.
                    The services are based on the latest guidelines from Indian Council of Medical
                    Research (ICMR)/ Ministry of Health and Family Welfare (MoHFW), which recommends
                    home isolation for patients who are pre-symptomatic or have very mild symptoms,
                    and are either positive or suspected of COVID-19.
                  </Typography>
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
                <Typography className={classes.panelHeading}>Diagnosis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    Stay I@HOME is a monitored home isolation service offered by Apollo Homecare.
                    The services are based on the latest guidelines from Indian Council of Medical
                    Research (ICMR)/ Ministry of Health and Family Welfare (MoHFW), which recommends
                    home isolation for patients who are pre-symptomatic or have very mild symptoms,
                    and are either positive or suspected of COVID-19.
                  </Typography>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={expanded === 'panel4'}
              onChange={handleChange('panel4')}
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
                <Typography className={classes.panelHeading}>General Advice</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    Stay I@HOME is a monitored home isolation service offered by Apollo Homecare.
                    The services are based on the latest guidelines from Indian Council of Medical
                    Research (ICMR)/ Ministry of Health and Family Welfare (MoHFW), which recommends
                    home isolation for patients who are pre-symptomatic or have very mild symptoms,
                    and are either positive or suspected of COVID-19.
                  </Typography>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={expanded === 'panel5'}
              onChange={handleChange('panel5')}
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
                <Typography className={classes.panelHeading}>Follow Up</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    Stay I@HOME is a monitored home isolation service offered by Apollo Homecare.
                    The services are based on the latest guidelines from Indian Council of Medical
                    Research (ICMR)/ Ministry of Health and Family Welfare (MoHFW), which recommends
                    home isolation for patients who are pre-symptomatic or have very mild symptoms,
                    and are either positive or suspected of COVID-19.
                  </Typography>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              expanded={expanded === 'panel6'}
              onChange={handleChange('panel6')}
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
                <Typography className={classes.panelHeading}>Payment &amp; Invoice</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                <div className={classes.detailsContent}>
                  <Typography>
                    Stay I@HOME is a monitored home isolation service offered by Apollo Homecare.
                    The services are based on the latest guidelines from Indian Council of Medical
                    Research (ICMR)/ Ministry of Health and Family Welfare (MoHFW), which recommends
                    home isolation for patients who are pre-symptomatic or have very mild symptoms,
                    and are either positive or suspected of COVID-19.
                  </Typography>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
