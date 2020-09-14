import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { clientRoutes } from 'helpers/clientRoutes';

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
      padding: 0,
    },
    msContent: {
      width: 700,
      margin: '0 auto',
      padding: '30px 0',
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
      border: '1px solid rgba(0, 0, 0, 0.2)',
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
      height: 80,
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
    availList: {
      margin: '10px 0',
      padding: '0 0 0 35px',
      listStyle: 'none',
      counterReset: 'my-counter',
      '& li': {
        padding: '10px 0',
        fontSize: 12,
        color: '#007C9D',
        fontWeight: 500,
        position: 'relative',
        counterIncrement: 'my-counter',
        '&:before': {
          content: 'counter(my-counter)',
          position: 'absolute',
          top: 10,
          left: -35,
          width: 24,
          height: 24,
          borderRadius: 5,
          background: '#007C9D',
          fontSize: 14,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
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
  };
});

export const MyMembership: React.FC = (props) => {
  const classes = useStyles({});
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [isHowToAvail, setIsHowToAvail] = React.useState<boolean>(false);

  return (
    <div className={classes.mainContainer}>
      <header className={` ${classes.header} ${classes.headerFixed}`}>
        <div className={classes.headerContent}>
          <Link to="/">
            <img
              src={require('images/ic_logo.png')}
              title={'Apollo 24x7 | HDFC'}
              alt={'Apollo 24x7 | HDFC'}
              width="70"
            />
          </Link>
          <Typography component="h1">Membership Listing</Typography>
        </div>
        <Link to="/">
          <img
            src={require('images/hdfc/hdfc-logo.svg')}
            title={'Apollo 24x7 | HDFC'}
            alt={'Apollo 24x7 | HDFC'}
            width="100"
          />
        </Link>
      </header>
      <div className={classes.container}>
        <div className={classes.mainContent}>
          <div className={classes.msContent}>
            <Typography component="h3" className={classes.sectionTitle}>
              Current Benefits
            </Typography>
            <div className={classes.membershipCard}>
              <img src={require('images/hdfc/medal.svg')} alt="" />
              <div className={classes.mcContent}>
                <Typography component="h4">Gold + Plan</Typography>
                <Typography>Benefits Available</Typography>
                <ul className={`${classes.benefitList} ${showMore ? classes.heightFull : ''}`}>
                  <li>24*7 Doctor on Call</li>
                  <li>Seamless Medicine Delivery</li>
                  <li>Patients Health Record</li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                </ul>
                <a
                  href="javascript: void(0);"
                  className={classes.more}
                  onClick={() => setShowMore(!showMore)}
                >
                  {!showMore ? <span> +3 more</span> : <span>Hide</span>}
                </a>
              </div>
              <div className={classes.btnContainer}>
                <AphButton href={clientRoutes.membershipPlanDetail()}>View Details</AphButton>
                <AphButton color="primary" variant="contained" href={clientRoutes.welcome()}>
                  Explore
                </AphButton>
              </div>
            </div>
            <Typography component="h3" className={classes.sectionTitle}>
              Premium Plans
            </Typography>
            <div className={classes.membershipCard}>
              <img src={require('images/hdfc/locked.svg')} alt="" />
              <div className={classes.mcContent}>
                <Typography component="h4">Platinum + Plan</Typography>
                <Typography>Key Features you get .. </Typography>
                <ul className={` ${classes.benefitList} ${showMore ? classes.heightFull : ''}`}>
                  <li>24*7 Doctor on Call</li>
                  <li>Seamless Medicine Delivery</li>
                  <li>Patients Health Record</li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                  <li>Lorem Ipsum </li>
                </ul>
                <a
                  href="javascript: void(0);"
                  className={classes.more}
                  onClick={() => setShowMore(!showMore)}
                >
                  {!showMore ? <span> +12 more</span> : <span>Hide</span>}
                </a>
              </div>
              <div className={classes.btnContainer}>
                <AphButton href={clientRoutes.membershipPlanLocked()}>View Details</AphButton>
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
        </div>
      </div>

      <AphDialog open={isHowToAvail} maxWidth="sm">
        <AphDialogClose
          className={classes.dialogclose}
          onClick={() => setIsHowToAvail(false)}
          title={'Close'}
        />
        <AphDialogTitle className={classes.dialogTitle}>How To Avail?</AphDialogTitle>
        <div className={classes.availContainer}>
          <Typography>Please follow these steps</Typography>
          <ul className={classes.availList}>
            <li>Complete transactions worth Rs 25000+ on Apollo 24/7</li>
            <li>
              Duration of membership is 1 year. It will be auto renewed if you spend more than Rs
              25000 within 1 year on Apollo 24/7
            </li>
          </ul>
          <AphButton color="primary">Avail Now</AphButton>
        </div>
      </AphDialog>
    </div>
  );
};
