import React, { useRef, useEffect, useState } from 'react';
import { Theme, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import moment from 'moment';
import fetchUtil from 'helpers/fetch';

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
    circlularProgress: {
      display: 'flex',
      padding: 20,
      justifyContent: 'center',
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
  name: string;
};

interface CommentListProps {
  commentData: Array<CommentItem>;
  totalComments: string;
  titleId: string;
}

export const CommentsList: React.FC<CommentListProps> = (props) => {
  const classes = useStyles({});
  const [commentsArr, setCommentsArr] = useState(props.commentData);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const articleCommentListUrl = process.env.ARTICLE_COMMENT_LIST_URL;
  let currentCommentsArr = props.commentData || [];
  useEffect(() => {
    setCommentsArr(currentCommentsArr);
  }, [props]);

  const getMoreComments = () => {
    setCommentsLoading(true);
    const currentOffset = commentsArr.length;
    fetchUtil(
      `${articleCommentListUrl}/${props.titleId}?limit=2&offset=${currentOffset}`,
      'GET',
      {},
      '',
      true
    ).then((res: any) => {
      const newComments = res.data[0]['comments'];
      const allComments = commentsArr.concat(newComments);
      setCommentsArr(allComments);
      setCommentsLoading(false);
    });
  };

  return (
    <div className={classes.root}>
      {commentsArr.length > 0 &&
        commentsArr.map((item) => {
          return (
            <div className={classes.listRow}>
              <div className={classes.listHeader}>
                <div className={classes.postTitle}>
                  {item.name && item.name.length ? item.name : item.email} wrote
                </div>
                <div className={classes.postDate}>
                  {item.createdAt && moment.unix(parseInt(item.createdAt)).format('ddd, ll')}
                </div>
              </div>
              <div className={classes.postContent}>{item.content}</div>
            </div>
          );
        })}
      {parseInt(props.totalComments) > commentsArr.length && (
        <>
          {!commentsLoading ? (
            <div className={classes.bottomActions} onClick={() => getMoreComments()}>
              <AphButton>View More</AphButton>
            </div>
          ) : (
            <div className={classes.circlularProgress}>
              <CircularProgress />
            </div>
          )}
        </>
      )}
    </div>
  );
};
