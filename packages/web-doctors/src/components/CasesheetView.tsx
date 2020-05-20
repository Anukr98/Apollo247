import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useContext, useState } from 'react';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { useCurrentPatient } from 'hooks/authHooks';
import { CaseSheetLastView } from './CasesheetLastView';
import moment from 'moment';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { isEmpty, trim } from 'lodash';
import { MEDICINE_FREQUENCY } from 'graphql/types/globalTypes';
import {
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
} from 'graphql/types/GetCaseSheet';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
      paddingBottom: 1,
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
    loader: {
      left: '50%',
      top: 60,
      position: 'relative',
    },
    prescriptionPreview: {
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: 'calc(100% - 40px)',
      color: 'rgba(0, 0, 0, 0.6)',
      margin: 20,
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
    accountDetails: {
      fontSize: 10,
      color: 'rgba(0, 0, 0, 0.6)',
      padding: '20px 12px',
    },
    infoRow: {
      display: 'flex',
      paddingBottom: 10,
      alignItems: 'center',
    },
    label: {
      width: 80,
      paddingRight: 10,
      fontSize: 10,
    },
    patientName: {
      fontSize: 11,
      fontWeight: 500,
      color: 'rgba(0, 0, 0, 0.8)',
    },
    chiefComplaints: {
      fontSize: 12,
      color: 'rgba(0, 0, 0, 0.6)',
      padding: '20px 12px',
    },
    complaintsInfoRow: {
      paddingBottom: 15,
    },
    complaintsLabel: {
      fontSize: 11,
      fontWeight: 500,
      color: 'rgba(0, 0, 0, 0.8)',
      paddingBottom: 3,
    },
    diagnosis: {
      fontSize: 12,
      color: 'rgba(0, 0, 0, 0.8)',
      fontWeight: 500,
      padding: '20px 12px',
    },
    medicationList: {
      fontSize: 12,
      fontWeight: 600,
      padding: '20px 12px',
      color: 'rgba(0, 0, 0, 0.8)',
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
    labelContent: {
      width: '100%',
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
    labelBlue: {
      color: 'rgba(0, 0, 0, 0.8)',
      fontWeight: 500,
      fontSize: 11,
    },
    prescriptionHeader: {
      marginBottom: 10,
      marginTop: 30,
      borderTop: '1px solid #02475b',
      padding: '20px 12px',
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
    consultInfo: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    labelRight: {
      width: 120,
    },
    subInfo: {
      fontSize: 8,
      color: 'rgba(0, 0, 0, 0.5)',
      fontWeight: 400,
    },
    vitalLabel: {
      color: '#02475b',
      marginBottom: 5,
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
interface savingProps {
  saving: boolean;
}
export const CasesheetView: React.FC<savingProps> = (props) => {
  const classes = useStyles({});
  const currentDoctor = useCurrentPatient();
  const {
    patientDetails,
    sdConsultationDate,
    height,
    weight,
    bp,
    temperature,
    appointmentInfo,
    consultType,
    createdDoctorProfile,
    followUp,
    followUpAfterInDays,
    followUpDate,
    followUpConsultType,
    diagnosis,
    otherInstructions,
    symptoms,
    diagnosticPrescription,
    medicinePrescription,
    referralDescription,
    referralSpecialtyName,
  } = useContext(CaseSheetContext);

  /*console.log({
    patientDetails,
    sdConsultationDate,
    height,
    weight,
    bp,
    temperature,
    appointmentInfo,
    consultType,
    createdDoctorProfile,
    followUp,
    followUpAfterInDays,
    followUpDate,
    followUpConsultType,
    diagnosis,
    otherInstructions,
    symptoms,
    diagnosticPrescription,
    medicinePrescription,
  });

  console.log({ currentDoctor });*/

  const [loader, setLoader] = useState<boolean>(false);
  let doctorFacilityDetails = null;
  if (createdDoctorProfile && createdDoctorProfile.doctorHospital[0]) {
    doctorFacilityDetails = createdDoctorProfile.doctorHospital[0].facility;
  }
  const dosageFrequency = [
    {
      id: 'ONCE_A_DAY',
      value: 'Once a day',
      selected: false,
    },
    {
      id: 'TWICE_A_DAY',
      value: 'Twice a day',
      selected: false,
    },
    {
      id: 'THRICE_A_DAY',
      value: 'Thrice a day',
      selected: false,
    },
    {
      id: 'FOUR_TIMES_A_DAY',
      value: 'Four times a day',
      selected: false,
    },
    {
      id: 'FIVE_TIMES_A_DAY',
      value: 'Five times a day',
      selected: false,
    },
    {
      id: 'AS_NEEDED',
      value: 'As Needed',
      selected: false,
    },
  ];
  const medUnitObject: any = {
    ML: { value: 'ml' },
    MG: { value: 'mg' },
    GM: { value: 'gm' },
    TABLET: { value: 'tablet(s)' },
    CAPSULE: { value: 'capsule(s)' },
    DROP: { value: 'drop(s)' },
    PUFF: { value: 'puff(s)' },
    UNIT: { value: 'unit(s)' },
    SPRAY: { value: 'spray(s)' },
    PATCH: { value: 'patch' },
    AS_PRESCRIBED: { value: 'As prescribed' },
  };
  const getAge = (date: string) => {
    if (date) {
      return Math.abs(
        new Date(Date.now()).getUTCFullYear() - new Date(date).getUTCFullYear()
      ).toString();
    }
  };
  const toBeTaken = (value: any) => {
    const tobeTakenObjectList: any = [];
    value.map((slot: any) => {
      const tobeTakenObject = slot.replace('_', ' ').toLowerCase();
      tobeTakenObjectList.push(tobeTakenObject);
    });
    return tobeTakenObjectList;
  };
  const term = (value: string, char: string) => {
    let changedString = value.substring(0, value.length - 1);
    return changedString + char;
  };
  const isPageContentFull = () => {
    return (
      diagnosticPrescription &&
      diagnosticPrescription.length > 0 &&
      medicinePrescription &&
      medicinePrescription.length > 0 &&
      diagnosis &&
      diagnosis.length > 0 &&
      symptoms &&
      symptoms.length > 0
    );
  };

  const getFollowUpData = () => {
    return `Follow up (${_startCase(_toLower(followUpConsultType[0]))}) ${
      followUpAfterInDays[0] === '9'
        ? `on ${moment(followUpDate[0]).format('DD/MM/YYYY')}`
        : `after ${followUpAfterInDays[0]} days`
    }
    `;
  };

  const medicineHtml =
    medicinePrescription &&
    medicinePrescription!.map(
      (
        prescription: GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
        index: number
      ) => {
        const duration =
          prescription.medicineConsumptionDurationInDays &&
          ` for ${Number(prescription.medicineConsumptionDurationInDays)} ${
            prescription.medicineConsumptionDurationUnit
              ? term(prescription.medicineConsumptionDurationUnit.toLowerCase(), '(s)')
              : 'day(s)'
          } `;

        const whenString =
          prescription!.medicineToBeTaken!.length > 0
            ? toBeTaken(prescription!.medicineToBeTaken)
                .join(', ')
                .toLowerCase()
            : '';
        const unitHtmls =
          prescription && medUnitObject && medUnitObject[prescription!.medicineUnit!]
            ? medUnitObject[prescription!.medicineUnit!].value
            : prescription!.medicineUnit!.toLowerCase();
        const isInDuration =
          prescription &&
          ((prescription!.medicineTimings &&
            prescription!.medicineTimings!.length === 1 &&
            prescription!.medicineTimings[0] === 'AS_NEEDED') ||
            (prescription!.medicineCustomDosage! && prescription!.medicineCustomDosage! !== ''))
            ? ''
            : 'in the ';
        let timesString =
          prescription!.medicineTimings!.length > 0
            ? isInDuration +
              prescription!
                .medicineTimings!.join(' , ')
                .toLowerCase()
                .replace('_', ' ')
            : '';
        if (timesString && timesString !== '') {
          timesString = timesString.replace(/,(?=[^,]*$)/, 'and');
        }
        let dosageHtml = '';
        if (prescription!.medicineCustomDosage && prescription!.medicineCustomDosage! !== '') {
          const dosageTimingArray = prescription!.medicineCustomDosage!.split('-');
          const customTimingArray = [];
          if (dosageTimingArray && dosageTimingArray[0])
            customTimingArray.push(dosageTimingArray[0] + unitHtmls);
          if (dosageTimingArray && dosageTimingArray[1])
            customTimingArray.push(dosageTimingArray[1] + unitHtmls);
          if (dosageTimingArray && dosageTimingArray[2])
            customTimingArray.push(dosageTimingArray[2] + unitHtmls);
          if (dosageTimingArray && dosageTimingArray[3])
            customTimingArray.push(dosageTimingArray[3] + unitHtmls);
          dosageHtml = customTimingArray.join(' - ');
        } else {
          dosageHtml = prescription!.medicineDosage! + ' ' + unitHtmls;
        }
        return (
          <li>
            {prescription.medicineName}
            <br />
            <span>
              {`${prescription!.medicineFormTypes! === 'OTHERS' ? 'Take' : 'Apply'} ${
                dosageHtml ? dosageHtml.toLowerCase() : ''
              }${
                timesString.length > 0 &&
                prescription!.medicineCustomDosage! &&
                prescription!.medicineCustomDosage! !== ''
                  ? ' (' + timesString + ') '
                  : ' '
              }${
                prescription!.medicineCustomDosage! && prescription!.medicineCustomDosage! !== ''
                  ? ''
                  : prescription!.medicineFrequency
                  ? prescription!.medicineFrequency === MEDICINE_FREQUENCY.STAT
                    ? 'STAT (Immediately)'
                    : prescription!.medicineFrequency
                        .split('_')
                        .join(' ')
                        .toLowerCase()
                  : dosageFrequency[0].id
                      .split('_')
                      .join(' ')
                      .toLowerCase()
              } ${duration} ${whenString.length > 0 ? whenString : ''} ${
                timesString.length > 0 &&
                prescription!.medicineCustomDosage! &&
                prescription!.medicineCustomDosage! !== ''
                  ? ''
                  : timesString
              }`}
            </span>
            {prescription.routeOfAdministration &&
              !isEmpty(trim(prescription.routeOfAdministration)) && (
                <>
                  <br />
                  <span>{`To be taken: ${prescription.routeOfAdministration
                    .split('_')
                    .join(' ')
                    .toLowerCase()}`}</span>
                </>
              )}
            {prescription.medicineInstructions &&
              !isEmpty(trim(prescription.medicineInstructions)) && (
                <>
                  <br />
                  <span>{prescription.medicineInstructions}</span>
                </>
              )}
          </li>
        );
      }
    );
  const generateSymptomsHtml = (symptom: GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms) => {
    {
      `Since: ${symptom.since} | How often: ${symptom.howOften} | Severity: ${symptom.severity}`;
    }
    const symptomArray = [];
    symptom && symptom.since && symptomArray.push(`Since: ${symptom.since}`);
    symptom && symptom.howOften && symptomArray.push(`How often: ${symptom.howOften}`);
    symptom && symptom.severity && symptomArray.push(`Severity: ${symptom.severity}`);
    symptom && symptom.details && symptomArray.push(`Details: ${symptom.details}`);
    return symptomArray.length > 0 ? symptomArray.join(' | ') : '';
  };

  return (
    <div className={classes.root} id={'prescriptionWrapper'}>
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
              </h3>
              {/* {currentDoctor.qualification && (
                <p className={`${classes.specialty} ${classes.qualification}`}>
                  {currentDoctor.qualification}
                </p>
              )} */}

              <p className={classes.specialty}>{`${
                createdDoctorProfile.specialty.specialistSingularTerm
                  ? createdDoctorProfile.specialty.specialistSingularTerm
                  : ''
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
        </div>
        <div className={classes.pageContent}>
          <div className={classes.prescriptionSection}>
            <div className={classes.sectionHeader}>Appointment Details</div>
            <div className={classes.consultInfo}>
              <div className={classes.accountDetails}>
                {patientDetails && (
                  <div className={classes.infoRow}>
                    <div className={classes.label}>Patient</div>
                    <div className={classes.labelContent}>
                      <div className={classes.patientName}>
                        {`${patientDetails.firstName}  ${patientDetails.lastName} | ${
                          patientDetails.gender
                        } | ${getAge(patientDetails.dateOfBirth)}yrs`}
                      </div>
                    </div>
                  </div>
                )}
                {patientDetails && (patientDetails.emailAddress || patientDetails.mobileNumber) && (
                  <div className={classes.infoRow}>
                    <div className={classes.label}>Contact</div>
                    <div className={classes.labelContent}>
                      <div className={classes.labelBlue}>{`${
                        patientDetails.emailAddress ? `${patientDetails.emailAddress} | ` : ''
                      } ${patientDetails.mobileNumber ? patientDetails.mobileNumber : ''}`}</div>
                    </div>
                  </div>
                )}
                {patientDetails && patientDetails.uhid && (
                  <div className={classes.infoRow}>
                    <div className={classes.label}>UHID</div>
                    <div className={classes.labelContent}>
                      <div className={classes.labelBlue}>{patientDetails.uhid}</div>
                    </div>
                  </div>
                )}
                {appointmentInfo && appointmentInfo.displayId && (
                  <div className={classes.infoRow}>
                    <div className={classes.label}>Appt Id</div>
                    <div className={classes.labelContent}>
                      <div className={classes.labelBlue}>{appointmentInfo.displayId}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className={classes.accountDetails}>
                {appointmentInfo && appointmentInfo.appointmentDateTime ? (
                  <div className={classes.infoRow}>
                    <div className={`${classes.label} ${classes.labelRight}`}>Consult Date</div>
                    <div className={classes.labelContent}>
                      <div className={classes.labelBlue}>
                        {sdConsultationDate && sdConsultationDate !== ''
                          ? `${moment(sdConsultationDate).format('DD/MM/YYYY')} at ${moment(
                              sdConsultationDate
                            ).format('h:mm a')}`
                          : `${moment(appointmentInfo.appointmentDateTime).format(
                              'DD/MM/YYYY'
                            )} at ${moment(appointmentInfo.appointmentDateTime).format('h:mm a')}`}
                      </div>
                    </div>
                  </div>
                ) : null}
                {consultType ? (
                  <div className={classes.infoRow}>
                    <div className={`${classes.label} ${classes.labelRight}`}>Consult Type</div>
                    <div className={classes.labelContent}>
                      <div className={classes.labelBlue}>
                        {_startCase(_toLower(consultType[0]))}
                      </div>
                    </div>
                  </div>
                ) : null}
                {/* <div className={classes.infoRow}>
                  <div className={`${classes.label} ${classes.labelRight}`}>Consult Count</div>
                  <div className={classes.labelContent}>
                    <div className={classes.labelBlue}>2</div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
          {!loader &&
          ((symptoms && symptoms.length > 0) || weight || height || bp || temperature) ? (
            <div className={classes.prescriptionSection}>
              <div className={classes.sectionHeader}>Chief Complaints</div>
              <div className={classes.chiefComplaints}>
                {symptoms.map((symptom) => (
                  <div className={classes.complaintsInfoRow}>
                    <div className={classes.complaintsLabel}>{symptom.symptom}</div>
                    <div className={classes.labelContent}>{generateSymptomsHtml(symptom)}</div>
                  </div>
                ))}
                {weight || height || bp || temperature ? (
                  <div className={classes.complaintsInfoRow}>
                    <div className={`${classes.complaintsLabel} ${classes.vitalLabel}`}>
                      VITALS <span className={classes.subInfo}>(as declared by patient)</span>
                    </div>
                    <div className={classes.labelContent}>
                      <div className={classes.labelBlue} style={{ fontWeight: 400 }}>
                        {`${weight ? `Weight : ${weight}` : ''} ${
                          height ? `| Height: ${height}` : ''
                        } ${bp ? `| BP: ${bp}` : ''}  ${
                          temperature ? `| Temperature: ${temperature}` : ''
                        }`}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          {!loader && diagnosis && diagnosis.length > 0 ? (
            <div className={classes.prescriptionSection}>
              <div className={classes.sectionHeader}>Diagnosis</div>
              <div className={classes.diagnosis}>
                {diagnosis.map((diagnos) => (
                  <div className={classes.infoRow}>
                    <div className={classes.labelContent}>{diagnos.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {!loader && medicinePrescription && medicinePrescription.length > 0 ? (
            <div className={classes.prescriptionSection}>
              <div className={classes.sectionHeader}>
                <img src={require('images/ic-medicines.svg')} /> Medication Prescribed
              </div>
              <div className={classes.medicationList}>
                <ol>{medicineHtml}</ol>
              </div>
            </div>
          ) : null}
          {!loader && diagnosticPrescription && diagnosticPrescription.length > 0 ? (
            <div className={classes.prescriptionSection}>
              <div className={classes.sectionHeader}>
                <img src={require('images/ic-microscope-solid.svg')} /> Diagnostic Tests
              </div>
              <div className={classes.medicationList}>
                <ol>
                  {diagnosticPrescription.map(
                    (prescription) =>
                      (prescription.itemname || prescription.itemName) && (
                        <li>{prescription.itemname || prescription.itemName}</li>
                      )
                  )}
                </ol>
              </div>
            </div>
          ) : null}
          {isPageContentFull() ? null : (
            <>
              {!loader &&
              ((otherInstructions && otherInstructions.length > 0) ||
                (followUp.length > 0 && followUp[0] && parseInt(followUpAfterInDays[0]) > 0) ||
                !isEmpty(referralSpecialtyName) ||
                !isEmpty(referralDescription)) ? (
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
                    {followUp.length > 0 && followUp[0] && parseInt(followUpAfterInDays[0]) > 0 ? (
                      <div className={classes.advice}>
                        <span>Follow Up</span>
                        <div className={classes.followContent}>{getFollowUpData()}</div>
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
            </>
          )}
          {isPageContentFull() ? null : (
            <>
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
            </>
          )}
        </div>
        <div className={classes.gerenalInfo}>
          {isPageContentFull() &&
          ((followUp.length > 0 && followUp[0]) ||
            (otherInstructions && otherInstructions.length > 0)) ? (
            <div className={classes.pageNumbers}>Page 1 of 2</div>
          ) : null}
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
      {isPageContentFull() &&
      ((followUp.length > 0 && followUp[0]) ||
        (otherInstructions && otherInstructions.length > 0)) ? (
        <CaseSheetLastView getFollowUpData={getFollowUpData} />
      ) : null}
    </div>
  );
};
