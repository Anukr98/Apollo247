import React, { useRef, useEffect, useState } from 'react';
import { Theme, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import moment from 'moment';
import fetchUtil from 'helpers/fetch';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 16,
    },
    listRow: {
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 16,
      paddingBottom: 16,
      color: '#01475b',
      fontWeight: 500,
      fontSize: 12,
      lineHeight: '18px',
      '&:first-child': {
        borderTop: 'none',
      },
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
      opacity: 0.8,
    },
    postContent: {
      paddingTop: 8,
      opacity: 0.6,
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
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
    feedback: {
      backgroundColor: '#f7f7f7',
      fontSize: 12,
      borderRadius: 10,
      marginLeft: 20,
      marginTop: 10,
      padding: 12,
      color: '#01475b',
    },
    feedbackHead: {
      display: 'flex',
      alignItems: 'center',
    },
    feedbackDate: {
      marginLeft: 'auto',
      opacity: 0.8,
    },
    feedbackContent: {
      opacity: 0.6,
      paddingTop: 8,
      '& a': {
        color: '#0087ba',
      },
    },
  };
});

interface CommentReplyInterface {
  content: string;
  name: string;
  createdAt: string;
}

interface CommentItem {
  email: string;
  createdAt: string;
  content: string;
  name: string;
  commentReply: CommentReplyInterface;
}

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
          let newCommentDateTime = moment.unix(parseInt(item.createdAt)).format('DD MMMM YYYY');
          const today = moment();
          const engagementDate = parseInt(item.createdAt);
          const daysDiff = today.diff(moment.unix(engagementDate), 'days');
          if (daysDiff === 0) {
            newCommentDateTime = 'Today';
          } else if (daysDiff === 1) newCommentDateTime = 'Yesterday';
          return (
            <div className={classes.listRow}>
              <div className={classes.listHeader}>
                <div className={classes.postTitle}>
                  {item.name && item.name.length ? item.name : item.email} wrote
                </div>
                <div className={classes.postDate}>{item.createdAt && newCommentDateTime}</div>
              </div>
              <div className={classes.postContent}>{item.content}</div>
              {item && item.commentReply && (
                <div className={classes.feedback}>
                  <div className={classes.feedbackHead}>
                    <div>{item.commentReply.name} </div>
                    <div className={classes.feedbackDate}>
                      {moment.unix(parseInt(item.commentReply.createdAt)).format('DD MMMM YYYY')}
                    </div>
                  </div>
                  <div
                    className={classes.feedbackContent}
                    dangerouslySetInnerHTML={{ __html: item.commentReply.content }}
                  />
                </div>
              )}
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
