import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, Grid } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { ConfigOneApolloData } from 'strings/AppConfig';
import { GetOneApollo as MyMembershipType } from 'graphql/types/GetOneApollo';

const useStyles = makeStyles((theme: Theme) => {
  return {
    oamContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
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
      background: 'url(images/silver-oneApollo.png) no-repeat 0 0',
    },
    gold: {
      background: 'url(images/gold-oneApollo.png) no-repeat 0 0',
    },
    platinum: {
      background: 'url(images/platinum-oneApollo.png) no-repeat 0 0',
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

interface MyMembershipProps {
  myMembershipType?: MyMembershipType;
}

export const MyMembership: React.FC<MyMembershipProps> = (props: any) => {
  const { myMembershipType } = props;
	const classes = useStyles({});
	const oneApolloLink = 'https://www.oneapollo.com';
  return (
    <TabContainer>
      <div className={classes.transactionHeader}>
        <Typography component="h2">My Membership Benefits</Typography>
      </div>
      <div className={classes.benefitsContainer}>
        <Grid container spacing={2}>
          {ConfigOneApolloData.myMembershipBenefits &&
            ConfigOneApolloData.myMembershipBenefits.map((benefitsData: any, index) => {
              return (
                <Grid item md={4} xs={12} key={index}>
                  <div className={classes.benefitContent}>
                    <div className={classes.imgContainer}>
                      <img src={require(`images/${benefitsData.image}`)} alt={benefitsData.title} />
                    </div>
                    <Typography component="h3">{benefitsData.title}</Typography>
                    <Typography>{benefitsData.description}</Typography>
                  </div>
                </Grid>
              );
            })}
        </Grid>
        <Grid container spacing={3}>
          <Grid item md={6}>
            <div className={classes.creditContent}>
              <Typography component="h3">Health Credit Earnings</Typography>
              <Typography>On every pharmacy transaction at Apollo 247 earn HCs</Typography>
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
                Redeem your health credits on transactions at Apollo 247 pharmacy orders at a value
                of <span>1 HC = ₹ 1</span>
              </Typography>
            </div>
          </Grid>
        </Grid>
        {myMembershipType.tier !== 'Platinum' && (
          <div className={classes.mUpgradeContainer}>
            <Typography component="h3">Membership Upgrades</Typography>
            <Grid container spacing={3}>
              {myMembershipType.tier === 'Gold' && (
                <Grid item md={6}>
                  <div className={classes.creditContent}>
                    <div className={`${classes.membershipCard} ${classes.gold} ${classes.mCard}`}>
                      <div className={classes.mcUser}>
                        <img src={require('images/lock.svg')} alt="Membership Locked" />
                        <Typography>Gold</Typography>
                      </div>
                    </div>
                    <Typography>
                      Upgrade to gold and enjoy more benefits by satisfying either of the
                      conditions:
                    </Typography>
                    <ul className={`${classes.creditList} ${classes.goldList}`}>
                      <li>Spend Rs. 75,000 in one year period</li>
                      <li> Buy an annual gym membership from Apollo Life</li>
                    </ul>
                    <AphButton color="primary" className={classes.knowMore}>
										<a target="_blank" href={oneApolloLink}>Know More</a>
										</AphButton>
                  </div>
                </Grid>
              )}
              {(myMembershipType.tier === 'Silver' || myMembershipType.tier === 'Gold') && (
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
                      Upgrade to platinum and enjoy more benefits by satisfying either of the
                      conditions:
                    </Typography>
                    <ul className={classes.creditList}>
                      <li>Spend Rs. 2,00,000 in one year period</li>
                      <li>Maintain Gold membership for 2 consecutive years</li>
                    </ul>
                  </div>
                </Grid>
              )}
            </Grid>
          </div>
        )}
      </div>
    </TabContainer>
  );
};
