import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Theme } from '@material-ui/core';
import { Header } from 'components/Header';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
      },
    },
    aboutUs: {
      padding: '24px 40px',
      borderRadius: '5px',
      backgroundColor: '#ffffff',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.down('sm')]: {
        padding: '24px 16px',
      },
    },
    bodyMain: {
      padding: '24px 40px',
      [theme.breakpoints.down('sm')]: {
        padding: '15px 16px',
      },
    },
    content: {
      fontSize: '16px',
      lineHeight: '26px',
      [theme.breakpoints.down('sm')]: {
        fontSize: '14px',
        lineHeight: '24px',
      },
    },
    headerText: {
      fontSize: '50px',
      fontWeight: 600,
      [theme.breakpoints.down('sm')]: {
        fontSize: '28px',
      },
    },
    headerSubText: {
      fontSize: '16px',
      [theme.breakpoints.down('sm')]: {
        fontSize: '14px',
      },
    },
    bodyPart: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
    },
    bodyText: {
      padding: '20px 24px',
      [theme.breakpoints.down('sm')]: {
        padding: '15px 16px',
      },
    },
    pointsHeading: {
      fontSize: '18px',
      lineHeight: '24px',
      color: '#0087ba',
      fontWeight: 600,
    },
    horizontalRule: {
      margin: '25px -25px',
      [theme.breakpoints.down('sm')]: {
        margin: '25px -10px',
      },
    },
    mainPoints: {
      paddingLeft: '20px',
    },
    subPoints: {
      paddingBottom: '10px',
    },
  };
});

export const TermsAndConditions: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
        <div className={classes.aboutUs}>
          <div className={classes.headerText}>terms & conditions</div>
          <div className={classes.headerSubText}>
            please read all of our terms and conditions before doing anything.
          </div>
        </div>
        <div className={classes.bodyMain}>
          <div className={classes.bodyPart}>
            <div className={classes.bodyText}>
              <div className={classes.pointsHeading}>1. General</div>
              <p className={classes.content}>
                We, at Apollo247 (“<b>Apollo247</b>”, “<b>We</b>,” “<b>Us</b>”) provide services to
                all individuals accessing or using our app Apollo247 (“<b>App</b>”) for any reason
                (“<b>You</b>”, “<b>Yours</b>”, “<b>User</b>”) subject to the notices, terms, and
                conditions set forth in these terms and conditions (“<b>Terms and Conditions</b>”, “
                <b>Agreement</b>”, “<b>T&C</b>”), read the Privacy Policy.
              </p>
              <p className={classes.content}>
                The App is owned and operated by AHEL, a company duly incorporated under the
                provisions of the Companies Act, 2013.
              </p>
              <p className={classes.content}>
                Any accessing or browsing of the and using the Services indicates your agreement to
                all the terms and conditions in this Agreement. If you disagree with any part of the
                Terms and Conditions, then you may discontinue access or use of the .
              </p>
              <hr className={classes.horizontalRule} />
              <div className={classes.pointsHeading}>2. Eligibility</div>
              <p className={classes.content}>
                When you use the App, you represent that you meet the following primary eligibility
                criteria:
              </p>
              <p className={classes.content}>
                You are at least 18 years old or visiting under the supervision of a parent or
                guardian, who in such a case will be deemed as the <br /> recipient / end-user of
                the Services for the purpose of these Terms and Conditions.
                <br /> You are legally competent to contract, and otherwise competent to receive the
                Services.
                <br /> You have not been previously suspended or removed by Apollo247, or
                disqualified for any other reason, from availing the Services.
              </p>
              <hr className={classes.horizontalRule} />
              <div className={classes.pointsHeading}>3. Our Services</div>
              <p className={classes.content}>
                Through , we provide you with the following services (“<b>Services</b>”):
              </p>
              <p className={classes.content}>
                <div>
                  <b>A. Creating and maintaining user accounts:</b>
                </div>
                <div className={classes.mainPoints}>
                  To use avail our Services, Users need to register on the App in order to use the
                  functions, service or platform of the App. In order to register, you must provide
                  certain personal details including your name, email address, birth date, gender,
                  etc.
                </div>
              </p>
              <p className={classes.content}>
                <div>
                  <b>B. Scheduling an appointment:</b>
                </div>
                <ul>
                  <li className={classes.subPoints}>
                    You can book an appointment for a virtual consultation with a healthcare service
                    provider (“<b>HSP</b>”) listed on . Virtual consultations on the App shall be
                    available for family physician & multi specialties.
                  </li>
                  <li className={classes.subPoints}>
                    You will receive a confirmation of appointment for a virtual consultation with
                    an HSP of your choice, on Apollo247 application and/or via SMS, email. reserves
                    the right to reschedule or cancel an appointment without any prior notice. The
                    time provided for consultation to you is indicative and actual consultation time
                    may change depending on the consulting HSP’s discretion. Consultations can be
                    booked, rescheduled or cancelled free of cost in minimum fifteen minutes left
                    from consult slot start time for virtual consult and minimum thirty minutes left
                    from consult slot start time for physical consult for free. Maximum 3 free
                    reschedules are allowed for virtual consult and 1 free reschedule for physical
                    consult.
                  </li>
                  <li>
                    Your consulting HSP reserves the right to provide post consultation free review.
                  </li>
                </ul>
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};
