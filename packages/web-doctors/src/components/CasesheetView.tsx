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
    prescriptionPreview: {
      backgroundColor: '#fff',
      display: 'inline-block',
      width: 'calc(100% - 40px)',
      color: 'rgba(0, 0, 0, 0.6)',
      margin: 20,
      padding: 20,
    },
    pageHeader: {
      display: 'flex',
    },
    doctorInformation: {
      marginLeft: 'auto',
      width: 198,
      '& h3': {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#02475b',
        margin: 0,
        '& span': {
          fontWeight: 'normal',
          fontSize: 10,
        },
      },
    },
    address: {
      fontSize: 8,
    },
    logo: {
      '& img': {
        height: 65,
      },
    },
    pageContent: {
      padding: '20px 0 0 0',
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: 500,
      color: 'rgba(0, 0, 0, 0.7)',
      backgroundColor: '#f7f7f7',
      padding: '8px 12px',
    },
    accountDetails: {
      fontSize: 10,
      color: 'rgba(0, 0, 0, 0.6)',
      padding: 12,
    },
    infoRow: {
      display: 'flex',
      paddingBottom: 5,
    },
    label: {
      width: 80,
      paddingRight: 10,
    },
    patientName: {
      fontSize: 12,
      color: '#02475b',
      fontWeight: 500,
    },
    chiefComplaints: {
      fontSize: 12,
      color: 'rgba(0, 0, 0, 0.6)',
      padding: 12,
    },
    complaintsInfoRow: {
      paddingBottom: 5,
    },
    complaintsLabel: {
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
    },
    diagnosis: {
      fontSize: 12,
      color: '#02475b',
      fontWeight: 500,
      padding: 12,
    },
    medicationList: {
      fontSize: 12,
      fontWeight: 600,
      padding: 12,
      '& ol': {
        padding: 0,
        paddingLeft: 18,
        margin: 0,
        '& li': {
          paddingBottom: 10,
          '& span': {
            color: 'rgba(0, 0, 0, 0.6)',
            fontWeight: 'normal',
            paddingTop: 3,
            display: 'inline-block',
          },
        },
      },
    },
    disclaimer: {
      fontSize: 10,
      borderTop: 'solid 1px rgba(2, 71, 91, 0.15)',
      color: 'rgba(0, 0, 0, 0.5)',
      paddingTop: 10,
    },
    pageNumbers: {
      textAlign: 'center',
      color: '#02475b',
      fontSize: 8,
      fontWeight: 500,
      paddingBottom: 15,
    },
    lebelContent: {
      width: '100%',
    },
  };
});

export const CasesheetView: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.previewHeader}>Prescription</div>
      <div className={classes.prescriptionPreview}>
        <div className={classes.pageHeader}>
          <div className={classes.logo}>
            <img src={require('images/ic_logo_insideapp.svg')} alt="" />
          </div>
          <div className={classes.doctorInformation}>
            <h3>
              Dr. Monica Iniyan
              <br />
              <span>General Physician | MCI Reg. No. AH98263</span>
            </h3>
            <p className={classes.address}>
              9th Floor | Krishe Sapphire Building | MSR Block, Survey No. 88 | HiTech City Main
              Road | Madhapur | Hyderabad – 500081 | Telangana, India
            </p>
          </div>
        </div>
        <div className={classes.pageContent}>
          <div className={classes.sectionHeader}>Appointment Details</div>
          <div className={classes.accountDetails}>
            <div className={classes.infoRow}>
              <div className={classes.label}>Patient</div>
              <div className={classes.lebelContent}>
                <div className={classes.patientName}>Seema Rao | Female | 49 yrs</div>
              </div>
            </div>
            <div className={classes.infoRow}>
              <div className={classes.label}>Vitals</div>
              <div className={classes.lebelContent}>
                Weight: 67 kgs | Height: 160 cms | BP: 120/80 mm Hg | Temperature: 102°F
              </div>
            </div>
            <div className={classes.infoRow}>
              <div className={classes.label}>UHID</div>
              <div className={classes.lebelContent}>APK 012345</div>
            </div>
            <div className={classes.infoRow}>
              <div className={classes.label}>Consult Date</div>
              <div className={classes.lebelContent}>24/09/2019</div>
            </div>
            <div className={classes.infoRow}>
              <div className={classes.label}>Consult Type</div>
              <div className={classes.lebelContent}>Online</div>
            </div>
          </div>
          <div className={classes.sectionHeader}>Chief Complaints</div>
          <div className={classes.chiefComplaints}>
            <div className={classes.complaintsInfoRow}>
              <div className={classes.complaintsLabel}>Fever</div>
              <div className={classes.lebelContent}>
                Since: Last 2 days | How often: Nights | Severity: High, 102°F
              </div>
            </div>
            <div className={classes.complaintsInfoRow}>
              <div className={classes.complaintsLabel}>Cough and Cold</div>
              <div className={classes.lebelContent}>
                Since: Last 4 days | How often: Wet cough, all day; chest congestion at nights |
                Severity: High
              </div>
            </div>
          </div>
          <div className={classes.sectionHeader}>Diagnosis</div>
          <div className={classes.diagnosis}>
            <div className={classes.infoRow}>
              <div className={classes.lebelContent}>Viral Fever and Throat Infection</div>
            </div>
          </div>
          <div className={classes.sectionHeader}>Medication Prescribed</div>
          <div className={classes.medicationList}>
            <ol>
              <li>
                Acetaminophen 1.5% w/w
                <br />
                <span>1 tablet (morning and night) for 5 days; before food</span>
              </li>
              <li>
                Dextromethorphan syrup (generic)
                <br />
                <span>10 ml for 5 days, every 4 hours</span>
              </li>
            </ol>
          </div>
          <div className={classes.sectionHeader}>Diagnostic Tests</div>
          <div className={classes.medicationList}>
            <ol>
              <li>
                Blood Sugar test (X-165)
                <br />
                <span>Instructions related to this test will appear here</span>
              </li>
              <li>
                Blood Sugar test (X-165)
                <br />
                <span>Instructions related to this test will appear here</span>
              </li>
            </ol>
          </div>
        </div>
        <div className={classes.pageNumbers}>Page 1 of 2</div>
        <div className={classes.disclaimer}>
          Disclaimer: The prescription has been issued based on your inputs during chat/call with
          the doctor. In case of emergency please visit a nearby hospital.
        </div>
      </div>
    </div>
  );
};
