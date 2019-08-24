import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { AllPatient } from './AllPatient';
import { FollowupPatients } from './FollowupPatients';
import { RegularPatients } from './RegularPatients';
import { Header } from 'components/Header';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useAuth } from 'hooks/authHooks';

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
    sortBy: {
      width: '20%',
      height: 63,
      padding: 20,
      position: 'absolute',
      right: '11%',
    },
  };
});

export interface DoctorsProfileProps {}

export const PatientLog: React.FC<DoctorsProfileProps> = (DoctorsProfileProps) => {
  const classes = useStyles();
  const [selectedTabIndex, setselectedTabIndex] = React.useState(0);
  const {
    currentPatient,
  }: { currentPatient: GetDoctorDetails_getDoctorDetails | null } = useAuth();
  const tabsArray = ['All', 'Follow Up', 'Regular'];
  const tabsHtml = tabsArray.map((item, index) => {
    return (
      <Tab
        key={item}
        className={selectedTabIndex === index ? classes.highlightActive : classes.highlightInactive}
        label={item}
        onClick={(e) => {
          setselectedTabIndex(index);
        }}
      />
    );
  });
  return (
    <div className={classes.profile}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div>
          <div className={classes.tabHeading}>
            <Typography variant="h1">
              <span>
                {currentPatient && `hello dr. ${currentPatient.lastName.toLowerCase()} :)`}
              </span>
            </Typography>
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
              <span className={classes.sortBy}>Sort BY</span>
            </AppBar>
          )}
          {selectedTabIndex === 0 && (
            <TabContainer>
              <AllPatient />
            </TabContainer>
          )}
          {selectedTabIndex === 1 && (
            <TabContainer>
              <FollowupPatients />
            </TabContainer>
          )}
          {selectedTabIndex === 2 && (
            <TabContainer>
              <RegularPatients />
            </TabContainer>
          )}
        </div>
      </div>
    </div>
  );
};
