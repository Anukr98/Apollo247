import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Header } from 'components/Header';
import { DoctorProfileTab } from 'components/DoctorProfileTab';
import { AvailabilityTab } from 'components/AvailabilityTab';
import { FeesTab } from 'components/FeesTab';
import { useQuery } from 'react-apollo-hooks';
import { GET_DOCTOR_PROFILE } from 'graphql/profiles';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
const useStyles = makeStyles((theme: Theme) => {
  return {
    profile: {
      paddingTop: 85,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 78,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      backgroundColor: theme.palette.text.primary,
    },
    tabBar: {
      backgroundColor: theme.palette.secondary.contrastText,
      color: theme.palette.secondary.dark,
      '& button': {
        textTransform: 'capitalize',
        fontSize: 16,
      },
    },
    tabHeading: {
      padding: '30px 40px 20px 40px',
      backgroundColor: theme.palette.secondary.contrastText,
      '& h1': {
        display: 'flex',
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 28,
        [theme.breakpoints.down('xs')]: {
          fontSize: 20,
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        margin: 0,
        [theme.breakpoints.down('xs')]: {
          fontSize: 15,
        },
      },
    },
  };
});

export interface DoctorsProfileProps {}

export const DoctorsProfile: React.FC<DoctorsProfileProps> = (props) => {
  const classes = useStyles();

  const [value, setValue] = React.useState(0);
  const { data, error, loading } = useQuery(GET_DOCTOR_PROFILE, {
    variables: { mobileNumber: '1234567890' },
  });

  if (loading) console.log('loading');
  if (error) console.log('Error');
  if (data) console.log('data', data);
  function handleChange(event, newValue) {
    setValue(newValue);
  }
  return (
    <div className={classes.profile}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.tabHeading}>
          <Typography variant="h1">
            <span>hi dr. rao!</span>
          </Typography>
          <p>
            It’s great to have you join us! <br /> Here’s what your patients see when they view your
            profile
          </p>
        </div>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            indicatorColor="secondary"
            className={classes.tabBar}
            onChange={handleChange}
          >
            <Tab label="Profile" />
            <Tab label="Availability" />
            <Tab label="Fees" />
          </Tabs>
        </AppBar>
        {value === 0 && (
          <TabContainer>
            <DoctorProfileTab />
          </TabContainer>
        )}
        {value === 1 && (
          <TabContainer>
            <AvailabilityTab />
          </TabContainer>
        )}
        {value === 2 && (
          <TabContainer>
            <FeesTab />
          </TabContainer>
        )}
      </div>
    </div>
  );
};
