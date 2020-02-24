import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { Header } from 'components/Header';
import { Consultations } from 'components/HealthRecords/Consultations';
import { MedicalRecords } from 'components/HealthRecords/MedicalRecords';
import { NavigationBottom } from 'components/NavigationBottom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    healthRecordsPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 0,
      },
    },
    tabsRoot: {
      marginLeft: 20,
      marginRight: 20,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0,
        marginRight: 0,
        backgroundColor: '#f7f8f5',
      },
    },
    tabRoot: {
      fontSize: 13,
      fontWeight: 600,
      textAlign: 'center',
      padding: '11px 32px',
      color: '#02475b',
      opacity: 1,
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 5,
    },
    rootTabContainer: {
      padding: 0,
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

type LandingProps = {
  location: {
    state: string;
    search: string;
  };
};

export const PHRLanding: React.FC<LandingProps> = (props) => {
  const classes = useStyles({});
  const [tabValue, setTabValue] = useState<number>(0);
  useEffect(() => {
    if (
      (props && props.location && props.location.state === 'medical') ||
      window.location.href.includes('active=medical')
    ) {
      setTabValue(1);
      window.history.pushState('', '', '');
    }
  }, [props]);
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.healthRecordsPage}>
          <Tabs
            value={tabValue}
            classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
            onChange={(e, newValue) => {
              setTabValue(newValue);
            }}
          >
            <Tab
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="Consults & Rx — 18"
            />
            <Tab
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="Medical Records — 27"
            />
          </Tabs>
          {tabValue === 0 && (
            <TabContainer>
              <Consultations />
            </TabContainer>
          )}
          {tabValue === 1 && (
            <TabContainer>
              <MedicalRecords />
            </TabContainer>
          )}
        </div>
      </div>
      <NavigationBottom />
    </div>
  );
};
