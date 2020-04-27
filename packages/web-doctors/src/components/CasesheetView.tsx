import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useContext, useState } from 'react';
import { CaseSheetContext } from 'context/CaseSheetContext';
import { CaseSheetLastView } from './CasesheetLastView';
import moment from 'moment';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { isEmpty, trim } from 'lodash';

import {
  GetCaseSheet_getCaseSheet_caseSheetDetails_symptoms,
  GetCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription,
} from 'graphql/types/GetCaseSheet';

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
    loader: {
      left: '50%',
      top: 60,
      position: 'relative',
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
    signInformation: {
      marginRight: 'auto',
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
      color: '#02475b',
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
      fontSize: 12,
      padding: 12,
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
      color: '#02475b',
    },
  };
});
interface savingProps {
  saving: boolean;
}
export const CasesheetView: React.FC<savingProps> = (props) => {
  const classes = useStyles();
  const {
    patientDetails,
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
  } = useContext(CaseSheetContext);

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
              {`${prescription!.medicineFormTypes! === 'OTHERS' ? 'Take' : 'Apply'} ${dosageHtml}${
                timesString.length > 0 &&
                prescription!.medicineCustomDosage! &&
                prescription!.medicineCustomDosage! !== ''
                  ? ' (' + timesString + ') '
                  : ' '
              }${
                prescription!.medicineFrequency
                  ? prescription!.medicineFrequency
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
                prescription!.medicineCustomDosage! === ''
                  ? timesString
                  : ''
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
          <div className={classes.sectionHeader}>Appointment Details</div>
          <div className={classes.accountDetails}>
            <div className={classes.infoRow}>
              <div className={classes.label}>Patient</div>
              <div className={classes.labelContent}>
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
                <div className={classes.labelContent}>
                  <div className={classes.labelBlue}>
                    {`${weight ? `Weight : ${weight}` : ''} ${
                      height ? `| Height: ${height}` : ''
                    } ${bp ? `| BP: ${bp}` : ''}  ${
                      temperature ? `| Temperature: ${temperature}` : ''
                    }`}
                  </div>
                </div>
              </div>
            ) : null}
            {patientDetails && patientDetails.uhid ? (
              <div className={classes.infoRow}>
                <div className={classes.label}>UHID</div>
                <div className={classes.labelContent}>
                  <div className={classes.labelBlue}>{patientDetails.uhid}</div>
                </div>
              </div>
            ) : null}
            {appointmentInfo && appointmentInfo.displayId ? (
              <div className={classes.infoRow}>
                <div className={classes.label}>Appt Id</div>
                <div className={classes.labelContent}>
                  <div className={classes.labelBlue}>{appointmentInfo.displayId}</div>
                </div>
              </div>
            ) : null}
            {appointmentInfo && appointmentInfo.appointmentDateTime ? (
              <div className={classes.infoRow}>
                <div className={classes.label}>Consult Date</div>
                <div className={classes.labelContent}>
                  <div className={classes.labelBlue}>
                    {moment(appointmentInfo.appointmentDateTime).format('DD/MM/YYYY')}
                  </div>
                </div>
              </div>
            ) : null}
            {consultType ? (
              <div className={classes.infoRow}>
                <div className={classes.label}>Consult Type</div>
                <div className={classes.labelContent}>
                  <div className={classes.labelBlue}>{_startCase(_toLower(consultType[0]))}</div>
                </div>
              </div>
            ) : null}
          </div>
          {!loader && symptoms && symptoms.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Chief Complaints</div>
              <div className={classes.chiefComplaints}>
                {symptoms.map((symptom) => (
                  <div className={classes.complaintsInfoRow}>
                    <div className={classes.complaintsLabel}>{symptom.symptom}</div>
                    <div className={classes.labelContent}>{generateSymptomsHtml(symptom)}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {!loader && diagnosis && diagnosis.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Diagnosis</div>
              <div className={classes.diagnosis}>
                {diagnosis.map((diagnos) => (
                  <div className={classes.infoRow}>
                    <div className={classes.labelContent}>{diagnos.name}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {!loader && medicinePrescription && medicinePrescription.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Medication Prescribed</div>
              <div className={classes.medicationList}>
                <ol>{medicineHtml}</ol>
              </div>
            </>
          ) : null}
          {!loader && diagnosticPrescription && diagnosticPrescription.length > 0 ? (
            <>
              <div className={classes.sectionHeader}>Diagnostic Tests</div>
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
            </>
          ) : null}
          {isPageContentFull() ? null : (
            <>
              {!loader && otherInstructions && otherInstructions.length > 0 ? (
                <>
                  <div className={classes.sectionHeader}>Advice Given</div>
                  <div className={classes.advice}>
                    {otherInstructions.map((instruction, index) => (
                      <span>
                        {`${instruction.instruction}`}
                        {index < otherInstructions.length - 1 && ','}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
              {followUp.length > 0 && followUp[0] && parseInt(followUpAfterInDays[0]) > 0 ? (
                <>
                  <div className={classes.sectionHeader}>Follow Up</div>
                  <div className={classes.followUpContent}>{getFollowUpData()}</div>
                </>
              ) : null}
            </>
          )}
          {isPageContentFull() ? null : (
            <>
              {createdDoctorProfile && createdDoctorProfile.signature && (
                <>
                  <div className={classes.sectionHeader}>Prescribed by</div>
                  <div className={classes.followUpContent}>
                    <img src={createdDoctorProfile.signature} />
                  </div>
                  <div className={classes.signInformation}>
                    <h3 className={classes.followUpContent}>
                      {`${createdDoctorProfile.salutation}. ${createdDoctorProfile.firstName} ${createdDoctorProfile.lastName}`}
                      <br />
                      <span>{`${
                        createdDoctorProfile.specialty.specialistSingularTerm
                      } | MCI Reg. No. ${createdDoctorProfile.registrationNumber || ''}`}</span>
                    </h3>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        {isPageContentFull() &&
        ((followUp.length > 0 && followUp[0]) ||
          (otherInstructions && otherInstructions.length > 0)) ? (
          <div className={classes.pageNumbers}>Page 1 of 2</div>
        ) : null}
        <div className={classes.disclaimer}>
          Disclaimer: The prescription has been issued based on your inputs during chat/call with
          the doctor. In case of emergency please visit a nearby hospital. This is an electronically
          generated prescription and will not require a doctor signature.
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
