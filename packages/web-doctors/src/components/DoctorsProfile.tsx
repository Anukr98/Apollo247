import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import { AphButton } from '@aph/web-ui-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Header } from 'components/Header';
import { DoctorProfileTab } from 'components/DoctorProfileTab';
import { AvailabilityTab } from 'components/AvailabilityTab';
import { FeesTab } from 'components/FeesTab';
import { useQuery } from 'react-apollo-hooks';
import { GET_DOCTOR_PROFILE } from 'graphql/profiles';
import { Link } from 'react-router-dom';
const AntTabs = withStyles({
  root: {
    borderBottom: '1px solid #e8e8e8',
    '& button': {
      minWidth: 120,
      width: 120,
      maxWidth: 120,
    },
  },
  indicator: {
    backgroundColor: '#02475b',
    minWidth: 120,
    width: 120,
    maxWidth: 120,
  },
})(Tabs);
export interface TabContainerProps {
  children: React.ReactNode;
}
function TabContainer(props: TabContainerProps) {
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
      borderBottom: '3px solid #02475b',
      opacity: 1,
      fontWeight: theme.typography.fontWeightBold,
    },
    highlightInactive: {
      borderBottom: 'none',
      opacity: 0.4,
      cursor: 'default',
      fontWeight: theme.typography.fontWeightMedium,
      pointerEvents: 'none',
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
      backgroundColor: '#f7f7f7',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    tabBar: {
      backgroundColor: 'transparent',
      color: theme.palette.secondary.dark,
      paddingLeft: 40,
      minWidth: 120,
      boxShadow: '0 5px 20px rgba(128,128,128,0.1)',
      '& button': {
        textTransform: 'capitalize',
        fontSize: 16,
        padding: '16px 0',
      },
    },
    none: {
      display: 'none',
    },
    tabHeading: {
      padding: '30px 40px 20px 40px',
      backgroundColor: theme.palette.secondary.contrastText,
      boxShadow: '0px 1px 5px 0 rgba(128, 128, 128, 0.3)',
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
    saveButton: {
      minWidth: 240,
      fontSize: 15,
      padding: '8px 16px',
      lineHeight: '24px',
      fontWeight: theme.typography.fontWeightBold,
      margin: theme.spacing(3, 1, 1, 0),
      backgroundColor: '#fc9916',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
    },
    tabBarHeading: {
      boxShadow: 'inset 0px 8px 6px -6px rgba(128,128,128,0.3)',
      backgroundColor: theme.palette.secondary.contrastText,
    },
  };
});

export interface DoctorsProfileProps {}

export const DoctorsProfile: React.FC<DoctorsProfileProps> = (DoctorsProfileProps) => {
  const classes = useStyles();
  const [selectedTabIndex, setselectedTabIndex] = React.useState(0);
  const { data } = useQuery(GET_DOCTOR_PROFILE);
  const tabsArray = ['Profile', 'Availability', 'Fees', ''];
  const tabsHtml = tabsArray.map((item, index) => {
    return (
      <Tab
        key={item}
        className={
          selectedTabIndex > index - 1 ? classes.highlightActive : classes.highlightInactive
        }
        label={item}
      />
    );
  });
  const onNext = () => {
    setselectedTabIndex(selectedTabIndex + 1);
  };
  const onBack = () => {
    setselectedTabIndex(selectedTabIndex - 1);
  };
  return (
    <div className={classes.profile}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        {data && data.getDoctorProfile && (
          <div>
            <div className={classes.tabHeading}>
              <Typography variant="h1">
                {selectedTabIndex === 0 && (
                  <span>{`hi dr. ${data.getDoctorProfile.profile.lastName.toLowerCase()} !`}</span>
                )}
                {selectedTabIndex === 1 && (
                  <span>{` ok dr. ${data.getDoctorProfile.profile.lastName.toLowerCase()}`}!</span>
                )}
                {selectedTabIndex === 2 && (
                  <span>{`ok dr. ${data.getDoctorProfile.profile.lastName.toLowerCase()}`}!</span>
                )}
                {selectedTabIndex === 3 && (
                  <span>{`thank you, dr. ${data.getDoctorProfile.profile.lastName.toLowerCase()} :)`}</span>
                )}
              </Typography>
              {selectedTabIndex === 0 && (
                <p>
                  It’s great to have you join us! <br /> Here’s what your patients see when they
                  view your profile
                </p>
              )}
              {selectedTabIndex === 1 && (
                <p>Now tell us what hours suit you for online and in-person consults</p>
              )}
              {selectedTabIndex === 2 && (
                <p>
                  Lastly, some money-related matters like fees, packages and how you take payments
                </p>
              )}
              {selectedTabIndex === 3 && (
                <div>
                  <p>Let’s go over now to see the Apollo24x7 portal and start consultations!</p>

                  <Link to="/calendar">
                    <AphButton
                      variant="contained"
                      color="primary"
                      classes={{ root: classes.saveButton }}
                    >
                      GET STARTED
                    </AphButton>
                  </Link>
                </div>
              )}
            </div>
            {selectedTabIndex < 3 && (
              <AppBar position="static" color="default" className={classes.tabBarHeading}>
                <AntTabs
                  value={selectedTabIndex}
                  indicatorColor="secondary"
                  className={classes.tabBar}
                >
                  {tabsHtml}
                </AntTabs>
              </AppBar>
            )}
            {selectedTabIndex === 0 && (
              <TabContainer>
                {!!data.getDoctorProfile && (
                  <DoctorProfileTab
                    // values={data.getDoctorProfile}
                    onNext={() => onNext()}
                    key={1}
                  />
                )}
              </TabContainer>
            )}
            {selectedTabIndex === 1 && (
              <TabContainer>
                {!!data.getDoctorProfile && (
                  <AvailabilityTab
                    values={data.getDoctorProfile}
                    onNext={() => onNext()}
                    onBack={() => onBack()}
                    key={2}
                  />
                )}
              </TabContainer>
            )}
            {selectedTabIndex === 2 && (
              <TabContainer>
                {!!data.getDoctorProfile && (
                  <FeesTab
                    values={data.getDoctorProfile}
                    onNext={() => onNext()}
                    onBack={() => onBack()}
                    key={3}
                  />
                )}
              </TabContainer>
            )}
            {selectedTabIndex === 3 && (
              <div className={classes.none}>
                <TabContainer>&nbsp;</TabContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
