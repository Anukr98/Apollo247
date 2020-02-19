import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React from 'react';
import { MyProfile } from 'components/MyAccount/MyProfile';
import { useCurrentPatient } from 'hooks/authHooks';
import { NavigationBottom } from 'components/NavigationBottom';
import { ManageAddressBook } from 'components/MyAccount/ManageAddressBook';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    myAccountPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    myAccountSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    leftSection: {
      width: 328,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 15,
      paddingTop: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingTop: 0,
        paddingRight: 0,
      },
    },
  };
});

export const AddressBook: React.FC = (props) => {
  const classes = useStyles();
  const patient = useCurrentPatient();
  if (!patient) return null;

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.myAccountPage}>
          <div className={classes.myAccountSection}>
            <div className={classes.leftSection}>
              <MyProfile />
            </div>
            <div className={classes.rightSection}>
              <ManageAddressBook patientId={patient.id} />
            </div>
          </div>
        </div>
      </div>
      <NavigationBottom />
    </div>
  );
};
