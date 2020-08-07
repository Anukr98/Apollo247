import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import fetchUtil from 'helpers/fetch';
import _isEmpty from 'lodash/isEmpty';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      display: 'flex',
      marginLeft: 'auto',
    },
    linkItem: {
      display: 'none',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: 12,
      lineHeight: '26px',
      fontWeight: 600,
      minWidth: 90,
      color: '#0087ba',
      '& img': {
        verticalAlign: 'middle',
        marginRight: 5,
        marginTop: -3,
      },
      '& span': {
        '& span': {
          color: '#7098a3',
        },
      },
      '&:first-child': {
        display: 'flex',
      },
    },
    likeFilter: {
      filter:
        'invert(51%) sepia(19%) saturate(4229%) hue-rotate(142deg) brightness(49%) contrast(129%)',
    },
    disLikeFilter: {
      filter:
        'invert(19%) sepia(100%) saturate(2423%) hue-rotate(343deg) brightness(85%) contrast(84%)',
    },
  };
});

interface FeedbackWidgetProps {
  totalComments: string;
  totalDislike: string;
  totalLike: string;
  articleId: string;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = (props) => {
  const classes = useStyles({});
  const [articleLiked, setArticleLiked] = useState(false);
  const [articleDisLiked, setArticleDisLiked] = useState(false);
  const [articleDislikeAttempt, setArticleDislikeAttempt] = useState(false);
  const [articleLikeAttempt, setArticleLikeAttempt] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const articleId = props.articleId;
  const feedbackUrl = process.env.COVID_ARTICLE_FEEDBACK_URL;
  useEffect(() => {
    // this will be used to update the count from API after the user likes/dislikes a post
    setLikeCount(Number(props.totalLike));
    setDislikeCount(Number(props.totalDislike));
    const likeDislikeState = JSON.parse(localStorage.getItem('fbArticle')) || {};
    if (!_isEmpty(likeDislikeState) && likeDislikeState[articleId]) {
      if (likeDislikeState[articleId]['like']) {
        setArticleLiked(true);
      }
      if (likeDislikeState[articleId]['dislike']) {
        setArticleDisLiked(true);
      }
      if (likeDislikeState[articleId]['attemptLike']) {
        setArticleLikeAttempt(true);
      }
      if (likeDislikeState[articleId]['attemptDislike']) {
        setArticleDislikeAttempt(true);
      }
    }
  }, [props.totalLike]);

  const callAPI = (type: string) => {
    fetchUtil(
      feedbackUrl,
      'POST',
      {
        id: props.articleId,
        like: type === 'like' ? 1 : 0,
        dislike: type === 'dislike' ? 1 : 0,
      },
      '',
      true
    ).then((res: any) => {
      if (res && res.success) {
        setLikeCount(Number(res.totalLike));
        setDislikeCount(Number(res.totalDislike));
      } else {
        console.error('unable to record message');
      }
    });
  };

  const handleLikeButton = () => {
    let articleLikedBool = true;
    if (!articleLiked) {
      setArticleLiked(true);
      setLikeCount(likeCount + 1);
      if (!articleLikeAttempt) {
        callAPI('like');
        setArticleLikeAttempt(true);
      }
    } else {
      setArticleLiked(false);
      setLikeCount(likeCount - 1);
      articleLikedBool = false;
    }
    if (articleDisLiked) {
      setDislikeCount(dislikeCount - 1);
      setArticleDisLiked(false);
    }
    let obj = {
      [articleId]: {
        like: articleLikedBool,
        dislike: false,
        attemptLike: true,
      },
    };
    localStorage.setItem('fbArticle', JSON.stringify(obj));
  };
  const handleDislikeButton = () => {
    let articleDisLikedBool = true;

    if (!articleDisLiked) {
      setArticleDisLiked(true);
      setDislikeCount(dislikeCount + 1);
      if (!articleDislikeAttempt) {
        callAPI('dislike');
        setArticleDislikeAttempt(true);
      }
    } else {
      setArticleDisLiked(false);
      setDislikeCount(dislikeCount - 1);
      articleDisLikedBool = false;
      // callAPI("dislike");
    }
    if (articleLiked) {
      setArticleLiked(false);
      setLikeCount(likeCount - 1);
    }
    let obj = {
      [articleId]: {
        like: false,
        dislike: articleDisLikedBool,
        attemptDislike: true,
      },
    };
    localStorage.setItem('fbArticle', JSON.stringify(obj));
  };
  return (
    <div className={classes.root}>
      <div className={classes.linkItem} onClick={() => handleLikeButton()}>
        <span>
          <img
            src={!articleLiked ? require('images/ic-like.svg') : require('images/noun-like.svg')}
            alt="Likes"
            onContextMenu={(e) => e.preventDefault()}
          />
        </span>
        <span>
          {likeCount} {Number(likeCount) === 1 ? 'Like' : 'Likes'}
        </span>
      </div>
      <div className={classes.linkItem} onClick={() => handleDislikeButton()}>
        <span>
          <img
            className={articleDisLiked ? classes.disLikeFilter : ''}
            src={require('images/ic_dislike.svg')}
            alt="Dislikes"
            onContextMenu={(e) => e.preventDefault()}
          />
        </span>
        <span>
          {dislikeCount} {Number(dislikeCount) === 1 ? 'Dislike' : 'Dislikes'}
        </span>
      </div>
      <div className={classes.linkItem}>
        <span>
          <img
            onContextMenu={(e) => e.preventDefault()}
            src={require('images/ic_feed.svg')}
            alt="Comments"
          />
        </span>
        <span>
          {Number(props.totalComments)} {Number(props.totalComments) === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>
    </div>
  );
};
