import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useState } from 'react';
import { MyProfile } from 'components/MyAccount/MyProfile';
import { useCurrentPatient } from 'hooks/authHooks';
import { NavigationBottom } from 'components/NavigationBottom';
import { LinearProgress } from '@material-ui/core';
import { BottomLinks } from 'components/BottomLinks';
import { ConsultPayments } from 'components/MyAccount/Payments/ConsultPayments';
import { PharmacyPayments } from 'components/MyAccount/Payments/PharmacyPayments';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    myPaymentPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
      },
    },
    myPaymentSection: {
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
        paddingTop: 56,
        paddingRight: 0,
      },
    },
    pageLoader: {
      position: 'absolute',
      top: 0,
      width: '100%',
    },
    pageGroup: {
      [theme.breakpoints.up('sm')]: {
        backgroundColor: '#fff',
        borderRadius: 5,
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      },
    },
    tabsRoot: {
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
      color: '#658f9b',
      opacity: 1,
      textTransform: 'none',
    },
    tabSelected: {
      color: '#02475b',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 5,
    },
    rootTabContainer: {
      padding: 0,
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const MyPayments: React.FC = (props) => {
  const classes = useStyles({});
  const [tabValue, setTabValue] = useState<number>(0);
  const patient = useCurrentPatient();
  if (!patient)
    return (
      <div className={classes.pageLoader}>
        <LinearProgress />
      </div>
    );

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.myPaymentPage}>
          <div className={classes.myPaymentSection}>
            <div className={classes.leftSection}>
              <MyProfile />
            </div>
            <div className={classes.rightSection}>
              <div className={classes.pageGroup}>
                <Tabs
                  value={tabValue}
                  classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
                  onChange={(e, newValue) => {
                    setTabValue(newValue);
                  }}
                >
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label={`Consult Payments`}
                    value={0}
                  />
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label={`Pharmacy Payments`}
                    value={1}
                  />
                </Tabs>

                {tabValue === 0 && (
                  <TabContainer>
                    <ConsultPayments />
                  </TabContainer>
                )}
                {tabValue === 1 && (
                  <TabContainer>
                    <PharmacyPayments />
                  </TabContainer>
                )}
              </div>  
            </div>
          </div>
        </div>
      </div>
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      <NavigationBottom />
    </div>
  );
};
