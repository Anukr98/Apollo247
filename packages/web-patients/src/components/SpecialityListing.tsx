import React, { useState, useEffect } from 'react';
import { Theme, Grid, CircularProgress, Popover, Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { AphInput } from '@aph/web-ui-components';
import { Specialities } from 'components/Specialities';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) => {
  return {
    slContainer: {},
    slContent: {
      padding: '0 20px',
      background: '#f7f8f5',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageHeader: {
      padding: '15px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
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
          padding: '0 15px',
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
    specialityContent: {
      padding: '20px 0',
      '& h5': {
        fontSize: 16,
        margin: '10px 0',
        color: '#00a7b9',
        fontWeight: 'bold',
      },
    },
    pastSearch: {
      padding: '20px 0',
      '& h6': {
        fontSize: 14,
        fontWeight: 'bold',
        margin: '0 0 15px',
      },
    },
    pastSearchList: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      '& li': {
        margin: '0 16px 0 0',
        '& a': {
          padding: 12,
          background: '#ffffff',
          borderRadius: 10,
          boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
          color: '#fc9916',
          fontsize: 13,
          textTransform: 'uppercase',
          display: 'block',
          fontWeight: 'bold',
        },
        '& :last-child': {
          margin: 0,
        },
      },
    },
    topSpeciality: {},
    sectionHeader: {
      padding: '10px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      '& h4': {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        margin: 0,
      },
    },
    otherSpeciality: {},
    faq: {
      padding: '20px 0',
      '& h5': {
        fontSize: 16,
        fontWeight: 'bold',
        margin: '0 0 20px',
        color: '#01667c',
      },
    },
    heading: {},
    detailsContent: {},
  };
});

export const SpecialityListing: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.slContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.slContent}>
          <div className={classes.backArrow} title={'Back to home page'}>
            <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div>
          <div className={classes.pageHeader}>
            <ol className={classes.breadcrumbs}>
              <li>
                <a href="javascript:void(0);">Home</a>
              </li>
              <li className="active">
                <a href="javascript:void(0);">Specialities</a>
              </li>
            </ol>
          </div>
          <Grid container spacing={2}>
            <Grid item sm={8}>
              <div className={classes.specialityContent}>
                <AphInput placeholder="Search doctors or specialities" />
                <div className={classes.pastSearch}>
                  <Typography component="h6">Past Searches</Typography>
                  <ul className={classes.pastSearchList}>
                    <li>
                      <a href="javascript:void(0)">Dr. Alok Mehta</a>
                    </li>
                    <li>
                      <a href="javascript:void(0)">Cardiology</a>
                    </li>
                    <li>
                      <a href="javascript:void(0)">Paediatrician</a>
                    </li>
                  </ul>
                </div>
                <Typography component="h5">
                  Start your care now by choosing from 500 doctors and 65 specialities
                </Typography>
                <div className={classes.topSpeciality}>
                  <div className={classes.sectionHeader}>
                    <Typography component="h4">Top Specialites</Typography>
                  </div>
                </div>
                <div className={classes.otherSpeciality}>
                  <div className={classes.sectionHeader}>
                    <Typography component="h4">Other Specialites</Typography>
                  </div>
                  {/* <Specialities /> */}
                </div>
                <div className={classes.faq}>
                  <Typography component="h5">Frequently asked questions</Typography>
                  <ExpansionPanel>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography className={classes.heading}>
                        How do I book an online consultation?
                      </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <div className={classes.detailsContent}>
                        <Typography>
                          You can book an online consultation either on the website or mobile app of
                          Apollo 24/7 in two ways.
                        </Typography>
                        <ul>
                          <li>
                            Click on the ‘Find a Doctor’ button on the homepage of the website/app,
                            select a specialty or type the name of the doctor directly. Once you
                            select a doctor, you can click on the “Consult Now’ button to start the
                            online consultation.
                          </li>
                          <li>
                            If you're looking for a doctor based on your symptoms, you may start by
                            going to the homepage of the website/app. Then click on the ‘Track
                            Symptoms’ tab, search for your symptoms or select a few of them based on
                            your health condition. Click ‘Show Doctors’, select a doctor and click
                            on the ‘Consult Now’ button to start the online consultation.
                          </li>
                        </ul>
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                  <ExpansionPanel>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel2a-content"
                      id="panel2a-header"
                    >
                      <Typography className={classes.heading}>
                        For how long can I speak to the doctor??
                      </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <div className={classes.detailsContent}>
                        <Typography>
                          Once you book an online consultation on our app, you will get 15 minutes
                          to speak to the doctor. This window can, however, change according to your
                          health condition and the number of queries you have.
                        </Typography>
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                  <ExpansionPanel>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel3a-content"
                      id="panel3a-header"
                    >
                      <Typography className={classes.heading}>
                        How do I book a follow-up session with the same doctor on the app?
                      </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                      <div className={classes.detailsContent}>
                        <Typography>
                          To book a follow-up session with the same doctor, select the ‘Active
                          Appointments’ tab on the home page or ‘Appointments’ tab on the bottom
                          menu bar of the app. After that, you can click on the ‘Schedule A
                          Follow-Up’ button to book a follow-up consultation. Alternatively, you can
                          also go to ‘Health Records’ section on the app, select ‘Consults &amp;
                          Rx’, select the appointment card and click on the ‘Schedule A Follow-Up’
                          button.
                        </Typography>
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </div>
              </div>
            </Grid>
            <Grid item sm={4}></Grid>
          </Grid>
        </div>
      </div>
      <NavigationBottom />
    </div>
  );
};
