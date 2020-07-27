import React, { useState } from 'react';
import { Popover, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton } from '@aph/web-ui-components';
import Typography from '@material-ui/core/Typography';
import { NewsletterSubscriptionForm } from './NewsletterSubscriptionForm';
import { CallOurExperts } from 'components/CallOurExperts';
import { ShareWidget } from 'components/ShareWidget';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      [theme.breakpoints.up('sm')]: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '100%',
      },
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
      '& button': {
        [theme.breakpoints.up('sm')]: {
          display: 'none',
        },
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
      color: '#01475b',
      fontWeight: 500,
      display: 'flex',
      [theme.breakpoints.up('sm')]: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        color: '#fff',
        backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), #000000 113%)',
      },
      [theme.breakpoints.up(1220)]: {
        padding: '40px 40px 34px 40px',
      },
      '& h2': {
        margin: 0,
        fontSize: 24,
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
    rightGroup: {
      marginLeft: 'auto',
      paddingLeft: 20,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    articleInformation: {
      fontSize: 12,
      lineHeight: '18px',
      paddingTop: 10,
      '& img': {
        verticalAlign: 'middle',
      },
      '& span': {
        [theme.breakpoints.up('sm')]: {
          position: 'relative',
          padding: '0 10px',
          '&:after': {
            content: '""',
            position: 'absolute',
            right: 0,
            top: 2,
            height: 12,
            width: 1,
            backgroundColor: '#ffffff',
            opacity: 0.8,
          },
        },
        '&:first-child': {
          paddingLeft: 0,
        },
        '&:last-child': {
          paddingRight: 0,
          '&:after': {
            display: 'none',
          },
        },
      },
    },
    type: {
      textTransform: 'uppercase',
    },
    views: {
      opacity: 0.8,
      [theme.breakpoints.down('xs')]: {
        opacity: 1,
        float: 'right',
        '& img': {
          filter:
            'invert(100%) sepia(86%) saturate(0%) hue-rotate(69deg) brightness(115%) contrast(100%)',
        },
      },
    },
    source: {
      opacity: 0.8,
      [theme.breakpoints.down('xs')]: {
        opacity: 1,
        display: 'flex',
        fontSize: 14,
        fontWeight: 'normal',
        paddingTop: 5,
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
    callOurExpertsContainer: {
      padding: 20,
      width: 270,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    shareIcon: {
      display: 'flex',
      marginRight: 40,
      color: '#fcb716',
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      position: 'relative',
      '& img': {
        verticalAlign: 'middle',
        marginRight: 5,
      },
    },
    desktopHide: {
      marginLeft: 'auto',
      marginRight: 15,
      fontSize: 13,
      lineHeight: '23px',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
  };
});

interface ArticleBannerProps {
  title: string;
  type: string;
  source: string;
  isWebView: boolean;
  slug: string;
}

export const ArticleBanner: React.FC<ArticleBannerProps> = (props) => {
  const classes = useStyles({});
  const subRef = React.useRef(null);
  const [openSubscriptionForm, setOpenSubscriptionForm] = useState(false);
  const [showShareWidget, setShowShareWidget] = useState(false);

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
        <div
          className={`${classes.shareIcon} ${classes.desktopHide}`}
          onClick={(e) => {
            setShowShareWidget(true);
          }}
        >
          <span>
            <img src={require('images/ic-share-yellow.svg')} alt="" />
          </span>
          <span>Share</span>
          {showShareWidget && (
            <ShareWidget
              title={props.title}
              closeShareWidget={(e) => {
                e.stopPropagation();
                setShowShareWidget(false);
              }}
              url={`${window.location.protocol}//${window.location.hostname}/covid19/article/${props.slug}`}
            />
          )}
        </div>
        <AphButton className={classes.subcribeBtn} onClick={() => setOpenSubscriptionForm(true)}>
          Subscribe
        </AphButton>
      </div>
      <div className={classes.content}>
        <div>
          <h2>{title}</h2>
          <div className={classes.articleInformation}>
            <span className={classes.type}>{type}</span>
            {/* <span className={classes.views}>
              <img src={require('images/ic-views.svg')} alt="" /> 276 Views
            </span> */}

            <span className={classes.source}>
              {source && source.length && <>Sourced from {source}</>}
            </span>
          </div>
        </div>
        <div className={classes.rightGroup}>
          <div
            className={classes.shareIcon}
            onMouseEnter={() => {
              setShowShareWidget(true);
            }}
          >
            <span>
              <img src={require('images/ic-share-yellow.svg')} alt="" />
            </span>
            <span>Share</span>
            {showShareWidget && (
              <ShareWidget
                title={props.title}
                closeShareWidget={() => {
                  setShowShareWidget(false);
                }}
                url={`${window.location.protocol}//${window.location.hostname}/covid19/article/${props.slug}`}
              />
            )}
          </div>
          <AphButton className={classes.subcribeBtn} onClick={() => setOpenSubscriptionForm(true)}>
            Subscribe
          </AphButton>
        </div>
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
              <NewsletterSubscriptionForm
                category={props.title}
                onClose={() => setOpenSubscriptionForm(false)}
              />
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};
