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
  GetDoctorProfile_getDoctorProfile_consultationHours,
  GetDoctorProfile_getDoctorProfile,
} from 'graphql/types/getDoctorProfile';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';

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
      minWidth: '120px',
      margin: theme.spacing(1),
      '&:hover': {
        backgroundColor: '#fcb716',
      },
    },
    backButton: {
      minWidth: '120px',
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(1),
      '&:hover': {
        backgroundColor: '#fff',
      },
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
      paddingTop: '15px',
      textAlign: 'right',
      '& button': {
        padding: '9px 16px',
      },
    },
    btnActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.secondary.contrastText,
      margin: theme.spacing(1, 1, 1, 0),
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
interface ConsultationHoursProps {
  values: GetDoctorProfile_getDoctorProfile;
}

export const ConsultationHours: React.FC<ConsultationHoursProps> = ({ values }) => {
  const classes = useStyles();
  const data = values;
  function convertTime(time: string) {
    return new Date('1970-01-01T' + time).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  const AvailabilityHtml =
    data && data.consultationHours
      ? data.consultationHours.map(
          (item: GetDoctorProfile_getDoctorProfile_consultationHours, index: number) => {
            return (
              <div key={index.toString()} className={classes.tabContent}>
                <ExpansionPanel>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
                  >
                    <div className={classes.columnTime}>
                      <Typography className={classes.primaryHeading}>{`${convertTime(
                        item.startTime
                      )} - ${convertTime(item.endTime)}`}</Typography>
                    </div>
                    <div className={classes.columnDays}>
                      <Typography className={classes.heading}>
                        {item.days} | {item.availableForPhysicalConsultation && 'Physical'}
                        {item.availableForPhysicalConsultation &&
                          item.availableForVirtualConsultation &&
                          ', '}
                        {item.availableForVirtualConsultation && 'Online'}
                      </Typography>
                    </div>
                    {item.type && item.type !== '' && (
                      <div className={classes.columnType}>(FIXED)</div>
                    )}
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
                        <div>
                          <Typography variant="h5" className={classes.timeForm}>
                            Which days you wish to apply these hours to?
                          </Typography>
                          <DaySelector selectedDays={item.days} />
                        </div>
                        <div>
                          <Typography variant="h5" className={classes.timeForm}>
                            What type of consults will you be available for?
                          </Typography>
                          <AphButton
                            variant="contained"
                            classes={
                              item.availableForPhysicalConsultation
                                ? { root: classes.btnActive }
                                : { root: classes.btnInactive }
                            }
                          >
                            Physical
                          </AphButton>

                          <AphButton
                            variant="contained"
                            classes={
                              item.availableForVirtualConsultation
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
                              classes={{ root: classes.backButton }}
                              //onClick={() => onBack()}
                            >
                              CANCEL
                            </AphButton>
                            <AphButton
                              variant="contained"
                              color="primary"
                              classes={{ root: classes.saveButton }}
                              //onClick={() => onNext()}
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
