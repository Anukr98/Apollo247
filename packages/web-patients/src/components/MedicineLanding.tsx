import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Header } from 'components/Header';
import { SearchMedicines } from 'components/SearchMedicines';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
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

export const MedicineLanding: React.FC = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(0);
  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
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
              <SearchMedicines />
            </TabContainer>
          )}
          {tabValue === 1 && <TabContainer>Test</TabContainer>}
        </div>
      </div>
    </div>
  );
};
