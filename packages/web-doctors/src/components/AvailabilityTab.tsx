import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { AphButton } from '@aph/web-ui-components';
import { ConsultationHours } from 'components/ConsultationHours';
import { GetDoctorProfile_getDoctorProfile } from 'graphql/types/getDoctorProfile';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
      },
      '& h3': {
        lineHeight: 22,
        padding: '3px 5px 5px 20px',
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 20,
        borderBottom: 'solid 0.5px rgba(98,22,64,0.2)',
      },
      '& h6': {
        color: theme.palette.secondary.main,
        padding: '5px 5px 5px 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        '& span': {
          padding: '0 2px',
        },
      },
    },
    tabContent: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 0,
      position: 'relative',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 15,
    },
    tabContentPanel: {
      backgroundColor: '#fff !important',
    },
    starDoctors: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      overflow: 'hidden',
      position: 'absolute',
      left: 10,
      '& h4': {
        borderBottom: 'none',
      },
    },
    tabLeftcontent: {
      padding: '10px 5px 10px 5px',
    },
    availabletabContent: {
      padding: 20,
    },
    avatarBlock: {
      overflow: 'hidden',
      borderRadius: '10px 0 0 0',
    },
    bigAvatar: {
      width: '100%',
    },
    profileImg: {
      height: 80,
    },
    tabContentStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 10,
      position: 'relative',
      paddingLeft: 90,
      minHeight: 100,
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 15,
      marginRight: 10,
    },
    saveButton: {
      minWidth: 300,
      fontSize: 15,
      padding: '8px 16px',
      lineHeight: '24px',
      fontWeight: theme.typography.fontWeightBold,
      margin: theme.spacing(1),
      backgroundColor: '#fc9916',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fc9916',
      },
    },
    backButton: {
      minWidth: 120,
      fontSize: 15,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(1),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    addDocter: {
      marginTop: -15,
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: theme.typography.fontWeightBold,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    btnContainer: {
      borderTop: 'solid 0.5px rgba(98,22,64,0.6)',
      marginTop: 30,
      paddingTop: 15,
      textAlign: 'right',
    },
    btnActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.secondary.contrastText,
      margin: theme.spacing(1, 1, 1, 0),
      textTransform: 'capitalize',
      fontSize: 16,
      fontWeight: theme.typography.fontWeightMedium,
      '&:hover': {
        backgroundColor: '#00b38e',
      },
    },
    btnInactive: {
      backgroundColor: '#fff',
      color: '#00b38e',
      margin: theme.spacing(1, 1, 1, 0),
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.secondary.dark,
    },
    primaryHeading: {
      fontSize: theme.typography.pxToRem(20),
      color: theme.palette.secondary.dark,
      fontWeight: theme.typography.fontWeightMedium,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },

    icon: {
      verticalAlign: 'bottom',
      height: 20,
      width: 20,
    },
    details: {
      alignItems: 'center',
      display: 'block',
    },
    column: {
      flexBasis: '100%',
    },
    columnDays: {
      flexBasis: '60%',
      paddingTop: 4,
    },
    columnTime: {
      flexBasis: '30%',
    },
    columnType: {
      flexBasis: '10%',
      paddingTop: 4,
      color: '#ff748e',
      fontWeight: theme.typography.fontWeightMedium,
    },
    helper: {
      borderLeft: `2px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 2),
    },
    link: {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    expandIcon: {
      color: '#000',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 140,
      '& input': {
        fontSize: 20,
        color: '#02475b',
        fontWeight: theme.typography.fontWeightMedium,
        paddingTop: 0,
        borderBottom: '2px solid #00b38e',
      },
    },
    addAvailabilitydetails: {
      padding: theme.spacing(2),
    },
    timeForm: {
      fontSize: 16,
      color: '#658f9b',
      padding: '20px 20px 0 0',
      fontWeight: theme.typography.fontWeightMedium,
    },
    footerButtons: {
      textAlign: 'right',
      paddingTop: 15,
      '& button': {
        fontSize: 15,
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    cancelBtn: {
      color: theme.palette.secondary.dark,
    },
    timeDivider: {},
    instructions: {
      fontSize: 12,
      color: '#ff748e',
      fontWeight: theme.typography.fontWeightMedium,
      padding: theme.spacing(2, 0, 2, 0),
    },
    consultForm: {
      fontSize: 14,
      color: 'rgba(2,71,91,0.5)',
      fontWeight: theme.typography.fontWeightMedium,
    },
    pointerNone: {
      pointerEvents: 'none',
    },
  };
});
interface AvailabilityTabProps {
  values: GetDoctorProfile_getDoctorProfile;
  onNext: () => void;
  onBack: () => void;
}
export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ values, onNext, onBack }) => {
  const classes = useStyles();
  const data = values;
  const [showOperatingHoursForm, setShowOperatingHoursForm] = useState<boolean>(false);
  const consultTypeArr = [
    {
      key: 'physical',
      value: 'Physical',
      selected: true,
    },
    {
      key: 'online',
      value: 'Online',
      selected: false,
    },
  ];
  const consultTypeHtml = consultTypeArr.map((item, index) => {
    return (
      <AphButton
        key={item.key}
        variant="contained"
        value={item.value}
        classes={item.selected ? { root: classes.btnActive } : { root: classes.btnInactive }}
      >
        {item.value}
      </AphButton>
    );
  });
  interface WeekItem {
    key: number;
    value: string;
    selected: boolean;
  }
  const weekArr: any = [
    {
      key: 0,
      value: 'SUN',
      selected: true,
    },
    {
      key: 1,
      value: 'MON',
      selected: true,
    },
    {
      key: 2,
      value: 'TUE',
      selected: false,
    },
    {
      key: 3,
      value: 'WED',
      selected: false,
    },
    {
      key: 4,
      value: 'THU',
      selected: false,
    },
    {
      key: 5,
      value: 'FRI',
      selected: false,
    },
    {
      key: 6,
      value: 'SAT',
      selected: false,
    },
  ];
  const weekHtml = weekArr.map((item: WeekItem, index: number) => {
    return (
      <AphButton
        key={item.key.toString()}
        variant="contained"
        classes={item.selected ? { root: classes.btnActive } : { root: classes.btnInactive }}
      >
        {item.value}
      </AphButton>
    );
  });
  function getDetails() {
    return (
      <div>
        <div className={classes.column}>
          <Typography variant="h5">
            <form className={classes.timeForm}>
              Enter your preferred consult hours:
              <TextField
                id="time"
                type="time"
                defaultValue="09:30"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
              <span className={classes.timeDivider}> - </span>
              <TextField
                id="time"
                type="time"
                defaultValue="12:30"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </form>
            <br />
          </Typography>
        </div>
        <div>
          <div>
            <Typography variant="h5" className={classes.timeForm}>
              Which days you wish to apply these hours to?
            </Typography>
            {weekHtml}
          </div>
          <div>
            <Typography variant="h5">What type of consults will you be available for?</Typography>
            {consultTypeHtml}
          </div>
          <Typography className={classes.instructions}>
            Note: Any addition or modification to your consultation hours will take effect only
            after 24 hours.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.ProfileContainer}>
      <Grid container className={classes.availabletabContent} alignItems="flex-start">
        <Grid item lg={2} sm={6} xs={12}>
          <Typography variant="h2">Consultation Type</Typography>
        </Grid>
        <Grid item lg={10} sm={6} xs={12}>
          <div>
            <div>
              <Typography variant="h5" className={classes.consultForm}>
                What type of consults will you be available for?
              </Typography>
              <AphButton
                variant="contained"
                classes={
                  data && data.profile && data.profile.availableForPhysicalConsultation
                    ? { root: classes.btnActive }
                    : { root: classes.btnInactive }
                }
              >
                Physical
              </AphButton>
              <AphButton
                variant="contained"
                // className={
                //   data && data.profile && data.profile.availableForVirtualConsultation
                //     ? classes.btnActive
                //     : classes.btnInactive
                // }
                classes={
                  data && data.profile && data.profile.availableForVirtualConsultation
                    ? { root: classes.btnActive }
                    : { root: classes.btnInactive }
                }
              >
                Online
              </AphButton>
            </div>
          </div>
        </Grid>
      </Grid>
      <Grid container className={classes.availabletabContent} alignItems="flex-start">
        <Grid item lg={2} sm={6} xs={12}>
          <Typography variant="h2">Consultation Hours</Typography>
        </Grid>
        <Grid item lg={10} sm={6} xs={12}>
          {data.consultationHours && data.consultationHours.length && (
            <ConsultationHours values={data} />
          )}

          {showOperatingHoursForm && (
            <div className={classes.tabContent}>
              <div className={classes.addAvailabilitydetails}>
                {getDetails()}
                <Divider />
                <div className={classes.footerButtons}>
                  <Button
                    size="small"
                    className={classes.cancelBtn}
                    onClick={(e) => setShowOperatingHoursForm(!showOperatingHoursForm)}
                  >
                    Cancel
                  </Button>
                  <Button size="small" color="primary">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
          {!showOperatingHoursForm && (
            <div className={classes.addDocter}>
              <AphButton
                variant="contained"
                color="primary"
                className={`${classes.btnAddDoctor} ${classes.pointerNone}`}
                onClick={() => setShowOperatingHoursForm(!showOperatingHoursForm)}
              >
                + ADD CONSULTATION HOURS
              </AphButton>
            </div>
          )}
        </Grid>
      </Grid>
      <Grid container alignItems="flex-start" spacing={0} className={classes.btnContainer}>
        <Grid item lg={12} sm={12} xs={12}>
          <AphButton
            variant="contained"
            color="primary"
            classes={{ root: classes.backButton }}
            onClick={() => onBack()}
          >
            BACK
          </AphButton>
          <AphButton
            variant="contained"
            color="primary"
            classes={{ root: classes.saveButton }}
            onClick={() => onNext()}
          >
            SAVE AND PROCEED
          </AphButton>
        </Grid>
      </Grid>
    </div>
  );
};
