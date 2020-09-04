import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  Grid,
  ExpansionPanelDetails,
  MenuItem,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useRef } from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton, AphSelect, AphTextField } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';
import { MedicalTest } from './DetailedFindings';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { useAllCurrentPatients } from 'hooks/authHooks';
import {
  MedicalTestUnit,
  AddMedicalRecordParametersInput,
  AddMedicalRecordInput,
  MedicalRecordType,
  LabResultFileProperties,
} from '../../graphql/types/globalTypes';
import { ADD_MEDICAL_RECORD } from '../../graphql/profiles';
import moment from 'moment';
import { AphCalendarPastDate } from '../AphCalendarPastDate';
import { useMutation } from 'react-apollo-hooks';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { Alerts } from 'components/Alerts/Alerts';
import { addRecordClickTracking } from '../../webEngageTracking';
import { gtmTracking } from '../../gtmTracking';
import { BottomLinks } from 'components/BottomLinks';
import { INVALID_FILE_SIZE_ERROR, toBase64 } from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    addRecordsPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f0f1ec',
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        zIndex: 999,
        height: '100%',
      },
    },
    breadcrumbs: {
      marginLeft: 62,
      marginRight: 62,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        zIndex: 2,
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        padding: '15px 20px',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    addRecordSection: {
      padding: '10px 42px 20px 42px',
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    detailsHeader: {
      [theme.breakpoints.down('xs')]: {
        flex: 1,
        textAlign: 'center',
      },
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
      marginRight: 15,
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        paddingBottom: 16,
        marginBottom: 0,
      },
    },
    count: {
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 5,
      },
    },
    backArrow: {
      zIndex: 2,
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -122,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    panelRoot: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '12px !important',
      width: '100%',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '4px 20px',
      fontSize: 13,
      fontWeight: 'bold',
      color: '#02475b',
      textTransform: 'uppercase',
    },
    panelExpanded: {
      minHeight: 'auto !important',
      '& >div:first-child': {
        marginTop: 12,
        marginBottom: 12,
      },
    },
    panelDetails: {
      padding: 20,
      paddingTop: 0,
      display: 'inline-block',
      width: '100%',
    },
    gridWidth: {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: '5px 10px !important',
      },
    },
    uploadImage: {
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      marginTop: 5,
      '& input': {
        position: 'absolute',
        left: -40,
        top: -40,
      },
      '& label': {
        backgroundColor: '#f7f8f5',
        borderRadius: 5,
        fontSize: 14,
        fontWeight: 600,
        color: '#fc9916',
        textTransform: 'uppercase',
        cursor: 'pointer',
        lineHeight: '44px',
        padding: 20,
        display: 'block',
        width: '100%',
        textAlign: 'center',
        [theme.breakpoints.down('xs')]: {
          padding: 0,
          lineHeight: 1,
          backgroundColor: '#fff',
          textAlign: 'right',
          margin: '8px 0',
        },
      },
    },
    uploadedImage: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: '20px 16px 20px 20px',
      display: 'flex',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      marginTop: 5,
      minHeight: 84,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
        minHeight: 'auto',
        backgroundColor: '#fff',
      },
    },
    docImg: {
      marginRight: 16,
      '& img': {
        verticalAlign: 'middle',
        maxWidth: 30,
      },
    },
    documentDetails: {
      display: 'flex',
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        borderBottom: '0.5px solid rgba(2,71,91,0.3)',
        paddingBottom: 10,
      },
    },
    removeBtn: {
      marginLeft: 'auto',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: 'auto',
      },
    },
    formGroup: {
      paddingTop: 5,
      paddingBottom: 10,
      '& label': {
        fontSize: 14,
        fontWeight: 500,
        color: '#02475b',
      },
      '& >div': {
        paddingTop: 0,
      },
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& ul': {
        padding: '10px 20px',
        '& li': {
          fontSize: 16,
          fontWeight: 500,
          color: '#01475b',
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    formGroupHeader: {
      paddingBottom: 15,
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    formGroupContent: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 20,
      marginBottom: 15,
    },
    formBottomActions: {
      textAlign: 'right',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        color: '#fc9916',
      },
      [theme.breakpoints.down('xs')]: {
        marginBottom: 15,
      },
    },
    observationDetails: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 24,
      marginTop: 15,
    },
    formGroupLast: {
      marginBottom: 0,
    },
    customScroll: {
      padding: 20,
      paddingTop: 10,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 20,
        paddingBottom: 5,
      },
    },
    pageBottomActions: {
      padding: 20,
      paddingTop: 10,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        paddingTop: 20,
      },
      '& button': {
        borderRadius: 10,
        minWidth: 288,
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
  };
});

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

const MedicalRecordInitialValues: AddMedicalRecordParametersInput = {
  parameterName: '',
  unit: MedicalTestUnit._PERCENT_,
  result: 0,
  minimum: 0,
  maximum: 0,
};

type RecordTypeType = {
  key: string;
  value: string;
};

const RecordType: RecordTypeType[] = [
  {
    value: _startCase(_toLower(MedicalRecordType.TEST_REPORT)).replace('_', ' '),
    key: MedicalRecordType.TEST_REPORT,
  },
  {
    value: _startCase(_toLower(MedicalRecordType.PRESCRIPTION)).replace('_', ' '),
    key: MedicalRecordType.PRESCRIPTION,
  },
];

export const AddRecords: React.FC = (props) => {
  const classes = useStyles({});
  let refFileInput: any = useRef();
  const [typeOfRecord, setTypeOfRecord] = React.useState<string>('');
  const [nameOfTest, setNameOfTest] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const [observation, setObservation] = React.useState<string>('');
  const [referringDoctor, setReferringDoctor] = React.useState<string>('');
  const [doctorIssuedPrescription, setDoctorIssuedPrescription] = React.useState<string>('');
  const [location, setLocation] = React.useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = React.useState<any | null>([]);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [showSpinner, setshowSpinner] = React.useState<boolean>(false);
  const [medicalRecordParameters, setmedicalRecordParameters] = React.useState<
    AddMedicalRecordParametersInput[]
  >([MedicalRecordInitialValues]);
  const [showReportDetails, setshowReportDetails] = React.useState<boolean>(false);
  const [dateOfTest, setdateOfTest] = React.useState<string>('');
  const [dateOfPrescription, setDateOfPrescription] = React.useState<string>('');
  const [showCalendar, setShowCalendar] = React.useState<boolean>(false);
  const [forceRender, setForceRender] = React.useState<boolean>(false);

  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const addMedicalRecordMutation = useMutation(ADD_MEDICAL_RECORD);

  const isValid = () => {
    let message = '';
    if (typeOfRecord !== '') {
      if (typeOfRecord === MedicalRecordType.TEST_REPORT) {
        if (nameOfTest === '') {
          message = 'Enter test name';
        } else if (dateOfTest === '') {
          message = 'Enter Date of Test';
        }
      } else if (typeOfRecord === MedicalRecordType.PRESCRIPTION) {
        if (doctorIssuedPrescription === '') {
          message = 'Enter doctor name';
        } else if (dateOfPrescription === '') {
          message = 'Enter Date of Prescription';
        }
      }
      const parameters = isRecordParameterFilled();
      if (parameters.length > 0) {
        const paramsWithInvalidValues = parameters.find(
          (paramObj: AddMedicalRecordParametersInput) =>
            paramObj.parameterName === '' || paramObj.minimum >= paramObj.maximum
        );
        if (paramsWithInvalidValues) {
          if (paramsWithInvalidValues.minimum >= paramsWithInvalidValues.maximum) {
            message = 'Please enter valid Maximum and Minimum';
          } else {
            message = 'Please enter valid Parameter Name';
          }
        }
      }
      if ((notes.length > 0 || observation.length > 0) && referringDoctor.length === 0) {
        message = 'Please Enter Referring doctor ';
      }
    } else {
      message = 'Select the Record Type';
    }

    return {
      message: message,
    };
  };

  const isRecordParameterFilled = () => {
    const medicalRecordsVaild = medicalRecordParameters
      .map((item) => {
        return item !== MedicalRecordInitialValues
          ? {
            ...item,
            result: parseFloat(((item && item.result) || 0).toString()),
            maximum: parseFloat(((item && item.maximum) || 0).toString()),
            minimum: parseFloat(((item && item.minimum) || 0).toString()),
          }
          : undefined;
      })
      .filter((item) => item !== undefined) as AddMedicalRecordParametersInput[];

    if (medicalRecordsVaild.length > 0) {
      return medicalRecordsVaild;
    } else {
      return [];
    }
  };

  const callAddingRecord = () => {
    let inputData: AddMedicalRecordInput = {
      additionalNotes: notes,
      documentURLs: '', //url,
      issuingDoctor: '',
      location: '',
      medicalRecordParameters: showReportDetails ? isRecordParameterFilled() : [],
      observations: observation,
      patientId: currentPatient ? currentPatient.id : '',
      recordType: typeOfRecord as MedicalRecordType,
      referringDoctor: referringDoctor,
      sourceName: '',
      testDate: '',
      testName: '',
    };
    if (uploadedDocuments && uploadedDocuments.length > 0) {
      const item = uploadedDocuments[0];
      const baseFormatSplitArry = item.baseFormat.split(`;base64,`);
      const documentFile: LabResultFileProperties = {
        fileName: item.name,
        mimeType:
          item.fileType === 'pdf' ? 'application/pdf' : `image/${item.fileType.toLowerCase()}`,
        content: baseFormatSplitArry[1],
      };
      inputData = { ...inputData, testResultFiles: documentFile };
    }
    if (typeOfRecord === MedicalRecordType.PRESCRIPTION) {
      inputData = {
        ...inputData,
        issuingDoctor: doctorIssuedPrescription,
        location: location,
        testDate:
          dateOfPrescription !== ''
            ? moment(dateOfPrescription, 'DD/MM/YYYY').format('YYYY-MM-DD')
            : '',
      };
    } else if (typeOfRecord === MedicalRecordType.TEST_REPORT) {
      inputData = {
        ...inputData,
        testName: nameOfTest,
        testDate: dateOfTest !== '' ? moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
      };
    }
    addMedicalRecordMutation({
      variables: {
        AddMedicalRecordInput: inputData,
      },
    })
      .then(({ data }) => {
        setshowSpinner(false);
        setUploadedDocuments([]);
        refFileInput.current.value = null;
        /**Gtm code start start */
        gtmTracking({
          category: 'Profile',
          action: 'Record Added',
          label: `${typeOfRecord} - Self`,
        });
        /**Gtm code start start */

        window.location.href =
          typeOfRecord === MedicalRecordType.TEST_REPORT
            ? `${clientRoutes.healthRecords()}?active=medical`
            : clientRoutes.healthRecords();
      })
      .catch((e) => {
        setshowSpinner(false);
        setIsAlertOpen(true);
        setAlertMessage('Please fill all the details');
      });
  };

  const saveRecord = () => {
    const valid = isValid();
    if (valid.message.length === 0) {
      setshowSpinner(true);
      callAddingRecord();
    } else {
      setIsAlertOpen(true);
      setAlertMessage(valid.message);
    }
  };

  const handleSaveRecord = () => {
    addRecordClickTracking('Medical Record');
    saveRecord();
  };

  const formatNumber = (value: string) => {
    if (!isNaN(parseFloat(value))) {
      let number =
        value.indexOf('.') === value.length - 1 ||
          value.indexOf('0', value.length - 1) === value.length - 1 ||
          value.indexOf('-') === value.length - 1
          ? value
          : parseFloat(value);
      return number || 0;
    }
    return '';
  };

  const setParametersData = (key: string, value: string, i: number) => {
    const dataCopy = [...medicalRecordParameters];
    dataCopy[i] = {
      ...dataCopy[i],
      [key]: key !== 'unit' && key !== 'parameterName' ? formatNumber(value) : value,
    };
    setmedicalRecordParameters(dataCopy);
  };

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
    if (isExpanded) {
      setshowReportDetails(true);
    }
  };

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.addRecordsPage}>
          <div className={classes.breadcrumbs}>
            <Link to={{ pathname: clientRoutes.healthRecords(), state: 'medical' }}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            <div className={classes.detailsHeader}>Add a Record</div>
          </div>
          <div className={classes.addRecordSection}>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMax={isSmallScreen ? 'calc(100vh - 130px)' : 'calc(100vh - 255px)'}
            >
              <div className={classes.customScroll}>
                <ExpansionPanel className={classes.panelRoot} defaultExpanded={true}>
                  <ExpansionPanelSummary
                    expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
                    classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
                  >
                    {'Documents Uploaded'}
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <Grid container spacing={2}>
                      {!isUploading && uploadedDocuments && uploadedDocuments.length > 0
                        ? uploadedDocuments.map((doc: any) => (
                          <Grid item sm={4} className={classes.gridWidth}>
                            <div className={classes.uploadedImage}>
                              <div className={classes.docImg}>
                                <img src={doc.imageUrl} alt="" />
                              </div>
                              <div className={classes.documentDetails}>
                                <span>{doc.name}</span>
                                <div className={classes.removeBtn}>
                                  <AphButton>
                                    <img
                                      src={require('images/ic_cross_onorange_small.svg')}
                                      alt=""
                                      onClick={() => {
                                        const docsWithoutSelectedDoc = uploadedDocuments.filter(
                                          (document: any) => document.name !== doc.name
                                        );
                                        setUploadedDocuments(docsWithoutSelectedDoc);
                                      }}
                                    />
                                  </AphButton>
                                </div>
                              </div>
                            </div>
                          </Grid>
                        ))
                        : null}

                      <Grid item sm={4} className={classes.gridWidth}>
                        <div className={classes.uploadImage}>
                          <input
                            disabled={showSpinner}
                            type="file"
                            ref={refFileInput}
                            onChange={async (e) => {
                              const fileNames = e.target.files;
                              if (fileNames && fileNames.length > 0) {
                                const file = fileNames[0] || null;
                                const fileExtension = file.name.split('.').pop();
                                const fileSize = file.size;
                                if (fileSize > 2000000) {
                                  setIsAlertOpen(true);
                                  setAlertMessage(INVALID_FILE_SIZE_ERROR);
                                } else if (
                                  fileExtension &&
                                  (fileExtension.toLowerCase() === 'png' ||
                                    fileExtension.toLowerCase() === 'jpg' ||
                                    fileExtension.toLowerCase() === 'jpeg')
                                ) {
                                  setIsUploading(true);
                                  if (file) {
                                    const aphBlob = await client
                                      .uploadBrowserFile({ file })
                                      .catch((error: any) => {
                                        throw error;
                                      });
                                    if (aphBlob && aphBlob.name) {
                                      const url = client.getBlobUrl(aphBlob.name);
                                      // let uploadedFiles = uploadedDocuments;
                                      toBase64(file)
                                        .then((res) => {
                                          // uploadedFiles.push({
                                          //   baseFormat: res,
                                          //   imageUrl: url,
                                          //   name: aphBlob.name,
                                          //   fileType: fileExtension.toLowerCase(),
                                          // });
                                          setUploadedDocuments([
                                            {
                                              baseFormat: res,
                                              imageUrl: url,
                                              name: aphBlob.name,
                                              fileType: fileExtension.toLowerCase(),
                                            },
                                          ]);
                                          setIsUploading(false);
                                          // setForceRender(!forceRender); // Added because after setUploadedDocuments component is not rerendering.
                                        })
                                        .catch((e: any) => {
                                          setIsUploading(false);
                                          setIsAlertOpen(true);
                                          setAlertMessage('Error while uploading the file');
                                        });
                                    }
                                  }
                                } else {
                                  setIsAlertOpen(true);
                                  setAlertMessage(
                                    'Invalid File Extension. Only files with .jpg,.jpeg or .png  extensions are allowed.'
                                  );
                                }
                                setIsUploading(false);
                              }
                            }}
                            id="icon-button-file"
                          />
                          <label htmlFor="icon-button-file">
                            {isUploading ? <CircularProgress /> : 'Add document'}
                          </label>
                        </div>
                      </Grid>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                <ExpansionPanel className={classes.panelRoot} defaultExpanded={true}>
                  <ExpansionPanelSummary
                    expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
                    classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
                  >
                    Record Details
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <Grid container spacing={2}>
                      <Grid item sm={6} className={classes.gridWidth}>
                        <div className={classes.formGroup}>
                          <label>Type Of Record</label>
                          <AphSelect
                            disabled={showSpinner}
                            value={typeOfRecord !== '' ? typeOfRecord : 'Select type of record'}
                            onChange={(e) => setTypeOfRecord(e.target.value as string)}
                            MenuProps={{
                              classes: { paper: classes.menuPopover },
                              anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'right',
                              },
                              transformOrigin: {
                                vertical: 'top',
                                horizontal: 'right',
                              },
                            }}
                          >
                            {RecordType.map((record) => (
                              <MenuItem
                                value={record.key}
                                classes={{ selected: classes.menuSelected }}
                              >
                                {record.value}
                              </MenuItem>
                            ))}
                          </AphSelect>
                        </div>
                      </Grid>
                      {typeOfRecord === MedicalRecordType.TEST_REPORT && (
                        <>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Name Of Test</label>
                              <AphTextField
                                disabled={showSpinner}
                                value={nameOfTest}
                                onChange={(e) => setNameOfTest(e.target.value)}
                                placeholder="Enter name of test"
                              />
                            </div>
                          </Grid>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Date Of Test</label>
                              <AphTextField
                                disabled={showSpinner}
                                value={dateOfTest}
                                onFocus={() => setShowCalendar(true)}
                                placeholder="dd/mm/yyyy"
                              />
                              {showCalendar && (
                                <AphCalendarPastDate
                                  getDate={(dateSelected: string) => {
                                    setdateOfTest(dateSelected);
                                    setShowCalendar(false);
                                  }}
                                  selectedDate={new Date()}
                                />
                              )}
                            </div>
                          </Grid>
                        </>
                      )}
                      {typeOfRecord === MedicalRecordType.PRESCRIPTION && (
                        <>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Doctor who issued prescription</label>
                              <AphTextField
                                disabled={showSpinner}
                                value={doctorIssuedPrescription}
                                onChange={(e) => setDoctorIssuedPrescription(e.target.value)}
                                placeholder="Enter doctor name"
                              />
                            </div>
                          </Grid>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Date Of Prescription</label>
                              <AphTextField
                                disabled={showSpinner}
                                value={dateOfPrescription}
                                onFocus={() => setShowCalendar(true)}
                                placeholder="dd/mm/yyyy"
                              />
                              {showCalendar && (
                                <AphCalendarPastDate
                                  getDate={(dateSelected: string) => {
                                    setDateOfPrescription(dateSelected);
                                    setShowCalendar(false);
                                  }}
                                  selectedDate={
                                    dateOfTest.length > 0 ? new Date(dateOfTest) : new Date()
                                  }
                                />
                              )}
                            </div>
                          </Grid>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Location (optional)</label>
                              <AphTextField
                                disabled={showSpinner}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter Location"
                              />
                            </div>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            </Scrollbars>
            <div className={classes.pageBottomActions}>
              <AphButton color="primary" onClick={handleSaveRecord}>
                {showSpinner ? <CircularProgress size={22} color="secondary" /> : 'Add Record'}
              </AphButton>
            </div>
          </div>
        </div>
      </div>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
    </div>
  );
};

// base64FileInput: baseFormatSplitArry[1],
// category:
//   typeOfRecord === 'PRESCRIPTION'
//     ? PRISM_DOCUMENT_CATEGORY.OpSummary
//     : PRISM_DOCUMENT_CATEGORY.TestReports,
// fileType: item.fileType === 'jpg' ? 'JPEG' : item.fileType.toUpperCase(),
// patientId: currentPatient && currentPatient.id,

// multiplePhysicalPrescriptionUpload(uploadedDocuments)
//   .then((data) => {
//     const uploadUrlscheck = data.map(({ data }: any) =>
//       data && data.uploadDocument && data.uploadDocument.status ? data.uploadDocument : null
//     );
//     const filtered = uploadUrlscheck.filter(function (el) {
//       return el != null;
//     });
//     if (filtered.length > 0) {
//       const inputData = {
//         patientId: currentPatient ? currentPatient.id : '',
//         testName: nameOfTest,
//         issuingDoctor: doctorIssuedPrescription,
//         location,
//         testDate:
//           dateOfTest !== ''
//             ? moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD')
//             : dateOfPrescription !== ''
//             ? moment(dateOfPrescription, 'DD/MM/YYYY').format('YYYY-MM-DD')
//             : '',
//         recordType: typeOfRecord,
//         referringDoctor: referringDoctor,
//         sourceName: '',
//         observations: observation,
//         additionalNotes: notes,
//         medicalRecordParameters: showReportDetails ? isRecordParameterFilled() : [],
//         documentURLs: filtered.map((item) => item.filePath).join(','),
//         prismFileIds: filtered.map((item) => item.fileId).join(','),
//       };
//       if (uploadUrlscheck.length > 0) {
//         addMedicalRecordMutation({
//           variables: {
//             AddMedicalRecordInput: inputData,
//           },
//         })
//           .then(({ data }) => {
//             setshowSpinner(false);
//             setUploadedDocuments([]);
//             refFileInput.current.value = null;
//             /**Gtm code start start */
//             gtmTracking({
//               category: 'Profile',
//               action: 'Record Added',
//               label: `${typeOfRecord} - Self`,
//             });
//             /**Gtm code start start */
//             window.location.href = `${clientRoutes.healthRecords()}?active=medical`;
//           })
//           .catch((e) => {
//             setshowSpinner(false);
//             setIsAlertOpen(true);
//             setAlertMessage('Please fill all the details');
//           });
//       } else {
//         setshowSpinner(false);
//         setIsAlertOpen(true);
//         setAlertMessage('An error occurred while loading the image.');
//       }
//     } else {
//       setshowSpinner(false);
//       setIsAlertOpen(true);
//       setAlertMessage('An error occurred while uploading the image.');
//     }
//   })
//   .catch((e) => {
//     setshowSpinner(false);
//     setIsAlertOpen(true);
//     setAlertMessage('An error occurred while uploading the image.');
//   });
/////////////////////////

// const uploadLabOrPrescriptionResults = (prescriptions: PickerImage[]) => {
// const item = prescriptions[0];
// const baseFormatSplitArry = item.baseFormat.split(`;base64,`);

// if (typeOfRecord === MedicRecordType.TEST_REPORT) {
//   // call upload labResults
//   return uploadLabResultMutation({
//     fetchPolicy: 'no-cache',
//     variables: {
//       labResultsInput: {
//         labTestName: nameOfTest,
//         labTestDate: moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD'),
//         labTestRefferedBy: referringDoctor,
//         observation: observation,
//         // identifier:,
//         additionalNotes: notes,
//         labTestResults: showReportDetails ? getRecordParameters() : [],
//         testResultFiles: [
//           {
//             fileName: item.name,
//             mimeType:
//               item.fileType === 'pdf'
//                 ? 'application/pdf'
//                 : `image/${item.fileType.toUpperCase()}`,
//             content: baseFormatSplitArry[1],
//           },
//         ],
//       },
//       uhid: currentPatient && currentPatient.uhid,
//     },
//   });
// } else {
//   // upload prescriptionResults
//   return uploadPrescriptionMutation({
//     fetchPolicy: 'no-cache',
//     variables: {
//       prescriptionInput: {
//         prescribedBy: doctorIssuedPrescription,
//         dateOfPrescription: moment(dateOfPrescription, 'DD/MM/YYYY').format('YYYY-MM-DD'),
//         startDate: null,
//         endDate: null,
//         prescriptionSource: prescriptionSource.SELF,
//         prescriptionFiles: [
//           {
//             fileName: item.name,
//             mimeType:
//               item.fileType === 'pdf'
//                 ? 'application/pdf'
//                 : `image/${item.fileType.toLowerCase()}`,
//             content: baseFormatSplitArry[1],
//           },
//         ],
//       },
//       uhid: currentPatient && currentPatient.uhid,
//     },
//   });
// }
// };

// const getRecordParameters = () => {
//   return isRecordParameterFilled().map(
//     (item) =>
//       item && {
//         result: item.result.toString(),
//         parameterName: item.parameterName,
//         unit: item.unit,
//         range: `${item.minimum}-${item.maximum}`,
//       }
//   );
// };
