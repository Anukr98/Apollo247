import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useLoginPopupState, useAuth, useAllCurrentPatients } from 'hooks/authHooks';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    mainContainer: {
      width: 360,
      margin: '0 auto',
      paddingBottom: 0,
    },
    header: {
      width: 360,
      margin: '0 auto',
      padding: '12px 16px',
      background: '#fff',
      boxShadow: ' 0px 2px 5px rgba(128, 128, 128, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerFixed: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
    },
    mainContent: {
      background: '#fff',
      padding: 20,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: 600,
      textTransform: 'uppercase',
      lineHeight: '22px',
      padding: '10px 0',
    },
    pageHeader: {
      fontSize: 13,
      fontWeight: 600,
      textTransform: 'uppercase',
      lineHeight: '17px',
    },
    membershipCard: {
      borderRadius: 10,
      background: '#fff',
      margin: '0 0 10px',
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.16)',
      overflow: 'hidden',
      position: 'relative',
      '& >img': {
        position: 'absolute',
        top: 16,
        right: 16,
      },
      '& h4': {
        fontSize: 14,
        fontWeight: 600,
        lineHeight: '18px',
        color: '#00B38E',
        textTransform: 'uppercase',
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 10,
        color: '#000',
        lineHeight: '16px',
      },
    },
    benefitList: {
      listStyle: 'none',
      margin: 0,
      padding: '0 0 0 20px',
      height: 80,
      transition: '0.5s ease',
      overflow: 'hidden',
      '& li': {
        position: 'relative',
        fontSize: 12,
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
      },
    },
    heightFull: {
      height: '100%',
    },
    mcContent: {
      padding: 16,
      position: 'relative',
    },
    btnContainer: {
      display: 'flex',
      alignItems: 'center',
      '& a, button': {
        width: '50%',
        flex: '1 0 auto',
        borderRadius: 0,
        boxShadow: 'none',
        position: 'relative',
        background: '#FC9916',
        '&:hover': {
          background: '#FC9916',
          boxShadow: 'none',
        },
        '&:first-child': {
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
      position: 'absolute',
      bottom: 20,
      right: 30,
      fontSize: 12,
      fontWeight: 700,
      color: '#00B38E',
      lineHeight: '20px',
      display: 'block',
    },
  };
});

export const MyMembership: React.FC = (props) => {
  const classes = useStyles({});
  const [showMore, setShowMore] = React.useState<boolean>(false);
  const [isHowToAvail, setIsHowToAvail] = React.useState<boolean>(false);

  return (
    <div className={classes.mainContainer}>
      <header className={`${classes.header} ${classes.headerFixed}`}>
        <Link to="/">
          <img
            src={require('images/ic_back.svg')}
            title={'My Membership'}
            alt={'Back To Membership'}
          />
        </Link>
        <Typography component="h2" className={classes.pageHeader}>
          My Membership
        </Typography>
        <Link to="/">
          <img src={require('images/hdfc/info.svg')} title={'Information'} alt={'Information'} />
        </Link>
      </header>
      <div className={classes.mainContent}>
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
            <AphButton
              color="primary"
              variant="contained"
              href={clientRoutes.membershipPlanDetail()}
            >
              View Details
            </AphButton>
            <AphButton color="primary" variant="contained" href={clientRoutes.welcome()}>
              Explore
            </AphButton>
          </div>
        </div>
        <Typography component="h3" className={classes.sectionTitle}>
          Upgrade To Premium Plans
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
            <AphButton
              color="primary"
              variant="contained"
              href={clientRoutes.membershipPlanLocked()}
            >
              View Details
            </AphButton>
            <AphButton color="primary" variant="contained" onClick={() => setIsHowToAvail(true)}>
              How To Avail
            </AphButton>
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
