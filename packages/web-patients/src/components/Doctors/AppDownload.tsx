import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { getAppStoreLink } from 'helpers/dateHelpers';

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
        fontSize: 14,
        fontWeight: 500,
        color: '#00667c',
        lineHeight: '15px',
        margin: 0,
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
      paddingTop: 20,
      '& img': {
        maxWidth: 77,
      },
      '& button': {
        flex: 1,
        color: '#fc9916',
        marginLeft: 16,
        backgroundColor: '#fff',
      },
    },
  });
});

export const AppDownload: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.appDownloadGroup}>
        <h4>To enjoy enhanced consultation experience download our mobile app</h4>
        <div className={classes.appDownload}>
          <span>
            <img src={require('images/apollo-logo.jpg')} alt="" />
          </span>
          <AphButton onClick={() => window.open(getAppStoreLink())}>Download the App</AphButton>
        </div>
      </div>
    </div>
  );
};
