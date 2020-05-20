import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import moment from 'moment';
import { useCurrentPatient } from 'hooks/authHooks';
import React, { useContext } from 'react';
import { isEmpty } from 'lodash';
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
      display: 'flex',
      alignItems: 'center',
      '& img': {
        marginRight: 10,
      },
    },
    prescriptionSection: {
      marginBottom: 10,
    },
    advice: {
      display: 'flex',
      '& span': {
        marginRight: 15,
        fontSize: 10,
        color: 'rgba(0, 0, 0, 0.5)',
        width: 100,
        flex: '0 0 100px',
        lineHeight: 1.5,
      },
    },
    adviceInstruction: {
      padding: '20px 12px',
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
      color: 'rgba(0, 0, 0, 0.66)',
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
      padding: '20px 12px',
      marginTop: 30,
      '& h6': {
        fontSize: 11,
        color: 'rgba(0, 0, 0, 0.6)',
        lineHeight: 1.5,
        margin: '20px 0 10px',
        fontWeight: 400,
      },
    },
    gerenalInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
    instruction: {
      whiteSpace: 'pre-wrap',
      marginBottom: 10,
      color: 'rgba(0, 0, 0, 0.6)',
      fontSize: 11,
    },
    followContent: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(0, 0, 0, 0.8)',
      lineHeight: 1.5,
    },
  };
});

export interface CaseSheetViewProps {
  getFollowUpData: () => string;
}

export const CaseSheetLastView: React.FC<CaseSheetViewProps> = (props) => {
  const classes = useStyles({});
  const currentDoctor = useCurrentPatient();
  const {
    followUp,
    otherInstructions,
    followUpAfterInDays,
    createdDoctorProfile,
    appointmentInfo,
    sdConsultationDate,
    referralDescription,
    referralSpecialtyName,
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
              } | Reg. No. ${createdDoctorProfile.registrationNumber || ''}`}</p>
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
          {(otherInstructions && otherInstructions.length > 0) ||
          (followUp[0] && parseInt(followUpAfterInDays[0]) > 0) ||
          !isEmpty(referralSpecialtyName) ||
          !isEmpty(referralDescription) ? (
            <div className={classes.prescriptionSection}>
              <div className={classes.sectionHeader}>
                <img src={require('images/ic-doctors-2.svg')} /> Advise/ Instructions
              </div>
              <div className={classes.adviceInstruction}>
                {otherInstructions && otherInstructions.length > 0 && (
                  <div className={classes.advice}>
                    <span>Doctor’s Advise</span>
                    <div>
                      {otherInstructions.map((instruction) => (
                        <div className={classes.instruction}>{instruction.instruction}</div>
                      ))}
                    </div>
                  </div>
                )}
                {followUp[0] && parseInt(followUpAfterInDays[0]) > 0 ? (
                  <div className={classes.advice}>
                    <span>Follow Up</span>
                    <div className={classes.followContent}>{props.getFollowUpData()}</div>
                  </div>
                ) : null}

                {(!isEmpty(referralSpecialtyName) || !isEmpty(referralDescription)) && (
                  <div className={classes.advice}>
                    <span>Referral</span>
                    <div>
                      {!isEmpty(referralSpecialtyName) && (
                        <div className={classes.followContent} style={{ marginBottom: 5 }}>
                          {referralSpecialtyName}
                        </div>
                      )}
                      {!isEmpty(referralDescription) && (
                        <div className={classes.instruction}>{referralDescription}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {createdDoctorProfile && (
            <div className={classes.prescriptionHeader}>
              {((sdConsultationDate && sdConsultationDate !== '') ||
                (appointmentInfo && appointmentInfo!.appointmentDateTime)) && (
                <h6>
                  Prescribed on{' '}
                  {sdConsultationDate && sdConsultationDate !== ''
                    ? moment(sdConsultationDate).format('DD/MM/YYYY')
                    : moment(appointmentInfo.appointmentDateTime).format('DD/MM/YYYY')}{' '}
                  by
                </h6>
              )}
              {createdDoctorProfile!.signature && (
                <div className={classes.followUpContent}>
                  <img src={createdDoctorProfile.signature} />
                </div>
              )}
              {(createdDoctorProfile!.salutation ||
                createdDoctorProfile!.firstName ||
                createdDoctorProfile!.lastName ||
                createdDoctorProfile!.registrationNumber ||
                (createdDoctorProfile!.specialty &&
                  createdDoctorProfile!.specialty!.specialistSingularTerm)) && (
                <div className={classes.signInformation}>
                  {(createdDoctorProfile.salutation ||
                    createdDoctorProfile.firstName ||
                    createdDoctorProfile.lastName) && (
                    <h3 className={classes.followUpContent}>
                      {`${createdDoctorProfile.salutation}. ${createdDoctorProfile.firstName} ${createdDoctorProfile.lastName}`}
                    </h3>
                  )}

                  {/* {currentDoctor.qualification && (
                      <p className={`${classes.specialty} ${classes.qualification}`}>
                        {currentDoctor.qualification}
                      </p>
                    )} */}
                  {((createdDoctorProfile.specialty &&
                    createdDoctorProfile.specialty.specialistSingularTerm) ||
                    createdDoctorProfile.registrationNumber) && (
                    <p className={classes.specialty}>
                      {createdDoctorProfile.specialty.specialistSingularTerm
                        ? `${createdDoctorProfile.specialty.specialistSingularTerm} | `
                        : ''}
                      {createdDoctorProfile.registrationNumber
                        ? `Reg. No. ${createdDoctorProfile.registrationNumber}`
                        : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={classes.gerenalInfo}>
          <div className={classes.pageNumbers}>Page 2 of 2</div>
          <div className={classes.disclaimer}>
            <span>Disclaimer:</span>
            <span>
              This prescription is issued on the basis of your inputs during teleconsultation. It is
              valid from the date of issue for upto 90 days (for the specific period/dosage of each
              medicine as advised).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
