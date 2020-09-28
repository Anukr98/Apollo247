import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, Grid } from '@material-ui/core';
import { useApolloClient } from 'react-apollo-hooks';
import { Header } from 'components/Header';
import { MyProfile } from 'components/MyAccount/MyProfile';
import { NavigationBottom } from 'components/NavigationBottom';
import { BottomLinks } from 'components/BottomLinks';
import CircularProgress from '@material-ui/core/CircularProgress';
import { GET_ONEAPOLLO_USERTXNS } from 'graphql/profiles';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { GetOneApollo, GetOneApolloVariables } from 'graphql/types/GetOneApollo';
import { GET_ONE_APOLLO } from 'graphql/medicines';
import moment from 'moment';
import { MyMembership } from 'components/MyAccount/MyMembership';
import { useQuery } from 'react-apollo-hooks';
import { getOneApolloUserTransactions } from 'graphql/types/getOneApolloUserTransactions';
import { ConfigOneApolloData } from 'strings/AppConfig';

const useStyles = makeStyles((theme: Theme) => {
  return {
    oamContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    oamContent: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: 20,
      background: '#F7F8F5',
    },
    leftSection: {
      width: '40%',
      maxWidth: 320,
    },
    rightSection: {
      padding: '0 0 0 15px',
      width: '70%',
    },
    membershipContainer: {
      background: '#fff',
      borderRadius: 5,
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      width: '100%',
    },
    membershipCardContainer: {
      padding: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    membershipCard: {
      width: 420,
      height: 220,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
      padding: 40,
    },
    silver: {
      background: 'url(images/silver-oneApollo.svg) no-repeat 0 0',
    },
    gold: {
      background: 'url(images/gold-oneApollo.svg) no-repeat 0 0',
    },
    platinum: {
      background: 'url(images/platinum-oneApollo.svg) no-repeat 0 0',
    },
    membershipContent: {},
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
    mcContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      '& img': {
        margin: '0 20px 0 0',
      },
    },
    mcUser: {
      textTransform: 'capitalize',
      '& h2': {
        fontSize: 16,
        fontWeight: 500,
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: '#525252',
      },
    },
    healthCredits: {
      width: 270,
      position: 'absolute',
      bottom: -30,
      left: 0,
      right: 0,
      padding: 20,
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0px 5px 20px rgba(128, 128, 128, 0.3)',
      display: 'flex',
      alignItems: 'center',
      margin: '0 auto',
      '& p': {
        fontSize: 16,
        fontWeight: 500,
        margin: '0 15px',
      },
      '& h3': {
        fontSize: 20,
        fontWeight: 600,
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
    tabContent: {
      //   padding: 30,
    },
    transactionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 30,
      borderBottom: '1px solid #E5E5E5',
      '& h2': {
        fontSize: 16,
        textTransform: 'uppercase',
        fontWeight: 500,
      },
    },
    thDetails: {
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '18px',
        color: '#525252',
      },
      '& h2': {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: '20px',
      },
    },
    transactionList: {
      margin: 0,
      padding: '0 30px',
      listStyle: 'none',
      maxHeight: 500,
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: 6,
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#888',
      },
      '& li': {
        padding: '20px 0',
        borderBottom: '1px solid #E5E5E5',
        '&:last-child': {
          border: 'none',
        },
        '& >p': {
          fontSize: 14,
          color: '#666666',
          paddingLeft: 50,
          '& span': {
            fontWeight: 600,
          },
        },
      },
    },
    tContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tContent: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 0 10px',
    },
    hcDetails: {
      margin: '0 0 0 20px',
      '& h3': {
        color: '#000',
        fontSize: 15,
        fontWeight: 500,
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        color: '#666666',
      },
    },
    transactionDetails: {
      '& p': {
        fontSize: 16,
        fontWeight: 600,
        textAlign: 'right',
        '& span': {
          margin: '0 10px 0 0',
        },
      },
    },
    earned: {
      color: '#00B38E',
    },
    redeemed: {
      color: '#C3202B',
    },
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const OneApolloMembership: React.FC = () => {
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const classes = useStyles({});
  const [tabValue, setTabValue] = useState<number>(0);
  const [oneApolloHc, setOneApollo] = useState<any>({});
  const [isLoading, setLoading] = useState<boolean>(true);
  const [totalEarned, setTotalEarned] = useState<number>(0);
	const [totalRedeemed, setTotalRedeemed] = useState<number>(0);
	const { error, loading, data } = useQuery<getOneApolloUserTransactions>(GET_ONEAPOLLO_USERTXNS);
	const oneApolloTrxnList = data && data.getOneApolloUserTransactions;
  useEffect(() => {
    if (currentPatient && currentPatient.id) {
      client
        .query<GetOneApollo, GetOneApolloVariables>({
          query: GET_ONE_APOLLO,
          variables: {
            patientId: currentPatient ? currentPatient.id : '',
          },
          fetchPolicy: 'no-cache',
        })
        .then((res) => {
          setLoading(false);
          if (res && res.data && res.data.getOneApolloUser) {
            const data = res.data.getOneApolloUser;
            setOneApollo(data);
            setTotalEarned(data.earnedHC);
            setTotalRedeemed(data.burnedCredits + data.blockedCredits);
          }
        })
        .catch((e) => {
          console.log( ConfigOneApolloData.apolloHcsError, e);
        });
    }
  }, [currentPatient]);
  return (
    <div className={classes.oamContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.oamContent}>
          <div className={classes.leftSection}>
            <MyProfile />
          </div>
          <div className={classes.rightSection}>
            {isLoading ? (
              <div className={classes.circlularProgress}>
                <CircularProgress />
              </div>
            ) : (
              <div className={classes.membershipContainer}>
                <div className={classes.membershipCardContainer}>
                  <div
                    className={`${classes.membershipCard} ${
                      oneApolloHc.tier === 'Gold'
                        ? classes.gold
                        : oneApolloHc.tier === 'Silver'
                        ? classes.silver
                        : classes.platinum
                    }`}
                  >
                    <div className={classes.mcContent}>
                      <img src={require('images/one-apollo.svg')} alt="OneApollo Membership" />
                      <div className={classes.mcUser}>
                        <Typography component="h2">{oneApolloHc.name}</Typography>
                        <Typography>{oneApolloHc.tier} Member</Typography>
                      </div>
                    </div>
                    <div className={classes.healthCredits}>
                      <img src={require('images/rupee.svg')} alt="Health Credits" />
                      <Typography>Available HC</Typography>
                      <Typography component="h3">{oneApolloHc.availableHC}</Typography>
                    </div>
                  </div>
                </div>
                <div className={classes.membershipContent}>
                  <Tabs
                    value={tabValue}
                    classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
                    onChange={(e, newValue) => {
                      setTabValue(newValue);
                    }}
                  >
                    <Tab
                      classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                      label="My Membership"
                      value={0}
                    />
                    <Tab
                      classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                      label="My Transcations"
                      value={1}
                    />
                  </Tabs>
                  <div className={classes.tabContent}>
                    {tabValue === 0 && <MyMembership />}
                    {tabValue === 1 && (
                      <TabContainer>
                        <div className={classes.transactionHeader}>
                          <div className={classes.thDetails}>
                            <Typography>Total Earned</Typography>
                            <Typography component="h2">{totalEarned.toFixed(2)}</Typography>
                          </div>
                          <div className={classes.thDetails}>
                            <Typography>Total Redeemed</Typography>
                            <Typography component="h2">{totalRedeemed.toFixed(2)}</Typography>
                          </div>
                        </div>
                        <ul className={classes.transactionList}>
                          {oneApolloTrxnList.length > 0 &&
                            oneApolloTrxnList.map((transaction, index) => {
                              return (
                                <li key={index}>
                                  <div className={classes.tContainer}>
                                    <div className={classes.tContent}>
                                      <img src={require('images/credit.svg')} alt="" />
                                      <div className={classes.hcDetails}>
                                        <Typography component="h3">
                                          {transaction.businessUnit}
                                        </Typography>
                                        <Typography>
                                          {moment(transaction.transactionDate).format(
                                            'DD MMM YYYY'
                                          )}
                                        </Typography>
                                      </div>
                                    </div>
                                    <div className={classes.transactionDetails}>
                                      <Typography>
                                        <span className={classes.earned}>Earned</span>{' '}
                                        {transaction.earnedHC}
                                      </Typography>
                                      <Typography>
                                        <span className={classes.redeemed}>Redeemed</span>{' '}
                                        {transaction.redeemedHC}
                                      </Typography>
                                    </div>
                                  </div>
                                  <Typography>
                                    Billing{' '}
                                    <span>
                                      Rs.{' '}
                                      {(transaction.netAmount + transaction.redeemedHC).toFixed(2)}
                                    </span>
                                  </Typography>
                                </li>
                              );
                            })}
                        </ul>
                      </TabContainer>
                    )}
                  </div>
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
    </div>
  );
};
