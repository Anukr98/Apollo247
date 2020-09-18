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
import React, { useRef, useState } from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton, AphSelect, AphTextField } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';
import { MedicalTest } from './DetailedFindings';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { useAllCurrentPatients } from 'hooks/authHooks';
import InputAdornment from '@material-ui/core/InputAdornment';
import {
  MedicalTestUnit,
  AddMedicalRecordParametersInput,
  AddMedicalRecordInput,
  MedicalRecordType,
  LabResultFileProperties,
  AddHealthCheckRecordInput,
  HealthCheckFileProperties,
  HospitalizationFileProperties,
  AddHospitalizationRecordInput,
} from '../../graphql/types/globalTypes';
import {
  ADD_MEDICAL_RECORD,
  ADD_HEALTHCHECK_RECORD,
  ADD_HOSPITALIZATION_RECORD,
} from '../../graphql/profiles';
import moment from 'moment';
import { AphCalendarPastDate } from '../AphCalendarPastDate';
import { useMutation } from 'react-apollo-hooks';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { Alerts } from 'components/Alerts/Alerts';
import { addRecordClickTracking } from '../../webEngageTracking';
import { gtmTracking } from '../../gtmTracking';
import { BottomLinks } from 'components/BottomLinks';
import {
  INVALID_FILE_SIZE_ERROR,
  toBase64,
  MAX_FILE_SIZE_FOR_UPLOAD,
  acceptedFilesNamesForFileUpload,
} from 'helpers/commonHelpers';
import { useParams } from 'hooks/routerHooks';

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
    adornment: {
      marginRight: 2,
      '& p': {
        color: '#02475b',
        fontSize: 15,
      },
    },
    adornmentInput: {
      '& div': {
        '&:before': {
          borderBottom: '2px solid #00b38e',
        },
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
  {
    value: _startCase(_toLower(MedicalRecordType.HEALTHCHECK)).replace('_', ' '),
    key: MedicalRecordType.HEALTHCHECK,
  },
  {
    value: 'Discharge Summary',
    key: MedicalRecordType.HOSPITALIZATION,
  },
];

const AddHealthRecords: React.FC = (props) => {
  const classes = useStyles({});
  let refFileInput: any = useRef();
  const params = useParams<{
    type: string;
  }>();
  const [typeOfRecord, setTypeOfRecord] = useState<string>(
    params.type === 'healthCheck'
      ? MedicalRecordType.HEALTHCHECK
      : params.type === 'hospitalization'
      ? MedicalRecordType.HOSPITALIZATION
      : ''
  );
  const [nameOfTest, setNameOfTest] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [observation, setObservation] = useState<string>('');
  const [referringDoctor, setReferringDoctor] = useState<string>('');
  const [doctorIssuedPrescription, setDoctorIssuedPrescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<any | null>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [medicalRecordParameters, setmedicalRecordParameters] = useState<
    AddMedicalRecordParametersInput[]
  >([MedicalRecordInitialValues]);
  const [showReportDetails, setshowReportDetails] = useState<boolean>(false);
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const [dateOfPrescription, setDateOfPrescription] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [forceRender, setForceRender] = useState<boolean>(false);
  const [healthCheckName, setHealthCheckName] = useState<string>('');
  const [dischargeDate, setDischargeDate] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const addMedicalRecordMutation = useMutation(ADD_MEDICAL_RECORD);
  const addHealthCheckRecordMutation = useMutation(ADD_HEALTHCHECK_RECORD);
  const addHospitalizationRecordMutation = useMutation(ADD_HOSPITALIZATION_RECORD);

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
      } else if (typeOfRecord === MedicalRecordType.HEALTHCHECK) {
        if (healthCheckName === '') {
          message = 'Enter Healthcheck Name';
        } else if (dateOfTest === '') {
          message = 'Enter Date of Test';
        }
      } else if (typeOfRecord === MedicalRecordType.HOSPITALIZATION) {
        if (doctorName === '') {
          message = 'Enter doctor Name';
        } else if (dischargeDate === '') {
          message = 'Enter Date of discharge';
        } else if (hospitalName === '') {
          message = 'Enter Hospital Name';
        }
      }
      if (
        typeOfRecord === MedicalRecordType.PRESCRIPTION ||
        typeOfRecord === MedicalRecordType.TEST_REPORT
      ) {
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

  const callAddingHealthCheckRecord = () => {
    let inputData: AddHealthCheckRecordInput = {
      patientId: currentPatient ? currentPatient.id : '',
      recordType: typeOfRecord as MedicalRecordType,
      healthCheckName,
      healthCheckDate: moment(dateOfTest, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    };
    if (uploadedDocuments && uploadedDocuments.length > 0) {
      const item = uploadedDocuments[0];
      const baseFormatSplitArry = item.baseFormat.split(`;base64,`);
      const documentFile: HealthCheckFileProperties = {
        fileName: item.name,
        mimeType:
          item.fileType === 'pdf' ? 'application/pdf' : `image/${item.fileType.toLowerCase()}`,
        content: baseFormatSplitArry[1],
      };
      inputData = { ...inputData, healthCheckFiles: [documentFile] };
    }
    addHealthCheckRecordMutation({
      variables: {
        AddHealthCheckRecordInput: inputData,
      },
    })
      .then(({ data }) => {
        console.log(data);
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

        window.location.href = `${clientRoutes.healthRecords()}?active=healthCheck`;
      })
      .catch((e) => {
        setshowSpinner(false);
        setIsAlertOpen(true);
        setAlertMessage('Please fill all the details');
      });
  };

  const callingAddingHospitalizationRecord = () => {
    let inputData: AddHospitalizationRecordInput = {
      patientId: currentPatient ? currentPatient.id : '',
      recordType: typeOfRecord as MedicalRecordType,
      dischargeDate: moment(dischargeDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      hospitalName,
      doctorName,
    };
    if (uploadedDocuments && uploadedDocuments.length > 0) {
      const item = uploadedDocuments[0];
      const baseFormatSplitArry = item.baseFormat.split(`;base64,`);
      const documentFile: HospitalizationFileProperties = {
        fileName: item.name,
        mimeType:
          item.fileType === 'pdf' ? 'application/pdf' : `image/${item.fileType.toLowerCase()}`,
        content: baseFormatSplitArry[1],
      };
      inputData = { ...inputData, hospitalizationFiles: [documentFile] };
    }
    addHospitalizationRecordMutation({
      variables: {
        AddHospitalizationRecordInput: inputData,
      },
    })
      .then(({ data }) => {
        console.log(data);
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

        window.location.href = `${clientRoutes.healthRecords()}?active=hospitalization`;
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
      if (
        typeOfRecord === MedicalRecordType.TEST_REPORT ||
        typeOfRecord === MedicalRecordType.PRESCRIPTION
      ) {
        callAddingRecord();
      } else if (typeOfRecord === MedicalRecordType.HEALTHCHECK) {
        callAddingHealthCheckRecord();
      } else if (typeOfRecord === MedicalRecordType.HOSPITALIZATION) {
        callingAddingHospitalizationRecord();
      }
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
                    {'Document Uploaded'}
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.panelDetails}>
                    <Grid container spacing={2}>
                      {!isUploading && uploadedDocuments && uploadedDocuments.length > 0
                        ? uploadedDocuments.map((doc: any) => (
                            <Grid item sm={4} className={classes.gridWidth}>
                              <div className={classes.uploadedImage}>
                                <div className={classes.docImg}>
                                  {doc.fileType === 'pdf' ? (
                                    <img
                                      src={require('images/pdf-file-format-symbol.svg')}
                                      width="70"
                                      height="70"
                                    />
                                  ) : (
                                    <img src={doc.imageUrl} alt="" />
                                  )}
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
                      {uploadedDocuments.length === 0 && (
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
                                  if (fileSize > MAX_FILE_SIZE_FOR_UPLOAD) {
                                    setIsAlertOpen(true);
                                    setAlertMessage(INVALID_FILE_SIZE_ERROR);
                                  } else if (
                                    fileExtension &&
                                    fileExtension &&
                                    acceptedFilesNamesForFileUpload.includes(
                                      fileExtension.toLowerCase()
                                    )
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
                                        toBase64(file)
                                          .then((res) => {
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
                      )}
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
                      {(typeOfRecord === MedicalRecordType.TEST_REPORT ||
                        typeOfRecord === MedicalRecordType.HEALTHCHECK) && (
                        <>
                          <Grid item sm={6} className={classes.gridWidth}>
                            {typeOfRecord === MedicalRecordType.TEST_REPORT && (
                              <div className={classes.formGroup}>
                                <label>Name Of Test</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={nameOfTest}
                                  onChange={(e) => setNameOfTest(e.target.value)}
                                  placeholder="Enter name of test"
                                />
                              </div>
                            )}
                            {typeOfRecord === MedicalRecordType.HEALTHCHECK && (
                              <div className={classes.formGroup}>
                                <label>Name Of Health Check</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={healthCheckName}
                                  onChange={(e) => setHealthCheckName(e.target.value)}
                                  placeholder="Enter name of health check"
                                />
                              </div>
                            )}
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
                                className={classes.adornmentInput}
                                placeholder="Enter doctor name"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment className={classes.adornment} position="start">
                                      Dr.
                                    </InputAdornment>
                                  ),
                                }}
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
                      {typeOfRecord === MedicalRecordType.HOSPITALIZATION && (
                        <>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Name Of Doctor</label>
                              <AphTextField
                                disabled={showSpinner}
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                placeholder="Enter doctor name"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment className={classes.adornment} position="start">
                                      Dr.
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </div>
                          </Grid>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Date Of Discharge</label>
                              <AphTextField
                                disabled={showSpinner}
                                value={dischargeDate}
                                onFocus={() => setShowCalendar(true)}
                                placeholder="dd/mm/yyyy"
                              />
                              {showCalendar && (
                                <AphCalendarPastDate
                                  getDate={(dateSelected: string) => {
                                    setDischargeDate(dateSelected);
                                    setShowCalendar(false);
                                  }}
                                  selectedDate={
                                    dischargeDate.length > 0 ? new Date(dischargeDate) : new Date()
                                  }
                                />
                              )}
                            </div>
                          </Grid>
                          <Grid item sm={6} className={classes.gridWidth}>
                            <div className={classes.formGroup}>
                              <label>Name Of Hospital</label>
                              <AphTextField
                                disabled={showSpinner}
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                placeholder="Enter Hospital Name"
                              />
                            </div>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                {(typeOfRecord === MedicalRecordType.TEST_REPORT ||
                  typeOfRecord === MedicalRecordType.PRESCRIPTION ||
                  typeOfRecord === '') && (
                  <ExpansionPanel
                    className={classes.panelRoot}
                    defaultExpanded={expanded === 'report'}
                    onChange={handleChange('report')}
                  >
                    <ExpansionPanelSummary
                      expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
                      classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
                    >
                      Report Details (Optional)
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      {/* click on Add Parameters button this section will be repeat */}

                      <div className={classes.formGroupHeader}>Parameters</div>
                      {medicalRecordParameters.map((record: any, idx: number) => (
                        <div className={classes.formGroupContent}>
                          <Grid container spacing={2}>
                            <Grid item sm={6} className={classes.gridWidth}>
                              <div className={classes.formGroup}>
                                <label>Name Of Parameter</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={record.parameterName}
                                  onChange={(e) => {
                                    setParametersData('parameterName', e.target.value, idx);
                                  }}
                                  placeholder="Enter name"
                                />
                              </div>
                            </Grid>
                            <Grid item sm={6} className={classes.gridWidth}>
                              <div className={classes.formGroup}>
                                <label>Result</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={record.result}
                                  onChange={(e) => setParametersData('result', e.target.value, idx)}
                                  placeholder="Enter value"
                                />
                              </div>
                            </Grid>
                            <Grid item sm={6} className={classes.gridWidth}>
                              <div className={classes.formGroup}>
                                <label>Unit</label>
                                {/* <AphTextField
                                  disabled={showSpinner}
                                  value={record.result}
                                  onChange={(e) =>
                                    setParametersData('unit', e.target.value as string, idx)
                                  }
                                  placeholder="Enter value"
                                /> */}
                                <AphSelect
                                  disabled={showSpinner}
                                  value={record.unit}
                                  onChange={(e) => {
                                    setParametersData('unit', e.target.value as string, idx);
                                  }}
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
                                  {MedicalTest.map((test: any) => (
                                    <MenuItem
                                      value={test.key}
                                      classes={{ selected: classes.menuSelected }}
                                    >
                                      {test.value}
                                    </MenuItem>
                                  ))}
                                </AphSelect>
                              </div>
                            </Grid>
                          </Grid>
                          <Grid container spacing={2}>
                            <Grid item sm={6} className={classes.gridWidth}>
                              <div className={classes.formGroup}>
                                <label>Min</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={record.minimum}
                                  onChange={(e) =>
                                    setParametersData('minimum', e.target.value, idx)
                                  }
                                  placeholder="Enter value"
                                />
                              </div>
                            </Grid>
                            <Grid item sm={6} className={classes.gridWidth}>
                              <div className={classes.formGroup}>
                                <label>Max</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={record.maximum}
                                  onChange={(e) =>
                                    setParametersData('maximum', e.target.value, idx)
                                  }
                                  placeholder="Enter value"
                                />
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      ))}
                      {/*Parameters Group end here */}
                      <div className={classes.formBottomActions}>
                        <AphButton
                          disabled={showSpinner}
                          onClick={() => {
                            const dataCopy = [...medicalRecordParameters];
                            dataCopy.push(MedicalRecordInitialValues);
                            setmedicalRecordParameters(dataCopy);
                          }}
                        >
                          Add Parameter
                        </AphButton>
                      </div>
                      <div className={classes.observationDetails}>
                        <div className={classes.formGroupHeader}>Observation Details</div>
                        <div className={`${classes.formGroupContent} ${classes.formGroupLast}`}>
                          <Grid container spacing={2}>
                            <Grid item sm={6} className={classes.gridWidth}>
                              <div className={classes.formGroup}>
                                <label>Referring Doctor</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={referringDoctor}
                                  onChange={(e) => setReferringDoctor(e.target.value)}
                                  placeholder="Enter name"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment
                                        className={classes.adornment}
                                        position="start"
                                      >
                                        Dr.
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </div>
                            </Grid>
                            <Grid item sm={6} className={classes.gridWidth}>
                              <div className={classes.formGroup}>
                                <label>Observations / Impressions</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={observation}
                                  onChange={(e) => setObservation(e.target.value)}
                                  placeholder="Enter observations"
                                />
                              </div>
                            </Grid>
                            <Grid item sm={6} className={classes.gridWidth}>
                              <div className={classes.formGroup}>
                                <label>Additional Notes</label>
                                <AphTextField
                                  disabled={showSpinner}
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Enter notes"
                                />
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                )}
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

export default AddHealthRecords;
