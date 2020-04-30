import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars';
import { AphTextField, AphButton, AphDialog, AphDialogTitle } from '@aph/web-ui-components';
import { PrescriptionCard } from 'components/Prescriptions/PrescriptionCard';
import { EPrescriptionCard } from 'components/Prescriptions/EPrescriptionCard';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { ScheduleConfirmationCall } from 'components/Prescriptions/ScheduleConfirmationCall';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      PaddingRight: 3,
      display: 'flex',
    },
    leftSection: {
      width: 328,
      backgroundColor: theme.palette.common.white,
      padding: '20px 5px',
      borderRadius: 5,
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 5,
    },
    medicineSection: {
      paddingLeft: 15,
      paddingRight: 15,
    },
    sectionGroup: {
      marginBottom: 10,
    },
    serviceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingbottom: 10,
    },
    serviceImg: {
      marginRight: 20,
      '& img': {
        maxWidth: 49,
        verticalAlign: 'middle',
      },
    },
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    serviceinfoText: {
      marginTop: 10,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: 0.04,
      opacity: 0.6,
      lineHeight: 1.67,
      color: '#02475b',
      borderTop: '0.5px solid rgba(2,71,91,0.2)',
      paddingTop: 10,
      paddingBottom: 10,
      display: 'inline-block',
      width: '100%',
    },
    marginNone: {
      marginBottom: 'none',
    },
    bottomImgGroup: {
      marginTop: 40,
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
    searchFormGroup: {
      display: 'flex',
      paddingRight: 15,
      paddingLeft: 20,
      marginBottom: 30,
    },
    pinCode: {
      width: 154,
      position: 'relative',
      '& input': {
        textAlign: 'right',
      },
    },
    pinLabel: {
      position: 'absolute',
      right: 0,
      top: -8,
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
    },
    searchMedicine: {
      width: 'calc(100% - 154px)',
      marginRight: 20,
      position: 'relative',
      opacity: 0,
    },
    uploadPrescriptionBtn: {
      position: 'absolute',
      right: 0,
      top: 0,
      paddingTop: 5,
      paddingBottom: 5,
      cursor: 'pointer',
    },
    medicineListGroup: {
      paddingRight: 15,
      paddingLeft: 20,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    count: {
      marginLeft: 'auto',
    },
    pastSearches: {
      paddingBottom: 10,
    },
    ePrescriptionSec: {
      textAlign: 'right',
      paddingBottom: 20,
    },
    addPrescriptionBtn: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 'auto',
      fontWeight: 'bold',
      color: '#fc9916',
      marginTop: 10,
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    submitPrescriptions: {
      boxShadow: '0 -5px 20px 0 #f7f8f5',
      paddingTop: 10,
      paddingLeft: 20,
      paddingRight: 15,
      textAlign: 'center',
      '& button': {
        width: 288,
        borderRadius: 10,
      },
    },
    dialogContent: {
      paddingTop: 10,
    },
    backArrow: {
      cursor: 'pointer',
      position: 'absolute',
      left: 0,
      top: -2,
      zIndex: 2,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      textAlign: 'center',
      '& button': {
        borderRadius: 10,
        width: 288,
      },
    },
    customScrollBar: {
      padding: 20,
      paddingTop: 14,
    },
    shadowHide: {
      overflow: 'hidden',
    },
  };
});

export const Prescriptions: React.FC = (props) => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isScheduleCallDialogOpen, setIsScheduleCallDialogOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.leftSection}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 237px)'}>
          <div className={classes.medicineSection}>
            <div className={classes.sectionGroup}>
              <Link className={classes.serviceType} to="/tests-medicines">
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_medicines.png')} alt="" />
                </span>
                <span className={classes.linkText}>Need to find a medicine/ alternative?</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <Link
                onClick={() => setIsUploadPreDialogOpen(true)}
                className={classes.serviceType}
                to="/prescriptions"
              >
                <span className={classes.serviceImg}>
                  <img src={require('images/ic_medicines.png')} alt="" />
                </span>
                <span className={classes.linkText}>Do you have a prescription ready?</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.sectionGroup}>
              <div className={classes.serviceinfoText}>
                Get all your medicines, certified using our 5-point system, within 2 hours.
              </div>
            </div>
            <div className={classes.sectionGroup}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter}`}
                to="/search-medicines"
              >
                <span className={classes.serviceIcon}>
                  <img src={require('images/ic_schedule.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Your Med Subscripitons</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={`${classes.sectionGroup} ${classes.marginNone}`}>
              <Link
                className={`${classes.serviceType} ${classes.textVCenter}`}
                to="/search-medicines"
              >
                <span className={classes.serviceIcon}>
                  <img src={require('images/ic_tablets.svg')} alt="" />
                </span>
                <span className={classes.linkText}>Your Orders</span>
                <span className={classes.rightArrow}>
                  <img src={require('images/ic_arrow_right.svg')} alt="" />
                </span>
              </Link>
            </div>
            <div className={classes.bottomImgGroup}>
              <img src={require('images/ic_adbanner_web.png')} alt="" />
            </div>
          </div>
        </Scrollbars>
      </div>
      <div className={classes.rightSection}>
        <div className={classes.searchFormGroup}>
          <div className={classes.searchMedicine}>
            <AphTextField placeholder="Enter name of the medicine" disabled />
            <div className={classes.uploadPrescriptionBtn}>
              <img src={require('images/ic_prescription.svg')} alt="" />
            </div>
          </div>
          <div className={classes.pinCode}>
            <label className={classes.pinLabel}>Delivery Pincode</label>
            <AphTextField placeholder="Enter Pincode" />
          </div>
        </div>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 312px)'}>
          <div className={classes.medicineListGroup}>
            <div className={classes.sectionHeader}>
              <span>Physical Prescriptions</span>
              <span className={classes.count}>02</span>
            </div>
            <div className={classes.pastSearches}>
              {/* <PrescriptionCard />
              <PrescriptionCard /> */}
            </div>
            <div className={classes.sectionHeader}>
              <span>Prescriptions From Health Records</span>
              <span className={classes.count}>01</span>
            </div>
            <div className={classes.ePrescriptionSec}>
              <EPrescriptionCard />
              <EPrescriptionCard />
              <AphButton
                onClick={() => setIsDialogOpen(true)}
                className={classes.addPrescriptionBtn}
              >
                Add More Prescriptions
              </AphButton>
            </div>
          </div>
        </Scrollbars>
        <div className={classes.submitPrescriptions}>
          <AphButton onClick={() => setIsScheduleCallDialogOpen(true)} color="primary">
            Submit Prescriptions
          </AphButton>
        </div>
      </div>
      <AphDialog open={isDialogOpen} maxWidth="md">
        <AphDialogTitle>
          <div className={classes.backArrow}>
            <img src={require('images/ic_back.svg')} alt="" />
          </div>
          Select From e-Prescriptions
        </AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <EPrescriptionCard />
                <EPrescriptionCard />
                <EPrescriptionCard />
                <EPrescriptionCard />
                <EPrescriptionCard />
                <EPrescriptionCard />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton color="primary">Upload</AphButton>
          </div>
        </div>
      </AphDialog>
      <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
        <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
        {/* <UploadPrescription /> */}
      </AphDialog>
      <AphDialog open={isScheduleCallDialogOpen} maxWidth="sm">
        <AphDialogTitle>Schedule Confirmation Call</AphDialogTitle>
        <div className={classes.shadowHide}>
          <div className={classes.dialogContent}>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
              <div className={classes.customScrollBar}>
                <ScheduleConfirmationCall />
              </div>
            </Scrollbars>
          </div>
          <div className={classes.dialogActions}>
            <AphButton color="primary">Done</AphButton>
          </div>
        </div>
      </AphDialog>
    </div>
  );
};
