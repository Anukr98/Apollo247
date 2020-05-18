import React, { useContext, useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import { AphButton } from '@aph/web-ui-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { Header } from 'components/Header';
import { DoctorProfileTab } from 'components/DoctorProfileTab';
import { AvailabilityTab } from 'components/AvailabilityTab';
import { FeesTab } from 'components/FeesTab';
import { useApolloClient } from 'react-apollo-hooks';
import { useQuery } from 'react-apollo-hooks';
import Scrollbars from 'react-custom-scrollbars';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import { LoggedInUserType } from 'graphql/types/globalTypes';
import { ApolloError } from 'apollo-client';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/profiles';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
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
    lowlightActive: {
      borderBottom: '3px solid #02475b',
      opacity: 1,
      fontWeight: theme.typography.fontWeightMedium,
    },
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
      paddingTop: 64,
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
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
      },
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
      [theme.breakpoints.down('xs')]: {
        padding: '30px 20px 20px 20px',
      },
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
      boxShadow: 'inset 0px 5px 6px -6px rgba(128,128,128,0.3)',
      backgroundColor: theme.palette.secondary.contrastText,
    },
  };
});

export interface DoctorsProfileProps {}

export const DoctorsProfile: React.FC<DoctorsProfileProps> = (DoctorsProfileProps) => {
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const { currentUserId, currentUserType } = useAuthContext();
  const client = useApolloClient();
  const classes = useStyles({});
  const [userDetails, setUserDetails] = React.useState<any>();
  const [selectedTabIndex, setselectedTabIndex] = React.useState(0);
  if (currentUserId) {
    localStorage.setItem('currentUserId', currentUserId ? currentUserId : '');
  }
  const tabsArray = ['Profile', 'Availability', 'Fees', ''];
  const tabsHtml = tabsArray.map((item, index) => {
    return (
      <Tab
        key={item}
        className={
          selectedTabIndex === index
            ? classes.highlightActive
            : selectedTabIndex > index
            ? classes.lowlightActive
            : classes.highlightInactive
        }
        label={item}
      />
    );
  });

  const getDoctorDetailsById = () => {
    client
      .query<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        fetchPolicy: 'no-cache',
        variables: { id: currentUserId ? currentUserId : localStorage.getItem('currentUserId') },
      })
      .then((data) => {
        setUserDetails(data.data.getDoctorDetailsById);
      })
      .catch((error: ApolloError) => {
        console.log(error);
      });
  };
  const getDoctorDetail = () => {
    client
      .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
      .then((_data) => {
        setUserDetails(_data.data.getDoctorDetails);
      })
      .catch((e) => {
        console.log('Error occured while fetching Doctor', e);
      });
  };
  useEffect(() => {
    if (currentUserType === LoggedInUserType.SECRETARY) {
      getDoctorDetailsById();
    } else {
      if (!userDetails && currentUserType === LoggedInUserType.DOCTOR) {
        getDoctorDetail();
      }
    }
  }, []);

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
      <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 65px)' }}>
        <div className={classes.container}>
          {userDetails && (
            <div>
              <div className={classes.tabHeading}>
                <Typography variant="h1">
                  {selectedTabIndex === 0 && <span>{`hi  ${userDetails.displayName} !`}</span>}
                  {selectedTabIndex === 1 && <span>{` ok  ${userDetails.displayName}`}!</span>}
                  {selectedTabIndex === 2 && <span>{`ok  ${userDetails.displayName}`}!</span>}
                  {selectedTabIndex === 3 && (
                    <span>{`thank you, ${userDetails.displayName} :)`}</span>
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
                  {!!userDetails && <DoctorProfileTab onNext={() => onNext()} key={1} />}
                </TabContainer>
              )}
              {selectedTabIndex === 1 && (
                <TabContainer>
                  {!!userDetails && (
                    <AvailabilityTab
                      values={userDetails}
                      onNext={() => onNext()}
                      onBack={() => onBack()}
                      key={2}
                    />
                  )}
                </TabContainer>
              )}
              {selectedTabIndex === 2 && (
                <TabContainer>
                  {!!userDetails && (
                    <FeesTab
                      values={userDetails}
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
      </Scrollbars>
    </div>
  );
};
