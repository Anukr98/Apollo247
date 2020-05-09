import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import moment from 'moment';
import React, { useContext } from 'react';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      paddingBottom: 1,
    },
    prescriptionPreview: {
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: 'calc(100% - 40px)',
      color: 'rgba(0, 0, 0, 0.6)',
      marginRight: 20,
      marginLeft: 20,
      marginBottom: 20,
      padding: 20,
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    doctorInformation: {
      marginLeft: 'auto',
      maxWidth: 250,
      '& h3': {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#02475b',
        margin: 0,
        lineHeight: 1.5,
      },
    },
    specialty: {
      fontSize: 9,
      color: '#02475b',
      margin: 0,
      lineHeight: 1.5,
    },
    qualification: {
      fontWeight: 500,
    },
    signInformation: {
      marginRight: 'auto',
      maxWidth: 250,
      '& h3': {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#02475b',
        margin: 0,
        padding: 0,
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
      color: '#02475b',
      textTransform: 'uppercase',
      padding: '8px 5px',
      borderBottom: '1px solid #02475b',
    },
    prescriptionSection: {
      marginBottom: 10,
    },
    advice: {
      fontSize: 12,
      padding: 12,
    },
    disclaimer: {
      fontSize: 9,
      borderTop: 'solid 1px rgba(2, 71, 91, 0.15)',
      color: 'rgba(0, 0, 0, 0.5)',
      paddingTop: 10,
      display: 'flex',
      '& span': {
        '&:first-child': {
          color: 'rgba(0, 0, 0, 0.6)',
          fontWeight: 'bold',
          marginRight: 10,
        },
      },
    },
    pageNumbers: {
      textAlign: 'right',
      color: '#02475b',
      fontSize: 8,
      fontWeight: 500,
      paddingBottom: 8,
    },
    followUpContent: {
      padding: 12,
      fontSize: 12,
      color: '#02475b',
      fontWeight: 500,
      '& img': {
        maxWidth: 200,
        height: 70,
      },
    },
    prescriptionHeader: {
      marginBottom: 10,
      borderTop: '1px solid #02475b',
      padding: 12,
      marginTop: 30,
      '& h6': {
        fontSize: 11,
        color: 'rgba(0, 0, 0, 0.6)',
        lineHeight: 1.5,
        margin: 0,
        fontWeight: 400,
        marginTop: 20,
      },
    },
    gerenalInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
  };
});

export interface CaseSheetViewProps {
  getFollowUpData: () => string;
}

export const CaseSheetLastView: React.FC<CaseSheetViewProps> = (props) => {
  const classes = useStyles({});
  const {
    followUp,
    otherInstructions,
    followUpAfterInDays,
    createdDoctorProfile,
    appointmentInfo,
    sdConsultationDate,
  } = useContext(CaseSheetContext);

  let doctorFacilityDetails = null;
  if (createdDoctorProfile && createdDoctorProfile.doctorHospital[0]) {
    doctorFacilityDetails = createdDoctorProfile.doctorHospital[0].facility;
  }

  return (
    <div className={classes.root}>
      <div className={classes.prescriptionPreview}>
        {/* <div className={classes.pageHeader}>
          <div className={classes.logo}>
            <img src={require('images/ic_logo_insideapp.svg')} alt="" />
          </div>
          {createdDoctorProfile ? (
            <div className={classes.doctorInformation}>
              <h3>
                {`${createdDoctorProfile.salutation}. ${createdDoctorProfile.firstName} ${createdDoctorProfile.lastName}`}
              </h3>
              <p className={`${classes.specialty} ${classes.qualification}`}>
                MBBS, MD (Internal Medicine)
              </p>
              <p className={classes.specialty}>{`${
                createdDoctorProfile.specialty.specialistSingularTerm
              } | MCI Reg. No. ${createdDoctorProfile.registrationNumber || ''}`}</p>
              {doctorFacilityDetails ? (
                <>
                  <p className={classes.address}>
                    {`${doctorFacilityDetails.streetLine1 || ''} ${
                      doctorFacilityDetails.streetLine2
                        ? `| ${doctorFacilityDetails.streetLine2}`
                        : ''
                    } ${
                      doctorFacilityDetails.streetLine3
                        ? `| ${doctorFacilityDetails.streetLine3}`
                        : ''
                    } ${doctorFacilityDetails.city ? ` | ${doctorFacilityDetails.city}` : ''}  ${
                      doctorFacilityDetails.zipcode ? ` - ${doctorFacilityDetails.zipcode}` : ''
                    }  ${doctorFacilityDetails.state ? ` | ${doctorFacilityDetails.state}` : ''} ${
                      doctorFacilityDetails.country ? `,${doctorFacilityDetails.country}` : ''
                    }`}
                  </p>
                </>
              ) : null}
            </div>
          ) : null}
        </div> */}
        <div className={classes.pageContent}>
          {otherInstructions && otherInstructions.length > 0 ? (
            <div className={classes.prescriptionSection}>
              <div className={classes.sectionHeader}>Advice Given</div>
              <div className={classes.advice}>
                {otherInstructions.map((instruction) => (
                  <div>{instruction.instruction}</div>
                ))}
              </div>
            </div>
          ) : null}
          {followUp[0] && parseInt(followUpAfterInDays[0]) > 0 ? (
            <div className={classes.prescriptionSection}>
              <div className={classes.sectionHeader}>Follow Up</div>
              <div className={classes.followUpContent}>{props.getFollowUpData()}</div>
            </div>
          ) : null}
          {createdDoctorProfile && createdDoctorProfile.signature && (
            <div className={classes.prescriptionHeader}>
              <h6>
                Prescribed on{' '}
                {sdConsultationDate && sdConsultationDate !== ''
                  ? moment(sdConsultationDate).format('DD/MM/YYYY')
                  : moment(appointmentInfo.appointmentDateTime).format('DD/MM/YYYY')}{' '}
                by
              </h6>
              <div className={classes.followUpContent}>
                <img src={createdDoctorProfile.signature} />
              </div>
              <div className={classes.signInformation}>
                <h3 className={classes.followUpContent}>
                  {`${createdDoctorProfile.salutation}. ${createdDoctorProfile.firstName} ${createdDoctorProfile.lastName}`}
                </h3>
                <p className={`${classes.specialty} ${classes.qualification}`}>
                  MBBS, MD (Internal Medicine)
                </p>
                <p className={classes.specialty}>{`${
                  createdDoctorProfile.specialty.specialistSingularTerm
                } | MCI Reg. No. ${createdDoctorProfile.registrationNumber || ''}`}</p>
              </div>
            </div>
          )}
        </div>
        <div className={classes.gerenalInfo}>
          <div className={classes.pageNumbers}>Page 2 of 2</div>
          <div className={classes.disclaimer}>
            <span>Disclaimer:</span>
            <span>
              This prescription is issued by the Apollo Hospitals Group on the basis of your
              teleconsultation. It is valid from the date of issue for upto 90 days (for the
              specific period/dosage of each medicine as advised).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
