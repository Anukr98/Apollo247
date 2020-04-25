import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'relative',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
    },
    bannerTop: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: 20,
      [theme.breakpoints.up(1220)]: {
        padding: 40,
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        width: 48,
        height: 48,
        top: 0,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
    },
    subcribeBtn: {
      visibility: 'hidden',
      marginLeft: 'auto',
      backgroundColor: '#fff',
      color: '#fc9916',
      minWidth: 148,
      borderRadius: 10,
      [theme.breakpoints.down('xs')]: {
        padding: '5px 12px',
        minWidth: 'auto',
      },
      [theme.breakpoints.up(1220)]: {
        marginTop: 20,
      },
      '&:hover': {
        backgroundColor: '#fff',
        color: '#fc9916',
      },
    },
    content: {
      padding: 20,
      paddingTop: 12,
      [theme.breakpoints.up(1220)]: {
        padding: 40,
        marginTop: -140,
      },
      '& h2': {
        margin: 0,
        fontSize: 36,
        fontWeight: 600,
        color: '#fff',
        textTransform: 'uppercase',
        [theme.breakpoints.down('xs')]: {
          lineHeight: '36px',
        },
      },
      '& p': {
        fontSize: 14,
        color: '#fff',
        margin: 0,
      },
    },
  };
});

export const Banner: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div
      className={classes.root}
      style={{ backgroundImage: `url(${require('images/covid-banner.png')})` }}
    >
      <div className={classes.bannerTop}>
        <Link to={clientRoutes.welcome()}>
          <div className={classes.backArrow}>
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div>
        </Link>
        <AphButton className={classes.subcribeBtn}>Subscribe</AphButton>
      </div>
      <div className={classes.content}>
        <h2>Covid-19</h2>
        <p>know more about Coronavirus</p>
      </div>
    </div>
  );
};
