import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  MenuItem,
  Popover,
  CircularProgress,
  Avatar,
  LinearProgress,
} from '@material-ui/core';
import { Header } from 'components/Header';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { GET_CASESHEET_DETAILS } from 'graphql/consult';
import {
  getCaseSheet_getCaseSheet_caseSheetDetails as CaseSheetDetailsType,
  getCaseSheet_getCaseSheet_caseSheetDetails_appointment as AppointmentType,
  getCaseSheet_getCaseSheet_patientDetails as PatientDetailsType,
  getCaseSheet_getCaseSheet_caseSheetDetails_medicinePrescription as PrescriptionType,
} from 'graphql/types/getCaseSheet';
import { useApolloClient } from 'react-apollo-hooks';
import { useParams } from 'hooks/routerHooks';
import { useQuery } from 'react-apollo-hooks';
import {
  APPOINTMENT_TYPE,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_TIMINGS,
} from 'graphql/types/globalTypes';
import moment from 'moment';
import _lowerCase from 'lodash/lowerCase';
import _upperFirst from 'lodash/upperFirst';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton } from '@aph/web-ui-components';
import { getMedicineDetailsApi } from 'helpers/MedicineApiCalls';
import { ShareWidget } from 'components/ShareWidget';

const useStyles = makeStyles((theme: Theme) => {
  return {
    prescriptionContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    prescriptionContent: {
      background: '#f7f8f5',
      padding: '0 20px 20px',
      borderRadius: '0 0 10px 10px',
    },
    pageHeader: {
      padding: '15px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('sm')]: {
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
      },
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        padding: 20,
        zIndex: 999,
        background: '#fff',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        height: 72,
      },
    },
    backArrow: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        padding: '0 20px 0 0',
      },
    },
    breadcrumbs: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      '& li': {
        '& a': {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#fca317',
          textTransform: 'uppercase',
          padding: '0 5px',
          position: 'relative',
          '&:after': {
            content: "''",
            position: 'absolute',
            top: 4,
            right: -8,
            border: '4px solid transparent',
            borderLeftColor: '#00889e',
          },
        },
        '&.active': {
          '& a': {
            color: '#007c93',
          },
        },
        '&:first-child': {
          '& a': {
            paddingLeft: 0,
          },
        },
        '&:last-child': {
          '& a:after': {
            display: 'none',
          },
        },
        [theme.breakpoints.down('xs')]: {
          display: 'none',
          '&:last-child': {
            display: 'block',
          },
        },
      },
    },
    drConsultContent: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      margin: '0 0 10px',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    consultDetails: {
      display: 'flex',
      alignItems: 'flex-end',
      padding: '16px 0 10px',
      '& h2': {
        fontSize: 20,
        fontWeight: 700,
        padding: '10px 30px 0 0 ',
        borderRight: '1px solid rgba(1,71,91,0.2)',
      },
      '& p': {
        fontSize: 14,
        color: '#0087BA',
        padding: '0 40px',
        fontWeight: 500,
        margin: '0 0 5px',
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottom: '1px solid rgba(1,71,91,0.2)',
        width: '100%',
        '& h2': {
          padding: 0,
          border: 'none',
        },
        '& p': {
          padding: 0,
        },
      },
    },
    viewConsult: {
      fontSize: 14,
      color: '#FC9916',
      fontWeight: 700,
      textTransform: 'uppercase',
      display: 'block',
      padding: '0 10px 10px',
      [theme.breakpoints.down('xs')]: {
        textAlign: 'right',
        margin: '10px 0 0',
        display: 'block',
        width: '100%',
      },
    },
    consultOptions: {
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    optionList: {
      display: 'flex',
      alignItems: 'center',
      margin: '0 0 10px',
      padding: 0,
      listStyle: 'none',
      '& li': {
        '& a': {
          padding: '0 10px',
          display: 'block',
          minWidth: 60,
          textAlign: 'center',
          '&:last-child': {
            paddingRight: 0,
          },
        },
      },
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 999,
      },
    },
    expansionContainer: {
      borderTop: '1px solid rgba(2, 71, 91, .2)',
    },
    panelRoot: {
      boxShadow: 'none',
      borderRadius: '0 !important',
      background: 'none',
      margin: '0 !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: 0,
      minHeight: '40px !important',
    },
    summaryContent: {},
    expandIcon: {
      color: '#02475b',
      margin: 0,
    },
    panelExpanded: {
      margin: 0,
    },
    panelDetails: {
      padding: 0,
      '& p': {
        fontSize: 12,
        fontWeight: 500,
      },
    },
    panelHeading: {
      margin: 0,
      fontSize: 14,
      fontWeight: 500,
    },
    detailsContent: {
      background: '#fff',
      boxShadow: ' 0px 5px 20px rgba(128, 128, 128, 0.3)',
      padding: '15px 20px',
      width: '100%',
      borderRadius: 10,
      '& p': {
        margin: '0 0 10px',
        '&:last-child': {
          margin: 0,
        },
      },
      '& a': {
        fontSize: 14,
        color: '#FC9916',
        fontWeight: 700,
        textTransform: 'uppercase',
        display: 'block',
        textAlign: 'right',
        margin: '10px 0 0',
      },
      [theme.breakpoints.down('xs')]: {
        padding: 15,
      },
    },
    adviceList: {
      margin: 0,
      padding: '0 0 0 20px',
      listStyle: 'decimal',
      '& li': {
        color: '#0087BA',
        fontSize: 14,
        padding: '5px 0',
      },
    },
    cdContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        margin: 0,
        width: '25%',
      },
      '&:first-child': {
        paddingTop: 0,
      },
      '&:last-child': {
        paddingBottom: 0,
        border: 'none',
      },

      '& a': {
        fontSize: 14,
        color: '#FC9916',
        fontWeight: 700,
        textTransform: 'uppercase',
        display: 'block',
        width: '25%',
        textAlign: 'right',
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        border: 'none',
        '& p': {
          width: '100%',
          borderBottom: '1px solid rgba(1,71,91,0.3)',
          padding: '0 0 10px',
          margin: '0 0 10px',
        },
        '& a': {
          width: '100%',
          textAlign: 'right',
          margin: '10px 0 0',
        },
      },
    },
    consultList: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: '1 0 auto',
      '& li': {
        fontSize: 14,
        fontWeight: 500,
        color: '#0087BA',
        minWidth: '20%',
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        '& li': {
          width: '100%',
          padding: ' 3px 0',
        },
      },
    },
    shareIcon: {
      display: 'flex',
      marginRight: 40,
      color: '#fcb716',
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      position: 'relative',
      '& img': {
        verticalAlign: 'middle',
        marginRight: 5,
      },
    },
    desktopHide: {
      marginLeft: 'auto',
      marginRight: 15,
      fontSize: 13,
      lineHeight: '23px',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
  };
});
export const Prescription: React.FC = (props) => {
  const classes = useStyles({});
  const apolloClient = useApolloClient();
  const params = useParams<{ appointmentId: string }>();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [showShareWidget, setShowShareWidget] = React.useState<boolean>(false);

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const { data, loading, error } = useQuery(GET_CASESHEET_DETAILS, {
    variables: {
      appointmentId: params.appointmentId,
    },
    fetchPolicy: 'no-cache',
  });

  let caseSheetDetails: CaseSheetDetailsType, juniorDoctorNotes, patientDetails: PatientDetailsType;
  if (data && data.getCaseSheet) {
    caseSheetDetails = data.getCaseSheet.caseSheetDetails;
    juniorDoctorNotes = data.getCaseSheet.juniorDoctorNotes;
    patientDetails = data.getCaseSheet.patientDetails;
  }

  const getConsultType = (consultType: string) => {
    switch (consultType) {
      case APPOINTMENT_TYPE.ONLINE:
        return 'Online';
      case APPOINTMENT_TYPE.PHYSICAL:
        return 'Physical';
      case APPOINTMENT_TYPE.BOTH:
        return 'Both';
    }
  };

  const getDoctorDetails = (appointment: AppointmentType) => {
    return appointment && appointment.doctorInfo && appointment.doctorInfo.fullName
      ? appointment.doctorInfo.fullName
      : '';
  };

  const getAppointmentDate = (appointment: AppointmentType) => {
    return appointment && appointment.appointmentDateTime
      ? moment(appointment.appointmentDateTime).format('DD MMM YYYY')
      : '';
  };

  const orderMedicines = (prescriptionDetails: PrescriptionType[]) => {
    Promise.all(
      prescriptionDetails.map(
        (prescription) => prescription.id && getMedicineDetailsApi(prescription.id)
      )
    )
      .then((res) => console.log(res))
      .catch((e) => console.log(e));
  };

  return (
    <div className={classes.prescriptionContainer}>
      <Header />
      {data && data.getCaseSheet ? (
        <div className={classes.container}>
          <div className={classes.prescriptionContent}>
            <div className={classes.pageHeader}>
              <Link to="#" className={classes.backArrow}>
                <img src={require('images/ic_back.svg')} alt="" />
              </Link>
              <ol className={classes.breadcrumbs}>
                <li>
                  <Link to={clientRoutes.appointments()}>Appointments </Link>
                </li>
                <li>
                  <Link
                    to={clientRoutes.chatRoom(
                      caseSheetDetails.appointment && caseSheetDetails.appointment.id
                        ? caseSheetDetails.appointment.id
                        : '',
                      patientDetails && patientDetails.id ? patientDetails.id : ''
                    )}
                  >
                    Consult Room{' '}
                  </Link>
                </li>
                <li>
                  <Link to="#">Prescription </Link>
                </li>
              </ol>
            </div>
            <div className={classes.drConsultContent}>
              <div className={classes.consultDetails}>
                <Typography component="h2">
                  {getDoctorDetails(caseSheetDetails.appointment)}
                </Typography>
                <Typography>
                  {getAppointmentDate(caseSheetDetails.appointment)},{' '}
                  {getConsultType(caseSheetDetails.consultType)}
                </Typography>
              </div>
              <div className={classes.consultOptions}>
                {/* <Link to="#" className={classes.viewConsult}>
                  View Consult
                </Link> */}
                {/* <div
                  className={`${classes.shareIcon} ${classes.desktopHide}`}
                  onClick={(e) => {
                    setShowShareWidget(true);
                  }}
                >
                  <span>
                    <img src={require('images/ic-share-yellow.svg')} alt="" />
                  </span>
                  <span>Share</span>
                  {showShareWidget && (
                    <ShareWidget
                      title={'Share Prescription'}
                      closeShareWidget={(e) => {
                        e.stopPropagation();
                        setShowShareWidget(false);
                      }}
                      url={caseSheetDetails.blobName || ''}
                    />
                  )}
                </div> */}
                <ul className={classes.optionList}>
                  <li>
                    <Link to="#">
                      <img src={require('images/ic_round-share.svg')} alt="Share" />
                    </Link>
                  </li>
                  {caseSheetDetails && caseSheetDetails.blobName && (
                    <li onClick={() => window.open(caseSheetDetails.blobName, '_blank')}>
                      <img src={require('images/ic_download.svg')} alt="download" />
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className={classes.expansionContainer}>
              {caseSheetDetails && (
                <>
                  <ExpansionPanel defaultExpanded className={classes.panelRoot}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      classes={{
                        root: classes.panelHeader,
                        content: classes.summaryContent,
                        expandIcon: classes.expandIcon,
                        expanded: classes.panelExpanded,
                      }}
                    >
                      <Typography className={classes.panelHeading}>Symptoms</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      <div className={classes.detailsContent}>
                        {caseSheetDetails.symptoms && caseSheetDetails.symptoms.length > 0 ? (
                          caseSheetDetails.symptoms.map((symptom) => (
                            <div className={classes.cdContainer}>
                              <Typography>{symptom.symptom}</Typography>
                              <ul className={classes.consultList}>
                                <li>Since: {symptom.since}</li>
                                <li>How Often: {symptom.howOften}</li>
                                <li>Severity: {symptom.severity}</li>
                              </ul>
                            </div>
                          ))
                        ) : (
                          <div className={classes.cdContainer}> No Symptoms </div>
                        )}
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel defaultExpanded className={classes.panelRoot}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      classes={{
                        root: classes.panelHeader,
                        content: classes.summaryContent,
                        expandIcon: classes.expandIcon,
                        expanded: classes.panelExpanded,
                      }}
                    >
                      <Typography className={classes.panelHeading}>Medicines</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      <div className={classes.detailsContent}>
                        {caseSheetDetails.medicinePrescription &&
                        caseSheetDetails.medicinePrescription.length > 0 ? (
                          <>
                            {caseSheetDetails.medicinePrescription.map((prescription) => (
                              <div className={classes.cdContainer}>
                                <Typography>{prescription.medicineName}</Typography>
                                <ul className={classes.consultList}>
                                  <li>
                                    {prescription.medicineDosage} {prescription.medicineUnit}
                                  </li>
                                  <li>
                                    {prescription.medicineTimings &&
                                    prescription.medicineTimings.length
                                      ? prescription.medicineTimings
                                          .map((timing: MEDICINE_TIMINGS | null) =>
                                            _upperFirst(_lowerCase(timing))
                                          )
                                          .join(', ') +
                                        `${
                                          prescription.medicineToBeTaken &&
                                          prescription.medicineToBeTaken.length
                                            ? ', '
                                            : ''
                                        }`
                                      : ''}
                                    {prescription.medicineToBeTaken &&
                                    prescription.medicineToBeTaken.length
                                      ? prescription.medicineToBeTaken
                                          .map((medicineTobeTaken: MEDICINE_TO_BE_TAKEN) =>
                                            _upperFirst(_lowerCase(medicineTobeTaken || ''))
                                          )
                                          .join(', ') + '.'
                                      : ''}
                                  </li>
                                  <li>{prescription.medicineConsumptionDurationInDays} days</li>
                                </ul>
                              </div>
                            ))}
                            <Link to="#">Order Medicines</Link>
                            {/* <AphButton
                              onClick={() => orderMedicines(caseSheetDetails.medicinePrescription)}
                            >
                              Order Medicines
                            </AphButton> */}
                          </>
                        ) : (
                          <div className={classes.cdContainer}>No Medicines</div>
                        )}
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel defaultExpanded className={classes.panelRoot}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      classes={{
                        root: classes.panelHeader,
                        content: classes.summaryContent,
                        expandIcon: classes.expandIcon,
                        expanded: classes.panelExpanded,
                      }}
                    >
                      <Typography className={classes.panelHeading}>Diagnosis</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      <div className={classes.detailsContent}>
                        {caseSheetDetails.diagnosis && caseSheetDetails.diagnosis.length > 0 ? (
                          <Typography>
                            {caseSheetDetails.diagnosis
                              .map((diagnosisData) => diagnosisData.name)
                              .join(', ')}
                          </Typography>
                        ) : (
                          'No diagnosis'
                        )}
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <ExpansionPanel defaultExpanded className={classes.panelRoot}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      classes={{
                        root: classes.panelHeader,
                        content: classes.summaryContent,
                        expandIcon: classes.expandIcon,
                        expanded: classes.panelExpanded,
                      }}
                    >
                      <Typography className={classes.panelHeading}>General Advice</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      <div className={classes.detailsContent}>
                        {caseSheetDetails.otherInstructions &&
                        caseSheetDetails.otherInstructions.length > 0 ? (
                          <ul className={classes.adviceList}>
                            {caseSheetDetails.otherInstructions.map((instruction) => (
                              <li>{instruction.instruction}</li>
                            ))}
                          </ul>
                        ) : (
                          'No Advice'
                        )}
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                  <ExpansionPanel defaultExpanded className={classes.panelRoot}>
                    <ExpansionPanelSummary
                      expandIcon={<ExpandMoreIcon />}
                      classes={{
                        root: classes.panelHeader,
                        content: classes.summaryContent,
                        expandIcon: classes.expandIcon,
                        expanded: classes.panelExpanded,
                      }}
                    >
                      <Typography className={classes.panelHeading}>Follow Up</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      <div className={classes.detailsContent}>
                        <div className={classes.cdContainer}>
                          {caseSheetDetails.followUp &&
                          caseSheetDetails!.doctorType !== 'JUNIOR' ? (
                            <>
                              <Typography>
                                {getConsultType(caseSheetDetails.consultType)}
                              </Typography>
                              <ul className={classes.consultList}>
                                {Number(caseSheetDetails.followUpAfterInDays || 0) <= 7 ? (
                                  <li>
                                    Recommended after {caseSheetDetails.followUpAfterInDays || 0}{' '}
                                    days
                                  </li>
                                ) : (
                                  <li>
                                    Follow up on{' '}
                                    {moment(caseSheetDetails!.followUpDate).format('DD MMM YYYY')}
                                  </li>
                                )}
                              </ul>
                              <Link to="#">Book Follow Up </Link>
                            </>
                          ) : (
                            'No Followup'
                          )}
                        </div>
                      </div>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                  {/* As of now we do not have payment information in API so commenting below code */}
                  {/* <ExpansionPanel defaultExpanded className={classes.panelRoot}>
                      <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        classes={{
                          root: classes.panelHeader,
                          content: classes.summaryContent,
                          expandIcon: classes.expandIcon,
                          expanded: classes.panelExpanded,
                        }}
                      >
                        <Typography className={classes.panelHeading}>
                          Payment &amp; Invoice
                        </Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.panelDetails}>
                        <div className={classes.detailsContent}>
                          <div className={classes.cdContainer}>
                            <Typography>Paid — Rs. 299 </Typography>
                            <ul className={classes.consultList}>
                              <li>Debit Card</li>
                              <li>5546 **** **** ***1</li>
                            </ul>
                            <Link to="#">Order Summary </Link>
                          </div>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel> */}
                </>
              )}
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className={classes.container}>
          <LinearProgress />
        </div>
      ) : (
        error && <div className={classes.container}>No data found...:(</div>
      )}
    </div>
  );
};
