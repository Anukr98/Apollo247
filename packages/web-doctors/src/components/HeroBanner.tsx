import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { AphButton } from '@aph/web-ui-components';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: theme.palette.primary.contrastText,
      padding: '40px 0 80px 40px',
      position: 'relative',
      [theme.breakpoints.up('lg')]: {
        display: 'flex',
      },
      [theme.breakpoints.down('xs')]: {
        padding: '40px 20px',
      },
      [theme.breakpoints.between('sm', 'md')]: {
        paddingTop: 30,
      },
    },
    bannerInfo: {
      [theme.breakpoints.up('lg')]: {
        width: '40%',
        '& button': {
          padding: '10px 16px',
          borderRadius: 5,
          fontSize: 15,
          lineHeight: '24px',
          backgroundColor: '#fc9916',
          fontWeight: theme.typography.fontWeightBold,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#e28913',
          },
        },
      },
      '& p': {
        fontSize: 20,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
        marginTop: 40,
        marginBottom: 40,
        [theme.breakpoints.between('sm', 'md')]: {
          paddingRight: 400,
        },
        '& span': {
          fontWeight: 'bold',
          display: 'block',
        },
      },
      '& h1': {
        display: 'flex',
        [theme.breakpoints.down('xs')]: {
          fontSize: 36,
        },
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
        },
      },
    },
    bannerImg: {
      marginBottom: -190,
      textAlign: 'right',
      position: 'absolute',
      top: 90,
      right: 0,
      [theme.breakpoints.up('lg')]: {
        width: '75%',
        marginLeft: 'auto',
      },
      [theme.breakpoints.down('xs')]: {
        top: 'auto',
        bottom: 90,
      },
      [theme.breakpoints.between('sm', 'md')]: {
        width: 585,
        position: 'absolute',
        right: 0,
        bottom: 0,
        marginBottom: -150,
      },
      '& img': {
        marginTop: -15,
        maxWidth: '100%',
        [theme.breakpoints.between('sm', 'md')]: {
          marginTop: -21,
        },
        [theme.breakpoints.down('xs')]: {
          maxWidth: 281,
          marginTop: 0,
        },
      },
    },
    button: {
      [theme.breakpoints.up('sm')]: {
        minWidth: 200,
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 56,
      fontWeight: 600,
      lineHeight: '66px',
      [theme.breakpoints.down('xs')]: {
        fontSize: 36,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minWidth: 100,
      marginLeft: 30,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

export const HeroBanner: React.FC = () => {
  const classes = useStyles({});

  return (
    <div className={classes.heroBanner}>
      <div className={classes.bannerInfo}>
        <p>
          The best way to connect with your patients, grow your practice and enhance your
          professional network -<span>anytime, anywhere :)</span>
        </p>
        <ProtectedWithLoginPopup>
          {({ protectWithLoginPopup }) => (
            <AphButton
              variant="contained"
              color="primary"
              classes={{ root: classes.button }}
              onClick={() => protectWithLoginPopup()}
            >
              GET STARTED
            </AphButton>
          )}
        </ProtectedWithLoginPopup>
      </div>
      <div className={classes.bannerImg}>
        <img src={require('images/ic_doctor.svg')} alt="" />
      </div>
    </div>
  );
};
