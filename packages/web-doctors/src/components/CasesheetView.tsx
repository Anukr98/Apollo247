import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    previewHeader: {
      backgroundColor: theme.palette.common.white,
      padding: '14px 20px',
      textAlign: 'center',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.2)',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#02475b',
    },
    previewBody: {
      padding: 20,
      color: '#02475b',
    },
    contentInnerView: {
      padding: 40,
      backgroundColor: theme.palette.common.white,
    },
    pdfViewHeader: {
      display: 'flex',
      borderBottom: '1px solid rgba(0,0,0,0.3)',
      paddingBottom: 20,
    },
    logo: {
      '& img': {
        verticalAlign: 'middle',
        width: 160,
      },
    },
    hospitalAddress: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      marginLeft: 'auto',
      maxWidth: 320,
    },
    pdfViewSubHeader: {
      display: 'flex',
      paddingTop: 20,
    },
    patientDetails: {
      display: 'flex',
      fontSize: 16,
      fontWeight: 'bold',
    },
    patientCol: {
      paddingRight: 20,
      '& label': {
        color: '#0e8dbd',
        textTransform: 'uppercase',
      },
    },
    createdDate: {
      marginLeft: 'auto',
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    infoRow: {
      display: 'flex',
      '& label': {
        color: '#02475b',
        textTransform: 'none',
        minWidth: 90,
      },
    },
    tabletImg: {
      paddingBottom: 20,
      paddingTop: 10,
      '& img': {
        width: 50,
        verticalAlign: 'middle',
      },
    },
    contentInfo: {
      paddingLeft: 15,
    },
    sectionTitle: {
      color: '#0e8dbd',
      fontSize: 18,
      fontWeight: 600,
      textTransform: 'uppercase',
      paddingBottom: 15,
    },
    prescriptionList: {
      '& ol': {
        padding: 0,
        margin: 0,
        paddingLeft: 18,
        '& li': {
          paddingBottom: 30,
          fontSize: 16,
          fontWeight: 'bold',
          '& h4': {
            fontSize: 16,
            fontWeight: 'bold',
            margin: 0,
            textTransform: 'uppercase',
          },
        },
      },
    },
    symptemList: {
      paddingLeft: 30,
      fontSize: 16,
      paddingTop: 5,
      fontWeight: 'normal',
    },
    since: {
      opacity: 0.8,
      fontStyle: 'italic',
    },
    howOften: {
      fontWeight: 'bold',
    },
    severity: {
      opacity: 0.8,
      fontStyle: 'italic',
    },
    generalAdvice: {
      fontSize: 16,
      fontWeight: 'bold',
      paddingLeft: 50,
      paddingBottom: 15,
    },
    disclaimer: {
      fontSize: 14,
      fontWeight: 500,
      paddingTop: 30,
      borderBottom: '1px solid rgba(0,0,0,0.3)',
      marginBottom: 30,
      paddingBottom: 5,
    },
  };
});

export const CasesheetView: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.previewHeader}>Prescription</div>
      <div className={classes.previewBody}>
        <div className={classes.contentInnerView}>
          <div className={classes.pdfViewHeader}>
            <div className={classes.logo}>
              <img src={require('images/ic_logo.svg')} alt="" />
            </div>
            <div className={classes.hospitalAddress}>
              1860 500 1066
              <br />
              Apollo Hospitals
              <br />
              No.1, Old No.28, Platform Road Near Mantri Square Mall, Hotel Swathi, Sheshadripuram
              Bangalore, KA 560020
            </div>
          </div>
          <div className={classes.pdfViewSubHeader}>
            <div className={classes.patientDetails}>
              <div className={classes.patientCol}>
                <label>Patient Details:</label>
              </div>
              <div className={classes.patientCol}>
                <div className={classes.infoRow}>
                  <label>Name</label>
                  <span>Seema singh</span>
                </div>
                <div className={classes.infoRow}>
                  <label>Age</label>
                  <span>56</span>
                </div>
                <div className={classes.infoRow}>
                  <label>Gender</label>
                  <span>Female</span>
                </div>
                <div className={classes.infoRow}>
                  <label>UHID</label>
                  <span>APK 012345</span>
                </div>
              </div>
            </div>
            <div className={classes.createdDate}>Date - 27/09/2019</div>
          </div>
          <div className={classes.contentInfo}>
            <div className={classes.tabletImg}>
              <img src={require('images/ic_tablets_rx.svg')} alt="" />
            </div>
            <div className={classes.sectionTitle}>Prescription</div>
            <div className={classes.prescriptionList}>
              <ol>
                <li>
                  <h4>Momate Lotion 0.1% w/w</h4>
                  <div className={classes.symptemList}>
                    <div className={classes.since}>mometasone furoate .1%</div>
                    <div className={classes.howOften}>Once-every 3 days for 3 weeks</div>
                    <div className={classes.severity}>
                      For dandruff Apply Over scalp, After 3 weeks apply once a week for 4 weeks
                    </div>
                  </div>
                </li>
                <li>
                  <h4>Adapen Topical Gel 0.1%</h4>
                  <div className={classes.symptemList}>
                    <div className={classes.since}>adapalene .1%</div>
                    <div className={classes.howOften}>1 time a day (night) for 5 weeks</div>
                    <div className={classes.severity}>
                      Apply to forehead, cheeks, chin area and avoid eyelids and mouth region.
                      gentle single stroke application at night on a dry face. will cause
                      irritation, so apply on alternate night for 1st week followed by every night.
                    </div>
                  </div>
                </li>
                <li>
                  <h4>Faceclin Topical Gel</h4>
                  <div className={classes.symptemList}>
                    <div className={classes.since}>nicotinamide 4%, clindamycin phosphate 1%</div>
                    <div className={classes.howOften}>1 time a day (morning) for 4 weeks</div>
                    <div className={classes.severity}>
                      Apply 15 min after washing with saslic face wash over cheeks, forehead, nose
                      and chin
                    </div>
                  </div>
                </li>
                <li>
                  <h4>Saslic-ds foam 2% w/v</h4>
                  <div className={classes.symptemList}>
                    <div className={classes.since}>nicotinamide 4%, clindamycin phosphate 1%</div>
                    <div className={classes.howOften}>1 time a day (morning) for 4 weeks</div>
                    <div className={classes.severity}>
                      Apply 15 min after washing with saslic face wash over cheeks, forehead, nose
                      and chin
                    </div>
                  </div>
                </li>
                <li>
                  <h4>Melaglow Cream</h4>
                  <div className={classes.symptemList}>
                    <div className={classes.since}>nicotinamide 4%, clindamycin phosphate 1%</div>
                    <div className={classes.howOften}>1 time a day (morning) for 4 weeks</div>
                    <div className={classes.severity}>
                      Apply 15 min after washing with saslic face wash over cheeks, forehead, nose
                      and chin
                    </div>
                  </div>
                </li>
              </ol>
            </div>
            <div className={classes.sectionTitle}>General Advice</div>
            <div className={classes.generalAdvice}>
              Avoid fast food like oily junk food
              <br />
              Stay out of the sun or cover your face & skin when exposet to Sunlight/dust/Pollution
              Avoid touching your face or Propping your Cheeks with your hands
              <br />
              Consume 2 to 3 Litres of water, eat healthy
            </div>
            <div className={classes.disclaimer}>
              Disclaimer: The prescription has been issued on inputs during chat/call with the
              doctor. In case of emergency please visit a nearby hospital.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
