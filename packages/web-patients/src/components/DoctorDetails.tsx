import { Theme, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState, useRef } from 'react';
import { useParams } from 'hooks/routerHooks';
import _get from 'lodash/get';
import { DoctorProfile } from 'components/DoctorProfile';
import { DoctorClinics } from 'components/DoctorClinics';
import { StarDoctorTeam } from 'components/StarDoctorTeam';
import { AppointmentHistory } from 'components/AppointmentHistory';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { DatePicker, MuiPickersUtilsProvider, MaterialUiPickersDate } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { usePickerState, TimePickerView, Calendar } from '@material-ui/pickers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
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
    bottomMenuRoot: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      bottom: 0,
      height: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& button': {
        padding: '10px 0',
      },
    },
    labelRoot: {
      width: '100%',
    },
    iconLabel: {
      fontSize: 12,
      color: '#67919d',
      paddingTop: 10,
      textTransform: 'uppercase',
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
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

const TabContainer = (props: TabContainerProps) => {
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
  const [showConsultPopup, setShowConsultPopup] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [selectedDate, handleDateChange] = useState(new Date());
  const [value, handleDateChange1] = useState<MaterialUiPickersDate>(new Date());
  const { pickerProps, wrapperProps, inputProps } = usePickerState(
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

  const doctorDetails = _get(detailsObj, doctorId);

  console.log(showConsultPopup, selectedDate);

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container} ref={popOverRef}>
        <DoctorProfile
          doctorDetails={doctorDetails}
          showConsultPopup={(isPopoverOpen) => setIsPopoverOpen(isPopoverOpen)}
        />
        <DoctorClinics doctorId={doctorId} />
        <StarDoctorTeam doctorId={doctorId} />
        <AppointmentHistory />

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
