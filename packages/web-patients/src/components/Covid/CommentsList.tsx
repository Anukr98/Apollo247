import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import moment from 'moment';

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

type CommentItem = {
  email: string;
  createdAt: string;
  content: string;
};

interface CommentListProps {
  commentData: Array<CommentItem>;
  totalComments: string;
}

export const CommentsList: React.FC<CommentListProps> = (props) => {
  const classes = useStyles({});
  let currentCommentsArr = props.commentData || [];
  return (
    <div className={classes.root}>
      {currentCommentsArr.length > 0 &&
        currentCommentsArr.map((item) => {
          return (
            <div className={classes.listRow}>
              <div className={classes.listHeader}>
                <div className={classes.postTitle}>{item.email} wrote</div>
                <div className={classes.postDate}>
                  {item.createdAt && moment.unix(parseInt(item.createdAt)).format('ddd, ll')}
                </div>
              </div>
              <div className={classes.postContent}>{item.content}</div>
            </div>
          );
        })}
      {parseInt(props.totalComments) > currentCommentsArr.length && (
        <div className={classes.bottomActions}>
          <AphButton>View More</AphButton>
        </div>
      )}
    </div>
  );
};
