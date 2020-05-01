import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 16,
    },
    listRow: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 16,
      paddingBottom: 16,
      color: '#01475b',
      fontWeight: 500,
      fontSize: 12,
      lineHeight: '18px',
    },
    listHeader: {
      display: 'flex',
    },
    postTitle: {
      padding: 0,
    },
    postDate: {
      marginLeft: 'auto',
      color: '#0087ba',
      opacity: 0.6,
    },
    postContent: {
      paddingTop: 8,
      opacity: 0.6,
    },
    bottomActions: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      textAlign: 'center',
      paddingTop: 5,
      '& button': {
        backgroundColor: 'transparent',
        color: '#fc9916',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#fc9916',
          boxShadow: 'none',
        },
      },
    },
  };
});

export const CommentsList: React.FC = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.listRow}>
        <div className={classes.listHeader}>
          <div className={classes.postTitle}>xyz@email.com wrote</div>
          <div className={classes.postDate}>Mon, 20 Apr 2020</div>
        </div>
        <div className={classes.postContent}>
          This article is really helpful, it helped me and my family to take extra measures to
          prevent ourselves from coronavirus. Thanks!
        </div>
      </div>
      <div className={classes.listRow}>
        <div className={classes.listHeader}>
          <div className={classes.postTitle}>Kriti wrote</div>
          <div className={classes.postDate}>Sun, 19 Apr 2020</div>
        </div>
        <div className={classes.postContent}>
          This article helped me how to wash my hands. Now my hands are super clean and fresh.
          #stayhomestaysafe #washyourhands
        </div>
      </div>
      <div className={classes.bottomActions}>
        <AphButton>View More</AphButton>
      </div>
    </div>
  );
};
