import { Theme, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import LinearProgress from '@material-ui/core/LinearProgress';
import { findLoggedinUserDetails } from 'graphql/types/findLoggedinUserDetails';
import { LOGGED_IN_USER_DETAILS } from 'graphql/profiles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { useAuth } from 'hooks/authHooks';
import { useQuery } from 'react-apollo-hooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 65,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 9999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      padding: 20,
    },
    profileBlock: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      width: 328,
    },
    doctorImg: {
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden',
      textAlign: 'center',
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
      },
    },
    doctorInfo: {
      padding: '20px 5px',
      minHeight: 150,
    },
    customScroll: {
      padding: '0 15px',
    },
    doctorName: {
      fontSize: 20,
      fontWeight: 600,
      color: '#02475b',
    },
    bottomActions: {
      padding: 20,
    },
    popoverTile: {
      color: '#fcb716',
      fontWeight: 500,
    },
    noDoctorImage: {
      paddingBottom: 0,
    },
  };
});

export const SecretaryProfile: React.FC = (props) => {
  const classes = useStyles();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { data, error, loading } = useQuery<findLoggedinUserDetails>(LOGGED_IN_USER_DETAILS);
  const { signOut, isSigningIn } = useAuth();
  const secretary =
    data && data.findLoggedinUserDetails && data.findLoggedinUserDetails.secretaryDetails;
  if (loading) return <CircularProgress />;
  if (!data) return <div>error :(</div>;
  const doctorName = secretary && secretary.name ? _startCase(_toLower(secretary.name)) : '';

  return isSigningIn ? (
    <LinearProgress />
  ) : (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.profileBlock}>
            <div className={`${classes.doctorImg} ${classes.noDoctorImage}`}>
              <img src={require('images/no_photo.png')} alt="Doctor Profile Image" />
            </div>
            <div className={classes.doctorInfo}>
              <div className={classes.customScroll}>
                <div className={classes.doctorName}>{doctorName}</div>
                <div className={classes.doctorName}>{secretary && secretary.mobileNumber}</div>
              </div>
            </div>
            <div className={classes.bottomActions}>
              <AphButton color="primary" fullWidth onClick={() => setIsDialogOpen(true)}>
                Logout
              </AphButton>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogTitle className={classes.popoverTile}>Apollo 24x7</DialogTitle>
        <DialogContent>
          <DialogContentText>You are successfully Logged out from Apollo 24x7</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={() => {
              signOut(); // kills firebase token.
              setIsDialogOpen(false);
            }}
            autoFocus
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
