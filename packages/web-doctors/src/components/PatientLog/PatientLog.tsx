import React, { useEffect } from 'react';
import { Theme, MenuItem } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { AllPatient } from './AllPatient';
import { Header } from 'components/Header';
import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { useAuth } from 'hooks/authHooks';
import { AphSelect } from '@aph/web-ui-components';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_PATIENT_LOG } from 'graphql/profiles';
import { GetPatientLog } from 'graphql/types/getPatientLog';
import { patientLogSort, patientLogType } from 'graphql/types/globalTypes';

const tabsArray: any = [
  {
    key: patientLogType.All,
    value: 'All',
  },
  {
    key: patientLogType.FOLLOW_UP,
    value: 'Follow Up',
  },
  {
    key: patientLogType.REGULAR,
    value: 'Regular',
  },
];
const sortByArray: any = [
  {
    key: patientLogSort.MOST_RECENT,
    value: 'Most Recent',
  },
  {
    key: patientLogSort.NUMBER_OF_CONSULTS,
    value: 'Number of Consults',
  },
  {
    key: patientLogSort.PATIENT_NAME_A_TO_Z,
    value: 'Patient Name: A to Z',
  },
  {
    key: patientLogSort.PATIENT_NAME_Z_TO_A,
    value: 'Patient Name: Z to A',
  },
];
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
      zIndex: 999,
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
      position: 'relative',
    },
    sortByTitle: {
      width: 100,
      height: 63,
      padding: 17,
      position: 'absolute',
      right: '85%',
      fontWeight: 700,
      fontSize: 16,
    },
    sortByDropdown: {
      width: '22%',
      height: 63,
      padding: 20,
      position: 'absolute',
      right: '1%',
      fontWeight: 700,
      fontSize: 16,
      paddingTop: 5,
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginLeft: -2,
      marginTop: 45,
      borderRadius: 10,
      left: '270px',
      width: 180,
      color: '#00b38e !important',
      display: 'inline-block',
      '& ul': {
        padding: '10px 0px',
        '& li': {
          fontSize: 16,
          width: 180,
          fontWeight: 500,
          color: '#02475b',
          minHeight: 'auto',
          paddingLeft: 10,
          paddingRight: 10,
          // borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:hover': {
            backgroundColor: '#f0f4f5',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    checkImg: {
      position: 'absolute',
      right: 16,
      top: 16,
    },
  };
});

export interface DoctorsProfileProps {}

export const PatientLog: React.FC<DoctorsProfileProps> = (DoctorsProfileProps) => {
  const classes = useStyles();
  const [selectedTabIndex, setselectedTabIndex] = React.useState(0);
  const [sortBy, setSortBy] = React.useState('PATIENT_NAME_A_TO_Z');
  const [patientList, setPatientList] = React.useState([]);
  const [offset, setOffset] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const {
    currentPatient,
  }: { currentPatient: GetDoctorDetails_getDoctorDetails | null } = useAuth();
  const client = useApolloClient();
  const limit = 10;
  useEffect(() => {
    setLoading(true);
    const selectedTab = tabsArray[selectedTabIndex];
    client
      .query<GetPatientLog>({
        query: GET_PATIENT_LOG,
        fetchPolicy: 'no-cache',
        variables: { limit: limit, offset: offset, sortBy: sortBy, type: selectedTab.key },
      })
      .then((_data: any) => {
        setPatientList(
          _data!.data!.getPatientLog && _data!.data!.getPatientLog !== null
            ? _data!.data!.getPatientLog
            : []
        );
        setLoading(false);
      })
      .catch((e: any) => {
        //setError('Error occured in getcasesheet api');
        console.log('Error occured creating session', e);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedTabIndex, sortBy]);

  const tabsHtml = tabsArray.map((item: any, index: number) => {
    return (
      <Tab
        key={index}
        className={selectedTabIndex === index ? classes.highlightActive : classes.highlightInactive}
        label={item.value}
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
            <p>here are all your patients</p>
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

              <span className={classes.sortByDropdown}>
                <span className={classes.sortByTitle}>Sort by:</span>
                <AphSelect
                  value={sortBy}
                  fullWidth
                  MenuProps={{
                    classes: { paper: classes.menuPopover },
                    anchorOrigin: {
                      vertical: 'top',
                      horizontal: 'right',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'right',
                    },
                  }}
                  onChange={(e) => {
                    setSortBy(e.target.value as string);
                  }}
                >
                  {sortByArray.map((item: any, index: number) => {
                    return (
                      <MenuItem
                        key={item.key}
                        value={item.key}
                        classes={{ selected: classes.menuSelected }}
                      >
                        {/* <img
                        className={classes.checkImg}
                        src={require('images/ic_unselected.svg')}
                        alt="chkUncheck"
                      /> */}
                        {item.value}
                      </MenuItem>
                    );
                  })}
                </AphSelect>
              </span>
            </AppBar>
          )}
          {loading ? (
            <Typography variant="h4">
              <span>Loading....</span>
            </Typography>
          ) : (
            <div>
              {selectedTabIndex === 0 && (
                <TabContainer>
                  <AllPatient patientData={patientList} />
                </TabContainer>
              )}
              {selectedTabIndex === 1 && (
                <TabContainer>
                  <AllPatient patientData={patientList} />
                </TabContainer>
              )}
              {selectedTabIndex === 2 && (
                <TabContainer>
                  <AllPatient patientData={patientList} />
                </TabContainer>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
