import React from 'react';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      marginTop: -88,
      fontSize: 18,
      [theme.breakpoints.down(900)]: {
        marginBottom: -80,
      },
      '& section': {
        paddingTop: 100,
        paddingBottom: 100,
        [theme.breakpoints.down(900)]: {
          paddingTop: 50,
          paddingBottom: 50,
        },
      },
      '& p': {
        marginBottom: 20,
        lineHeight: 1.5,
      },
      '& footer': {
        padding: '25px 0',
        textAlign: 'center',
        color: 'rgba(255,255,255,.3)',
        backgroundColor: '#222',
        fontSize: 12,
        '& p': {
          marginBottom: 10,
        },
        '& ul': {
          padding: 0,
          margin: 0,
          '& li': {
            listStyleType: 'none',
            display: 'inline-block',
            margin: '0 5px',
            '& a': {
              fontSize: 12,
              color: 'rgba(255,255,255,.3)',
            },
          },
        },
      },
    },
    container: {
      maxWidth: 1140,
      paddingLeft: 15,
      paddingRight: 15,
      margin: 'auto',
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
      <section>
        <div className={classes.container}>
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
      </section>
      <footer>
        <div className={classes.container}>
          <p>&copy; Apollo247 2020. All Rights Reserved.</p>
          <ul>
            <li>
              <Link
                to={clientRoutes.welcome()}
                onClick={(e) => {
                  window.location.href = clientRoutes.welcome();
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link to={clientRoutes.privacy()}>Privacy</Link>
            </li>
            <li>
              <Link to={clientRoutes.termsConditions()}>Terms</Link>
            </li>
            <li>
              <Link to={clientRoutes.FAQ()}>FAQ</Link>
            </li>
            <li>
              <Link to={clientRoutes.contactUs()}>Contact Us</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};
