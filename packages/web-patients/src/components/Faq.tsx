import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { BottomLinks } from 'components/BottomLinks';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';

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
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
        padding: 40,
      },
    },
    textCenter: {
      textAlign: 'center',
    },
  };
});

export const Faq: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <h1 className={classes.textCenter}>Frequently Asked Questions</h1>
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
          </div>
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};
