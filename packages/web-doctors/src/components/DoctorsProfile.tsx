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

function TabContainer(props: any) {
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
    highlightActive: {
      borderBottom: '2px solid #02475b',
    },
    highlightInactive: {
      borderBottom: 'none',
    },
    profile: {
      paddingTop: 68,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 62,
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
  const tabsArray = [
    {
      key: 0,
      value: 'Profile',
    },
    {
      key: 1,
      value: 'Availability',
    },
    {
      key: 2,
      value: 'Fees',
    },
  ];
  const tabsHtml = tabsArray.map((item, index) => {
    return (
      <Tab
        key={item.value}
        className={value > item.key - 1 ? classes.highlightActive : classes.highlightInactive}
        label={item.value}
      />
    );
  });
  // function handleChange(event, newValue) {
  //   setValue(newValue);
  // }
  const proceedHadler = () => {
    setValue(value + 1);
  };
  const backBtnHandler = () => {
    setValue(value - 1);
  };
  if (loading) console.log('loading');
  if (error) console.log('Error');
  //if (data) console.log('data', data);
  return (
    <div className={classes.profile}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        {!!data.getDoctorProfile && (
          <div>
            <div className={classes.tabHeading}>
              <Typography variant="h1">
                <span>
                  hi dr. {`${data.getDoctorProfile.firstName} ${data.getDoctorProfile.lastName}`}!
                </span>
              </Typography>
              <p>
                It’s great to have you join us! <br /> Here’s what your patients see when they view
                your profile
              </p>
            </div>
            <AppBar position="static" color="default">
              <Tabs value={value} indicatorColor="secondary" className={classes.tabBar}>
                {tabsHtml}
              </Tabs>
            </AppBar>
            {value === 0 && (
              <TabContainer>
                {!!data.getDoctorProfile && (
                  <DoctorProfileTab
                    values={data.getDoctorProfile}
                    proceedHadler={() => proceedHadler()}
                    key={1}
                  />
                )}
              </TabContainer>
            )}
            {value === 1 && (
              <TabContainer>
                {!!data.getDoctorProfile && (
                  <AvailabilityTab
                    values={data.getDoctorProfile}
                    proceedHadler={() => proceedHadler()}
                    backBtnHandler={() => backBtnHandler()}
                    key={2}
                  />
                )}
              </TabContainer>
            )}
            {value === 2 && (
              <TabContainer>
                {!!data.getDoctorProfile && (
                  <FeesTab
                    values={data.getDoctorProfile}
                    proceedHadler={() => proceedHadler()}
                    backBtnHandler={() => backBtnHandler()}
                    key={3}
                  />
                )}
              </TabContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
