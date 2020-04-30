import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/doctors';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { DoctorType } from 'graphql/types/globalTypes';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { VisitClinic } from 'components/VisitClinic';
import { LocationProvider } from 'components/LocationProvider';
import { OnlineConsult } from 'components/OnlineConsult';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
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
  });
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};
interface DoctorCardProps {
  doctorId: string;
  setIsPopoverOpen: (popover: boolean) => void;
  doctorAvailableIn: number;
}

export const BookConsult: React.FC<DoctorCardProps> = (props) => {
  const classes = useStyles({});

  const { doctorId, setIsPopoverOpen } = props;
  const [tabValue, setTabValue] = useState<number>(0);

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
    useEffect(() => {
      /* Gtm code start */
      const speciality =
        doctorDetails &&
          doctorDetails.getDoctorDetailsById &&
          doctorDetails.getDoctorDetailsById.specialty &&
          doctorDetails.getDoctorDetailsById.specialty.name ? doctorDetails.getDoctorDetailsById.specialty.name : null
      const onlineConsultationFees = doctorDetails && doctorDetails.getDoctorDetailsById && doctorDetails.getDoctorDetailsById.onlineConsultationFees ? doctorDetails.getDoctorDetailsById.onlineConsultationFees : null
      window.gep && window.gep('Consultations', speciality, 'Order Initiated', onlineConsultationFees);
      /* Gtm code end */
    }, [])

    return (
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
              doctorAvailableIn={props.doctorAvailableIn}
            />
          </TabContainer>
        )}

        {tabValue === 1 && availableForPhysicalConsultation && !isPayrollDoctor && (
          <TabContainer>
            <LocationProvider>
              <VisitClinic
                doctorDetails={doctorDetails}
                doctorAvailableIn={props.doctorAvailableIn}
              />
            </LocationProvider>
          </TabContainer>
        )}
      </Paper>
    );
  } else {
    return <LinearProgress />;
  }
};
