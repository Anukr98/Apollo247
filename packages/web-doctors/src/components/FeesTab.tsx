import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphButton } from '@aph/web-ui-components';
import MenuItem from '@material-ui/core/MenuItem';
import { AphSelect } from '@aph/web-ui-components';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import _isEmpty from 'lodash/isEmpty';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/lowerCase';
import { PatientSignIn_patientSignIn_patients } from 'graphql/types/PatientSignIn'; // eslint-disable-line camelcase
import { useAuth } from 'hooks/authHooks';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
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
      '& h5': {
        padding: '5px 5px 3px 20px',
        color: '#658f9b',
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
    serviceItem: {
      padding: '0 0 10px 0',
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
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    btnContainer: {
      borderTop: 'solid 0.5px rgba(98,22,64,0.6)',
      marginTop: '30px',
    },
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      color: '#02475b',
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
    timeForm: {},
    timeDivider: {},
  };
});
interface Props {
  values: any;
  proceedHadler: () => void;
}
export const FeesTab: React.FC<Props> = ({ values, proceedHadler }) => {
  const classes = useStyles();
  const [data, setData] = useState(values);
  const [sp, setsp] = useState<string>('Physical');

  console.log(data);

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
              <Typography variant="subtitle1">Rs. 399</Typography>
              <Typography variant="subtitle1">What are your physical consultation fees?</Typography>
              <Typography variant="subtitle1">Rs. 399</Typography>
              <Typography variant="subtitle1">What packages do you offer your patients?</Typography>
              <Typography variant="subtitle1">
                3 Online Consults + 3 Physical Consults @ Rs. 999
              </Typography>
            </Paper>
          </div>
        </Grid>
      </Grid>

      <Grid container alignItems="flex-start" spacing={0}>
        <Grid item lg={2} sm={6} xs={12}>
          <Typography variant="h2">Consultation Hours</Typography>
        </Grid>

        <Grid item lg={10} sm={6} xs={12}>
          <div className={classes.tabContent}>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon className={classes.expandIcon} />}
                aria-controls="panel1c-content"
                id="panel1c-header"
              >
                <div className={classes.columnAC}>
                  <Typography className={classes.heading}>A/C Number: xxx xxx xxx 7890</Typography>
                </div>
                <div className={classes.columnBank}>
                  <Typography className={classes.secondaryHeading}>
                    State Bank of India, Powai
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

      <Grid container alignItems="flex-start" spacing={0} className={classes.btnContainer}>
        <Grid item lg={12} sm={12} xs={12}>
          <AphButton variant="contained" color="primary" classes={{ root: classes.saveButton }}>
            SAVE AND PROCEED
          </AphButton>
        </Grid>
      </Grid>
    </div>
  );
};
