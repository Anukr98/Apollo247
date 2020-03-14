import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      paddingLeft: 0,
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
        fontWeight: 500,
      },
      '& h6': {
        color: '#658f9b',
        padding: '5px 5px 0 0',
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
      '& h3': {
        color: '#658f9b !important',
        marginLeft: '20px !important',
      },
    },
    subtitle1: {
      fontWeight: 500,
      color: '#658f9b',
      fontSize: '16px',
      paddingBottom: '0',
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
      marginTop: 0,
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
      flexBasis: '60%',
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
      fontWeight: theme.typography.fontWeightMedium,
      color: '#02475b',
      marginLeft: 20,
      fontSize: 16,
      marginBottom: 18,
    },
    accountDetails: {
      fontWeight: theme.typography.fontWeightMedium,
      color: '#02475b !important',
      display: 'inline-block',
      width: '70%',
      fontSize: 14,
      '& h5': {
        fontWeight: 500,
      },
    },
    accountDetailsHeading: {
      color: '#658F9B',
      fontSize: 12,
      display: 'inline-block',
      width: '25%',
      fontWeight: 'normal',
    },
    topBorder: {
      borderTop: 'solid 1px rgba(101,143,155,0.2)',
      width: '100%',
      paddingTop: 20,
      marginTop: '-5px',
    },
    pointerNone: {
      pointerEvents: 'none',
    },
    helpTxt: {
      color: '#0087ba',
      fontSize: 16,
      lineHeight: 1.38,
      fontWeight: 500,
    },
    orange: {
      color: '#fc9916',
      fontWeight: 700,
    },
    navLeftIcon: {
      position: 'relative',
      top: 5,
      width: 'auto',
      marginRight: 10,
    },
  };
});
interface FeesProps {
  values: GetDoctorDetails_getDoctorDetails;
  onNext: () => void;
  onBack: () => void;
}
export const MyAccountFeeTab: React.FC<FeesProps> = (props) => {
  const classes = useStyles();
  const data = props.values;

  return (
    <div className={classes.ProfileContainer}>
      <Grid container spacing={0}>
        <Grid item lg={12} sm={12} xs={12}>
          <Typography variant="h2">Consultation Fees</Typography>
        </Grid>

        <Grid item lg={12} sm={12} xs={12}>
          <div className={classes.tabContent}>
            <Paper className={classes.serviceItem}>
              <Typography className={classes.subtitle1} variant="h3">
                What are your online consultation fees?
              </Typography>
              <Typography className={classes.bold}>
                {parseInt(data.onlineConsultationFees, 10) !== 0
                  ? `Rs. ${data.onlineConsultationFees}`
                  : 'N/A'}
              </Typography>
              <Typography className={classes.subtitle1} variant="h3">
                What are your physical consultation fees?
              </Typography>
              <Typography className={classes.bold}>
                {parseInt(data.physicalConsultationFees, 10) !== 0
                  ? `Rs. ${data.physicalConsultationFees}`
                  : 'N/A'}
              </Typography>
              <Typography className={classes.subtitle1} variant="h3">
                What packages do you offer your patients?
              </Typography>
              <Typography className={classes.bold}>
                {data.packages &&
                data.packages.length > 0 &&
                data.packages![0]!.name &&
                data.packages![0]!.name.length > 0
                  ? data.packages![0]!.name
                  : 'N/A'}
              </Typography>
            </Paper>
          </div>
        </Grid>
      </Grid>
      {localStorage.getItem('loggedInMobileNumber') === data.mobileNumber &&
        data.bankAccount &&
        data.bankAccount.length > 0 && (
          <Grid container spacing={0}>
            <Grid item lg={12} sm={12} xs={12}>
              <Typography variant="h2">Payment Details</Typography>
            </Grid>

            <Grid item lg={12} sm={12} xs={12}>
              <div className={classes.tabContent}>
                <ExpansionPanel className={`${classes.serviceItem}`}>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
                  >
                    <div className={classes.columnAC}>
                      <Typography className={classes.heading}>
                        A/C Number:{' xxxx xxxx xxxx '}
                        {data.bankAccount &&
                          data.bankAccount![0]!.accountNumber.substr(
                            data.bankAccount && data.bankAccount![0]!.accountNumber.length - 4,
                            data.bankAccount && data.bankAccount![0]!.accountNumber.length - 1
                          )}
                      </Typography>
                    </div>
                    <div>
                      <Typography className={classes.secondaryHeading}>
                        {data.bankAccount![0]!.bankName}
                      </Typography>
                    </div>
                  </ExpansionPanelSummary>

                  <ExpansionPanelDetails className={classes.serviceItem}>
                    <div className={classes.topBorder}>
                      <Grid container alignItems="flex-start" spacing={0}>
                        <Grid item lg={12} sm={12} xs={12}>
                          <div className={classes.accountDetailsHeading}>Account Holder’s Name</div>
                          <Typography className={classes.accountDetails}>
                            {data.bankAccount[0]!.accountHolderName}
                          </Typography>
                        </Grid>
                        <Grid item lg={12} sm={12} xs={12}>
                          <div className={classes.accountDetailsHeading}>IFSC Code</div>
                          <Typography className={classes.accountDetails}>
                            {data.bankAccount![0]!.IFSCcode}
                          </Typography>
                        </Grid>
                        <Grid item lg={12} sm={12} xs={12}>
                          <div className={classes.accountDetailsHeading}>Account Type</div>
                          <Typography className={classes.accountDetails}>
                            {data.bankAccount![0]!.accountType}
                          </Typography>
                        </Grid>
                      </Grid>
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            </Grid>
          </Grid>
        )}
      <div className={classes.helpTxt}>
        <img alt="" src={require('images/ic_info.svg')} className={classes.navLeftIcon} />
        Call <span className={classes.orange}>1800 - 3455 - 3455 </span>to make any changes
      </div>
    </div>
  );
};
