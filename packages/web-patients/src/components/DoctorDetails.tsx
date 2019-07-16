import { Theme, Popover, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState, useRef } from 'react';
import { useParams } from 'hooks/routerHooks';
import { DoctorProfile } from 'components/DoctorProfile';
import { DoctorClinics } from 'components/DoctorClinics';
import { StarDoctorTeam } from 'components/StarDoctorTeam';
import { AppointmentHistory } from 'components/AppointmentHistory';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { MaterialUiPickersDate } from '@material-ui/pickers';
import { usePickerState, Calendar } from '@material-ui/pickers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorDetailsPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 15,
      paddingBottom: 10,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
    },
    doctorProfileSection: {
      display: 'flex',
      padding: 20,
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      paddingLeft: 20,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '1px solid rgba(1,71,91,0.3)',
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
  };
});

type Params = { id: string };

export interface DoctorDetailsProps {
  id: string;
}

interface TabContainerProps {
  children?: React.ReactNode;
}

const TabContainer: React.FC = (props) => {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
};

export const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const classes = useStyles();
  const params = useParams<Params>();
  const popOverRef = useRef(null);
  const doctorId = params.id;
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [value, handleDateChange1] = useState<MaterialUiPickersDate>(new Date());
  const { pickerProps } = usePickerState(
    { value, onChange: handleDateChange1 },
    {
      getDefaultFormat: () => 'MM/dd/yyyy',
    }
  );

  /* this should be a graphql call */
  const detailsObj = {
    '1': {
      profilePicture: '',
      doctorName: 'Dr. Simran Rai',
      doctorSpeciality: 'GENERAL PHYSICIAN',
      doctorExperience: '7',
      doctorQualification: ['MS (Surgery)', 'MBBS (Internal Medicine)'],
      awards: [
        'Dr. B.C. Roy Award (2009)',
        'Wiliam E. Ladd Medical (2013)',
        'R. D. Birla Award (2014)',
      ],
      locations: ['Apollo Hospital, Jubilee Hills', 'Apollo Hospital, Banjara Hills'],
      languagesKnown: ['English', 'Hindi', 'Telugu'],
      consultingOptions: {
        online: {
          consultType: 'Online Consultation',
          fees: 299,
          availableIn: 30,
        },
        clinic: {
          consultType: 'Clinic Visit',
          fees: 499,
          availableIn: 27,
        },
      },
      isStarDoctor: true,
    },
    '2': {
      profilePicture: '',
      doctorName: 'Dr. Mishra',
      doctorSpeciality: 'GENERAL PHYSICIAN',
      doctorExperience: '10',
      doctorQualification: ['MD (Surgery)'],
      awards: [
        'Dr. B.C. Roy Award (2009)',
        'Wiliam E. Ladd Medical (2013)',
        'R. D. Birla Award (2014)',
      ],
      locations: ['SLN Terminus', 'HiTECH City'],
      languagesKnown: ['English', 'Hindi', 'Telugu'],
      consultingOptions: {
        online: {
          consultType: 'Online Consultation',
          fees: 399,
          availableIn: 30,
        },
        clinic: {
          consultType: 'Clinic Visit',
          fees: 599,
          availableIn: 27,
        },
      },
      isStarDoctor: false,
    },
  };

  const doctorDetails = detailsObj[doctorId as '1' | '2'];

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.doctorDetailsPage}>
          <div className={classes.breadcrumbs}>Doctor Details</div>
          <div className={classes.doctorProfileSection}>
            <DoctorProfile
              doctorDetails={doctorDetails}
              onBookConsult={() => setIsPopoverOpen(true)}
            />
            <div className={classes.searchSection}>
              <div className={classes.sectionHeader}>
                <span>Dr. Simran’s Clinic</span>
                <span className={classes.count}>02</span>
              </div>
              <DoctorClinics doctorId={doctorId} />
              <div className={classes.sectionHeader}>
                <span>Dr. Simran’s Team</span>
                <span className={classes.count}>02</span>
              </div>
              <StarDoctorTeam doctorId={doctorId} />
              <div className={classes.sectionHeader}>
                <span>Appointment History</span>
                <span className={classes.count}>01</span>
              </div>
              <Grid spacing={2} container>
                <Grid item sm={6}>
                  <AppointmentHistory />
                </Grid>
              </Grid>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.container} ref={popOverRef}>
        <Popover
          open={isPopoverOpen}
          anchorEl={popOverRef.current}
          onClose={() => setIsPopoverOpen(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          classes={{ paper: classes.topPopover }}
        >
          <Paper>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => {
                setTabValue(newValue);
                console.log('new tab is...', newValue);
              }}
            >
              <Tab label="Consult Online" />
              <Tab label="Visit Clinic" />
            </Tabs>
            {tabValue === 0 && (
              <TabContainer>
                <Calendar {...pickerProps} />
              </TabContainer>
            )}
            {tabValue === 1 && <TabContainer>Item Two</TabContainer>}
          </Paper>
        </Popover>
      </div>
    </div>
  );
};
