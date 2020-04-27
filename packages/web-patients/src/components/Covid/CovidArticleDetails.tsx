import React, { useEffect, useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import { ArticleBanner } from 'components/Covid/ArticleBanner';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import fetch from 'helpers/fetch';
// import { FeedbackWidget } from 'components/Covid/FeedbackWidget';
// import { Link } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
// import { CommentsForm } from 'components/Covid/CommentsForm';
// import { CommentsList } from 'components/Covid/CommentsList';
// import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f7f8f5',
      paddingBottom: 20,
      [theme.breakpoints.up('sm')]: {
        borderRadius: '0 0 10px 10px',
      },
    },
    imageBanner: {
      padding: 0,
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
      },
    },
    desktopBanner: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    mobileBanner: {
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    sectionGroup: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 20px 0 20px',
      },
    },
    mainContent: {
      fontSize: 14,
      lineHeight: '24px',
      color: '#01475b',
      padding: 20,
      backgroundColor: '#fff',
      boxShadow: '0 10px 20px 0 rgba(128, 128, 128, 0.3)',
      [theme.breakpoints.up('sm')]: {
        fontSize: 16,
        lineHeight: '26px',
        // width: 'calc(100% - 360px)',
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
      '& p': {
        marginTop: 0,
        marginBottom: 20,
        [theme.breakpoints.up('sm')]: {
          marginBottom: 40,
        },
        '&:last-child': {
          marginBottom: 0,
        },
      },
      '& a': {
        color: '#0087ba',
      },
      '& h3': {
        fontSize: 16,
        lineHeight: '24px',
        color: '#0087ba',
        margin: 0,
        paddingBottom: 12,
        fontWeight: 500,
        [theme.breakpoints.up('sm')]: {
          fontSize: 18,
        },
      },
    },
    rightSidebar: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        width: 360,
      },
    },
    formCard: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 16,
      borderRadius: 10,
    },
    bottomActions: {
      paddingTop: 20,
      '& button': {
        width: '100%',
        borderRadius: 10,
      },
    },
  };
});

export const CovidArticleDetails: React.FC = (props: any) => {
  const classes = useStyles();
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const [htmlData, setHtmlData] = useState('');
  const [source, setSource] = useState('');
  const [thumbnailWeb, setThumbnailWeb] = useState('');
  const [thumbnailMobile, setThumbnailMobile] = useState('');

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [showLoader, setShowLoader] = useState(true);
  const covidArticleDetailUrl = process.env.COVID_ARTICLE_DETAIL_URL;
  const articleId = props && props.location.pathname && props.location.pathname.split('/').pop();

  useEffect(() => {
    if (articleId) {
      fetch(`${covidArticleDetailUrl}/${articleId}`, 'GET', {}, '', true).then((res: any) => {
        let postData: any = {};
        if (res && res.data && !isEmpty(res.data[0])) {
          postData = res.data[0];
          const { htmlData, source, thumbnailMobile, thumbnailWeb, title, type } = postData;
          setHtmlData(htmlData);
          setSource(source);
          setThumbnailWeb(thumbnailWeb);
          setThumbnailMobile(thumbnailMobile);
          setTitle(title);
          setType(type);
          setShowLoader(false);
        }
      });
    } else {
      props.history.push('/');
    }
  }, []);
  return (
    <div className={classes.root}>
      {isDesktopOnly ? <Header /> : ''}
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          {showLoader ? (
            <div className={classes.progressLoader}>
              <CircularProgress size={30} />
            </div>
          ) : (
            <>
              <ArticleBanner title={title} source={source} type={type} />
              <div className={classes.imageBanner}>
                <img className={classes.mobileBanner} src={thumbnailMobile} alt="" />
                <img className={classes.desktopBanner} src={thumbnailWeb} alt="" />
              </div>
              {/* <FeedbackWidget /> */}
              <div className={classes.sectionGroup}>
                <div className={classes.mainContent}>
                  <div dangerouslySetInnerHTML={{ __html: htmlData }} />
                </div>
                {/* <div className={classes.rightSidebar}>
              <div className={classes.formCard}>
                <CommentsForm />
                <CommentsList />
              </div>
              <div className={classes.bottomActions}>
                <AphButton color="primary">Share this article</AphButton>
              </div>
            </div> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
