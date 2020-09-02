import React from 'react';
import { Link, Route } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, LinearProgress, CircularProgress } from '@material-ui/core';
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
import { useParams } from 'hooks/routerHooks';
import { useQuery } from 'react-apollo-hooks';
import {
  APPOINTMENT_TYPE,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_TIMINGS,
  MEDICINE_UNIT,
  MEDICINE_CONSUMPTION_DURATION,
} from 'graphql/types/globalTypes';
import moment from 'moment';
import _lowerCase from 'lodash/lowerCase';
import _upperFirst from 'lodash/upperFirst';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { getMedicineDetailsApi } from 'helpers/MedicineApiCalls';
import { ShareWidget } from 'components/ShareWidget';
import { useShoppingCart, MedicineCartItem, EPrescription } from 'components/MedicinesCartProvider';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { readableParam } from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    prescriptionContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    expertBox: {
      padding: 20,
      textAlign: 'center',
      '& h2': {
        fontSize: 16,
        margin: 0,
      },
      '& button': {
        marginTop: 20,
      },
    },
    summaryDownloads: {
      margin: '0 0 0 auto',
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 10,
      },
      '& button': {
        textTransform: 'uppercase',
        color: '#fc9916',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        fontSize: 12,
        minWidth: 52,
      },
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
      marginRight: 0,
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
  const { currentPatient } = useAllCurrentPatients();
  const { addMultipleCartItems, setEPrescriptionData, ePrescriptionData } = useShoppingCart();
  const params = useParams<{ appointmentId: string }>();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [showShareWidget, setShowShareWidget] = React.useState<boolean>(false);
  const [cartItemsLoading, setCartItemsLoading] = React.useState<boolean>(false);
  const [showInstockItemsPopup, setShowInstockItemsPopup] = React.useState<boolean>(false);

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
    return appointment && appointment.doctorInfo && appointment.doctorInfo.displayName
      ? appointment.doctorInfo.displayName
      : '';
  };

  const getAppointmentDate = (appointment: AppointmentType) => {
    return appointment && appointment.appointmentDateTime
      ? moment(appointment.appointmentDateTime).format('DD MMM YYYY')
      : '';
  };

  const getDaysCount = (type: MEDICINE_CONSUMPTION_DURATION | null) => {
    return type == MEDICINE_CONSUMPTION_DURATION.MONTHS
      ? 30
      : type == MEDICINE_CONSUMPTION_DURATION.WEEKS ||
        type == MEDICINE_CONSUMPTION_DURATION.TILL_NEXT_REVIEW
      ? 7
      : 1;
  };

  const getQuantity = (
    medicineUnit: MEDICINE_UNIT | null,
    medicineTimings: (MEDICINE_TIMINGS | null)[] | null,
    medicineDosage: string | null,
    medicineCustomDosage: string | null /** E.g: (1-0-1/2-0.5), (1-0-2\3-3) etc.*/,
    medicineConsumptionDurationInDays: string | null,
    medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION | null,
    mou: number // how many tablets per strip
  ) => {
    if (medicineUnit == MEDICINE_UNIT.TABLET || medicineUnit == MEDICINE_UNIT.CAPSULE) {
      const medicineDosageMapping = medicineCustomDosage
        ? medicineCustomDosage.split('-').map((item) => {
            if (item.indexOf('/') > -1) {
              const dosage = item.split('/').map((item) => Number(item));
              return (dosage[0] || 1) / (dosage[1] || 1);
            } else if (item.indexOf('\\') > -1) {
              const dosage = item.split('\\').map((item) => Number(item));
              return (dosage[0] || 1) / (dosage[1] || 1);
            } else {
              return Number(item);
            }
          })
        : medicineDosage
        ? Array.from({ length: 4 }).map(() => Number(medicineDosage))
        : [1, 1, 1, 1];

      const medicineTimingsPerDayCount =
        (medicineTimings || []).reduce(
          (currTotal, currItem) =>
            currTotal +
            (currItem == MEDICINE_TIMINGS.MORNING
              ? medicineDosageMapping[0]
              : currItem == MEDICINE_TIMINGS.NOON
              ? medicineDosageMapping[1]
              : currItem == MEDICINE_TIMINGS.EVENING
              ? medicineDosageMapping[2]
              : currItem == MEDICINE_TIMINGS.NIGHT
              ? medicineDosageMapping[3]
              : (medicineDosage && Number(medicineDosage)) || 1),
          0
        ) || 1;

      const totalTabletsNeeded =
        medicineTimingsPerDayCount *
        Number(medicineConsumptionDurationInDays || '1') *
        getDaysCount(medicineConsumptionDurationUnit);

      return Math.ceil(totalTabletsNeeded / mou);
    } else {
      // 1 for other than tablet or capsule
      return 1;
    }
  };

  const orderMedicines = (prescriptionDetails: PrescriptionType[], history: any) => {
    const medPrescription = (prescriptionDetails || []).filter((item) => item!.id);
    setCartItemsLoading(true);
    Promise.all(
      medPrescription.map(
        (prescription) => prescription.id && getMedicineDetailsApi(prescription.id)
      )
    )
      .then((res: any) => {
        if (res && res.length > 0) {
          const medicinesAll = res.map(({ data }: any, index: number) => {
            if (data && data.productdp && data.productdp[0]) {
              const medicineDetails = data.productdp[0];
              const item = medPrescription[index]!;
              const qty = getQuantity(
                item.medicineUnit,
                item.medicineTimings,
                item.medicineDosage,
                item.medicineCustomDosage,
                item.medicineConsumptionDurationInDays,
                item.medicineConsumptionDurationUnit,
                parseInt(medicineDetails.mou || '1', 10)
              );
              const {
                url_key,
                description,
                id,
                image,
                is_in_stock,
                is_prescription_required,
                name,
                price,
                special_price,
                sku,
                small_image,
                status,
                thumbnail,
                type_id,
                mou,
                isShippable,
                MaxOrderQty,
              } = medicineDetails;
              return {
                url_key,
                description,
                id,
                image,
                is_in_stock,
                is_prescription_required,
                name,
                price,
                special_price,
                sku,
                small_image,
                status,
                thumbnail,
                type_id,
                mou,
                isShippable,
                MaxOrderQty,
                quantity: qty,
                isMedicine: (medicineDetails.type_id || '').toLowerCase() == 'pharma',
              } as MedicineCartItem;
            }
          });

          const inStockItems = medicinesAll.filter(
            (medicine: MedicineCartItem) => medicine && medicine.is_in_stock
          ).length;

          if (inStockItems && inStockItems.length) {
            addMultipleCartItems(inStockItems as MedicineCartItem[]);
            const rxMedicinesCount =
              medicinesAll.length == 0
                ? 0
                : medicinesAll.filter(
                    (medicineItem: MedicineCartItem) =>
                      medicineItem && medicineItem.is_prescription_required
                  ).length;

            const presToAdd = {
              id: caseSheetDetails.id,
              uploadedUrl: `${process.env.AZURE_PDF_BASE_URL}${caseSheetDetails.blobName}`,
              forPatient: (currentPatient && currentPatient.firstName) || '',
              date: moment(caseSheetDetails.appointment.appointmentDateTime).format('DD MMM YYYY'),
              medicines: (medicinesAll || [])
                .map((medicine: MedicineCartItem) => medicine.name)
                .join(', '),
              doctorName: caseSheetDetails.appointment.doctorInfo.displayName,
              prismPrescriptionFileId: '',
            } as EPrescription;

            if (rxMedicinesCount) {
              setEPrescriptionData &&
                setEPrescriptionData([
                  ...ePrescriptionData.filter((item) => !(item.id == presToAdd.id)),
                  presToAdd,
                ]);
            }
            history.push(clientRoutes.medicinesCart());
          } else {
            setShowInstockItemsPopup(true);
          }
        }
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setCartItemsLoading(false);
      });
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
                      caseSheetDetails && caseSheetDetails.doctorId ? caseSheetDetails.doctorId : ''
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
                  Dr. {getDoctorDetails(caseSheetDetails.appointment)}
                </Typography>
                <Typography>
                  {getAppointmentDate(caseSheetDetails.appointment)},{' '}
                  {getConsultType(caseSheetDetails.consultType)}
                </Typography>
              </div>
              <div className={classes.consultOptions}>
                <Link
                  to={clientRoutes.chatRoom(
                    caseSheetDetails.appointment && caseSheetDetails.appointment.id
                      ? caseSheetDetails.appointment.id
                      : '',
                    caseSheetDetails && caseSheetDetails.doctorId ? caseSheetDetails.doctorId : ''
                  )}
                  className={classes.viewConsult}
                >
                  View Consult
                </Link>
                {caseSheetDetails && caseSheetDetails.blobName && (
                  <>
                    {/* <div
                      className={`${classes.shareIcon} `}
                      onClick={(e) => {
                        setShowShareWidget(true);
                      }}
                    >
                      <span>
                        <img src={require('images/ic_round-share.svg')} alt="Share" />
                      </span>
                      {showShareWidget && (
                        <ShareWidget
                          title={'Share Prescription'}
                          closeShareWidget={(e) => {
                            e.stopPropagation();
                            setShowShareWidget(false);
                          }}
                          url={`${process.env.REACT_APP_CASESHEET_LINK}${
                            caseSheetDetails.blobName || ''
                          }`}
                        />
                      )}
                    </div> */}

                    <a
                      href={`${process.env.AZURE_PDF_BASE_URL}${caseSheetDetails.blobName}`}
                      target="_blank"
                    >
                      <div className={classes.shareIcon}>
                        <img src={require('images/ic_download.svg')} alt="download" />
                      </div>
                    </a>
                  </>
                )}
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
                                {prescription.medicineCustomDetails ? (
                                  <ul className={classes.consultList}>
                                    <li>{prescription.medicineCustomDetails}</li>
                                  </ul>
                                ) : (
                                  <ul className={classes.consultList}>
                                    <li>
                                      {prescription.medicineDosage}{' '}
                                      {_upperFirst(_lowerCase(prescription.medicineUnit))}
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
                                            .join(', ')
                                        : ''}
                                    </li>
                                    <li>{prescription.medicineConsumptionDurationInDays} days</li>
                                  </ul>
                                )}
                              </div>
                            ))}
                            <div className={classes.summaryDownloads}>
                              <Route
                                render={({ history }) => (
                                  <AphButton
                                    onClick={() =>
                                      orderMedicines(caseSheetDetails.medicinePrescription, history)
                                    }
                                  >
                                    {cartItemsLoading ? (
                                      <CircularProgress color="primary" size={22} />
                                    ) : (
                                      'Order Medicines'
                                    )}
                                  </AphButton>
                                )}
                              />
                            </div>
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
                              <Link
                                to={clientRoutes.doctorDetails(
                                  readableParam(caseSheetDetails.appointment.doctorInfo.fullName),
                                  caseSheetDetails.doctorId
                                )}
                              >
                                Book Follow Up{' '}
                              </Link>
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
      <AphDialog open={showInstockItemsPopup} maxWidth="sm">
        <AphDialogClose onClick={() => setShowInstockItemsPopup(false)} title={'Close'} />
        <AphDialogTitle></AphDialogTitle>
        <div className={classes.expertBox}>
          <h2>All Items are in out of stock</h2>
          <AphButton onClick={() => setShowInstockItemsPopup(false)} color="primary">
            Ok, Got It
          </AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
