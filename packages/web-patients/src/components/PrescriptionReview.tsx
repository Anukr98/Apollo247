import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import { Header } from './Header';
import _isEmpty from 'lodash/isEmpty';
import { useDropzone } from 'react-dropzone';
import { useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { Alerts } from 'components/Alerts/Alerts';
import {
  AphInput,
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
} from '@aph/web-ui-components';
import { isEmailValid } from '@aph/universal/dist/aphValidators';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { useMutation } from 'react-apollo-hooks';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { UploadEPrescriptionCard } from 'components/Prescriptions/UploadEPrescriptionCard';
import { PrescriptionFormat, EPrescription } from 'components/MedicinesCartProvider';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { SAVE_PHARMACOLOGIST_CONSULT } from 'graphql/medicines';
import { savePharmacologistConsultVariables } from 'graphql/types/savePharmacologistConsult';
import {
  acceptedFilesNamesForFileUpload,
  MAX_FILE_SIZE_FOR_UPLOAD,
  INVALID_FILE_SIZE_ERROR,
  INVALID_FILE_TYPE_ERROR,
  toBase64,
} from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    prContainer: {
      position: 'relative',
    },
    prContent: {
      background: '#f7f8f5',
      padding: '16px 20px 40px',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    prescriptionThumb: {
      maxWidth: 30,
    },
    loader: {
      textAlign: 'center',
      display: 'block',
    },
    backArrow: {
      zIndex: 2,
      cursor: 'pointer',
      marginRight: 20,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        width: 48,
        height: 48,
        top: 0,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
    },
    pageHeader: {
      padding: '0 0 10px',
      borderBottom: '1px solid rgba(2, 71, 91, 0.3)',
      margin: '0 0 20px',
      '& h6': {
        margin: 0,
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: 'bold',
      },
    },
    reviewContainer: {},
    pContent: {
      position: 'relative',
    },
    consultDetails: {
      background: '#fcb716',
      borderRadius: 10,
      margin: '0 0 20px',
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.3)',
    },
    error: {
      color: '#890000',
    },
    cdContent: {
      display: 'flex',
      alignItems: 'center',
      padding: '20px 10px 0',
      overflow: 'hidden',
      position: 'relative',
      '& h4': {
        fontSize: 17,
        color: '#02475b',
        fontWeight: '600',
        textTransform: 'uppercase',
        padding: '0 0 5px 30px',
        borderBottom: '2px solid #fff',
        margin: '0',
        position: 'absolute',
        width: 290,
        top: -10,
        left: -40,
      },
      '& div': {
        position: 'relative',
        padding: '40px 0 0',
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        '& img': {
          order: 2,
        },
        '& div': {
          order: 1,
          padding: '0 0 20px',
        },
        '& h4': {
          position: 'static',
          width: 'auto',
          paddingLeft: 0,
          margin: '0 0 20px',
          textAlign: 'center',
        },
      },
    },
    whiteText: {
      color: '#ffffff !important',
    },
    prescriptionUpload: {},
    uploadContent: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
      overflow: 'hidden',
    },
    pList: {
      padding: '0 10px 0 0',
      margin: 0,
      listStyleType: 'none',
      textAlign: 'right',
      '& li': {
        fontSize: 12,
        color: '#02475b',
        padding: '0 0 10px',
        position: 'relative',
        '&:after': {
          content: "''",
          position: 'absolute',
          top: 7,
          right: -20,
          width: 10,
          height: 6,
          background: '#02475b',
        },
      },
    },
    disclaimer: {
      padding: 16,
      background: 'rgb(247, 248, 245, 0.5)',
      '& p': {
        fontSize: 12,
        color: '#02475b',
        lineHeight: '14px',
      },
    },
    validateContainer: {
      boxShadow: '0 -1px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 10,
      overflow: 'hidden',
    },
    resendBtnDisabled: {
      color: '#fc9916 !important',
      opacity: 0.4,
      background: '#fff',
      cursor: 'pointer',
      fontSize: 13,
      textTransform: 'uppercase',
      border: '1px solid #fcb716',
      textAlign: 'center',
      borderRadius: 5,
      boxShadow: 'none',
    },
    vHead: {
      padding: '15px 20px',
      background: '#f7f8f5',
      '& h4': {
        fontSize: 17,
        textTransform: 'uppercase',
        color: '#02475b',
        margin: 0,
        fontWeight: 'bold',
      },
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    vBody: {
      padding: '15px 20px',
      background: '#ffffff',
      '& >p': {
        fontSize: 12,
        textAlign: 'center',
        '& a': {
          fontWeight: 'bold',
          padding: '0 0 5px',
          borderBottom: '1px solid #02475b',
        },
      },
    },
    yellowText: {
      color: '#fcb716 !important',
    },
    steps: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      margin: '0 0 20px',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    stepDetails: {
      textAlign: 'center',
      width: '32%',
      '& img': {
        margin: '0 0 10px',
        height: 100,
      },
      '& p': {
        fontSize: 12,
        color: 'rgb(1, 71, 91,0.7)',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        margin: '0 0 20px',
      },
    },
    bold: {
      fontWeight: 'bold',
    },
    beforeUpload: {
      outline: 'none',
    },
    uploadArea: {
      textAlign: 'center',
      padding: '40px 40px 16px',
      background: '#fff',
      '& h5': {
        fontSize: 16,
        fontWeight: '600',
        margin: '0 0 14px',
      },
      '& p': {
        fontSize: 13,
      },
    },
    uploadFile: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: '10px 20px',
      background: '#fff',
      cursor: 'pointer',
      color: '#fcb716',
      fontSize: 13,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      position: 'relative',
      width: 200,
      border: '1px solid #fcb716',
      textAlign: 'center',
      borderRadius: 5,
      margin: '0 auto 10px',
      '& input': {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
      },
    },
    instructions: {
      padding: 16,
      background: '#f7f8f5',
      '& h6': {
        fontSize: 14,
        color: '#02475b',
        lineHeight: '20px',
        fontWeight: '600',
      },
      '& p': {
        fontSize: 12,
        color: '#0087ba',
        lineHeight: '20px',
      },
    },
    box: {
      background: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: '15px 20px',
      margin: '16px 0',
    },
    emailId: {
      '& input': {
        fontSize: 14,
        '&:placeholder': {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    },
    queryBox: {
      border: '1px solid #30c1a3',
      padding: '10px 20px !important',
      '& span': {
        color: 'rgba(2, 71, 91, 0.6)',
        fontSize: 12,
        fontWeight: '600',
      },
      '& input': {
        paddingTop: 6,
      },
    },
    queries: {
      border: 'none',
      '&:before': {
        border: 'none',
      },
      '&:after': {
        border: 'none',
      },
      '&:hover': {
        border: 'none',
        '&:before': {
          border: 'none !important',
        },
        '&:after': {
          border: 'none !important',
        },
      },
    },
    buttonContainer: {
      textAlign: 'right',
      padding: '30px 0 0',
      '& button': {
        width: 150,
        fontSize: 13,
      },
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    afterUpload: {
      padding: '20px 30px',
      background: '#fff',
      [theme.breakpoints.down('xs')]: {
        padding: 16,
      },
    },
    uploadHead: {
      padding: '0 0 5px',
      width: '70%',
      borderBottom: '1px solid rgb(2, 71, 91, 0.3)',
      '& h6': {
        fontSize: 14,
        fontWeight: '600',
      },
    },
    uploadList: {
      padding: 0,
      margin: '15px 0',
      listStyle: 'none',
      '& li': {
        padding: 10,
        borderRadius: 5,
        background: '#fff',
        boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.2)',
        margin: '0 0 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        '&:last-child': {
          margin: 0,
        },
      },
    },
    imageDetails: {
      display: 'flex',
      alignItems: 'center',
      '& >div': {
        margin: '0 16px',
      },
      '& h5': {
        margin: '0 0 10px 0',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    uploadProgress: {
      width: 200,
      border: '1px solid #00b38e',
      display: 'block',
      [theme.breakpoints.down('xs')]: {
        width: 140,
      },
    },
    hrList: {
      padding: 0,
      margin: '15px 0',
      listStyle: 'none',
      '& li': {
        padding: 10,
        borderRadius: 5,
        background: '#fff',
        boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.2)',
        margin: '0 0 10px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        '&:last-child': {
          margin: 0,
        },
      },
    },
    ePrescriptionTitle: {
      zIndex: 9999,
    },
    uploadMore: {
      fontSize: 13,
      color: '#fc9916',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      display: 'block',
      textAlign: 'right',
      padding: '10px 0 0',
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
    },
    recordDetails: {
      display: 'flex',
      alignItems: 'flex-start',
      '& h5': {
        fontSize: 16,
        fontWeight: 'bold',
      },
      '& p': {
        fontSize: 12,
        color: '#0087ba',
        fontWeight: '600',
      },
      '& img': {
        margin: '0 16px 0 0',
      },
    },
    details: {
      display: 'flex',
      alignItems: 'center',
      margin: '6px 0',
      borderBottom: '1px solid rgb(2, 71, 91, 0.3)',
      padding: '0 0 5px',
      '& p': {
        fontSize: 12,
        color: 'rgb(2, 71, 91, 0.6)',
        fontWeight: '600',
        padding: '0 10px',
        lineHeight: '12px',
        '&:first-child': {
          borderRight: '1px solid rgb(2, 71, 91, 0.3)',
          paddingLeft: 0,
        },
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      bottom: '0 !important',
      top: 'auto !important',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },

    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
  };
});

const pharmacologistEmail = process.env.PHARMACOLOGIST_EMAIL || '';

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);
export const PrescriptionReview: React.FC = (props: any) => {
  const defPresObject = {
    name: '',
    imageUrl: '',
    fileType: '',
    baseFormat: '',
  };
  const { isSignedIn } = useAuth();
  const { currentPatient } = useAllCurrentPatients();

  const classes = useStyles({});
  const [userEmail, setUserEmail] = useState<string>('');
  const [userQuery, setUserQuery] = useState<string>('');
  const [isPostSubmitDisable, setIsPostSubmitDisable] = useState<boolean>(true);
  const [emailValid, setEmailValid] = useState<boolean>(true);
  const [uploadPrescription, setUploadPrescription] = React.useState<boolean>(false);
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [prescriptionUploaded, setPrescriptionUploaded] = React.useState<PrescriptionFormat | null>(
    defPresObject
  );
  const [ePrescriptionUploaded, setEPrescriptionUploaded] = React.useState<
    [EPrescription] | null
  >();
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [prescriptionArr, setPrescriptionArr] = useState([]);
  const [ePrescriptionArr, setEPrescriptionArr] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    acceptedFiles.forEach(async (file: any) => {
      const reader = new FileReader();
      const fileExtension = file.name.split('.').pop();
      const fileSize = file.size;
      if (fileSize > MAX_FILE_SIZE_FOR_UPLOAD) {
        setIsAlertOpen(true);
        setAlertMessage(INVALID_FILE_SIZE_ERROR);
      } else if (
        fileExtension &&
        acceptedFilesNamesForFileUpload.includes(fileExtension.toLowerCase())
      ) {
        if (file) {
          const aphBlob = await client.uploadBrowserFile({ file }).catch((error) => {
            throw error;
          });
          if (aphBlob && aphBlob.name) {
            const url = client.getBlobUrl(aphBlob.name);
            toBase64(file).then((res: any) => {
              setPrescriptionUploaded({
                imageUrl: url,
                name: aphBlob.name,
                fileType: fileExtension.toLowerCase(),
                baseFormat: res,
              });
              return;
            });
          }
        }
      } else {
        setIsAlertOpen(true);
        setAlertMessage(INVALID_FILE_TYPE_ERROR);
      }

      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    if (prescriptionUploaded && prescriptionUploaded.imageUrl) {
      setPrescriptionArr(prescriptionArr.concat([prescriptionUploaded]));
      setUploadPrescription(true);
    }
  }, [prescriptionUploaded]);

  useEffect(() => {
    if (ePrescriptionUploaded && !_isEmpty(ePrescriptionUploaded)) {
      setEPrescriptionArr(ePrescriptionUploaded);
      setUploadPrescription(true);
    }
  }, [ePrescriptionUploaded]);

  useEffect(() => {
    if (
      isEmailValid(userEmail) &&
      ((prescriptionArr && prescriptionArr.length) || (ePrescriptionArr && ePrescriptionArr.length))
    ) {
      setIsPostSubmitDisable(false);
    } else {
      setIsPostSubmitDisable(true);
    }
  }, [userEmail, prescriptionArr, ePrescriptionArr]);

  const handleEmailValidityCheck = () => {
    if (userEmail.length && !isEmailValid(userEmail)) {
      setEmailValid(false);
    } else {
      setEmailValid(true);
    }
  };

  const deleteItem = (type: string, id: string) => {
    if (type === 'physical') {
      setPrescriptionArr(prescriptionArr.filter((e: PrescriptionFormat) => e.name !== id));
    } else {
      setEPrescriptionArr(ePrescriptionArr.filter((e: EPrescription) => e.id !== id));
    }
  };

  const submitPrescriptionMutation = useMutation(SAVE_PHARMACOLOGIST_CONSULT);

  const makeApi = (variables: savePharmacologistConsultVariables) => {
    submitPrescriptionMutation({ variables })
      .then(({ data }: any) => {
        if (data.savePharmacologistConsult && data.savePharmacologistConsult.status) {
          setIsLoading(false);
          props && props.history.push(`${clientRoutes.medicines()}?prescriptionSubmit=success`);
        }
      })
      .catch((e) => {
        setIsLoading(false);
        setAlertMessage('Something went wrong!');
        setIsAlertOpen(true);
        console.log(e);
      });
  };

  const submitPrescriptionForReview = () => {
    setIsLoading(true);
    const savePharmacologistConsultInput: savePharmacologistConsultVariables = {
      savePharmacologistConsultInput: {
        patientId: currentPatient ? currentPatient.id : '',
        prescriptionImageUrl: [
          ...prescriptionArr!.map((item) => item.imageUrl),
          ...ePrescriptionArr!.map((item) => item.uploadedUrl),
        ].join(' '),
        emailId: userEmail,
        queries: userQuery,
      },
    };
    makeApi(savePharmacologistConsultInput);
  };

  return (
    <div className={classes.prContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.prContent}>
          {/* <div className={classes.backArrow}>
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div> */}
          <div className={classes.pageHeader}>
            <h6>Check Medicine Interactions</h6>
          </div>
          <Grid container spacing={2} className={classes.reviewContainer}>
            <Grid item xs={12} sm={6}>
              <div className={classes.pContent}>
                <div className={classes.consultDetails}>
                  <div className={classes.cdContent}>
                    <img src={require('images/pharmacologist.svg')} />
                    <div>
                      <h4>
                        Consult a <span className={classes.whiteText}>Pharmacologist</span>
                      </h4>
                      <ul className={classes.pList}>
                        <li>
                          If you are taking multiple medications, it’s important to understand the
                          potential impact that it can have on your health.
                        </li>
                        <li>
                          To know if your medications react with each other or with certain foods
                        </li>
                        <li>To know how to store &amp; take your medications </li>
                      </ul>
                    </div>
                  </div>
                  <div className={classes.disclaimer}>
                    <Typography>
                      <span className={classes.bold}>Diclaimer: </span>The information contained
                      herein should be used in conjunction with the advice of an appropriately
                      qualified and licensed doctor. Please check with your doctor if you have
                      health questions or concerns.
                    </Typography>
                  </div>
                </div>
                <div className={classes.validateContainer}>
                  <div className={classes.vHead}>
                    <h4>
                      Three Easy Steps{' '}
                      <span className={classes.yellowText}>
                        to Validate Prescription and Order Medicine
                      </span>
                    </h4>
                  </div>
                  <div className={classes.vBody}>
                    <div className={classes.steps}>
                      <div className={classes.stepDetails}>
                        <img src={require('images/upload.png')} />
                        <Typography>Share all of your prescriptions with us</Typography>
                      </div>
                      <div className={classes.stepDetails}>
                        <img src={require('images/get-in-touch.png')} />
                        <Typography>
                          Our expert pharmacologist will analyze these for potential medicine and
                          food interaction risks
                        </Typography>
                      </div>
                      <div className={classes.stepDetails}>
                        <img src={require('images/call.png')} />
                        <Typography>
                          Order your medicines here if no risks identified, else consult a doctor
                          for a review of the medicines
                        </Typography>
                      </div>
                    </div>
                    {pharmacologistEmail && pharmacologistEmail.length && (
                      <Typography>
                        You can also send us the prescriptions by email on{' '}
                        <a
                          href={`mailto:${pharmacologistEmail}`}
                          target="_blank"
                          className={classes.bold}
                        >
                          {pharmacologistEmail}
                        </a>
                      </Typography>
                    )}
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={classes.prescriptionUpload}>
                <div className={classes.uploadContent}>
                  {!uploadPrescription ? (
                    <div className={classes.beforeUpload} {...getRootProps()}>
                      <input {...getInputProps()} />
                      <div className={classes.uploadArea}>
                        <img src={require('images/cloud-upload.png')} />
                        <Typography component="h5">
                          Drag &amp; Drop your prescription here
                        </Typography>
                        <Typography component="h5">or</Typography>
                        <div
                          className={classes.uploadFile}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsUploadPreDialogOpen(true);
                            // setUploadPrescription(true);
                          }}
                        >
                          Choose File
                        </div>
                        <Typography component="p">(Pdf,jpeg,jpg)</Typography>
                      </div>
                      <div className={classes.instructions}>
                        <Typography component="h6">
                          Instructions For Uploading Prescriptions
                        </Typography>
                        <Typography>
                          Upload a clear picture of your entire prescription. Doctor details and
                          date of the prescription should be clearly visible.
                        </Typography>
                      </div>
                    </div>
                  ) : (
                    <div className={classes.afterUpload}>
                      {prescriptionArr && prescriptionArr.length > 0 && (
                        <>
                          <div className={classes.uploadHead}>
                            <Typography component="h6">Physical Prescriptions</Typography>
                          </div>
                          <ul className={classes.uploadList}>
                            {prescriptionArr.map((pres: PrescriptionFormat) => {
                              return (
                                <li key={pres.imageUrl}>
                                  <div className={classes.imageDetails}>
                                    <img
                                      className={classes.prescriptionThumb}
                                      src={pres.imageUrl}
                                    />
                                    <div>
                                      <Typography component="h5">{pres.name}</Typography>
                                      <span className={classes.uploadProgress}></span>
                                    </div>
                                  </div>
                                  <a
                                    onClick={() => {
                                      deleteItem('physical', pres.name);
                                    }}
                                  >
                                    <img
                                      src={require('images/ic_cross_onorange_small.svg')}
                                      width="20"
                                    />
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                      {ePrescriptionArr && ePrescriptionArr.length > 0 && (
                        <>
                          <div className={classes.uploadHead}>
                            <Typography component="h6">
                              Prescriptions From Health Records
                            </Typography>
                          </div>
                          <ul className={classes.hrList}>
                            {ePrescriptionArr.map((pres: EPrescription) => {
                              return (
                                <li key={pres.id}>
                                  <div className={classes.recordDetails}>
                                    <img src={require('images/rx.png')} />
                                    <div>
                                      <Typography component="h5">{pres.doctorName}</Typography>
                                      <div className={classes.details}>
                                        <Typography>{pres.date}</Typography>
                                        <Typography>{pres.forPatient}</Typography>
                                      </div>
                                      <Typography>{pres.medicines}</Typography>
                                    </div>
                                  </div>
                                  <a
                                    onClick={() => {
                                      deleteItem('ePres', pres.id);
                                    }}
                                  >
                                    <img
                                      src={require('images/ic_cross_onorange_small.svg')}
                                      width="20"
                                    />
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                      <div
                        onClick={() => {
                          setIsUploadPreDialogOpen(true);
                        }}
                      >
                        <a href="javascript:void(0)" className={classes.uploadMore}>
                          Upload More Prescriptions
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className={classes.box}>
                  <AphInput
                    className={classes.emailId}
                    value={userEmail}
                    error={!emailValid}
                    onChange={(event) => setUserEmail(event.target.value)}
                    placeholder="Enter email ID here"
                    onBlur={handleEmailValidityCheck}
                  />
                  {!emailValid && <div className={classes.error}>Invalid email</div>}
                </div>
                <div className={` ${classes.box} ${classes.queryBox}`}>
                  <span>Queries (if any)</span>
                  <AphInput
                    className={classes.queries}
                    value={userQuery}
                    onChange={(event) => setUserQuery(event.target.value)}
                    placeholder="Type here..."
                  />
                </div>

                <ProtectedWithLoginPopup>
                  {({ protectWithLoginPopup }) => (
                    <div className={classes.buttonContainer}>
                      {isLoading ? (
                        <div className={classes.loader}>
                          <CircularProgress size={30} />
                        </div>
                      ) : (
                        <AphButton
                          className={isPostSubmitDisable ? classes.resendBtnDisabled : ''}
                          disabled={isPostSubmitDisable}
                          color="primary"
                          onClick={() => {
                            !isSignedIn ? protectWithLoginPopup() : submitPrescriptionForReview();
                          }}
                        >
                          Submit
                        </AphButton>
                      )}
                    </div>
                  )}
                </ProtectedWithLoginPopup>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
      <div>
        <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
          <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
          <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
          <UploadPrescription
            closeDialog={() => {
              setIsUploadPreDialogOpen(false);
            }}
            setIsEPrescriptionOpen={setIsEPrescriptionOpen}
            isNonCartFlow={false}
            isPresReview={true}
            setPrescriptionForReview={setPrescriptionUploaded}
          />
        </AphDialog>
        <AphDialog open={isEPrescriptionOpen} maxWidth="sm">
          <AphDialogClose onClick={() => setIsEPrescriptionOpen(false)} title={'Close'} />
          <AphDialogTitle className={classes.ePrescriptionTitle}>E Prescription</AphDialogTitle>
          <UploadEPrescriptionCard
            setIsEPrescriptionOpen={setIsEPrescriptionOpen}
            isNonCartFlow={false}
            isPresReview={true}
            setEPrescriptionForReview={setEPrescriptionUploaded}
            pharmaCologistPres={ePrescriptionArr}
          />
        </AphDialog>
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
