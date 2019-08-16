import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { AphButton } from '@aph/web-ui-components';
import { ConsultationHours } from 'components/ConsultationHours';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { GetDoctorDetails_getDoctorDetails_consultHours } from 'graphql/types/GetDoctorDetails';

import { ConsultMode } from 'graphql/types/globalTypes';
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
      margin: theme.spacing(1, 1, 0, 1),
      backgroundColor: '#fc9916',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
    },
    backButton: {
      minWidth: 120,
      fontSize: 15,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(1, 1, 0, 1),
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
      borderTop: 'solid 2px rgba(101,143,155,0.2)',
      marginTop: 0,
      paddingTop: 10,
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
      fontSize: 16,
      textTransform: 'capitalize',
      fontWeight: theme.typography.fontWeightMedium,
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
  values: GetDoctorDetails_getDoctorDetails;
  onNext: () => void;
  onBack: () => void;
}
export const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ values, onNext, onBack }) => {
  const classes = useStyles();
  const data = values;
  const [showOperatingHoursForm, setShowOperatingHoursForm] = useState<boolean>(false);

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
                classes={{
                  root:
                    data.consultHours &&
                    data.consultHours!.length > 0 &&
                    data.consultHours!.some(
                      (_item: GetDoctorDetails_getDoctorDetails_consultHours | null) =>
                        _item!.consultMode === ConsultMode.PHYSICAL ||
                        _item!.consultMode === ConsultMode.BOTH
                    )
                      ? classes.btnActive
                      : classes.btnInactive,
                }}
              >
                Physical
              </AphButton>
              <AphButton
                variant="contained"
                classes={{
                  root:
                    data.consultHours &&
                    data.consultHours!.length > 0 &&
                    data.consultHours!.some(
                      (_item: GetDoctorDetails_getDoctorDetails_consultHours | null) =>
                        _item!.consultMode === ConsultMode.ONLINE ||
                        _item!.consultMode === ConsultMode.BOTH
                    )
                      ? classes.btnActive
                      : classes.btnInactive,
                }}
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
          {data && data.consultHours && data.consultHours.length && (
            <ConsultationHours values={data} />
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
