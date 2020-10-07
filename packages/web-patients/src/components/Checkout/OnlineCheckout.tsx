import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { Link } from 'react-router-dom';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { useApolloClient } from 'react-apollo-hooks';
import { clientRoutes } from 'helpers/clientRoutes';
import LinearProgress from '@material-ui/core/LinearProgress';
import moment from 'moment';
import { useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { BottomLinks } from 'components/BottomLinks';
import { CouponCodeConsult } from 'components/Coupon/CouponCodeConsult';
import { AppointmentType } from 'graphql/types/globalTypes';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/doctors';
import { ValidateConsultCoupon_validateConsultCoupon } from 'graphql/types/ValidateConsultCoupon';
import { Route } from 'react-router-dom';
import { consultPayButtonClickTracking } from 'webEngageTracking';
import { getCouponByUserMobileNumber } from 'helpers/commonHelpers';
import fetchUtil from 'helpers/fetch';
import { gtmTracking, dataLayerTracking } from '../../gtmTracking';
import { useLocationDetails } from 'components/LocationProvider';
import { GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';

const useStyles = makeStyles((theme: Theme) => {
  return {
    pageTopHeader: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    loader: {
      top: -88,
      zIndex: 999,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      marginTop: -16,
      [theme.breakpoints.up('sm')]: {
        marginTop: 0,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
      },
    },
    pageHeader: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: theme.palette.secondary.dark,
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        padding: '16px 20px',
        position: 'fixed',
        top: 0,
        width: '100%',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
      zIndex: 2,
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
    pageContent: {
      paddingBottom: 25,
      [theme.breakpoints.up('sm')]: {
        padding: 20,
        display: 'flex',
      },
    },
    leftGroup: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.up('sm')]: {
        backgroundColor: '#fff',
        width: 328,
        borderRadius: 10,
        boxShadow: 'none',
      },
    },
    rightGroup: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        width: 'calc(100% - 328px)',
        padding: '0 20px 0 40px',
      },
    },
    doctorProfile: {
      [theme.breakpoints.up('sm')]: {
        borderRadius: 10,
        overflow: 'hidden',
      },
    },
    doctorImg: {
      textAlign: 'center',
      '& img': {
        maxWidth: '100%',
        maxHeight: 138,
        verticalAlign: 'middle',
      },
    },
    doctorInfo: {
      padding: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 0,
      },
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    doctorType: {
      fontSize: 12,
      color: '#0087ba',
      textTransform: 'uppercase',
      paddingTop: 5,
      fontWeight: 600,
      display: 'flex',
      '& span': {
        '& span': {
          textTransform: 'none',
        },
      },
    },
    moreBtn: {
      cursor: 'pointer',
      color: '#fc9916',
      textTransform: 'uppercase',
      marginLeft: 'auto',
      fontWeight: 500,
    },
    appointmentDetails: {
      [theme.breakpoints.up('sm')]: {
        marginTop: 30,
        borderRadius: 5,
        backgroundColor: '#f7f8f5',
        padding: 10,
      },
    },
    blockHeader: {
      fontSize: 12,
      color: '#02475b',
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    consultServices: {
      paddingTop: 16,
    },
    serviceType: {
      display: 'flex',
      paddingBottom: 16,
      fontSize: 13,
      color: '#02475b',
      fontWeight: 500,
      lineHeight: '18px',
      alignItems: 'center',
    },
    textTopAlign: {
      alignItems: 'start',
    },
    serviceIcon: {
      width: 25,
      marginRight: 20,
      textAlign: 'center',
      '& img': {
        verticalAlign: 'middle',
      },
    },
    sectionHeader: {
      fontSize: 14,
      color: '#02475b',
      paddingBottom: 10,
      fontWeight: 500,
      marginBottom: 16,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      textTransform: 'uppercase',
    },
    priceSection: {
      padding: '8px 16px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 10,
    },
    priceRow: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 8,
      paddingTop: 8,
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    price: {
      marginLeft: 'auto',
    },
    totalPrice: {
      fontWeight: 'bold',
    },
    bottomActions: {
      textAlign: 'center',
      paddingTop: 30,
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        bottom: 0,
        backgroundColor: '#fff',
        padding: 20,
        left: 0,
        right: 0,
        zIndex: 991,
      },
      '& button': {
        borderRadius: 10,
        minWidth: '100%',
        [theme.breakpoints.up('sm')]: {
          minWidth: 320,
        },
      },
    },
    footerLinks: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    sectionGroup: {
      marginBottom: 10,
    },
    serviceTypeCoupon: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 10,
      padding: '16px 10px 16px 16px',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      marginBottom: 16,
    },
    couponTopGroup: {
      display: 'flex',
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 44,
      paddingbottom: 10,
    },
    serviceImg: {
      marginRight: 20,
      '& img': {
        maxWidth: 49,
        verticalAlign: 'middle',
      },
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    couponRight: {
      width: 'calc(100% - 34px)',
    },
    applyCoupon: {
      display: 'flex',
      alignItems: 'center',
    },
    appliedCoupon: {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 600,
      '& $linkText': {
        '& span': {
          color: '#00b38e',
          textTransform: 'uppercase',
        },
      },
    },
    couponText: {
      color: '#01475b',
      fontSize: 12,
      lineHeight: '18px',
    },
    discountTotal: {
      color: '#0087ba',
      borderRadius: 3,
      border: 'solid 1px #0087ba',
      backgroundColor: 'rgba(0, 135, 186, 0.07)',
      padding: '4px 10px',
      fontSize: 16,
      marginTop: 10,
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    discountRow: {
      color: '#0187ba',
    },
    couponIcon: {
      width: 25,
      marginRight: 10,
      textAlign: 'center',
      '& img': {
        verticalAlign: 'middle',
        marginTop: 3,
      },
    },
  };
});

const OnlineCheckout: React.FC = () => {
  const classes = useStyles({});
  const { currentPincode } = useLocationDetails();
  const { currentPatient } = useAllCurrentPatients();
  const { isSignedIn } = useAuth();
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isApplyCouponDialogOpen, setIsApplyCouponDialogOpen] = React.useState<boolean>(false);
  const [couponCode, setCouponCode] = React.useState<string>('');
  const [revisedAmount, setRevisedAmount] = React.useState<number>(0);

  const [validateCouponResult, setValidateCouponResult] = useState<any>({});
  const [validityStatus, setValidityStatus] = useState<boolean>(false);
  const [mutationLoading, setMutationLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const apolloClient = useApolloClient();

  const pageData: any = localStorage.getItem('consultBookDetails')
    ? JSON.parse(localStorage.getItem('consultBookDetails'))
    : {};
  const {
    consultCouponCodeInitial,
    consultCouponValue,
    doctorId,
    appointmentDateTime,
    amount,
    appointmentType,
    doctorName,
  } = pageData;
  let newAppointmentDateTime = moment(appointmentDateTime)
    .format('DD MMMM[,] LT')
    .toString();
  const today = moment().endOf('day');
  const tomorrow = moment()
    .add(1, 'day')
    .endOf('day');
  const bookingTime = moment(appointmentDateTime);
  if (bookingTime < tomorrow) {
    newAppointmentDateTime = `Tomorrow, ${moment(appointmentDateTime)
      .format('LT')
      .toString()}`;
  }
  if (bookingTime < today) {
    newAppointmentDateTime = `Today, ${moment(appointmentDateTime)
      .format('LT')
      .toString()}`;
  }

  useEffect(() => {
    setLoading(true);

    /**Gtm code start start */
    dataLayerTracking({
      event: 'pageviewEvent',
      pagePath: window.location.href,
      pageName: 'Consultation Cart Page',
      pageLOB: 'Consultation',
      pageType: 'Cart Page',
      Time: appointmentDateTime,
      Type: appointmentType,
      cartproductlist: JSON.stringify(pageData),
    });
    /**Gtm code start end */

    apolloClient
      .query<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        variables: { id: doctorId },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (validateCouponResult && validateCouponResult.valid) {
      localStorage.setItem(
        'consultBookDetails',
        JSON.stringify({
          ...pageData,
          consultCouponValue: parseFloat(validateCouponResult.discount),
          consultCouponCodeInitial: couponCode,
        })
      );
    }
  }, [validateCouponResult]);

  useEffect(() => {
    setRevisedAmount(Number(amount) - Number(consultCouponValue || 0));

    if (!couponCode && consultCouponCodeInitial && consultCouponCodeInitial.length) {
      setCouponCode(consultCouponCodeInitial || '');
    }
  });

  const getValidateCouponBody = (doctorDetails: DoctorDetails, coupon: string) => {
    const { onlineConsultationFees } = doctorDetails;
    const hospitalId =
      doctorDetails.doctorHospital &&
      doctorDetails.doctorHospital[0] &&
      doctorDetails.doctorHospital[0].facility &&
      doctorDetails.doctorHospital[0].facility.id;
    const specialityId = (doctorDetails.specialty && doctorDetails.specialty.id) || null;
    const validateCouponBody = {
      mobile: currentPatient && currentPatient.mobileNumber,
      billAmount: Number(revisedAmount),
      coupon,
      pinCode: currentPincode ? currentPincode : localStorage.getItem('currentPincode') || '',
      consultations: [
        {
          hospitalId,
          doctorId,
          specialityId,
          consultationTime: new Date(appointmentDateTime).getTime(),
          consultationType: appointmentType === 'PHYSICAL' ? 0 : 1,
          cost: Number(onlineConsultationFees),
          rescheduling: false,
        },
      ],
    };
    return validateCouponBody;
  };

  const verifyCoupon = (doctorDetails: DoctorDetails, couponCode: string) => {
    if (doctorDetails && couponCode.length > 0) {
      setMutationLoading(true);
      const validateCouponBody = getValidateCouponBody(data.getDoctorDetailsById, couponCode);
      const speciality = (doctorDetails.specialty && doctorDetails.specialty.name) || null;
      fetchUtil(process.env.VALIDATE_CONSULT_COUPONS, 'POST', validateCouponBody, '', false)
        .then((data: any) => {
          if (data && data.response) {
            const couponValidateResult = data.response;
            setValidityStatus(couponValidateResult.valid);
            setValidateCouponResult(couponValidateResult);
            if (couponValidateResult.valid) {
              /*GTM TRACKING START */
              gtmTracking({
                category: 'Consultations',
                action: speciality,
                label: `Coupon Applied - ${couponCode}`,
                value:
                  couponValidateResult && couponValidateResult.valid
                    ? Number(parseFloat(couponValidateResult.discount).toFixed(2))
                    : null,
              });
              /*GTM TRACKING END */
              setErrorMessage('');
            } else {
              setErrorMessage(couponValidateResult.reason);
            }
          } else if (data && data.errorMsg && data.errorMsg.length > 0) {
            setErrorMessage(data.errorMsg);
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => setMutationLoading(false));
    }
  };

  const getCouponByMobileNumber = () => {
    getCouponByUserMobileNumber()
      .then((resp: any) => {
        if (resp.errorCode == 0 && resp.response && resp.response.length > 0) {
          const couponCode = resp.response[0].coupon;
          setCouponCode(couponCode || '');
          verifyCoupon(data.getDoctorDetailsById, couponCode);
        } else {
          setCouponCode('');
        }
      })
      .catch((e: any) => {
        console.log(e);
        setCouponCode('');
      });
  };

  useEffect(() => {
    if (currentPatient && data && data.getDoctorDetailsById && couponCode === '') {
      getCouponByMobileNumber();
    }
  }, [data, currentPatient]);

  const doctorDetails = data && data.getDoctorDetailsById ? data : null;
  if (doctorDetails) {
    const {
      experience,
      displayName,
      photoUrl,
      onlineConsultationFees,
    } = doctorDetails.getDoctorDetailsById;
    const speciality =
      (doctorDetails &&
        doctorDetails.getDoctorDetailsById &&
        doctorDetails.getDoctorDetailsById.specialty &&
        doctorDetails.getDoctorDetailsById.specialty.name) ||
      null;
    const specialityId =
      (doctorDetails &&
        doctorDetails.getDoctorDetailsById &&
        doctorDetails.getDoctorDetailsById.specialty &&
        doctorDetails.getDoctorDetailsById.specialty.id) ||
      null;
    const hospitalId =
      doctorDetails &&
      doctorDetails.getDoctorDetailsById &&
      doctorDetails.getDoctorDetailsById.doctorHospital[0] &&
      doctorDetails.getDoctorDetailsById.doctorHospital[0].facility
        ? doctorDetails.getDoctorDetailsById.doctorHospital[0].facility.id
        : '';
    // const facilityAddress =
    //   (doctorDetails &&
    //     doctorDetails.getDoctorDetailsById &&
    //     doctorDetails.getDoctorDetailsById.doctorHospital &&
    //     doctorDetails.getDoctorDetailsById.doctorHospital[0].facility) ||
    //   null;

    return (
      <div>
        <div className={classes.pageTopHeader}>
          <Header />
        </div>
        <div className={classes.container}>
          <div className={classes.pageContainer}>
            <div className={classes.pageHeader}>
              <Link to={clientRoutes.specialityListing()}>
                <div className={classes.backArrow}>
                  <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                  <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
                </div>
              </Link>
              Checkout
            </div>
            <div className={classes.pageContent}>
              <div className={classes.leftGroup}>
                <div className={classes.doctorProfile}>
                  <div className={classes.doctorImg}>
                    <img src={photoUrl} alt="" />
                  </div>
                  <div className={classes.doctorInfo}>
                    <div className={classes.doctorName}>{displayName}</div>
                    <div className={classes.doctorType}>
                      <span>
                        {speciality} | <span>{experience} Yrs. Exp</span>
                      </span>
                      {/* <div className={classes.moreBtn}>More</div> */}
                    </div>
                    <div className={classes.appointmentDetails}>
                      <div className={classes.blockHeader}>Appointment Details</div>
                      <div className={classes.consultServices}>
                        {/* <div className={classes.serviceType}>
                        <span className={classes.serviceIcon}>
                          <img src={require('images/ic_clinic.svg')} alt="" />
                        </span>
                        <span>Clinic Visit</span>
                      </div> */}
                        <div className={classes.serviceType}>
                          <span className={classes.serviceIcon}>
                            <img src={require('images/ic_round_video.svg')} alt="" />
                          </span>
                          <span>Online Consultation</span>
                        </div>
                        <div className={classes.serviceType}>
                          <span className={classes.serviceIcon}>
                            <img src={require('images/ic_calendar_show.svg')} alt="" />
                          </span>
                          <span>{newAppointmentDateTime}</span>
                        </div>
                        {/* <div className={`${classes.serviceType} ${classes.textTopAlign}`}>
                          <span className={classes.serviceIcon}>
                            <img src={require('images/ic_location.svg')} alt="" />
                          </span>
                          <span>
                            {facilityAddress.name} <br />
                            {facilityAddress.streetLine1}, {facilityAddress.streetLine2} <br />
                            {facilityAddress.city}, {facilityAddress.state}
                          </span>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={classes.rightGroup}>
                <div className={`${classes.sectionGroup}`}>
                  <div
                    onClick={() => setIsApplyCouponDialogOpen(true)}
                    className={`${classes.serviceTypeCoupon}`}
                  >
                    <div className={classes.couponTopGroup}>
                      <span className={classes.couponIcon}>
                        <img src={require('images/ic_coupon.svg')} alt="Coupon Icon" />
                      </span>
                      <div className={classes.couponRight}>
                        {couponCode === '' ? (
                          <div className={classes.applyCoupon}>
                            <span className={classes.linkText}>Apply Coupon</span>
                            <span className={classes.rightArrow}>
                              <img src={require('images/ic_arrow_right.svg')} alt="" />
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className={classes.appliedCoupon}>
                              <span className={classes.linkText}>
                                <span>{couponCode}</span> applied
                              </span>
                              <span className={classes.rightArrow}>
                                <img src={require('images/ic_arrow_right.svg')} alt="" />
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {couponCode.length > 0 && (
                      <div className={classes.discountTotal}>
                        Savings of Rs.{' '}
                        {validateCouponResult && validateCouponResult.valid
                          ? validateCouponResult.discount.toFixed(2)
                          : consultCouponValue
                          ? consultCouponValue.toFixed(2)
                          : 0}{' '}
                        on the bill
                      </div>
                    )}
                  </div>
                </div>
                <div className={classes.sectionHeader}>Total Charges</div>
                <div className={classes.priceSection}>
                  <div className={classes.priceRow}>
                    <span>Subtotal</span>
                    <span className={classes.price}>
                      Rs. {Number(onlineConsultationFees).toFixed(2)}
                    </span>
                  </div>
                  {(validateCouponResult && validateCouponResult.valid) ||
                  (consultCouponCodeInitial && consultCouponCodeInitial.length) ? (
                    <div className={`${classes.priceRow} ${classes.discountRow}`}>
                      <span>
                        Coupon Applied <br /> ({couponCode})
                      </span>
                      <span className={classes.price}>
                        - Rs.{' '}
                        {validateCouponResult && validateCouponResult.valid
                          ? validateCouponResult.discount.toFixed(2)
                          : consultCouponValue}
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className={`${classes.priceRow} ${classes.totalPrice}`}>
                    <span>To Pay</span>
                    <span className={classes.price}>
                      Rs.{' '}
                      {validateCouponResult && validateCouponResult.valid
                        ? (validateCouponResult.billAmount - validateCouponResult.discount).toFixed(
                            2
                          )
                        : revisedAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className={classes.bottomActions}>
                  <Route
                    render={({ history }) => (
                      <AphButton
                        color="primary"
                        disabled={mutationLoading}
                        onClick={() => {
                          history.push(clientRoutes.payMedicine('consults'));
                          const eventData = {
                            actualPrice: Number(amount),
                            consultDateTime: appointmentDateTime,
                            consultType: appointmentType,
                            discountAmount:
                              validateCouponResult && validateCouponResult.valid
                                ? Number(
                                    validateCouponResult.amount - validateCouponResult.discount
                                  )
                                : Number(revisedAmount),
                            discountCoupon: couponCode,
                            doctorCity: '',
                            doctorName,
                            specialty: speciality,
                            netAmount: Number(amount),
                            patientGender: currentPatient && currentPatient.gender,
                          };
                          consultPayButtonClickTracking(eventData);
                        }}
                      >
                        Pay Rs.{' '}
                        {validateCouponResult && validateCouponResult.valid
                          ? Number(
                              validateCouponResult.billAmount - validateCouponResult.discount
                            ).toFixed(2)
                          : revisedAmount.toFixed(2)}
                      </AphButton>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          <AphDialog open={isApplyCouponDialogOpen} maxWidth="sm">
            <AphDialogClose onClick={() => setIsApplyCouponDialogOpen(false)} title={'Close'} />
            <AphDialogTitle>Apply Coupon</AphDialogTitle>
            <CouponCodeConsult
              appointmentDateTime={appointmentDateTime}
              doctorId={doctorId}
              consultType={AppointmentType.ONLINE}
              setCouponCode={setCouponCode}
              couponCode={couponCode}
              setValidateCouponResult={setValidateCouponResult}
              close={(isApplyCouponDialogOpen: boolean) => {
                setIsApplyCouponDialogOpen(isApplyCouponDialogOpen);
              }}
              cartValue={onlineConsultationFees}
              validityStatus={validityStatus}
              setValidityStatus={setValidityStatus}
              speciality={speciality}
              specialityId={specialityId}
              hospitalId={hospitalId}
            />
          </AphDialog>
        </div>
        <div className={classes.footerLinks}>
          <BottomLinks />
        </div>
        {isSignedIn && <NavigationBottom />}
      </div>
    );
  } else {
    return <LinearProgress className={classes.loader} />;
  }
};

export default OnlineCheckout;
