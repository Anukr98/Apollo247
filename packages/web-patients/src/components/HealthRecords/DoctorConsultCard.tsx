import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import {
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheetType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_symptoms as SymptomType,
} from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#f7f8f5',
      borderRadius: 10,
      padding: 10,
      border: '1px solid #f7f8f5',
      marginBottom: 28,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    doctorInfoGroup: {
      display: 'flex',
    },
    doctorImg: {
      '& img': {
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      paddingLeft: 16,
      width: 'calc(100% - 40px)',
    },
    avatar: {
      width: 40,
      height: 40,
    },
    doctorName: {
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
    },
    dateField: {
      display: 'flex',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      letterSpacing: 0.04,
      color: '#02475b',
      '& span:first-child': {
        opacity: 0.6,
      },
      '& span:last-child': {
        marginLeft: 'auto',
        '& img': {
          verticalAlign: 'middle',
          maxWidth: 20,
        },
      },
    },
    doctorService: {
      display: 'flex',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      letterSpacing: 0.04,
      color: '#02475b',
      '& span:first-child': {
        opacity: 0.6,
      },
      '& span:last-child': {
        marginLeft: 'auto',
        '& img': {
          verticalAlign: 'middle',
          maxWidth: 20,
        },
      },
    },
    bottomActions: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 15,
      marginTop: -1,
      display: 'flex',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        color: '#fc9916',
        fontSize: 12,
      },
      '& button:last-child': {
        marginLeft: 'auto',
      },
    },
    activeCard: {
      border: '1px solid #00b38e',
      position: 'relative',
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: '100%',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        top: '50%',
        borderColor: 'transparent transparent transparent #00b38e',
        borderWidth: 9,
        marginTop: -9,
      },
      '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        left: '100%',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        top: '50%',
        borderColor: 'transparent transparent transparent #f7f8f5',
        borderWidth: 8,
        marginTop: -8,
      },
    },
  };
});

type ConsultCardProps = {
  consult: any;
};

export const DoctorConsultCard: React.FC<ConsultCardProps> = (props) => {
  const classes = useStyles({});
  const { consult } = props;
  const symptoms: SymptomType[] = [];

  consult.caseSheet &&
    consult.caseSheet.forEach(
      (caseSheet: CaseSheetType | null) =>
        caseSheet &&
        caseSheet.doctorType !== 'JUNIOR' &&
        caseSheet.symptoms &&
        caseSheet.symptoms.length > 0 &&
        caseSheet.symptoms.forEach(
          (symptom: SymptomType | null) => symptom && symptoms.push(symptom)
        )
    );

  return (
    <div className={`${classes.root}`}>
      {consult && consult.patientId ? (
        <>
          <div className={classes.doctorInfoGroup}>
            <div className={classes.doctorImg}>
              <Avatar
                alt="Dr. Simran Rai"
                src={require('images/doctordp_01.png')}
                className={classes.avatar}
              />
            </div>
            <div className={classes.doctorInfo}>
              <div className={classes.doctorName}>
                {consult.doctorInfo
                  ? `Dr. ${consult.doctorInfo.firstName || ''} ${consult.doctorInfo.lastName || ''}`
                  : ''}
              </div>
              <div className={classes.doctorService}>
                {consult.isFollowUp ? (
                  <span>Follow-up to {consult.followUpTo}</span>
                ) : (
                  <span>New Consult</span>
                )}
                <span>
                  <img src={require('images/ic_onlineconsult.svg')} alt="" />
                </span>
              </div>
              <div className={classes.doctorService}>
                {
                  <span>
                    {symptoms && symptoms.length > 0
                      ? symptoms.map((symptom: SymptomType, idx: number) => {
                          if (idx !== 0) {
                            return `, ${symptom.symptom} `;
                          }
                          return symptom.symptom;
                        })
                      : 'No Symptoms'}
                  </span>
                }
                <span>
                  <img src={require('images/ic_prescription_blue.svg')} alt="" />
                </span>
              </div>
            </div>
          </div>
          {/* <div className={classes.bottomActions}> */}
          {/* <AphButton>Book Follow-up</AphButton>
            <AphButton>Order Meds & Tests</AphButton> */}
          {/* </div> */}
        </>
      ) : consult.medicineOrderLineItems && consult.medicineOrderLineItems.length === 0 ? (
        <div className={classes.doctorInfoGroup}>
          <div className={classes.doctorImg}>
            <Avatar
              alt="Dr. Simran Rai"
              src={require('images/doctordp_01.png')}
              className={classes.avatar}
            />
          </div>
          <div className={classes.doctorInfo}>
            <div className={classes.doctorName}>Prescription uploaded by Patient</div>
            <div className={classes.dateField}>
              <span>
                {consult.quoteDateTime && moment(consult.quoteDateTime).format('MM/DD/YYYY')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.doctorInfoGroup}>
          <div className={classes.doctorImg}>
            <Avatar
              alt="Dr. Simran Rai"
              src={require('images/doctordp_01.png')}
              className={classes.avatar}
            />
          </div>
          <div className={classes.doctorInfo}>
            <div className={classes.doctorName}>
              {consult.medicineOrderLineItems.map((medicine: any) => (
                <span>{medicine.medicineName}</span>
              ))}
            </div>
            <div className={classes.dateField}>
              <span>
                {consult.quoteDateTime && moment(consult.quoteDateTime).format('MM/DD/YYYY')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
