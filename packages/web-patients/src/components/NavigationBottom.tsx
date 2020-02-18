import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import { BottomNavigation, Theme, Dialog, DialogContent } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      bottom: 0,
      height: 'auto',
      boxShadow: '0 -10px 30px 0 rgba(0, 0, 0, 0.6)',
      [theme.breakpoints.up(991)]: {
        display: 'none',
      },
      '& button': {
        padding: '10px 0',
      },
    },
    labelRoot: {
      width: '100%',
      minWidth: 'auto',
      padding: 0,
    },
    iconLabel: {
      fontSize: 10,
      color: '#67919d',
      paddingTop: 6,
      textTransform: 'uppercase',
      [theme.breakpoints.down(420)]: {
        fontSize: 8,
      },
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },
    logoutModal: {
      padding: '12px 0',
      '& h3': {
        fontSize: 18,
        fontWeight: 500,
        margin: 0,
      },
    },
    bottomActions: {
      textAlign: 'right',
      paddingTop: 20,
      '& button': {
        marginLeft: 15,
      },
    },
  };
});

export const NavigationBottom: React.FC = (props) => {
  const classes = useStyles();
  const { signOut } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <BottomNavigation showLabels className={classes.root}>
      <BottomNavigationAction
        component={Link}
        label="Consult Room"
        icon={<img src={require('images/bottom-nav/ic_appointments.svg')} />}
        to={clientRoutes.appointments()}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="Health Records"
        component={Link}
        to={clientRoutes.healthRecords()}
        icon={<img src={require('images/bottom-nav/ic_myhealth.svg')} />}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="Medicines"
        component={Link}
        to={clientRoutes.medicines()}
        icon={<img src={require('images/bottom-nav/ic_medicines.svg')} />}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="Tests"
        icon={<img src={require('images/bottom-nav/ic_tests.svg')} />}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <BottomNavigationAction
        label="My Account"
        component={Link}
        to={clientRoutes.healthRecords()}
        icon={<img src={require('images/bottom-nav/ic_account.svg')} />}
        onClick={() => setIsDialogOpen(true)}
        classes={{
          root: classes.labelRoot,
          label: classes.iconLabel,
          selected: classes.iconSelected,
        }}
      />
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogContent>
          <div className={classes.logoutModal}>
            <h3>You are successfully Logged in with Apollo 24x7</h3>
            <div className={classes.bottomActions}>
              <AphButton color="secondary" onClick={() => setIsDialogOpen(false)} autoFocus>
                Cancel
              </AphButton>
              <AphButton color="primary" onClick={() => signOut()}>
                Sign out
              </AphButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </BottomNavigation>
  );
};
