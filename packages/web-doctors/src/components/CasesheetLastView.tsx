import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useContext } from 'react';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    prescriptionPreview: {
      backgroundColor: '#fff',
      display: 'inline-block',
      width: 'calc(100% - 40px)',
      color: 'rgba(0, 0, 0, 0.6)',
      marginRight: 20,
      marginLeft: 20,
      marginBottom: 20,
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
    followUp: {
      fontSize: 12,
      color: 'rgba(0, 0, 0, 0.6)',
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

export const CaseSheetLastView: React.FC = (props) => {
  const classes = useStyles();
  const {
    followUp,
    otherInstructions,
    consultType,
    followUpAfterInDays,
    createdDoctorProfile,
  } = useContext(CaseSheetContext);
  console.log('follow', followUp);

  return (
    <div className={classes.root}>
      <div className={classes.prescriptionPreview}>
        <div className={classes.pageHeader}>
          <div className={classes.logo}>
            <img src={require('images/ic_logo_insideapp.svg')} alt="" />
          </div>
          {createdDoctorProfile ? (
            <div className={classes.doctorInformation}>
              <h3>
                {`${createdDoctorProfile.salutation}. ${createdDoctorProfile.firstName} ${createdDoctorProfile.lastName}`}
                <br />
                <span>{`${createdDoctorProfile.speciality} | MCI Reg. No. ${createdDoctorProfile.id}`}</span>
              </h3>
              <p className={classes.address}>
                {`${createdDoctorProfile.streetLine1} | ${createdDoctorProfile.streetLine2} | ${createdDoctorProfile.streetLine3} | ${createdDoctorProfile.city} – ${createdDoctorProfile.zip} | ${createdDoctorProfile.state}, ${createdDoctorProfile.country}}`}
              </p>
            </div>
          ) : null}
        </div>
        <div className={classes.pageContent}>
          {otherInstructions && otherInstructions.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Advice Given</div>
              <div className={classes.medicationList}>
                {otherInstructions.map((instruction) => (
                  <span>{instruction.instruction}</span>
                ))}
              </div>
            </>
          ) : null}
          {followUp && followUpAfterInDays ? (
            <>
              <div className={classes.sectionHeader}>Follow Up</div>
              <div className={classes.followUp}>
                Follow up {consultType} after {followUpAfterInDays} days
              </div>
            </>
          ) : null}
        </div>
        <div className={classes.pageNumbers}>Page 2 of 2</div>
        <div className={classes.disclaimer}>
          Disclaimer: The prescription has been issued based on your inputs during chat/call with
          the doctor. In case of emergency please visit a nearby hospital.
        </div>
      </div>
    </div>
  );
};
