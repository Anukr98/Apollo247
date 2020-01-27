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
import Scrollbars from 'react-custom-scrollbars';
import { LocationProvider } from 'components/LocationProvider';
import { AphButton } from '@aph/web-ui-components';

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
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    doctorProfileSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingLeft: 0,
      },
    },
    sectionHeader: {
      color: theme.palette.secondary.dark,
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    count: {
      marginLeft: 'auto',
    },
    topPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
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
      marginRight: 50,
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
  const { currentPatient } = useAllCurrentPatients();

  const currentUserId = currentPatient && currentPatient.id;

  const { data, loading, error } = useQueryWithSkip<
    GetDoctorDetailsById,
    GetDoctorDetailsByIdVariables
  >(GET_DOCTOR_DETAILS_BY_ID, {
    variables: { id: doctorId },
  });

  if (loading) {
    return <LinearProgress />;
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

    // if (
    //   doctorDetails &&
    //   doctorDetails.getDoctorDetailsById &&
    //   doctorDetails.getDoctorDetailsById.consultHours &&
    //   doctorDetails.getDoctorDetailsById.consultHours.length > 0
    // ) {
    //   doctorDetails.getDoctorDetailsById.consultHours.forEach((consultHour) => {
    //     const currentDay = new Date().toLocaleString('en-IN', { weekday: 'long' }).toUpperCase();
    //     const consultDay = consultHour && consultHour.weekDay ? consultHour.weekDay : '';
    //     const consultMode =
    //       consultHour && consultHour.consultMode ? consultHour.consultMode : ConsultMode.PHYSICAL;
    //     if (currentDay === consultDay) {
    //       availableForPhysicalConsultation =
    //         consultMode === ConsultMode.PHYSICAL || ConsultMode.BOTH ? true : false;
    //       availableForVirtualConsultation =
    //         consultMode === ConsultMode.ONLINE || ConsultMode.BOTH ? true : false;
    //       return;
    //     }
    //   });
    // }
    // this needs to be reworked after availability api.

    // console.log(availableForPhysicalConsultation, availableForVirtualConsultation);

    return (
      <div className={classes.root}>
        <Header />
        <div className={classes.container}>
          <div className={classes.doctorDetailsPage}>
            <div className={classes.breadcrumbs}>
              <Link to={clientRoutes.doctorsLanding()}>
                <div className={classes.backArrow}>
                  <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                  <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
                </div>
              </Link>
              Doctor Details
            </div>
            <div className={classes.doctorProfileSection}>
              <DoctorProfile
                doctorDetails={doctorDetails}
                avaPhy={availableForPhysicalConsultation}
                avaOnline={availableForVirtualConsultation}
              />
              <div className={classes.searchSection}>
                <span className={classes.count}>
                  <AphButton onClick={(e) => setIsPopoverOpen(true)} fullWidth color="primary">
                    Book Appointment
                  </AphButton>
                </span>
                <Scrollbars
                  style={{ height: '100%' }}
                  autoHide={true}
                  autoHeight
                  autoHeightMax={'calc(100vh - 195px'}
                >
                  <div className={classes.customScroll}>
                    {isStarDoctor && (
                      <>
                        <DoctorClinics doctorDetails={doctorDetails} />
                        <StarDoctorTeam doctorDetails={doctorDetails} />
                      </>
                    )}
                    <AppointmentHistory doctorId={doctorId} patientId={currentUserId || ' '} />
                  </div>
                </Scrollbars>
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
                />
              )}

              {availableForPhysicalConsultation && !isPayrollDoctor && (
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Visit Clinic"
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
    return <LinearProgress />;
  }
};
