import { Theme, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState, useEffect } from 'react';
import { useParams } from 'hooks/routerHooks';
import { DoctorProfile } from 'components/DoctorProfile';
import { DoctorClinics } from 'components/DoctorClinics';
import { StarDoctorTeam } from 'components/StarDoctorTeam';
import { AppointmentHistory } from 'components/AppointmentHistory';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useApolloClient } from 'react-apollo-hooks';
import Typography from '@material-ui/core/Typography';
import { OnlineConsult } from 'components/OnlineConsult';
import { VisitClinic } from 'components/VisitClinic';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/doctors';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { DoctorType } from 'graphql/types/globalTypes';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { LocationProvider } from 'components/LocationProvider';
import { AphButton } from '@aph/web-ui-components';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useAuth } from 'hooks/authHooks';
import { ManageProfile } from 'components/ManageProfile';
import { BottomLinks } from 'components/BottomLinks';
import { gtmTracking } from 'gtmTracking';
import { getOpeningHrs } from '../helpers/commonHelpers';
import { SchemaMarkup } from 'SchemaMarkup';
import { MetaTagsComp } from 'MetaTagsComp';
import { DoctorTimings } from 'components/DoctorTimings';
import { HowCanConsult } from 'components/Doctors/HowCanConsult';
import { AppDownload } from 'components/Doctors/AppDownload';
import { NavigationBottom } from 'components/NavigationBottom';
export interface DoctorDetailsProps {
  id: string;
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorDetailsPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f0f1ec',
        marginTop: -14,
      },
    },
    breadcrumbLinks: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 13,
      color: '#007c93',
      fontWeight: 600,
      textTransform: 'uppercase',
      padding: 20,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        position: 'fixed',
        padding: '17px 20px',
        zIndex: 99,
        top: 0,
        width: '100%',
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      },
      '& a': {
        paddingLeft: 5,
        paddingRight: 5,
        color: '#fca317',
      },
      '& span': {
        paddingLeft: 5,
        paddingRight: 5,
      },
    },
    doctorProfileSection: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#dcdfce',
        paddingBottom: 20,
      },
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: 20,
        paddingTop: 0,
      },
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 20,
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    rightSideBar: {
      width: 328,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    modalBox: {
      maxWidth: 676,
      margin: 'auto',
      marginTop: 88,
      backgroundColor: theme.palette.common.white,
      position: 'relative',
      outline: 'none',
    },
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: '10px 10px 0 0',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'center',
      color: 'rgba(2,71,91,0.5)',
      padding: '14px 10px',
      textTransform: 'none',
      minWidth: '50%',
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    rootTabContainer: {
      padding: 0,
    },
    modalBoxClose: {
      position: 'absolute',
      right: -48,
      top: 0,
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: theme.palette.common.white,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        right: 0,
        top: -48,
      },
    },
    bookAppointment: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
    flotingBtn: {
      position: 'fixed',
      bottom: 0,
      textAlign: 'center',
      width: '100%',
      backgroundColor: '#dcdfce',
      zIndex: 99,
      [theme.breakpoints.up(901)]: {
        display: 'none',
      },
      '& button': {
        minWidth: 200,
        margin: '20px 0',
      },
    },
    loader: {
      top: -88,
      zIndex: 999,
    },
    doctorProfile: {
      borderRadius: 5,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#ffffff',
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
    },
    doctorTimings: {
      paddingTop: 20,
    },
    mHide: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    backArrow: {
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& img': {
        verticalAlign: 'middle',
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const { isSignedIn } = useAuth();
  const classes = useStyles({});
  const params = useParams<{ id: string; specialty: string }>();
  const doctorId = params.id;
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [isShownOnce, setIsShownOnce] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const apolloClient = useApolloClient();
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [structuredJSON, setStructuredJSON] = useState(null);
  const [metaTagProps, setMetaTagProps] = useState(null);

  const currentUserId = currentPatient && currentPatient.id;

  useEffect(() => {
    setLoading(true);
    apolloClient
      .query<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        variables: { id: doctorId },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
        if (
          response.data &&
          response.data.getDoctorDetailsById &&
          Object.keys(response.data.getDoctorDetailsById).length
        ) {
          const {
            getDoctorDetailsById: {
              id,
              fullName,
              photoUrl,
              firstName,
              lastName,
              doctorHospital,
              specialty,
              onlineConsultationFees,
              physicalConsultationFees,
              consultHours,
              salutation
            },
          } = response.data;
          const openingHours = consultHours ? getOpeningHrs(consultHours) : '';
          let streetLine1 = '',
            city = '',
            latitude,
            longitude,
            name = '',
            imageUrl;
          if (doctorHospital.length && doctorHospital[0].facility) {
            streetLine1 = doctorHospital[0].facility.streetLine1;
            city = doctorHospital[0].facility.city;
            latitude = doctorHospital[0].facility.latitude;
            longitude = doctorHospital[0].facility.longitude;
            name = doctorHospital[0].facility.name;
            imageUrl =
              doctorHospital[0].facility.imageUrl ||
              'https://prodaphstorage.blob.core.windows.net/patientwebstaticfiles/hospital_image-e202f2.png';
          }
          setStructuredJSON({
            '@context': 'http://schema.org/',
            '@type': 'Physician',
            name: fullName ? fullName : `${firstName} ${lastName}`,
            url: window && window.location ? window.location.href : null,
            currenciesAccepted: 'INR',
            image: photoUrl || 'https://prodaphstorage.blob.core.windows.net/doctors/no_photo.png',
            photo: [
              {
                '@type': 'CreativeWork',
                url:
                  photoUrl || 'https://prodaphstorage.blob.core.windows.net/doctors/no_photo.png',
              },
            ],
            openingHours: openingHours,
            address: {
              '@type': 'PostalAddress',
              addressLocality: streetLine1,
              addressRegion: city,
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: latitude,
              longitude: longitude,
            },
            priceRange:
              onlineConsultationFees === physicalConsultationFees
                ? `Rs. ${onlineConsultationFees}`
                : `Rs. ${Math.min(
                    Number(onlineConsultationFees),
                    Number(physicalConsultationFees)
                  )} - Rs. ${Math.max(
                    Number(onlineConsultationFees),
                    Number(physicalConsultationFees)
                  )}`,
            branchOf: {
              '@type': 'MedicalClinic',
              name: name,
              url: window && window.location ? window.location.href : null,
              address: {
                '@type': 'PostalAddress',
                addressLocality: streetLine1,
                addressRegion: city,
              },
              image: imageUrl,
            },
            medicalSpecialty: specialty ? specialty.name : '',
          });
          setMetaTagProps({
            title: `${fullName}: ${specialty && specialty.name ? specialty.name : ''} - Online Consultation/Appointment - Apollo 247`,
            description: `Book an appointment with ${fullName} - ${specialty && specialty.name} and consult online at Apollo 247. Know more about ${fullName} and his work here. Get medical help online in just a few clicks at Apollo 247.`,
            canonicalLink: window && window.location && window.location.href
          })
        }
      });
  }, []);

  if (loading) {
    return <LinearProgress className={classes.loader} />;
  }

  const availableForPhysicalConsultation = true,
    availableForVirtualConsultation = true;

  const doctorDetails = data && data.getDoctorDetailsById ? data : null;

  const gtmTrackingFunc = () => {
    /* Gtm code start */
    const speciality =
      doctorDetails &&
      doctorDetails.getDoctorDetailsById &&
      doctorDetails.getDoctorDetailsById.specialty &&
      doctorDetails.getDoctorDetailsById.specialty.name
        ? doctorDetails.getDoctorDetailsById.specialty.name
        : null;
    const onlineConsultationFees =
      doctorDetails &&
      doctorDetails.getDoctorDetailsById &&
      doctorDetails.getDoctorDetailsById.onlineConsultationFees
        ? doctorDetails.getDoctorDetailsById.onlineConsultationFees
        : null;
    gtmTracking({
      category: 'Consultations',
      action: speciality,
      label: 'Order Initiated',
      value: onlineConsultationFees,
    });
    /* Gtm code end */
  };

  if (doctorDetails) {
    const isStarDoctor =
      doctorDetails &&
      doctorDetails.getDoctorDetailsById &&
      doctorDetails.getDoctorDetailsById.doctorType === DoctorType.STAR_APOLLO
        ? true
        : false;

    const isPayrollDoctor =
      doctorDetails &&
      doctorDetails.getDoctorDetailsById &&
      doctorDetails.getDoctorDetailsById.doctorType === DoctorType.PAYROLL
        ? true
        : false;

    const doctorId =
      doctorDetails && doctorDetails.getDoctorDetailsById
        ? doctorDetails.getDoctorDetailsById.id
        : '';

    const hasStarTeam =
      doctorDetails &&
      doctorDetails.getDoctorDetailsById &&
      doctorDetails.getDoctorDetailsById.starTeam
        ? true
        : false;

    return (
      <div className={classes.root}>
        <MetaTagsComp {...metaTagProps}/>
        <div className={classes.mHide}>
          <Header />
        </div>
        {structuredJSON && <SchemaMarkup structuredJSON={structuredJSON} />}
        <div className={classes.container}>
          <div className={classes.doctorDetailsPage}>
            <div className={classes.breadcrumbLinks}>
              <Link className={classes.backArrow} to={clientRoutes.doctorsLanding()}>
                <img src={require('images/ic_back.svg')} alt="" />
              </Link>
              <Link to={clientRoutes.doctorsLanding()}>Doctor</Link>
              <img src={require('images/triangle.svg')} alt="" />
              <Link to={clientRoutes.doctorsLanding()}>Specialities</Link>
              <img src={require('images/triangle.svg')} alt="" />
              <span>Doctor Details</span>
            </div>
              <div className={classes.doctorProfileSection}>
                <div className={classes.leftSection}>
                  <div className={classes.doctorProfile}>
                    <DoctorProfile
                      doctorDetails={doctorDetails}
                      avaPhy={availableForPhysicalConsultation}
                      avaOnline={availableForVirtualConsultation}
                    />
                    {!isPayrollDoctor && (
                      <>
                        <DoctorClinics doctorDetails={doctorDetails} />
                        {hasStarTeam && <StarDoctorTeam doctorDetails={doctorDetails} />}
                      </>
                    )}
                    <DoctorTimings />
                  </div>
                  <AppointmentHistory doctorId={doctorId} patientId={currentUserId || ' '} />
                </div>
                <div className={classes.rightSideBar}>
                  <HowCanConsult />
                  <AppDownload />
                  {/* <ProtectedWithLoginPopup>
                    {({ protectWithLoginPopup }) => (
                      <>
                        <AphButton
                          onClick={(e) => {
                            if (!isSignedIn) {
                              protectWithLoginPopup();
                            } else {
                              setIsPopoverOpen(true);
                              gtmTrackingFunc();
                            }
                          }}
                          color="primary"
                          className={classes.bookAppointment}
                          title={' Book Appointment'}
                        >
                          Book Appointment
                        </AphButton>
                      </>
                    )}
                  </ProtectedWithLoginPopup> */}
                </div>
              </div>
          </div>
        </div>
        <Modal
          open={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          disableBackdropClick
          disableEscapeKeyDown
        >
          <Paper className={classes.modalBox}>
            <div className={classes.modalBoxClose} onClick={() => setIsPopoverOpen(false)}>
              <img src={require('images/ic_cross_popup.svg')} alt="" />
            </div>
            <Tabs
              value={tabValue}
              classes={{
                root: classes.tabsRoot,
                indicator: classes.tabsIndicator,
              }}
              onChange={(e, newValue) => {
                setTabValue(newValue);
              }}
            >
              {availableForVirtualConsultation && (
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Consult Online"
                  title={'Consult Online'}
                />
              )}

              {availableForPhysicalConsultation && !isPayrollDoctor && (
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Visit Clinic"
                  title="Visit Clinic"
                />
              )}
            </Tabs>
            {tabValue === 0 && availableForVirtualConsultation && (
              <TabContainer>
                <OnlineConsult
                  setIsPopoverOpen={setIsPopoverOpen}
                  doctorDetails={doctorDetails}
                  onBookConsult={(popover: boolean) => setIsPopoverOpen(popover)}
                  isRescheduleConsult={false}
                  tabValue={(tabValue: number) => setTabValue(tabValue)}
                  setIsShownOnce={(isShownOnce: boolean) => setIsShownOnce(isShownOnce)}
                  isShownOnce={isShownOnce}
                />
              </TabContainer>
            )}

            {tabValue === 1 && availableForPhysicalConsultation && !isPayrollDoctor && (
              <TabContainer>
                <LocationProvider>
                  <VisitClinic doctorDetails={doctorDetails} />
                </LocationProvider>
              </TabContainer>
            )}
          </Paper>
        </Modal>
        <BottomLinks />
        <NavigationBottom />
      </div>
    );
  } else {
    return <LinearProgress className={classes.loader} />;
  }
};
