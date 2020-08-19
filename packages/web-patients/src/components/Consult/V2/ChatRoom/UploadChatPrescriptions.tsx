/* acknowledgement: file upload mechanism to Azure Blob is based on the POC done by Kabir Sarin */

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { Alerts } from 'components/Alerts/Alerts';
import { useAllCurrentPatients } from 'hooks/authHooks';
import {
  MAX_FILE_SIZE_FOR_UPLOAD,
  acceptedFilesNamesForFileUpload,
  INVALID_FILE_SIZE_ERROR,
  INVALID_FILE_TYPE_ERROR,
  toBase64,
} from 'helpers/commonHelpers';
import moment from 'moment';
import {
  MediaPrescriptionFileProperties,
  MediaPrescriptionUploadRequest,
  mediaPrescriptionSource,
  STATUS,
} from 'graphql/types/globalTypes';
import { mimeType } from 'helpers/mimeType';
import { useApolloClient } from 'react-apollo-hooks';
import { UPLOAD_MEDIA_DOCUMENT_PRISM } from 'graphql/consult';
import { downloadDocuments } from 'graphql/types/downloadDocuments';
import { DOWNLOAD_DOCUMENT } from 'graphql/profiles';
import Pubnub, { HereNowResponse } from 'pubnub';

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
  appointmentId: string;
  displayName: string;
}

export const UploadChatPrescription: React.FC<UploadPrescriptionProps> = (props) => {
  const classes = useStyles({});
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const apolloClient = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const patientId = currentPatient ? currentPatient.id : '';
  const config: Pubnub.PubnubConfig = {
    subscribeKey: process.env.SUBSCRIBE_KEY || '',
    publishKey: process.env.PUBLISH_KEY || '',
    ssl: true,
    uuid: `PATIENT_${patientId}`,
    restore: true,
    keepAlive: true,
    heartbeatInterval: 20,
    origin: 'apollo.pubnubapi.com',
  };
  const pubnub = new Pubnub(config);

  const getPrismUrls = (patientId: string, fileIds: string[]) => {
    return new Promise((res, rej) => {
      apolloClient
        .query<downloadDocuments>({
          query: DOWNLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            downloadDocumentsInput: {
              patientId: patientId,
              fileIds: fileIds,
            },
          },
        })
        .then(({ data }) => {
          res({ urls: data && data.downloadDocuments && data.downloadDocuments.downloadPaths });
        })
        .catch((err: any) => {
          console.log(err);
        });
    });
  };

  const HereNowPubnub = (message: string) => {
    if (status !== STATUS.COMPLETED) return;

    pubnub
      .hereNow({
        channels: [props.appointmentId],
        includeUUIDs: true,
      })
      .then((response: HereNowResponse) => {
        const data: any = response.channels[props.appointmentId].occupants;

        const occupancyDoctor = data.filter((obj: any) => {
          return obj.uuid === 'DOCTOR' || obj.uuid.indexOf('DOCTOR_') > -1;
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className={classes.root}>
      <div className={classes.dialogContent}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(43vh - 52px)'}>
          <div className={classes.customScrollBar}>
            <div className={classes.uploadSection}>
              <div className={classes.uploadCard}>
                {/* <input accept="image/*" id="icon-button-file" type="file" /> */}
                <input
                  type="file"
                  onChange={async (e) => {
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
                                toBase64(file).then((res: any) => {
                                  const formattedDate = moment(new Date()).format('YYYY-MM-DD');
                                  const base64Format = res.split('base64,');

                                  const prescriptionFile: MediaPrescriptionFileProperties = {
                                    fileName,
                                    mimeType: mimeType(fileName),
                                    content: base64Format[1],
                                  };
                                  const inputData: MediaPrescriptionUploadRequest = {
                                    prescribedBy: props.displayName,
                                    dateOfPrescription: formattedDate,
                                    startDate: null,
                                    endDate: null,
                                    prescriptionSource: mediaPrescriptionSource.SELF,
                                    prescriptionFiles: [prescriptionFile],
                                  };
                                  apolloClient
                                    .mutate({
                                      mutation: UPLOAD_MEDIA_DOCUMENT_PRISM,
                                      fetchPolicy: 'no-cache',
                                      variables: {
                                        MediaPrescriptionUploadRequest: inputData,
                                        uhid: currentPatient ? currentPatient.uhid : '',
                                        appointmentId: props.appointmentId,
                                      },
                                    })
                                    .then((res) => {
                                      setIsUploading(false);
                                      const recordId =
                                        res.data &&
                                        res.data.uploadMediaDocument &&
                                        res.data.uploadMediaDocument.recordId;
                                      if (recordId) {
                                        getPrismUrls(patientId, [recordId])
                                          .then((data: any) => {
                                            const text = {
                                              id: patientId,
                                              message: '^^#DocumentUpload',
                                              fileType: ((data.urls && data.urls[0]) || '').match(
                                                /\.(pdf)$/
                                              )
                                                ? 'pdf'
                                                : 'image',
                                              prismId: recordId,
                                              url: (data.urls && data.urls[0]) || '',
                                              messageDate: new Date(),
                                            };
                                            pubnub.publish(
                                              {
                                                channel: props.appointmentId,
                                                message: text,
                                                storeInHistory: true,
                                                sendByPost: true,
                                              },
                                              (status, response) => {
                                                if (status.statusCode == 200) {
                                                  HereNowPubnub('ImageUploaded');
                                                }
                                              }
                                            );
                                          })
                                          .catch((e) => {
                                            console.log(e);
                                          })
                                          .finally(() => {
                                            setIsUploading(false);
                                          });
                                      } else {
                                        alert('Upload document failed');
                                      }
                                    });
                                });
                                props.closeDialog();
                                setIsUploading(false);
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
              <div
                className={classes.uploadCard}
                onClick={(e) => {
                  props.setIsEPrescriptionOpen(true);
                  props.closeDialog();
                }}
              >
                <img src={require('images/ic_prescription.svg')} alt="" />
                <p>Select from E-Prescription</p>
              </div>
            </div>
            <div className={classes.instructions}>
              <h6>Instructions For Uploading Prescriptions</h6>
              <ol>
                <li>Take clear Picture of your entire prescription.</li>
                <li>Doctor details &amp; date of the prescription should be clearly visible.</li>
              </ol>
            </div>
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
