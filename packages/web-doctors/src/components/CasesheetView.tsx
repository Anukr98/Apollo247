import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useContext } from 'react';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { CaseSheetLastView } from './CasesheetLastView';
import moment from 'moment';

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
    followUp: {
      fontSize: 12,
      color: 'rgba(0, 0, 0, 0.6)',
      padding: 12,
    },
  };
});

export const CasesheetView: React.FC = (props) => {
  const classes = useStyles();
  const {
    patientDetails,
    height,
    weight,
    bp,
    temperature,
    appointmentInfo,
    consultType,
    symptoms,
    diagnosis,
    medicinePrescription,
    diagnosticPrescription,
    createdDoctorProfile,
    followUp,
    otherInstructions,
    followUpAfterInDays,
  } = useContext(CaseSheetContext);

  const getAge = (date: string) => {
    if (date) {
      return Math.abs(
        new Date(Date.now()).getUTCFullYear() - new Date(date).getUTCFullYear()
      ).toString();
    }
  };

  const getPageContentCount = () => {
    return diagnosticPrescription &&
      diagnosticPrescription.length > 0 &&
      medicinePrescription &&
      medicinePrescription.length > 0 &&
      diagnosis &&
      diagnosis.length > 0 &&
      symptoms &&
      symptoms.length > 0
      ? 4
      : 0;
  };

  return (
    <div className={classes.root}>
      <div className={classes.previewHeader}>Prescription</div>
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
                <span>{`${
                  createdDoctorProfile.specialty.specialistSingularTerm
                    ? createdDoctorProfile.specialty.specialistSingularTerm
                    : ''
                } | MCI Reg. No. ${createdDoctorProfile.registrationNumber || ''}`}</span>
              </h3>
              <p className={classes.address}>
                {`${createdDoctorProfile.streetLine1 || ''} ${
                  createdDoctorProfile.streetLine2 ? `| ${createdDoctorProfile.streetLine2}` : ''
                } ${
                  createdDoctorProfile.streetLine3 ? ` | ${createdDoctorProfile.streetLine3}` : ''
                }  ${createdDoctorProfile.city ? `| ${createdDoctorProfile.city}` : ''}  ${
                  createdDoctorProfile.zip ? ` - ${createdDoctorProfile.zip}` : ''
                }  ${createdDoctorProfile.state ? ` | ${createdDoctorProfile.state}` : ''} ${
                  createdDoctorProfile.country ? `,${createdDoctorProfile.country}` : ''
                }`}
              </p>
            </div>
          ) : null}
        </div>
        <div className={classes.pageContent}>
          <div className={classes.sectionHeader}>Appointment Details</div>
          <div className={classes.accountDetails}>
            <div className={classes.infoRow}>
              <div className={classes.label}>Patient</div>
              <div className={classes.lebelContent}>
                {patientDetails ? (
                  <div className={classes.patientName}>
                    {`${patientDetails.firstName}  ${patientDetails.lastName}`} |{' '}
                    {patientDetails.gender} | {getAge(patientDetails.dateOfBirth)}
                  </div>
                ) : null}
              </div>
            </div>
            {weight || height || bp || temperature ? (
              <div className={classes.infoRow}>
                <div className={classes.label}>Vitals</div>
                <div className={classes.lebelContent}>
                  {`${weight ? `Weight : ${weight}` : null} ${
                    height ? `| Height: ${height}` : null
                  } ${bp ? `| BP: ${bp}` : null}  ${
                    temperature && parseInt(temperature) > 0 ? `| Temperature: ${temperature}` : ''
                  }`}
                </div>
              </div>
            ) : null}
            {patientDetails && patientDetails.uhid ? (
              <div className={classes.infoRow}>
                <div className={classes.label}>UHID</div>
                <div className={classes.lebelContent}>{patientDetails.uhid}</div>
              </div>
            ) : null}
            {appointmentInfo && appointmentInfo.appointmentDateTime ? (
              <div className={classes.infoRow}>
                <div className={classes.label}>Consult Date</div>
                <div className={classes.lebelContent}>
                  {moment(appointmentInfo.appointmentDateTime).format('DD/MM/YYYY')}
                </div>
              </div>
            ) : null}
            {consultType ? (
              <div className={classes.infoRow}>
                <div className={classes.label}>Consult Type</div>
                <div className={classes.lebelContent}>{consultType}</div>
              </div>
            ) : null}
          </div>
          {symptoms && symptoms.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Chief Complaints</div>
              <div className={classes.chiefComplaints}>
                {symptoms.map((symptom) => (
                  <div className={classes.complaintsInfoRow}>
                    <div className={classes.complaintsLabel}>{symptom.symptom}</div>
                    <div className={classes.lebelContent}>
                      {`Since: Last ${symptom.since} | How often: ${symptom.howOften} | Severity: ${symptom.severity}`}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {diagnosis && diagnosis.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Diagnosis</div>
              <div className={classes.diagnosis}>
                {diagnosis.map((diagnos) => (
                  <div className={classes.infoRow}>
                    <div className={classes.lebelContent}>{diagnos.name}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {medicinePrescription && medicinePrescription.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Medication Prescribed</div>
              <div className={classes.medicationList}>
                <ol>
                  {medicinePrescription.map((prescription) => (
                    <li>
                      {prescription.medicineName}
                      <br />
                      <span>
                        {`${prescription.medicineDosage} ${
                          prescription.medicineDosage && parseInt(prescription.medicineDosage) > 1
                            ? `tablets`
                            : `tablet`
                        } ${
                          prescription.medicineTimings && prescription.medicineTimings.length > 0
                            ? `(${prescription.medicineTimings.map((timing) => timing)})`
                            : ''
                        }
                         for ${prescription.medicineConsumptionDurationInDays} days${
                          prescription.medicineToBeTaken &&
                          prescription.medicineToBeTaken.length > 0
                            ? `; ${prescription.medicineToBeTaken.map((timing) => timing)}`
                            : ''
                        }`}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          ) : null}
          {diagnosticPrescription && diagnosticPrescription.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Diagnostic Tests</div>
              <div className={classes.medicationList}>
                <ol>
                  {diagnosticPrescription.map((prescription) => (
                    <li>{prescription.itemname}</li>
                  ))}
                </ol>
              </div>
            </>
          ) : null}
          {getPageContentCount() === 4 ? null : (
            <>
              {' '}
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
            </>
          )}
        </div>
        {getPageContentCount() === 4 &&
        ((followUp && followUp.length > 0) ||
          (otherInstructions && otherInstructions.length > 0)) ? (
          <div className={classes.pageNumbers}>Page 1 of 2</div>
        ) : null}
        <div className={classes.disclaimer}>
          Disclaimer: The prescription has been issued based on your inputs during chat/call with
          the doctor. In case of emergency please visit a nearby hospital.
        </div>
      </div>
      {getPageContentCount() === 4 &&
      ((followUp && followUp.length > 0) || (otherInstructions && otherInstructions.length > 0)) ? (
        <CaseSheetLastView />
      ) : null}
    </div>
  );
};
