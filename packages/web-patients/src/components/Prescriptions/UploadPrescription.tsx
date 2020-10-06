/* acknowledgement: file upload mechanism to Azure Blob is based on the POC done by Kabir Sarin */

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { Alerts } from 'components/Alerts/Alerts';
import { uploadPhotoTracking } from '../../webEngageTracking';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useAuth } from 'hooks/authHooks';
import {
  MAX_FILE_SIZE_FOR_UPLOAD,
  acceptedFilesNamesForFileUpload,
  INVALID_FILE_SIZE_ERROR,
  INVALID_FILE_TYPE_ERROR,
  toBase64,
} from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    orderSteps: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#0087ba',
      fontSize: 14,
      fontWeight: 500,
      color: theme.palette.common.white,
      padding: 20,
    },
    stepsInfo: {
      display: 'flex',
      alignItems: 'center',
      paddingTop: 10,
    },
    steps: {
      fontSize: 10,
      fontWeight: 600,
      color: theme.palette.common.white,
      backgroundColor: 'rgba(2,71,91,0.2)',
      borderRadius: 5,
      padding: '8px 12px',
      textAlign: 'center',
      textTransform: 'uppercase',
      width: 134,
    },
    stepsArrow: {
      paddingLeft: 5,
      paddingRight: 5,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    dialogContent: {
      paddingTop: 10,
      paddingBottom: 20,
    },
    customScrollBar: {
      padding: 20,
      paddingTop: 10,
      paddingBottom: 0,
    },
    instructions: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 10,
      marginBottom: 10,
      '& h6': {
        fontSize: 14,
        fontWeight: 500,
        color: '#01475b',
        margin: 0,
        paddingBottom: 3,
      },
      '& ol': {
        padding: 0,
        margin: 0,
        paddingLeft: 15,
        '& li': {
          fontSize: 14,
          fontWeight: 500,
          color: '#0087ba',
        },
      },
    },
    bottomNotes: {
      fontSize: 12,
      color: '#02475b',
      fontWeight: 'bold',
      opacity: 0.6,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 5,
    },
    uploadSection: {
      display: 'flex',
      paddingBottom: 20,
      marginLeft: -5,
      marginRight: -5,
    },
    uploadCard: {
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      padding: 10,
      fontSize: 10,
      fontWeight: 'bold',
      color: '#fc9916',
      textAlign: 'center',
      textTransform: 'uppercase',
      marginLeft: 5,
      marginRight: 5,
      width: 'calc(50% - 10px)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      '& input': {
        position: 'absolute',
        left: -40,
        top: -40,
      },
      '& label': {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        padding: '10px 15px',
        cursor: 'pointer',
      },
      '& p': {
        marginBottom: 0,
        marginTop: 10,
      },
    },
  };
});

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

interface UploadPrescriptionProps {
  closeDialog: () => void;
  setIsEPrescriptionOpen: (isEPrescriptionOpen: boolean) => void;
  isNonCartFlow: boolean;
  isPresReview?: boolean;
  setPrescriptionForReview?: any;
}

export const UploadPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { setPrescriptionUploaded } = useShoppingCart();

  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className={classes.root}>
      {!props.isPresReview && (
        <div className={classes.orderSteps}>
          Order medicines in 2 simple steps —
          <div className={classes.stepsInfo}>
            <div className={classes.steps}>
              Upload <br />
              your prescription
            </div>
            <div className={classes.stepsArrow}>
              <img src={require('images/ic_steps_arrow.svg')} alt="" />
            </div>
            <div className={classes.steps}>Order Through our customer care</div>
          </div>
        </div>
      )}

      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(43vh - 52px)'}>
          <div className={classes.customScrollBar}>
            <div className={classes.uploadSection}>
              <div className={classes.uploadCard}>
                {/* <input accept="image/*" id="icon-button-file" type="file" /> */}
                <input
                  type="file"
                  onChange={async (e) => {
                    uploadPhotoTracking('Choose Gallery');
                    const fileNames = e.target.files;
                    if (fileNames && fileNames.length > 0) {
                      const file = fileNames[0] || null;
                      const fileExtension = file.name.split('.').pop();
                      const fileSize = file.size;
                      if (fileSize > MAX_FILE_SIZE_FOR_UPLOAD) {
                        setIsAlertOpen(true);
                        setAlertMessage(INVALID_FILE_SIZE_ERROR);
                      } else if (
                        fileExtension &&
                        fileExtension &&
                        acceptedFilesNamesForFileUpload.includes(fileExtension.toLowerCase())
                      ) {
                        setIsUploading(true);
                        if (file) {
                          await client
                            .uploadBrowserFile({ file })
                            .then((res: any) => {
                              if (res && res.name) {
                                const fileName = res.name as string;
                                const url = client.getBlobUrl(fileName);

                                if (props.isPresReview) {
                                  props.setPrescriptionForReview &&
                                    props.setPrescriptionForReview({
                                      imageUrl: url,
                                      name: fileName,
                                      fileType: fileExtension.toLowerCase(),
                                      baseFormat: res,
                                    });
                                  props.closeDialog();
                                  setIsUploading(false);
                                  return;
                                }

                                toBase64(file).then((res: any) => {
                                  setPrescriptionUploaded &&
                                    setPrescriptionUploaded({
                                      imageUrl: url,
                                      name: fileName,
                                      fileType: fileExtension.toLowerCase(),
                                      baseFormat: res,
                                    });
                                });
                                if (props.isNonCartFlow) {
                                  window.location.href = clientRoutes.medicinePrescription();
                                } else {
                                  props.closeDialog();
                                  setIsUploading(false);
                                }
                              }
                            })
                            .catch((error) => {
                              throw error;
                            });
                        }
                      } else {
                        setIsAlertOpen(true);
                        setAlertMessage(INVALID_FILE_TYPE_ERROR);
                      }

                      setIsUploading(false);
                    }
                  }}
                  id="icon-button-file"
                />

                {isUploading ? (
                  <CircularProgress />
                ) : (
                  <label htmlFor="icon-button-file">
                    <img src={require('images/ic_gallery.svg')} alt="" />
                    <p>Choose from gallery</p>
                  </label>
                )}
              </div>
              {/* <div className={classes.uploadCard}>
                <img src={require('images/ic_gallery.svg')} alt="" />
                <p>Camera</p>
              </div> */}
              <ProtectedWithLoginPopup>
                {({ protectWithLoginPopup }) => (
                  <div
                    className={classes.uploadCard}
                    onClick={(e) => {
                      !isSignedIn ? protectWithLoginPopup() : props.setIsEPrescriptionOpen(true);
                      props.closeDialog();
                    }}
                  >
                    <img src={require('images/ic_prescription.svg')} alt="" />
                    <p>Select from E-Prescription</p>
                  </div>
                )}
              </ProtectedWithLoginPopup>
            </div>
            <div className={classes.instructions}>
              <h6>Instructions For Uploading Prescriptions</h6>
              <ol>
                <li>Take clear Picture of your entire prescription.</li>
                <li>Doctor details &amp; date of the prescription should be clearly visible.</li>
                {!props.isPresReview && <li>Medicines will be dispensed as per prescription</li>}
              </ol>
            </div>
            {!props.isPresReview && (
              <div className={classes.bottomNotes}>
                * Our pharmacist will dispense medicines only if the prescription is valid &amp; it
                meets all government regulations.
              </div>
            )}
          </div>
        </Scrollbars>
      </div>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
