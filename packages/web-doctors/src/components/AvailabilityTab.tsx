import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { AphButton } from '@aph/web-ui-components';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
//import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: '15px',
      },
      '& h3': {
        lineHeight: '22px',
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
      marginBottom: '30px',
    },
    tabContentPanel: {
      backgroundColor: '#fff !important',
    },
    starDoctors: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      overflow: 'hidden',
      position: 'absolute',
      left: '10px',
      '& h4': {
        borderBottom: 'none',
      },
    },
    tabLeftcontent: {
      padding: '10px 5px 10px 5px',
    },
    availabletabContent: {
      padding: theme.spacing(1, 0),
    },
    avatarBlock: {
      overflow: 'hidden',
      borderRadius: '10px 0 0 0',
    },
    bigAvatar: {
      width: '100%',
    },
    profileImg: {
      height: '80px',
    },
    tabContentStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: '10px',
      position: 'relative',
      paddingLeft: '90px',
      minHeight: '100px',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: '30px',
      marginRight: '10px',
    },
    saveButton: {
      minWidth: '300px',
      marginTop: '20px',
      float: 'right',
    },
    addDocter: {
      marginTop: '20px',
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
      marginTop: '30px',
    },
    btnActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.secondary.contrastText,
      margin: theme.spacing(1, 1, 1, 0),
    },
    btnInactive: {
      backgroundColor: '#fff',
      color: '#00b38e',
      margin: theme.spacing(1, 1, 1, 0),
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
      paddingTop: '4px',
    },
    columnTime: {
      flexBasis: '30%',
    },
    columnType: {
      flexBasis: '10%',
      paddingTop: '4px',
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
        fontSize: '20px',
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
      fontSize: '16px',
      color: '#658f9b',
      padding: '20px 20px 0 0',
      fontWeight: theme.typography.fontWeightMedium,
    },
    footerButtons: {
      textAlign: 'right',
      paddingTop: '15px',
      '& button': {
        fontSize: '15px',
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
    pointerNone: {
      pointerEvents: 'none',
    },
  };
});
interface Props {
  values: any;
  proceedHadler: () => void;
}
export const AvailabilityTab: React.FC<Props> = ({ values, proceedHadler }) => {
  const classes = useStyles();
  const [data, setData] = useState(values);
  const [sp, setsp] = useState<string>('Physical');
  const [showOperatingHoursForm, setShowOperatingHoursForm] = useState<boolean>(false);

  interface consultItem {
    key: string;
    value: string;
    selected: boolean;
  }
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
  const [consultType, setVonsultType] = useState<consultItem>(consultTypeArr);
  const consultTypeHtml = consultType.map((item, index) => {
    return (
      <AphButton
        key={item.key}
        variant="contained"
        value={item.value}
        classes={item.selected ? { root: classes.btnActive } : { root: classes.btnInactive }}
        onClick={(e) => {
          console.log(e);
        }}
      >
        {item.value}
      </AphButton>
    );
  });
  function getConsultTypeHTML() {
    return (
      <div>
        <Typography variant="h5">What type of consults will you be available for?</Typography>
        {consultTypeHtml}
      </div>
    );
  }
  interface weekItem {
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
  const [week, setWeek] = useState<weekItem>(weekArr);
  const dayClickHandler = (key) => {
    const updatedWeekArr = weekArr.map((day) => {
      if (day.key === key) {
        console.log(day.selected, !day.selected);
        day.selected = !day.selected;
      }
      return day;
    });
    setWeek(updatedWeekArr);
  };
  const weekHtml = week.map((item, index) => {
    return (
      <AphButton
        key={item.key.toString()}
        variant="contained"
        //value={item.value}
        classes={item.selected ? { root: classes.btnActive } : { root: classes.btnInactive }}
        onClick={() => {
          dayClickHandler(item.key);
        }}
      >
        {item.value}
      </AphButton>
    );
  });
  function getWeekHTML() {
    return (
      <div>
        <Typography variant="h5" className={classes.timeForm}>
          Which days you wish to apply these hours to?
        </Typography>
        {weekHtml}
      </div>
    );
  }
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
          <div>{getWeekHTML()}</div>
          <div>{getConsultTypeHTML()}</div>
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
          <div>{getConsultTypeHTML()}</div>
        </Grid>
      </Grid>
      <Grid container className={classes.availabletabContent} alignItems="flex-start">
        <Grid item lg={2} sm={6} xs={12}>
          <Typography variant="h2">Consultation Hours</Typography>
        </Grid>
        <Grid item lg={10} sm={6} xs={12}>
          <div className={classes.tabContent}>
            <ExpansionPanel className={`${classes.tabContentPanel} ${classes.pointerNone}`}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
                aria-controls="panel1c-content"
                id="panel1c-header"
              >
                <div className={classes.columnTime}>
                  <Typography className={classes.primaryHeading}>9:00 AM - 12:30 PM</Typography>
                </div>
                <div className={classes.columnDays}>
                  <Typography className={classes.heading}>
                    Mon, Tue, Wed, Thur, Fri | Online, Physical
                  </Typography>
                </div>
                <div className={classes.columnType}>(Fixed)</div>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.details}>
                {getDetails()}
              </ExpansionPanelDetails>
              <Divider />
            </ExpansionPanel>
          </div>
          {showOperatingHoursForm && (
            <div className={classes.tabContent}>
              <div className={classes.addAvailabilitydetails}>
                {getDetails()}
                <Divider />
                <div display="flex" className={classes.footerButtons}>
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
                classes={{ root: classes.btnAddDoctor }}
                onClick={(e) => setShowOperatingHoursForm(!showOperatingHoursForm)}
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
            classes={{ root: classes.saveButton }}
            onClick={proceedHadler()}
          >
            SAVE AND PROCEED
          </AphButton>
        </Grid>
      </Grid>
    </div>
  );
};
