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
import { useApolloClient, useMutation } from 'react-apollo-hooks';
import Typography from '@material-ui/core/Typography';
import { OnlineConsult } from 'components/OnlineConsult';
import { VisitClinic } from 'components/VisitClinic';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/doctors';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { DoctorType, SEARCH_TYPE } from 'graphql/types/globalTypes';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { LocationProvider } from 'components/LocationProvider';
import { AphButton } from '@aph/web-ui-components';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { ManageProfile } from 'components/ManageProfile';
import { BottomLinks } from 'components/BottomLinks';
import { gtmTracking, dataLayerTracking } from 'gtmTracking';
import { getOpeningHrs, readableParam } from '../helpers/commonHelpers';
import { SchemaMarkup } from 'SchemaMarkup';
import { MetaTagsComp } from 'MetaTagsComp';
import { DoctorTimings } from 'components/DoctorTimings';
import { HowCanConsult } from 'components/Doctors/HowCanConsult';
import { AppDownload } from 'components/Doctors/AppDownload';
import { NavigationBottom } from 'components/NavigationBottom';
import { GetDoctorNextAvailableSlot } from 'graphql/types/GetDoctorNextAvailableSlot';
import { GetDoctorDetailsById_getDoctorDetailsById as DoctorDetailsType } from 'graphql/types/GetDoctorDetailsById';
import { doctorProfileViewTracking } from 'webEngageTracking';
import { getDiffInMinutes, deepLinkUtil } from 'helpers/commonHelpers';
import { hasOnePrimaryUser } from 'helpers/onePrimaryUser';
import { SAVE_PATIENT_SEARCH } from 'graphql/pastsearches';
import { useLocation } from 'react-router';

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

const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const { isSignedIn } = useAuth();
  const classes = useStyles({});
  const onePrimaryUser = hasOnePrimaryUser();
  const params = useParams<{ id: string; specialty: string; name: string }>();
  const nameId = params && params.name && params.id && params.name + '-' + params.id;
  const nameIdLength = nameId && nameId.length;
  const doctorId = nameIdLength && nameId.slice(nameIdLength - 36);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [isShownOnce, setIsShownOnce] = useState<boolean>(false);
  const apolloClient = useApolloClient();
  const [doctorData, setDoctorData] = useState<DoctorDetailsType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [structuredJSON, setStructuredJSON] = useState(null);
  const [breadcrumbJSON, setBreadcrumbJSON] = useState(null);
  const [metaTagProps, setMetaTagProps] = useState(null);
  const [doctorAvailableSlots, setDoctorAvailableSlots] = useState<GetDoctorNextAvailableSlot>();
  const [error, setError] = useState<boolean>(false);
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const { currentPatient } = useAllCurrentPatients();
  const saveSearchMutation = useMutation(SAVE_PATIENT_SEARCH);

  const doctorSlots =
    doctorAvailableSlots &&
    doctorAvailableSlots.getDoctorNextAvailableSlot &&
    doctorAvailableSlots.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
    doctorAvailableSlots.getDoctorNextAvailableSlot.doctorAvailalbeSlots.length > 0 &&
    doctorAvailableSlots.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0];

  useEffect(() => {
    deepLinkUtil(`Doctor?${doctorId}`);
  }, []);

  useEffect(() => {
    if (doctorSlots && doctorSlots.availableSlot) {
      const {
        doctorType,
        experience,
        fullName,
        specialty: { name },
      } = doctorData;
      const eventData = {
        availableInMins: getDiffInMinutes(doctorSlots.availableSlot),
        docCategory: doctorType,
        exp: experience,
        name: fullName,
        specialty: name,
      };
      doctorProfileViewTracking(eventData);
    }
  }, [doctorSlots, doctorData]);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/specialties')) {
      history.replaceState(null, '', clientRoutes.doctorDetails(params.name, params.id));
    }
    setLoading(true);
    apolloClient
      .query<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        variables: { id: doctorId },
      })
      .then(({ data }: any) => {
        if (data && data.getDoctorDetailsById) {
          setDoctorData(data.getDoctorDetailsById);
          const {
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
            salutation,
          } = data.getDoctorDetailsById;
          if (currentPatient && currentPatient.id) {
            saveSearchMutation({
              variables: {
                saveSearchInput: {
                  type: SEARCH_TYPE.SPECIALTY,
                  typeId: specialty.id,
                  patient: currentPatient ? currentPatient.id : '',
                },
              },
            });
            saveSearchMutation({
              variables: {
                saveSearchInput: {
                  type: SEARCH_TYPE.DOCTOR,
                  typeId: id,
                  patient: currentPatient ? currentPatient.id : '',
                },
              },
            });
          }
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

          const docSpecialty = specialty && specialty.name ? specialty.name : '';

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
          setBreadcrumbJSON({
            '@context': 'https://schema.org/',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'HOME',
                item: 'https://www.apollo247.com/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'SPECIALTIES',
                item: 'https://www.apollo247.com/specialties',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: specialty ? specialty.name : '',
                item: `https://www.apollo247.com/specialties/${readableParam(
                  specialty ? specialty.name : ''
                )}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: fullName ? fullName : `${firstName} ${lastName}`,
                item: `https://www.apollo247.com/specialties/${readableParam(
                  specialty ? specialty.name : ''
                )}/${readableParam(fullName ? fullName : `${firstName} ${lastName}`)}-${id}`,
              },
            ],
          });
          setMetaTagProps({
            title: `${fullName}, ${docSpecialty} in ${city}, Consult Online Now - Apollo 247`,
            description: `Consult ${fullName} (${docSpecialty}) online now. Book online appointment and clinic visit with ${fullName} in just a few clicks. Know fees, availability, experience and more about ${fullName}.`,
            canonicalLink:
              window &&
              window.location &&
              window.location.origin &&
              `${window.location.origin}/doctors/${readableParam(fullName)}-${id}`,
            deepLink: window.location.href,
          });
          /**Gtm code start start */
          dataLayerTracking({
            event: 'pageviewEvent',
            pagePath: window.location.href,
            pageName: 'Doctor Details Page',
            pageLOB: 'Consultation',
            pageType: 'Details Page',
            productlist: JSON.stringify(data.getDoctorDetailsById),
          });
          /**Gtm code start end */
        }
        setError(false);
      })
      .catch((e) => {
        console.log(e);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LinearProgress className={classes.loader} />;
  }

  if (error) {
    return <>Error Loading the data</>;
  }

  if (doctorData) {
    const doctorTimings = doctorData.consultHours || null;
    const gtmTrackingFunc = () => {
      /* Gtm code start */
      const speciality =
        doctorData && doctorData.specialty && doctorData.specialty.name
          ? doctorData.specialty.name
          : null;
      const onlineConsultationFees =
        doctorData && doctorData.onlineConsultationFees ? doctorData.onlineConsultationFees : null;
      gtmTracking({
        category: 'Consultations',
        action: speciality,
        label: 'Order Initiated',
        value: onlineConsultationFees,
      });
      /* Gtm code end */
    };
    const doctorId = doctorData.id || '';

    const isPayrollDoctor =
      doctorData.doctorType && doctorData.doctorType === DoctorType.PAYROLL ? true : false;

    const hasStarTeam = doctorData.starTeam ? true : false;

    return (
      <div className={classes.root}>
        <MetaTagsComp {...metaTagProps} />
        <div className={classes.mHide}>
          <Header />
        </div>
        {structuredJSON && <SchemaMarkup structuredJSON={structuredJSON} />}
        {breadcrumbJSON && <SchemaMarkup structuredJSON={breadcrumbJSON} />}
        <div className={classes.container}>
          <div className={classes.doctorDetailsPage}>
            <div className={classes.breadcrumbLinks}>
              <Link className={classes.backArrow} to={clientRoutes.specialties(params.specialty)}>
                <img src={require('images/ic_back.svg')} alt="" />
              </Link>
              <Link to={clientRoutes.welcome()}>Home</Link>
              <img src={require('images/triangle.svg')} alt="" />
              <Link to={clientRoutes.specialityListing()}>Specialties</Link>
              <img src={require('images/triangle.svg')} alt="" />
              {doctorData && (
                <>
                  {doctorData.specialty && doctorData.specialty.name ? (
                    <>
                      <Link to={clientRoutes.specialties(readableParam(doctorData.specialty.name))}>
                        {doctorData.specialty.name}
                      </Link>
                      <img src={require('images/triangle.svg')} alt="" />
                    </>
                  ) : null}

                  <span>{doctorData.fullName || ''}</span>
                </>
              )}
            </div>
            <div className={classes.doctorProfileSection}>
              <div className={classes.leftSection}>
                <div className={classes.doctorProfile}>
                  <DoctorProfile
                    doctorDetails={doctorData}
                    avaPhy={true}
                    avaOnline={true}
                    getDoctorAvailableSlots={(value: GetDoctorNextAvailableSlot) => {
                      setDoctorAvailableSlots(value);
                    }}
                  />
                  {!isPayrollDoctor && (
                    <>
                      <DoctorClinics doctorDetails={doctorData} />
                      {hasStarTeam && <StarDoctorTeam doctorDetails={doctorData} />}
                    </>
                  )}
                  <DoctorTimings doctorTimings={doctorTimings} />
                </div>
                <AppointmentHistory doctorId={doctorData.id || ''} />
              </div>
              <div className={classes.rightSideBar}>
                <HowCanConsult
                  doctorDetails={doctorData}
                  doctorAvailablePhysicalSlots={
                    doctorSlots ? doctorSlots.physicalAvailableSlot : ''
                  }
                  doctorAvailableOnlineSlot={doctorSlots ? doctorSlots.availableSlot : ''}
                />
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
              <Tab
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Consult Online"
                title={'Consult Online'}
              />

              {!isPayrollDoctor && (
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
            {tabValue === 0 && (
              <TabContainer>
                <OnlineConsult
                  setIsPopoverOpen={setIsPopoverOpen}
                  doctorDetails={doctorData}
                  tabValue={(tabValue: number) => setTabValue(tabValue)}
                  setIsShownOnce={(isShownOnce: boolean) => setIsShownOnce(isShownOnce)}
                  isShownOnce={isShownOnce}
                />
              </TabContainer>
            )}

            {tabValue === 1 && !isPayrollDoctor && (
              <TabContainer>
                <LocationProvider>
                  <VisitClinic doctorDetails={doctorData} />
                </LocationProvider>
              </TabContainer>
            )}
          </Paper>
        </Modal>
        <BottomLinks />
        <NavigationBottom />
        {!onePrimaryUser && <ManageProfile />}
      </div>
    );
  } else {
    return <LinearProgress className={classes.loader} />;
  }
};

export default DoctorDetails;
