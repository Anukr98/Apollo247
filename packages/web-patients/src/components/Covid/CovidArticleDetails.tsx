import React, { useEffect, useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import { ArticleBanner } from 'components/Covid/ArticleBanner';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import fetchUtil from 'helpers/fetch';
import { CallOurExperts } from 'components/CallOurExperts';
import { FeedbackWidget } from 'components/Covid/FeedbackWidget';
import { Link } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import { NavigationBottom } from 'components/NavigationBottom';
import { CommentsForm } from 'components/Covid/CommentsForm';
import { CommentsList } from 'components/Covid/CommentsList';
import { AphButton } from '@aph/web-ui-components';
import { CheckRiskLevel } from 'components/Covid/CheckRiskLevel';
import { BottomLinks } from 'components/BottomLinks';
import moment from 'moment';
import { SchemaMarkup } from 'SchemaMarkup';

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
      marginTop: -72,
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
        borderRadius: '0 0 10px 10px',
        marginTop: 0,
      },
    },
    imageBanner: {
      padding: 0,
      '& img': {
        verticalAlign: 'middle',
        width: '100%',
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
        width: 'calc(100% - 360px)',
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
    htmlContent: {
      marginBottom: 30,
    },
    sourceUrl: {
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
    },
    expertsContainer: {
      paddingTop: 20,
      width: 240,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    hideWeb: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    hideMobile: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    bannerGroup: {
      position: 'relative',
    },
    riskLevelWrap: {
      [theme.breakpoints.down('xs')]: {
        margin: 20,
        marginTop: 0,
      },
      '& >div': {
        [theme.breakpoints.down('xs')]: {
          marginTop: 0,
        },
      },
    },
  };
});

export const CovidArticleDetails: React.FC = (props: any) => {
  const classes = useStyles({});
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const [htmlData, setHtmlData] = useState('');
  const [source, setSource] = useState('');
  const [thumbnailWeb, setThumbnailWeb] = useState('');
  const [thumbnailMobile, setThumbnailMobile] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [title, setTitle] = useState('');
  const [titleId, setTitleId] = useState<string>('');
  const [type, setType] = useState('');
  const [showLoader, setShowLoader] = useState(true);
  const [isWebView, setIsWebView] = useState<boolean>(false);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState('');
  const [totalLike, setTotalLike] = useState('');
  const [totalDislike, setTotalDislike] = useState('');
  const [structuredJSON, setStructuredJSON] = useState(null);

  const covidArticleDetailUrl = process.env.COVID_ARTICLE_DETAIL_URL;
  const articleSlug = props && props.location.pathname && props.location.pathname.split('/').pop();

  useEffect(() => {
    if (props && props.location && props.location.search && props.location.search.length) {
      const qParamsArr = props.location.search.split('=');
      if (qParamsArr && qParamsArr.length) {
        const isWebView = qParamsArr.some((param: string) => param.includes('mobile_app'));
        setIsWebView(isWebView);
      }
    }
    if (articleSlug) {
      fetchUtil(`${covidArticleDetailUrl}/${articleSlug}`, 'GET', {}, '', true).then((res: any) => {
        let postData: any = {};
        if (res && res.data && !isEmpty(res.data[0])) {
          postData = res.data[0];
          const {
            htmlData,
            source,
            thumbnailMobile,
            thumbnailWeb,
            title,
            type,
            sourceUrl,
            id,
            comments,
            totalComments,
            totalLike,
            totalDislike,
            createdAt,
            updatedAt,
          } = postData;
          const schemaJSON =
            title && thumbnailWeb && createdAt && updatedAt
              ? {
                  '@context': 'https://schema.org',
                  '@type': 'BlogPosting',
                  mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': window && window.location ? window.location.href : null,
                  },
                  headline: title,
                  image: thumbnailWeb,
                  author: {
                    '@type': 'Organization',
                    name: 'Apollo24|7',
                  },
                  datePublished: moment(Number(createdAt)).utc().format(),
                  dateModified: moment(Number(updatedAt)).utc().format(),
                  publisher: {
                    '@type': 'Organization',
                    name: 'Apollo24|7',
                    logo: {
                      '@type': 'ImageObject',
                      url:
                        'https://www.apollo247.com/campaign/online-medical-consultation/images/logo.png',
                      width: 58,
                      height: 59,
                    },
                  },
                }
              : null;
          setHtmlData(htmlData);
          setSource(source);
          setSourceUrl(sourceUrl);
          setThumbnailWeb(thumbnailWeb);
          setThumbnailMobile(thumbnailMobile);
          setTitle(title);
          setTitleId(id);
          setType(type);
          setShowLoader(false);
          setComments(comments);
          setTotalComments(totalComments);
          setTotalDislike(totalDislike);
          setTotalLike(totalLike);
          setStructuredJSON(schemaJSON);
        }
      });
    } else {
      props.history.push('/');
    }
  }, []);
  return (
    <div className={classes.root}>
      {isDesktopOnly ? <Header /> : ''}
      {structuredJSON && <SchemaMarkup structuredJSON={structuredJSON} />}
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          {showLoader ? (
            <div className={classes.progressLoader}>
              <CircularProgress size={30} />
            </div>
          ) : (
            <>
              <div className={classes.bannerGroup}>
                <ArticleBanner title={title} source={source} type={type} isWebView={isWebView} />
                <div className={classes.imageBanner}>
                  <img className={classes.mobileBanner} src={thumbnailMobile} alt="" />
                  <img className={classes.desktopBanner} src={thumbnailWeb} alt="" />
                </div>
              </div>
              <div className={classes.hideWeb}>
                <FeedbackWidget
                  totalComments={totalComments}
                  totalLike={totalLike}
                  totalDislike={totalDislike}
                  articleId={titleId}
                />
              </div>
              <div className={classes.sectionGroup}>
                <div className={classes.mainContent}>
                  <div
                    className={classes.htmlContent}
                    dangerouslySetInnerHTML={{ __html: htmlData }}
                  />
                  {sourceUrl && sourceUrl.length && (
                    <>
                      <a href={sourceUrl} target="_blank">
                        <div>SOURCE</div>
                        <div className={classes.sourceUrl}>{sourceUrl}</div>
                      </a>
                    </>
                  )}
                </div>
                <div className={classes.rightSidebar}>
                  <div className={classes.formCard}>
                    <div className={classes.hideMobile}>
                      <FeedbackWidget
                        totalComments={totalComments}
                        totalLike={totalLike}
                        totalDislike={totalDislike}
                        articleId={titleId}
                      />
                    </div>
                    <CommentsForm titleId={titleId} />
                    <CommentsList
                      titleId={titleId}
                      commentData={comments}
                      totalComments={totalComments}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className={classes.riskLevelWrap}>
          <CheckRiskLevel />
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};
