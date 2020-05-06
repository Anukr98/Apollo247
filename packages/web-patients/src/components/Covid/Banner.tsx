import React, { useState } from 'react';
import { Theme, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton } from '@aph/web-ui-components';
import { NewsletterSubscriptionForm } from './NewsletterSubscriptionForm';

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
      zIndex: 2,
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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        maxWidth: '100%',
        width: '100%',
        left: '0 !important',
        display: 'flex',
        bottom: 0,
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
        marginBottom: 0,
      },
    },
    windowWrap: {
      width: '100%',
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      [theme.breakpoints.down('xs')]: {
        borderRadius: '10px 10px 0 0',
      },
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

interface BannerProps {
  isWebView: boolean;
}

export const Banner: React.FC<BannerProps> = (props) => {
  const classes = useStyles({});
  const subRef = React.useRef(null);

  const [openSubscriptionForm, setOpenSubscriptionForm] = useState(false);
  return (
    <div
      className={classes.root}
      style={{ backgroundImage: `url(${require('images/covid-banner.png')})` }}
    >
      <div className={classes.bannerTop}>
        {!props.isWebView && (
          <Link to={clientRoutes.welcome()}>
            <div className={classes.backArrow}>
              <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
            </div>
          </Link>
        )}

        <AphButton className={classes.subcribeBtn} onClick={() => setOpenSubscriptionForm(true)}>
          Subscribe
        </AphButton>
      </div>
      <div className={classes.content}>
        <h2>Coronavirus (Covid-19)</h2>
        <p>Learn more about Coronavirus, how to stay safe, and what to do if you have symptoms.</p>
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
