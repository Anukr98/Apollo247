import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphButton } from '@aph/web-ui-components';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { GetDoctorProfile_getDoctorProfile } from 'graphql/types/GetDoctorProfile';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      paddingLeft: 15,
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
        paddingTop: 0,
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
      '& h5': {
        padding: '5px 5px 3px 20px',
        color: '#658f9b',
      },
      '& h6': {
        color: '#658f9b',
        padding: '5px 5px 5px 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontWeight: theme.typography.fontWeightMedium,
        '& span': {
          padding: '0 2px',
        },
      },
    },
    tabContent: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: '10px 0',
      position: 'relative',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: '30px',
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
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
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
      marginBottom: 30,
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
      margin: theme.spacing(1, 1, 0, 1),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
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
      borderTop: 'solid 2px rgba(101,143,155,0.2)',
      marginTop: 30,
      paddingTop: 10,
      textAlign: 'right',
    },
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    heading: {
      fontSize: 18,
      color: '#02475b',
      fontWeight: theme.typography.fontWeightMedium,
    },
    secondaryHeading: {
      fontSize: 14,
      color: 'rgba(2, 71, 91, 0.6)',
      fontWeight: 600,
      paddingTop: 3,
    },
    icon: {
      verticalAlign: 'bottom',
      height: 20,
      width: 20,
    },
    details: {
      alignItems: 'center',
    },
    column: {
      flexBasis: '50%',
    },
    columnDays: {
      flexBank: '60%',
    },
    columnAC: {
      flexBasis: '40%',
    },
    columnType: {
      flexBasis: '10%',
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
      color: '#02475b',
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
      color: '#02475b',
      marginLeft: 20,
    },
    pointerNone: {
      pointerEvents: 'none',
    },
  };
});
interface FeesProps {
  values: GetDoctorProfile_getDoctorProfile;
  onNext: () => void;
  onBack: () => void;
}
export const FeesTab: React.FC<FeesProps> = ({ values, onNext, onBack }) => {
  const classes = useStyles();
  const data = values;

  return (
    <div className={classes.ProfileContainer}>
      <Grid container alignItems="flex-start" spacing={0}>
        <Grid item lg={2} sm={6} xs={12}>
          <Typography variant="h2">Consultation Fees</Typography>
        </Grid>

        <Grid item lg={10} sm={6} xs={12}>
          <div className={classes.tabContent}>
            <Paper className={classes.serviceItem}>
              <Typography variant="subtitle1">What are your online consultation fees?</Typography>
              <Typography className={classes.bold}>
                Rs. {data.profile.onlineConsultationFees}
              </Typography>
              <Typography variant="subtitle1">What are your physical consultation fees?</Typography>
              <Typography className={classes.bold}>
                Rs. {data.profile.physicalConsultationFees}
              </Typography>
              <Typography variant="subtitle1">What packages do you offer your patients?</Typography>
              <Typography className={classes.bold}>{data.profile.package}</Typography>
            </Paper>
          </div>
        </Grid>
      </Grid>
      {data.paymentDetails && data.paymentDetails.length > 0 && (
        <Grid container alignItems="flex-start" spacing={0}>
          <Grid item lg={2} sm={6} xs={12}>
            <Typography variant="h2">Payment Method</Typography>
          </Grid>

          <Grid item lg={10} sm={6} xs={12}>
            <div className={classes.tabContent}>
              <ExpansionPanel className={`${classes.pointerNone} ${classes.serviceItem}`}>
                <ExpansionPanelSummary
                  expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
                >
                  <div className={classes.columnAC}>
                    <Typography className={classes.heading}>
                      A/C Number: {data.paymentDetails[0].accountNumber}
                    </Typography>
                  </div>
                  <div>
                    <Typography className={classes.secondaryHeading}>
                      {data.paymentDetails[0].address}
                    </Typography>
                  </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                  <div className={classes.column}>
                    <Typography variant="h5">More bank details.</Typography>
                  </div>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          </Grid>
        </Grid>
      )}

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
