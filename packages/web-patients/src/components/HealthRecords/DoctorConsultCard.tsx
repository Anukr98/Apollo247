import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar, Popover } from '@material-ui/core';
import { AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
import {
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheetType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_symptoms as SymptomType,
} from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import moment from 'moment';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import _lowerCase from 'lodash/lowerCase';
import { MedicalRecordType } from '../../graphql/types/globalTypes';

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
      wordBreak: 'break-word',
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
    dialogBody: {
      padding: 20,
      color: '#01475b',
      fontWeight: 500,
      fontSize: 14,
      '& span': {
        fontWeight: 'bold',
      },
    },
    dialogActions: {
      padding: 16,
      textAlign: 'center',
      display: 'flex',
      '& button': {
        flex: 1,
        '&:first-child': {
          marginRight: 10,
        },
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
        [theme.breakpoints.down('xs')]: {
          borderColor: 'transparent transparent transparent #fff',
        },
      },
    },
    moreProfileActions: {
      position: 'absolute',
      right: 10,
      cursor: 'pointer',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    cancelBtn: {
      textTransform: 'none',
      color: '#02475b',
      fontSize: 16,
      fontWeight: 500,
    },
    cancelPopover: {
      marginTop: -10,
    },
  };
});

type ConsultCardProps = {
  consult: any;
  isActiveCard: boolean;
  deleteReport: (id: string, type: string) => void;
  downloadPrescription: () => void;
};

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

export const DoctorConsultCard: React.FC<ConsultCardProps> = (props) => {
  const classes = useStyles({});
  const delteRecordRef = useRef(null);
  const { consult, isActiveCard, deleteReport } = props;
  const symptoms: SymptomType[] = [];
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showDeletePopover, setShowDeletePopover] = useState<boolean>(false);

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

  const prescriptionDownload = (caseSheetList: CaseSheetType[]) => {
    const filterCaseSheet = caseSheetList.find(
      (caseSheet: CaseSheetType | null) => caseSheet && caseSheet.doctorType !== 'JUNIOR'
    );
    if (filterCaseSheet && filterCaseSheet.blobName) {
      const a = document.createElement('a');
      a.href = client.getBlobUrl(filterCaseSheet.blobName);
      a.click();
    }
  };

  return (
    <>
      {consult ? (
        consult.patientId ? (
          <div className={`${classes.root} ${isActiveCard ? classes.activeCard : ''}`}>
            <div className={classes.doctorInfoGroup}>
              {/* {consult.source &&
                (consult.source === '247self' || _lowerCase(consult.source) === 'self') && (
                  <div
                    onClick={() => setShowDeletePopover(true)}
                    ref={delteRecordRef}
                    className={classes.moreProfileActions}
                  >
                    <img src={require('images/ic_more.svg')} alt="" />
                  </div>
                )} */}
              <div className={classes.doctorImg}>
                <Avatar
                  alt="Dr. Simran Rai"
                  src={
                    consult.doctorInfo &&
                    consult.doctorInfo.photoUrl &&
                    consult.doctorInfo.photoUrl.length > 0
                      ? consult.doctorInfo.photoUrl
                      : ''
                  }
                  className={classes.avatar}
                />
              </div>
              <div className={classes.doctorInfo}>
                <div className={classes.doctorName}>
                  {consult.doctorInfo
                    ? `Dr. ${consult.doctorInfo.firstName || ''} ${
                        consult.doctorInfo.lastName || ''
                      }`
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
                  <span onClick={() => prescriptionDownload(consult.caseSheet)}>
                    <img src={require('images/ic_prescription_blue.svg')} alt="" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : consult.prescriptionName ? (
          <div className={`${classes.root} ${isActiveCard ? classes.activeCard : ''}`}>
            <div className={classes.doctorInfoGroup}>
              {/* {consult.source &&
                (consult.source === '247self' || _lowerCase(consult.source) === 'self') && (
                  <div
                    onClick={() => setShowDeletePopover(true)}
                    ref={delteRecordRef}
                    className={classes.moreProfileActions}
                  >
                    <img src={require('images/ic_more.svg')} alt="" />
                  </div>
                )} */}
              <div className={classes.doctorImg}>
                <img src={require('images/ic_prescription_icon.svg')} alt="" />
              </div>
              <div className={classes.doctorInfo}>
                <div className={classes.doctorName}>{consult.prescriptionName}</div>
                <div className={classes.dateField}>
                  <span>{consult.date && moment(consult.date).format('MM/DD/YYYY')}</span>
                </div>
              </div>
            </div>
          </div>
        ) : consult.medicineOrderLineItems && consult.medicineOrderLineItems.length === 0 ? (
          <div className={`${classes.root} ${isActiveCard ? classes.activeCard : ''}`}>
            <div className={classes.doctorInfoGroup}>
              {/* {consult.source &&
                (consult.source === '247self' || _lowerCase(consult.source) === 'self') && (
                  <div
                    onClick={() => setShowDeletePopover(true)}
                    ref={delteRecordRef}
                    className={classes.moreProfileActions}
                  >
                    <img src={require('images/ic_more.svg')} alt="" />
                  </div>
                )} */}
              <div className={classes.doctorImg}>
                <img src={require('images/ic_prescription_icon.svg')} alt="" />
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
          </div>
        ) : consult && consult.medicineOrderLineItems ? (
          consult.medicineOrderLineItems.map((medicine: any) => (
            <div className={`${classes.root} ${isActiveCard ? classes.activeCard : ''}`}>
              <div className={classes.doctorInfoGroup}>
                {/* {consult.source &&
                  (consult.source === '247self' || _lowerCase(consult.source) === 'self') && (
                    <div
                      onClick={() => setShowDeletePopover(true)}
                      ref={delteRecordRef}
                      className={classes.moreProfileActions}
                    >
                      <img src={require('images/ic_more.svg')} alt="" />
                    </div>
                  )} */}
                <div className={classes.doctorImg}>
                  <Avatar
                    alt="Dr. Simran Rai"
                    src={
                      consult.doctorInfo &&
                      consult.doctorInfo.photoUrl &&
                      consult.doctorInfo.photoUrl.length > 0
                        ? consult.doctorInfo.photoUrl
                        : ''
                    }
                    className={classes.avatar}
                  />
                </div>
                <div className={classes.doctorInfo}>
                  <div className={classes.doctorName}>
                    <span>{medicine.medicineName}</span>
                  </div>
                  <div className={classes.dateField}>
                    <span>
                      {consult.quoteDateTime && moment(consult.quoteDateTime).format('MM/DD/YYYY')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : null
      ) : null}
      <Popover
        open={showDeletePopover}
        anchorEl={delteRecordRef.current}
        onClose={() => setShowDeletePopover(false)}
        classes={{
          paper: classes.cancelPopover,
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <AphButton onClick={() => setShowPopup(true)} className={classes.cancelBtn}>
          Delete
        </AphButton>
      </Popover>
      <AphDialog
        open={showPopup}
        disableBackdropClick
        disableEscapeKeyDown
        onClose={() => setShowPopup(false)}
        maxWidth="sm"
      >
        <AphDialogTitle>Delete Report</AphDialogTitle>
        <div className={classes.dialogBody}>
          Are you sure you want to delete the selected record?
        </div>
        <div className={classes.dialogActions}>
          <AphButton
            color="default"
            onClick={() => {
              setShowDeletePopover(false);
              setShowPopup(false);
            }}
            autoFocus
          >
            Cancel
          </AphButton>
          <AphButton
            color="primary"
            onClick={() => {
              deleteReport(consult.id, MedicalRecordType.PRESCRIPTION);
              setShowPopup(false);
              setShowDeletePopover(false);
            }}
            autoFocus
          >
            Ok
          </AphButton>
        </div>
      </AphDialog>
    </>
  );
};
