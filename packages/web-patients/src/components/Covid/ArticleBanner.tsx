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
      backgroundColor: '#fff',
    },
    bannerTop: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '19px 20px',
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
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
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
      '&:hover': {
        backgroundColor: '#fff',
        color: '#fc9916',
      },
    },
    content: {
      padding: 20,
      paddingTop: 0,
      color: '#01475b',
      fontWeight: 500,
      [theme.breakpoints.up(1220)]: {
        padding: '34px 40px',
        marginTop: -118,
      },
      '& h2': {
        margin: 0,
        fontSize: 24,
        color: '#01475b',
        fontWeight: 600,
        [theme.breakpoints.down('xs')]: {
          lineHeight: '30px',
        },
      },
      '& p': {
        fontSize: 14,
        margin: 0,
      },
    },
    articleType: {
      fontSize: 12,
      lineHeight: '18px',
      textTransform: 'uppercase',
      paddingTop: 10,
    },
  };
});

interface ArticleBannerProps {
  title: string;
  type: string;
  source: string;
}

export const ArticleBanner: React.FC<ArticleBannerProps> = (props) => {
  const classes = useStyles();
  const { title, type, source } = props;
  return (
    <div className={classes.root}>
      <div className={classes.bannerTop}>
        <Link to={clientRoutes.covidLanding()}>
          <div className={classes.backArrow}>
            <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div>
        </Link>
        <AphButton className={classes.subcribeBtn}>Subscribe</AphButton>
      </div>
      <div className={classes.content}>
        <h2>{title}</h2>
        <div className={classes.articleType}>{type}</div>
        <p>Sourced from {source}</p>
      </div>
    </div>
  );
};
