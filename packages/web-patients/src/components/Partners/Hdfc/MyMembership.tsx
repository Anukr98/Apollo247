import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { clientRoutes } from 'helpers/clientRoutes';
import { MyProfile } from 'components/MyAccount/MyProfile';
import { Header } from 'components/Header';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';

import { useApolloClient } from 'react-apollo-hooks';

import {
  GetAllUserSubscriptionsWithPlanBenefits,
  GetAllUserSubscriptionsWithPlanBenefitsVariables,
} from 'graphql/types/GetAllUserSubscriptionsWithPlanBenefits';
import { GET_ALL_USER_SUBSCRIPTIONS_WITH_BENEFITS } from 'graphql/profiles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    mainContainer: {
      height: 'calc(100vh - 90px)',
    },
    container: {
      width: 1064,
      margin: '0 auto',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
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
    loadingContainer: {
      width: '100%',
      height: '100%',
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
    header: {
      width: 1064,
      margin: '0 auto',
      padding: '12px 16px',
      background: '#fff',
      boxShadow: ' 0px 2px 5px rgba(128, 128, 128, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    headerFixed: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      '& h1': {
        fontSize: 16,
        lineHeight: '21px',
        fontWeight: 600,
        textTransform: 'uppercase',
        margin: '0 0 0 50px',
        [theme.breakpoints.down('sm')]: {
          display: 'none',
          margin: 0,
        },
      },
    },
    mainContent: {
      background: '#fff',
      padding: '0 0 60px',
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    msContent: {
      width: 700,
      margin: '0 auto',
      padding: '0px 30px 30px 30px',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        padding: 20,
      },
    },
    cContainer: {
      boxShadow: '0px 5px 20px rgba(128, 128, 128, 0.3)',
      background: '#fff',
      borderRadius: 10,
      border: '1.5px solid #00B38E',
      padding: '20px 40px',
      display: 'flex',
      alignItems: 'center',
      margin: '0 0 10px',
      [theme.breakpoints.down('sm')]: {
        padding: 10,
      },
      '& img': {
        width: 100,
        margin: '0 60px 0 0 ',
        [theme.breakpoints.down('sm')]: {
          width: 50,
          margin: '0 15px 0 0 ',
        },
      },
    },
    cContent: {
      '& h2': {
        fontSize: 32,
        fontWeight: 700,
        color: '#00B38E',
        lineHeight: '42px',
        margin: '0 0 10px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 18,
          lineHeight: '24px',
          margin: 0,
        },
      },
      '& p': {
        fontSize: 18,
        lineHeight: '24px',
        color: '#00B38E',
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
        },
      },
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 600,
      textTransform: 'uppercase',
      lineHeight: '22px',
      padding: '20px 0',
      [theme.breakpoints.down('sm')]: {
        fontSize: 14,
        lineHeight: '22px',
        padding: '10px 0',
      },
    },
    membershipCard: {
      borderRadius: 10,
      background: '#fff',
      margin: '0 0 10px',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.16)',
      overflow: 'hidden',
      padding: 20,
      position: 'relative',

      '& >img': {
        position: 'absolute',
        top: 16,
        right: 16,
      },
      '& h4': {
        fontSize: 18,
        fontWeight: 600,
        lineHeight: '18px',
        color: '#00B38E',
        textTransform: 'uppercase',
        margin: '0 0 10px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 14,
        },
      },
      '& p': {
        fontSize: 14,
        color: '#000',
        lineHeight: '16px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
          lineHeight: '16px',
        },
      },
    },
    benefitList: {
      listStyle: 'none',
      margin: '10px 0',
      padding: '0 0 0 20px',
      transition: '0.5s ease',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridColumnGap: 30,
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        margin: 0,
      },
      '& li': {
        position: 'relative',
        fontSize: 14,
        color: 'rgb(0 124 157 / 0.8)',
        fontWeight: 700,
        padding: '5px 0',
        '&:before': {
          content: "''",
          position: 'absolute',
          top: 10,
          left: -20,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: ' rgba(51, 150, 177, 0.2)',
        },
        [theme.breakpoints.down('sm')]: {
          fontSize: 12,
        },
      },
    },
    heightFull: {
      height: '100%',
    },
    mcContent: {
      padding: 24,
      position: 'relative',
      [theme.breakpoints.down('sm')]: {
        padding: 16,
      },
    },
    btnContainer: {
      padding: '0 20px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
        padding: 0,
      },
      '& a': {
        margin: '0 0 0 30px',
        width: 150,
        '&:first-child': {
          color: '#FC9916',
        },
        '&:last-child': {
          background: '#FC9916',
          '&:hover': {
            background: '#FC9916',
          },
        },
        [theme.breakpoints.down('sm')]: {
          background: '#FC9916',
          color: '#fff',
          width: '50%',
          margin: 0,
          flex: '1 0 auto',
          borderRadius: 0,
          boxShadow: 'none',
          position: 'relative',
          '&:hover': {
            background: '#FC9916',
            boxShadow: 'none',
          },
          '&:first-child': {
            color: '#fff',
            '&:after': {
              content: "''",
              position: 'absolute',
              right: 0,
              top: 5,
              bottom: 5,
              borderRight: '1px solid #fff',
            },
          },
        },
      },
      '& button': {
        margin: '0 0 0 30px',
        width: 150,
        '&:first-child': {
          color: '#FC9916',
        },
        '&:last-child': {
          background: '#FC9916',
          '&:hover': {
            background: '#FC9916',
          },
        },
        [theme.breakpoints.down('sm')]: {
          background: '#FC9916',
          color: '#fff',
          width: '50%',
          margin: 0,
          flex: '1 0 auto',
          borderRadius: 0,
          boxShadow: 'none',
          position: 'relative',
          '&:hover': {
            background: '#FC9916',
            boxShadow: 'none',
          },
          '&:first-child': {
            color: '#fff',
            '&:after': {
              content: "''",
              position: 'absolute',
              right: 0,
              top: 5,
              bottom: 5,
              borderRight: '1px solid #fff',
            },
          },
        },
      },
    },
    dialogclose: {
      top: 16,
      right: 16,
    },
    dialogTitle: {
      '& h2': {
        textAlign: 'left',
        color: '#07AE8B',
        fontSize: 16,
        fontWeight: 500,
      },
    },
    availContainer: {
      padding: 16,
      '& p': {
        fontSize: 12,
      },
      '& button': {
        width: '100%',
      },
    },
    availDesc: {
      fontWeight: 500,
      fontSize: 14,
      color: '#007C9D',
      marginTop: 20,
    },
    availHeading: {
      fontSize: 18,
      color: '#02475B',
      fontWeight: 500,
    },
    more: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        position: 'absolute',
        bottom: 20,
        right: 30,
        fontSize: 12,
        fontWeight: 700,
        color: '#00B38E',
        lineHeight: '20px',
        display: 'block',
      },
    },
    upgradableSubscription: {
      background: `#fff url(${require('images/hdfc/locked.svg')}) no-repeat 50% 50%`,
    },
    seperator: {
      display: 'block',
      height: 1,
      border: '1px solid rgba(0, 0, 0, 0.2)',
      margin: '1em 0',
      padding: 0,
    },
    hdcHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 0 10px',
    },
  };
});

interface upgradableSubscriptionType {
  name: String;
  benefits: Array<string>;
  min_transaction_value: String;
}

export const MyMembership: React.FC = (props) => {
  const classes = useStyles({});
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [isHowToAvail, setIsHowToAvail] = React.useState<boolean>(false);
  const apolloClient = useApolloClient();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [active, setActive] = React.useState<boolean>(false);

  const [currentSubscription, setCurrentSubscription] = React.useState([]);
  const [upgradableSubscription, setUpgradableSubscription] = React.useState<
    upgradableSubscriptionType
  >();

  useEffect(() => {
    apolloClient
      .query<
        GetAllUserSubscriptionsWithPlanBenefits,
        GetAllUserSubscriptionsWithPlanBenefitsVariables
      >({
        query: GET_ALL_USER_SUBSCRIPTIONS_WITH_BENEFITS,
        variables: {
          mobile_number: localStorage.getItem('userMobileNo'),
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        setCurrentSubscription(response.data.GetAllUserSubscriptionsWithPlanBenefits.response);
        setUpgradableSubscription(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].can_upgrade_to
        );
        setActive(
          response.data.GetAllUserSubscriptionsWithPlanBenefits.response[0].subscriptionStatus ===
            'active'
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed fetching Subscription Inclusions');
      });
  }, []);

  const getMedalImage = (planName: String) => {
    if (!active) {
      return require('images/hdfc/locked.svg');
    } else if (active && planName == 'GOLD+ PLAN') {
      return require('images/hdfc/medal_gold.svg');
    } else if (active && planName == 'PLATINUM+ PLAN') {
      return require('images/hdfc/medal_platinum.svg');
    } else if (active && planName == 'SILVER+ PLAN') {
      return require('images/hdfc/medal_silver.svg');
    }
  };

  return (
    <div className={classes.mainContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.mainContent}>
          <div className={classes.leftSection}>
            <MyProfile />
          </div>
          <div className={classes.rightSection}>
            {loading ? (
              <div className={classes.loadingContainer}>
                <CircularProgress size={30} />
              </div>
            ) : (
              <div className={classes.msContent}>
                <div className={classes.membershipCard}>
                  <div className={classes.hdcHeader}>
                    <img
                      src={require('images/hdfc/apollo-hashtag.svg')}
                      alt="HDFC Call Doctor"
                      width="100"
                    />
                    <img
                      src={require('images/hdfc/hdfc-logo.svg')}
                      alt="HDFC Call Doctor"
                      width="100"
                    />
                  </div>
                  <Typography component="h3" className={classes.sectionTitle}>
                    Current Benefits
                  </Typography>
                  <div>
                    <div className={classes.mcContent}>
                      <Typography component="h4">
                        {currentSubscription &&
                          currentSubscription[0] &&
                          currentSubscription[0].name}
                      </Typography>
                      <Typography>Benefits Available</Typography>
                      <ul
                        className={`${classes.benefitList} ${showMore ? classes.heightFull : ''}`}
                      >
                        {currentSubscription &&
                          currentSubscription[0] &&
                          currentSubscription[0].benefits.map((item: any) => {
                            return <li>{item.header_content}</li>;
                          })}
                      </ul>
                      {/* <a
                      href="javascript: void(0);"
                      className={classes.more}
                      onClick={() => setShowMore(!showMore)}
                    >
                      {!showMore ? <span> +3 more</span> : <span>Hide</span>}
                    </a> */}
                    </div>
                    <div className={classes.btnContainer}>
                      <AphButton href={clientRoutes.membershipPlanDetail()}>View Details</AphButton>
                      <AphButton color="primary" variant="contained" href={clientRoutes.welcome()}>
                        Explore
                      </AphButton>
                    </div>
                  </div>

                  {upgradableSubscription ? (
                    <div className={classes.upgradableSubscription}>
                      <div className={classes.seperator} />
                      <Typography component="h3" className={classes.sectionTitle}>
                        Other Plans
                      </Typography>
                      <div>
                        <div className={classes.mcContent}>
                          <Typography component="h4">
                            {upgradableSubscription && upgradableSubscription.name}
                          </Typography>
                          <Typography>Benefits Available </Typography>
                          <ul
                            className={` ${classes.benefitList} ${
                              showMore ? classes.heightFull : ''
                            }`}
                          >
                            {upgradableSubscription &&
                              upgradableSubscription.benefits.map((item: any) => {
                                return <li>{item.header_content}</li>;
                              })}
                          </ul>
                          {/* <a
                      href="javascript: void(0);"
                      className={classes.more}
                      onClick={() => setShowMore(!showMore)}
                    >
                      {!showMore ? <span> +12 more</span> : <span>Hide</span>}
                    </a> */}
                        </div>
                        <div className={classes.btnContainer}>
                          <AphButton href={clientRoutes.membershipPlanLocked()}>
                            View Details
                          </AphButton>
                          <AphButton
                            color="primary"
                            variant="contained"
                            onClick={() => setIsHowToAvail(true)}
                          >
                            How To Avail
                          </AphButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      <NavigationBottom />

      <AphDialog open={isHowToAvail} maxWidth="sm">
        <AphDialogClose
          className={classes.dialogclose}
          onClick={() => setIsHowToAvail(false)}
          title={'Close'}
        />
        <div className={classes.availContainer}>
          <Typography component="h2" className={classes.availHeading}>
            How To Avail ?
          </Typography>
          <Typography className={classes.availDesc}>
            Complete transactions worth Rs{' '}
            {currentSubscription &&
              currentSubscription[0] &&
              currentSubscription[0].upgrade_transaction_value}{' '}
            on Apollo 24/7 app to unlock {upgradableSubscription && upgradableSubscription.name}{' '}
            membership
          </Typography>
        </div>
      </AphDialog>
    </div>
  );
};
