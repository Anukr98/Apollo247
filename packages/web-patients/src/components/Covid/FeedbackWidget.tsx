import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      display: 'flex',
      padding: '0 0 16px',
      margin: '0 0 16px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('xs')]: {
        padding: '16px 20px',
        margin: 0,
      }
    },
    linkItem: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: 9,
      fontWeight: 600,
      minWidth: 90,
      '& img': {
        verticalAlign: 'middle',
        marginRight: 5,
      },
    },
  };
});

export const FeedbackWidget: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.linkItem}>
        <span>
          <img src={require('images/ic_like.svg')} alt="Likes" />
        </span>
        <span>100 Likes</span>
      </div>
      <div className={classes.linkItem}>
        <span>
          <img src={require('images/ic_dislike.svg')} alt="Dislikes" />
        </span>
        <span>17 Dislikes</span>
      </div>
      <div className={classes.linkItem}>
        <span>
          <img src={require('images/ic_feed.svg')} alt="Comments" />
        </span>
        <span>100 Comments</span>
      </div>
    </div>
  );
};
