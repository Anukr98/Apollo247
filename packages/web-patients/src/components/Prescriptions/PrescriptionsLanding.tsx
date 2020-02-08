import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Header } from 'components/Header';
import { Prescriptions } from 'components/Prescriptions/Prescriptions';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: '100%',
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    tabsRoot: {
      marginLeft: 20,
      marginRight: 20,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
    },
    tabRoot: {
      fontSize: 13,
      fontWeight: 600,
      textAlign: 'center',
      padding: '11px 10px',
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

export const PrescriptionsLanding: React.FC = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(0);
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <Tabs
            value={tabValue}
            classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
            onChange={(e, newValue) => {
              setTabValue(newValue);
            }}
          >
            <Tab
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="Medicines"
            />
            <Tab
              disabled
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="Tests"
            />
          </Tabs>
          {tabValue === 0 && (
            <TabContainer>
              <Prescriptions />
            </TabContainer>
          )}
          {tabValue === 1 && <TabContainer>Test</TabContainer>}
        </div>
      </div>
    </div>
  );
};
