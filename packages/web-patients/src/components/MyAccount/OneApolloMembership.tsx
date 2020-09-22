import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, Grid } from '@material-ui/core';
import { Header } from 'components/Header';
import { MyProfile } from 'components/MyAccount/MyProfile';
import { NavigationBottom } from 'components/NavigationBottom';
import { BottomLinks } from 'components/BottomLinks';
import { AphButton } from '@aph/web-ui-components';

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
      width: 240,
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
    benefitsContainer: {
      padding: 30,
    },
    benefitContent: {
      textAlign: 'center',

      '& h3': {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '20px',
      },
      '& p': {
        fontSize: 12,
        fontWeight: 500,
        color: 'rgba(2,71,91,0.6)',
      },
    },
    imgContainer: {
      width: 120,
      height: 120,
      margin: '0 auto 10px',
      border: '2px solid #00B38E',
      '& img': {
        width: '100%',
        height: '100%',
      },
    },
    creditList: {
      margin: '10px 0',
      padding: 0,
      listStyle: 'none',
      '& li': {
        padding: '10px 10px 10px 30px',
        fontSize: 13,
        fontWeight: 500,
        position: 'relative',
        '&:before': {
          content: "''",
          position: 'absolute',
          top: 12,
          left: 0,
          border: '8px solid transparent',
          borderLeft: '10px solid #858585',
        },
      },
    },
    creditContent: {
      padding: '20px 0',
      '& h3': {
        fontSize: 16,
        fontWeight: 500,
        textTransform: 'uppercase',
        padding: '0 0 15px',
        borderBottom: '1px solid rgba(2,71,91,0.2)',
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        color: '#525252',
        lineHeight: '24px',
        '& span': {
          color: '#02475b',
        },
      },
    },
    tncBtn: {
      background: 'transparent',
      color: '#00B38E',
      fontSize: 12,
      fontWeight: 500,
      padding: 5,
      boxShadow: 'none',
      textTransform: 'capitalize',
      '&:hover': {
        background: 'transparent',
        color: '#00B38E',
      },
    },
    knowMore: {
      padding: 5,
      boxShadow: 'none',
      fontSize: 12,
      fontWeight: 500,
      background: '#fff',
      color: '#FC9916',
      '&:hover': {
        background: '#fff',
        color: '#FC9916',
      },
    },
    mUpgradeContainer: {
      //   padding: '30px 0',
      '& h3': {
        fontSize: 16,
        fontWeight: 500,
        textTransform: 'uppercase',
        padding: '0 0 15px',
        borderBottom: '1px solid rgba(2,71,91,0.2)',
      },
    },
    mCard: {
      width: '100%',
      padding: 20,
      textAlign: 'center',
      height: 150,
      justifyContent: 'center',
      margin: '0 0 10px',
    },
    goldList: {
      '& li': {
        '&:before': {
          borderLeftColor: '#E8AF13 !important',
        },
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const OneApolloMembership: React.FC = () => {
  const classes = useStyles({});
  const [tabValue, setTabValue] = useState<number>(0);
  return (
    <div className={classes.oamContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.oamContent}>
          <div className={classes.leftSection}>
            <MyProfile />
          </div>
          <div className={classes.rightSection}>
            <div className={classes.membershipContainer}>
              <div className={classes.membershipCardContainer}>
                <div className={`${classes.membershipCard} ${classes.silver}`}>
                  <div className={classes.mcContent}>
                    <img src={require('images/one-apollo.svg')} alt="OneApollo Membership" />
                    <div className={classes.mcUser}>
                      <Typography component="h2">Archana Singh</Typography>
                      <Typography>Silver Member</Typography>
                    </div>
                  </div>
                  <div className={classes.healthCredits}>
                    <img src={require('images/rupee.svg')} alt="Health Credits" />
                    <Typography>Available HC</Typography>
                    <Typography component="h3">316</Typography>
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
                    label={`My Membership`}
                    value={0}
                  />
                  <Tab
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label={`My Transcations`}
                    value={1}
                  />
                </Tabs>
                <div className={classes.tabContent}>
                  {tabValue === 0 && (
                    <TabContainer>
                      <div className={classes.transactionHeader}>
                        <Typography component="h2">My Membership Benefits</Typography>
                      </div>
                      <div className={classes.benefitsContainer}>
                        <Grid container spacing={2}>
                          <Grid item md={4}>
                            <div className={classes.benefitContent}>
                              <div className={classes.imgContainer}>
                                <img
                                  src={require('images/apollo-clinics.jpg')}
                                  alt="Apollo Clinics"
                                />
                              </div>
                              <Typography component="h3">Apollo Clinics</Typography>
                              <Typography>
                                Free home sample collections on clinic consultations
                              </Typography>
                            </div>
                          </Grid>
                          <Grid item md={4}>
                            <div className={classes.benefitContent}>
                              <div className={classes.imgContainer}>
                                <img
                                  src={require('images/apollo-cradle.jpg')}
                                  alt="Apollo Cradle"
                                />
                              </div>
                              <Typography component="h3">Apollo Cradle</Typography>
                              <Typography>Avail 15% discount on Health Checks</Typography>
                            </div>
                          </Grid>
                          <Grid item md={4}>
                            <div className={classes.benefitContent}>
                              <div className={classes.imgContainer}>
                                <img
                                  src={require('images/apollo-diagnostics.jpg')}
                                  alt="Apollo Diagnostics"
                                />
                              </div>
                              <Typography component="h3">Apollo Diagnostics</Typography>
                              <Typography>
                                Avail 5% discount on Lab &amp; Imaging Services in OP Diagnostics
                              </Typography>
                            </div>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={6}>
                            <div className={classes.creditContent}>
                              <Typography component="h3">Health Credit Earnings</Typography>
                              <Typography>
                                On every pharmacy transaction at Apollo 247 earn HCs
                              </Typography>
                              <ul className={classes.creditList}>
                                <li>5% of non-pharmaceutical products</li>
                                <li>10% of pharmaceutical products</li>
                                <li>10% of Apollo brand products</li>
                              </ul>
                              <AphButton color="primary" className={classes.tncBtn}>
                                T&amp;C Apply
                              </AphButton>
                            </div>
                          </Grid>
                          <Grid item md={6}>
                            <div className={classes.creditContent}>
                              <Typography component="h3">Health Credit Redemption</Typography>
                              <Typography>
                                Redeem your health credits on transactions at Apollo 247 pharmacy
                                orders at a value of <span>1 HC = ₹ 1</span>
                              </Typography>
                            </div>
                          </Grid>
                        </Grid>
                        <div className={classes.mUpgradeContainer}>
                          <Typography component="h3">Membership Upgrades</Typography>
                          <Grid container spacing={3}>
                            <Grid item md={6}>
                              <div className={classes.creditContent}>
                                <div
                                  className={`${classes.membershipCard} ${classes.gold} ${classes.mCard}`}
                                >
                                  <div className={classes.mcUser}>
                                    <img src={require('images/lock.svg')} alt="Membership Locked" />
                                    <Typography>Gold</Typography>
                                  </div>
                                </div>
                                <Typography>
                                  Upgrade to gold and enjoy more benefits by satisfying either of
                                  the conditions:
                                </Typography>
                                <ul className={`${classes.creditList} ${classes.goldList}`}>
                                  <li>Spend Rs. 75,000 in one year period</li>
                                  <li> Buy an annual gym membership from Apollo Life</li>
                                </ul>
                                <AphButton color="primary" className={classes.knowMore}>
                                  Know More
                                </AphButton>
                              </div>
                            </Grid>
                            <Grid item md={6}>
                              <div className={classes.creditContent}>
                                <div
                                  className={`${classes.membershipCard} ${classes.platinum} ${classes.mCard}`}
                                >
                                  <div className={classes.mcUser}>
                                    <img src={require('images/lock.svg')} alt="Membership Locked" />
                                    <Typography>Platinum</Typography>
                                  </div>
                                </div>
                                <Typography>
                                  Upgrade to gold and enjoy more benefits by satisfying either of
                                  the conditions:
                                </Typography>
                                <ul className={classes.creditList}>
                                  <li>Spend Rs. 2,00,000 in one year period</li>
                                  <li>Maintain Gold membership for 2 consecutive years</li>
                                </ul>
                              </div>
                            </Grid>
                          </Grid>
                        </div>
                      </div>
                    </TabContainer>
                  )}
                  {tabValue === 1 && (
                    <TabContainer>
                      <div className={classes.transactionHeader}>
                        <div className={classes.thDetails}>
                          <Typography>Total Earned</Typography>
                          <Typography component="h2">316</Typography>
                        </div>
                        <div className={classes.thDetails}>
                          <Typography>Total Redeemed</Typography>
                          <Typography component="h2">316</Typography>
                        </div>
                      </div>
                      <ul className={classes.transactionList}>
                        <li>
                          <div className={classes.tContainer}>
                            <div className={classes.tContent}>
                              <img src={require('images/credit.svg')} alt="" />
                              <div className={classes.hcDetails}>
                                <Typography component="h3">Apollo Hospitals</Typography>
                                <Typography>24 May 2020</Typography>
                              </div>
                            </div>
                            <div className={classes.transactionDetails}>
                              <Typography>
                                <span className={classes.earned}>Earned</span> 20
                              </Typography>
                              <Typography>
                                <span className={classes.redeemed}>Redeemed</span> 10
                              </Typography>
                            </div>
                          </div>
                          <Typography>
                            Billing <span>Rs.200</span>
                          </Typography>
                        </li>
                        <li>
                          <div className={classes.tContainer}>
                            <div className={classes.tContent}>
                              <img src={require('images/credit.svg')} alt="" />
                              <div className={classes.hcDetails}>
                                <Typography component="h3">Apollo Hospitals</Typography>
                                <Typography>24 May 2020</Typography>
                              </div>
                            </div>
                            <div className={classes.transactionDetails}>
                              <Typography>
                                <span className={classes.earned}>Earned</span> 20
                              </Typography>
                              <Typography>
                                <span className={classes.redeemed}>Redeemed</span> 10
                              </Typography>
                            </div>
                          </div>
                          <Typography>
                            Billing <span>Rs.200</span>
                          </Typography>
                        </li>
                        <li>
                          <div className={classes.tContainer}>
                            <div className={classes.tContent}>
                              <img src={require('images/credit.svg')} alt="" />
                              <div className={classes.hcDetails}>
                                <Typography component="h3">Apollo Hospitals</Typography>
                                <Typography>24 May 2020</Typography>
                              </div>
                            </div>
                            <div className={classes.transactionDetails}>
                              <Typography>
                                <span className={classes.earned}>Earned</span> 20
                              </Typography>
                              <Typography>
                                <span className={classes.redeemed}>Redeemed</span> 10
                              </Typography>
                            </div>
                          </div>
                          <Typography>
                            Billing <span>Rs.200</span>
                          </Typography>
                        </li>
                        <li>
                          <div className={classes.tContainer}>
                            <div className={classes.tContent}>
                              <img src={require('images/credit.svg')} alt="" />
                              <div className={classes.hcDetails}>
                                <Typography component="h3">Apollo Hospitals</Typography>
                                <Typography>24 May 2020</Typography>
                              </div>
                            </div>
                            <div className={classes.transactionDetails}>
                              <Typography>
                                <span className={classes.earned}>Earned</span> 20
                              </Typography>
                              <Typography>
                                <span className={classes.redeemed}>Redeemed</span> 10
                              </Typography>
                            </div>
                          </div>
                          <Typography>
                            Billing <span>Rs.200</span>
                          </Typography>
                        </li>
                        <li>
                          <div className={classes.tContainer}>
                            <div className={classes.tContent}>
                              <img src={require('images/credit.svg')} alt="" />
                              <div className={classes.hcDetails}>
                                <Typography component="h3">Apollo Hospitals</Typography>
                                <Typography>24 May 2020</Typography>
                              </div>
                            </div>
                            <div className={classes.transactionDetails}>
                              <Typography>
                                <span className={classes.earned}>Earned</span> 20
                              </Typography>
                              <Typography>
                                <span className={classes.redeemed}>Redeemed</span> 10
                              </Typography>
                            </div>
                          </div>
                          <Typography>
                            Billing <span>Rs.200</span>
                          </Typography>
                        </li>
                        <li>
                          <div className={classes.tContainer}>
                            <div className={classes.tContent}>
                              <img src={require('images/credit.svg')} alt="" />
                              <div className={classes.hcDetails}>
                                <Typography component="h3">Apollo Hospitals</Typography>
                                <Typography>24 May 2020</Typography>
                              </div>
                            </div>
                            <div className={classes.transactionDetails}>
                              <Typography>
                                <span className={classes.earned}>Earned</span> 20
                              </Typography>
                              <Typography>
                                <span className={classes.redeemed}>Redeemed</span> 10
                              </Typography>
                            </div>
                          </div>
                          <Typography>
                            Billing <span>Rs.200</span>
                          </Typography>
                        </li>
                      </ul>
                    </TabContainer>
                  )}
                </div>
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
