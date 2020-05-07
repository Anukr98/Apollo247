import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { DaySelector } from 'components/DaySelector';
import { AphButton, AphInput } from '@aph/web-ui-components';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import {
  GetDoctorDetails_getDoctorDetails_consultHours,
  GetDoctorDetails_getDoctorDetails,
} from 'graphql/types/GetDoctorDetails';
import Divider from '@material-ui/core/Divider';
import format from 'date-fns/format';

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
      marginBottom: 30,
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
    serviceItem: {
      position: 'relative',
      height: '100%',
      boxShadow: 'none',
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
      height: 80,
    },
    tabContentStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 10,
      position: 'relative',
      paddingLeft: '90',
      minHeight: 100,
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 30,
      marginRight: 10,
    },
    saveButton: {
      minWidth: 300,
      margin: theme.spacing(1),
      '&:hover': {
        backgroundColor: '#fc9916',
      },
    },
    backButton: {
      minWidth: 120,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(1),
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    saveBtn: {
      minWidth: 30,
      margin: theme.spacing(1),
      fontSize: 15,
      fontWeight: 600,
      color: '#fc9916',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    cosultMode: {
      color: '#658f9b',
      fontSize: 14,
      fontWeight: theme.typography.fontWeightMedium,
    },
    pointerNone: {
      pointerEvents: 'none',
    },
    cancelBtn: {
      minWidth: 30,
      margin: theme.spacing(1),
      fontSize: 15,
      fontWeight: 500,
      color: '#02575b',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    addDocter: {
      marginTop: 20,
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
      '& button': {
        padding: '0px 16px 10px 5px',
      },
    },
    btnActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.secondary.contrastText,
      margin: theme.spacing(1, 1, 1, 0),
      textTransform: 'capitalize',
      minWidth: 56,
      '&:hover': {
        backgroundColor: '#00b38e',
      },
    },
    btnInactive: {
      backgroundColor: '#fff',
      color: '#00b38e',
      margin: theme.spacing(1, 1, 1, 0),
      textTransform: 'capitalize',
      minWidth: 56,
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    heading: {
      fontSize: 14,
      color: theme.palette.secondary.dark,
      textTransform: 'capitalize',
    },
    primaryHeading: {
      fontSize: 16,
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
      padding: '20px 24px 0 20px',
    },
    column: {
      flexBasis: '100%',
    },
    columnDays: {
      flexBasis: '60%',
      paddingTop: 4,
    },
    columnTime: {
      flexBasis: '45%',
    },
    columnType: {
      flexBasis: '10%',
      paddingTop: 4,
      color: '#ff748e',
      fontWeight: theme.typography.fontWeightMedium,
      textTransform: 'uppercase',
      fontSize: 14,
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        top: 12,
        right: 20,
      },
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
    timeDivider: {},
    instructions: {
      fontSize: 12,
      color: '#ff748e',
      fontWeight: theme.typography.fontWeightMedium,
      padding: theme.spacing(2, 0, 2, 0),
    },
    feesTabResponsive: {
      '& div': {
        [theme.breakpoints.down('xs')]: {
          display: 'block',
        },
      },
    },
  };
});
interface ConsultationHoursProps {
  values: GetDoctorDetails_getDoctorDetails;
}

export const ConsultationHours: React.FC<ConsultationHoursProps> = ({ values }) => {
  const classes = useStyles({});
  const data = values;

  // converts utc to ist time.
  const convertTime = (slotTime: string) => {
    const currentDay = new Date().getDate();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const utcDate =
      new Date(
        new Date(`${currentYear}-${currentMonth}-${currentDay} ${slotTime}`).toUTCString()
      ).getTime() + +(5.5 * 60 * 60 * 1000);
    return format(utcDate, 'p');
  };

  const AvailabilityHtml =
    data && data.consultHours
      ? data.consultHours.map(
          (_item: GetDoctorDetails_getDoctorDetails_consultHours | null, index: number) => {
            const item = _item!;
            return (
              <div key={index.toString()} className={classes.tabContent}>
                <ExpansionPanel className={`${classes.serviceItem} ${classes.pointerNone}`}>
                  <ExpansionPanelSummary className={classes.feesTabResponsive}>
                    <div className={classes.columnTime}>
                      <Typography className={classes.primaryHeading}>{`${convertTime(
                        item.startTime
                      )} - ${convertTime(item.endTime)}`}</Typography>
                    </div>
                    {item && item.actualDay && (
                      <div className={classes.columnDays}>
                        <Typography className={classes.heading}>
                          {item.actualDay.toLowerCase()} &nbsp; | &nbsp;
                          <span className={classes.cosultMode}>
                            {item.consultMode === 'PHYSICAL' && 'Physical'}
                            {item.consultMode === 'BOTH' && 'Physical , Online'}
                            {item.consultMode === 'ONLINE' && 'Online'}
                          </span>
                        </Typography>
                      </div>
                    )}

                    {item.consultType && <div className={classes.columnType}>(FIXED)</div>}
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.details}>
                    <div>
                      <div className={classes.column}>
                        <Typography variant="h5">
                          <form className={classes.timeForm}>
                            Enter your preferred consult hours:
                            <AphInput
                              inputProps={{ type: 'text' }}
                              value={convertTime(item.startTime)}
                              className={classes.textField}
                            />
                            <span className={classes.timeDivider}> - </span>
                            <AphInput
                              inputProps={{ type: 'text' }}
                              value={convertTime(item.endTime)}
                              className={classes.textField}
                            />
                          </form>
                          <br />
                        </Typography>
                      </div>
                      <div>
                        {item && item.actualDay && (
                          <div>
                            <Typography variant="h5" className={classes.timeForm}>
                              Which days you wish to apply these hours to?
                            </Typography>
                            <DaySelector selectedDays={item.actualDay} />
                          </div>
                        )}

                        <div>
                          <Typography variant="h5" className={classes.timeForm}>
                            What type of consults will you be available for?
                          </Typography>
                          <AphButton
                            variant="contained"
                            classes={
                              item.consultMode === 'PHYSICAL'
                                ? { root: classes.btnActive }
                                : { root: classes.btnInactive }
                            }
                          >
                            Physical
                          </AphButton>

                          <AphButton
                            variant="contained"
                            classes={
                              item.consultMode === 'ONLINE'
                                ? { root: classes.btnActive }
                                : { root: classes.btnInactive }
                            }
                          >
                            Online
                          </AphButton>
                        </div>
                        <Typography className={classes.instructions}>
                          Note: Any addition or modification to your consultation hours will take
                          effect only after 24 hours.
                        </Typography>
                        <Grid
                          container
                          alignItems="flex-start"
                          spacing={0}
                          className={classes.btnContainer}
                        >
                          <Grid item lg={12} sm={12} xs={12}>
                            <AphButton
                              variant="contained"
                              color="primary"
                              classes={{ root: classes.cancelBtn }}
                            >
                              CANCEL
                            </AphButton>
                            <AphButton
                              variant="contained"
                              color="primary"
                              classes={{ root: classes.saveBtn }}
                            >
                              SAVE
                            </AphButton>
                          </Grid>
                        </Grid>
                      </div>
                    </div>
                  </ExpansionPanelDetails>
                  <Divider />
                </ExpansionPanel>
              </div>
            );
          }
        )
      : '';
  return <div className={classes.ProfileContainer}>{AvailabilityHtml}</div>;
};
