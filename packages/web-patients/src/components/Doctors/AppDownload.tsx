import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { getAppStoreLink } from 'helpers/dateHelpers';
import { dataLayerTracking } from 'gtmTracking';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      marginTop: 20,
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        marginTop: 0,
        marginLeft: 20,
        marginRight: 20,
      },
    },
    appDownloadGroup: {
      '& h4': {
        fontSize: 12,
        fontWeight: 500,
        color: 'rgba(1,71,91,0.6)',
        lineHeight: '18px',
        paddingRight: 20,
        margin: 0,
        [theme.breakpoints.down('xs')]: {
          paddingRight: 0,
        },
      },
      '& p': {
        fontSize: 12,
        lineHeight: '18px',
        opacity: 0.6,
        marginTop: 0,
      },
    },
    appDownload: {
      display: 'flex',
      alignItems: 'center',
      paddingTop: 5,
      '& img': {
        maxWidth: 77,
      },
      '& button': {
        flex: 1,
        color: '#fc9916',
        marginLeft: 16,
        backgroundColor: 'transparent',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
  });
});

export const AppDownload: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.appDownloadGroup}>
        <h4>To enjoy services provided by Apollo 247 on Mobile, download our App</h4>
        <div className={classes.appDownload}>
          <span>
            <img src={require('images/apollo-logo.jpg')} alt="" />
          </span>
          <AphButton
            onClick={() => {
              /**Gtm code start start */
              dataLayerTracking({
                event: 'Download App Clicked',
              });
              /**Gtm code start end */
              window.open(getAppStoreLink());
            }}
          >
            Download the App
          </AphButton>
        </div>
      </div>
    </div>
  );
};
