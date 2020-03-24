import { Theme, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState } from 'react';
import { useParams } from 'hooks/routerHooks';
import { DoctorProfile } from 'components/DoctorProfile';
import { DoctorClinics } from 'components/DoctorClinics';
import { StarDoctorTeam } from 'components/StarDoctorTeam';
import { AppointmentHistory } from 'components/AppointmentHistory';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { OnlineConsult } from 'components/OnlineConsult';
import { VisitClinic } from 'components/VisitClinic';
import { useQueryWithSkip } from 'hooks/apolloHooks';
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
import Scrollbars from 'react-custom-scrollbars';
import { AphButton } from '@aph/web-ui-components';
import useMediaQuery from '@material-ui/core/useMediaQuery';

type Params = { id: string };

export interface DoctorDetailsProps {
  id: string;
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorDetailsPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        zIndex: 99,
        width: '100%',
      },
    },
    breadcrumbs: {
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
        width: '100%',
      },
    },
    doctorProfileSection: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#dcdfce',
        marginTop: 56,
        paddingBottom: 80,
      },
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      marginLeft: 'auto',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingLeft: 0,
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
    backArrow: {
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
    customScroll: {
      paddingLeft: 20,
      paddingRight: 17,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    bookAppointment: {
      position: 'absolute',
      right: 20,
      top: 12,
      minWidth: 200,
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
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const doctorId = params.id;
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [isShownOnce, setIsShownOnce] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const currentUserId = currentPatient && currentPatient.id;

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorDetailsById,
    GetDoctorDetailsByIdVariables
  >(GET_DOCTOR_DETAILS_BY_ID, {
    variables: { id: doctorId },
  });

  if (loading) {
    return <LinearProgress className={classes.loader} />;
  }
  if (error) {
    return <div>Error....</div>;
  }

  const availableForPhysicalConsultation = true,
    availableForVirtualConsultation = true;

  const doctorDetails = data && data.getDoctorDetailsById ? data : null;

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

    return (
      <div className={classes.root}>
        <Header />
        <div className={classes.container}>
          <div className={classes.doctorDetailsPage}>
            <div className={classes.breadcrumbs}>
              <Link to={clientRoutes.doctorsLanding()} title={'Back to doctors search'}>
                <div className={classes.backArrow}>
                  <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                  <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
                </div>
              </Link>
              Doctor Details
            </div>
            <Scrollbars
              autoHide={true}
              autoHeight
              autoHeightMax={
                isMediumScreen
                  ? 'calc(100vh - 240px)'
                  : isSmallScreen
                  ? 'auto'
                  : 'calc(100vh - 154px)'
              }
            >
              <div className={classes.doctorProfileSection}>
                <DoctorProfile
                  doctorDetails={doctorDetails}
                  avaPhy={availableForPhysicalConsultation}
                  avaOnline={availableForVirtualConsultation}
                />
                <div className={classes.searchSection}>
                  <AphButton
                    onClick={(e) => setIsPopoverOpen(true)}
                    color="primary"
                    className={classes.bookAppointment}
                    title={' Book Appointment'}
                  >
                    Book Appointment
                  </AphButton>
                  <div className={classes.customScroll}>
                    {!isPayrollDoctor && (
                      <>
                        <DoctorClinics doctorDetails={doctorDetails} />
                        <StarDoctorTeam doctorDetails={doctorDetails} />
                      </>
                    )}
                    <AppointmentHistory doctorId={doctorId} patientId={currentUserId || ' '} />
                  </div>
                </div>
              </div>
            </Scrollbars>
          </div>
        </div>
        <div className={classes.flotingBtn}>
          <AphButton
            onClick={(e) => setIsPopoverOpen(true)}
            color="primary"
            title={' Book Appointment'}
          >
            Book Appointment
          </AphButton>
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
      </div>
    );
  } else {
    return <LinearProgress className={classes.loader} />;
  }
};
