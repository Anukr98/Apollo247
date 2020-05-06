import React, { useState } from 'react';
import { Theme, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton } from '@aph/web-ui-components';
import Typography from '@material-ui/core/Typography';
import { NewsletterSubscriptionForm } from './NewsletterSubscriptionForm';

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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        maxWidth: '100%',
        width: '100%',
        left: 0,
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: '100%',
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
    bottomActions: {
      display: 'flex',
      alignItems: 'center',
      '& button': {
        boxShadow: 'none',
        padding: 0,
        color: '#fc9916',
      },
    },
    contentGroup: {
      padding: 20,
      paddingTop: 0,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    noServiceRoot: {
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
  };
});

interface ArticleBannerProps {
  title: string;
  type: string;
  source: string;
  isWebView: boolean;
}

export const ArticleBanner: React.FC<ArticleBannerProps> = (props) => {
  const classes = useStyles({});
  const subRef = React.useRef(null);

  const [openSubscriptionForm, setOpenSubscriptionForm] = useState(false);

  const { title, type, source, isWebView } = props;
  return (
    <div className={classes.root}>
      <div className={classes.bannerTop}>
        <Link
          to={
            !isWebView
              ? clientRoutes.covidLanding()
              : `${clientRoutes.covidLanding()}?utm_source=mobile_app`
          }
        >
          <div className={classes.backArrow}>
            <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
            <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
          </div>
        </Link>
        <AphButton className={classes.subcribeBtn} onClick={() => setOpenSubscriptionForm(true)}>
          Subscribe
        </AphButton>
      </div>
      <div className={classes.content}>
        <h2>{title}</h2>
        <div className={classes.articleType}>{type}</div>
        <p>Sourced from {source}</p>
      </div>
      <Popover
        open={openSubscriptionForm}
        anchorEl={subRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <div className={classes.noServiceRoot}>
              <div className={classes.windowBody}>
                <Typography variant="h3">
                  <div>Subscribe?</div>
                </Typography>
                <p>Subscribe to receive the latest info on COVID 19 from Apollo247</p>
              </div>
              <NewsletterSubscriptionForm onClose={() => setOpenSubscriptionForm(false)} />
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};
