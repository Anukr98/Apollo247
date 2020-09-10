import React, { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import { DoctorType, ConsultMode } from 'graphql/types/globalTypes';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { VisitClinicFollowupConsult } from 'components/VisitClinicFollowupConsult';
import { LocationProvider } from 'components/LocationProvider';
import { OnlineFollwupConsult } from 'components/OnlineFollowupConsult';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/doctors';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';

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
  setIsPopoverOpen: (popover: boolean) => void;
  doctorId: string;
  setSelectedSlot: (selectedSlot: string) => void;
  setFollwupAppoitnmentType: (followupAppointmentType: number) => void;
}

export const BookFollowupConsult: React.FC<DoctorCardProps> = (props) => {
  const classes = useStyles({});

  const { doctorId, setIsPopoverOpen, setSelectedSlot, setFollwupAppoitnmentType } = props;
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

  const doctorDetails = data && data.getDoctorDetailsById ? data.getDoctorDetailsById : null;

  if (doctorDetails) {
    const isPayrollDoctor = doctorDetails.doctorType === DoctorType.PAYROLL ? true : false;

    const doctorId = doctorDetails.id;

    const consultModeOnline: any = [];
    const consultModePhysical: any = [];
    doctorDetails &&
      doctorDetails.consultHours &&
      doctorDetails.consultHours.map((item: any) => {
        if (item.consultMode === 'PHYSICAL' || item.consultMode === 'BOTH') {
          consultModePhysical.push(item.consultMode);
        }
        if (item.consultMode === 'ONLINE' || item.consultMode === 'BOTH') {
          consultModeOnline.push(item.consultMode);
        }
      });
    const consultMode =
      consultModeOnline.length > 0 && consultModePhysical.length > 0
        ? ConsultMode.BOTH
        : consultModeOnline.length > 0
        ? ConsultMode.ONLINE
        : consultModePhysical.length > 0
        ? ConsultMode.PHYSICAL
        : null;

    const availableForVirtualConsultation =
      consultMode === ConsultMode.BOTH || consultMode === ConsultMode.ONLINE;
    const availableForPhysicalConsultation =
      consultMode === ConsultMode.BOTH || consultMode == ConsultMode.PHYSICAL;

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
            setFollwupAppoitnmentType(newValue);
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
        {availableForVirtualConsultation && tabValue === 0 && (
          <TabContainer>
            <OnlineFollwupConsult
              setIsPopoverOpen={setIsPopoverOpen}
              doctorDetails={doctorDetails}
              setSelectedSlot={props.setSelectedSlot}
            />
          </TabContainer>
        )}
        {availableForPhysicalConsultation && !isPayrollDoctor && tabValue === 1 && (
          <TabContainer>
            <LocationProvider>
              <VisitClinicFollowupConsult
                setIsPopoverOpen={setIsPopoverOpen}
                doctorDetails={doctorDetails}
                setSelectedSlot={setSelectedSlot}
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
