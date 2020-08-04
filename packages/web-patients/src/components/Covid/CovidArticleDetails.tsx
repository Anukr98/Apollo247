import React, { useEffect, useState } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress, Typography } from '@material-ui/core';
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
import { MetaTagsComp } from 'MetaTagsComp';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from 'helpers/onePrimaryUser';

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
        backgroundColor: '#fff',
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
        padding: 40,
        lineHeight: '26px',
        width: 'calc(100% - 320px)',
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
        color: '#098bb0',
      },
      '& h3': {
        fontSize: 16,
        lineHeight: '24px',
        margin: 0,
        paddingBottom: 12,
        fontWeight: 500,
        [theme.breakpoints.up('sm')]: {
          fontSize: 18,
        },
      },
      '& ul': {
        paddingLeft: 20,
      },
    },
    rightSidebar: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        width: 320,
        flex: 1,
        padding: 0,
      },
    },
    formCard: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      height: '100%',
      [theme.breakpoints.up('sm')]: {
        borderRadius: '0 0 10px 0',
      },
    },
    sectionHead: {
      fontSize: 12,
      padding: 16,
      fontWeight: 600,
      color: '#0087ba',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.up('sm')]: {
        paddingTop: 40,
      },
      '& img': {
        verticalAlign: 'middle',
        marginRight: 8,
      },
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
      },
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
    formTrigger: {
      backgroundColor: 'rgba(216,216,216,0.2)',
      padding: 12,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: '18px',
      borderRadius: 5,
      margin: '0 16px',
    },
    emptyCommentSection: {
      height: 'calc(100% - 124px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down('xs')]: {
        height: 'calc(100% - 112px)',
        padding: 20,
      },
    },
    noComments: {
      width: '70%',
      textAlign: 'center',
      '& p': {
        margin: '20px 0',
        fontSize: 12,
        color: '#02475b',
        lineHeight: '18px',
      },
      [theme.breakpoints.down('xs')]: {
        width: '80%',
      },
    },
  };
});

export const CovidArticleDetails: React.FC = (props: any) => {
  const classes = useStyles({});
  const onePrimaryUser = hasOnePrimaryUser();
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
  const [showCommentForm, setShowCommentForm] = useState<boolean>(false);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState('');
  const [totalLike, setTotalLike] = useState('');
  const [totalDislike, setTotalDislike] = useState('');
  const [structuredJSON, setStructuredJSON] = useState(null);
  const [metaTagProps, setMetaTagProps] = useState(null);

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
            alt,
            metaDescription,
          } = postData;

          alt &&
            metaDescription &&
            setMetaTagProps({
              title: alt,
              description: metaDescription,
              canonicalLink:
                typeof window !== 'undefined' && window.location && window.location.href,
            });
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
                  datePublished: moment(Number(createdAt) * 1000)
                    .utc()
                    .format(),
                  dateModified: moment(Number(updatedAt) * 1000)
                    .utc()
                    .format(),
                  publisher: {
                    '@type': 'Organization',
                    name: 'Apollo24|7',
                    logo: {
                      '@type': 'ImageObject',
                      url:
                        'https://www.apollo247.com/campaign/online-medical-consultation/images/logo.png',
                      width: 231,
                      height: 171,
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
      {metaTagProps && <MetaTagsComp {...metaTagProps} />}
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
                <ArticleBanner
                  slug={articleSlug}
                  title={title}
                  source={source}
                  type={type}
                  isWebView={isWebView}
                />
                <div className={classes.imageBanner}>
                  <img className={classes.mobileBanner} src={thumbnailMobile} alt="" />
                  <img className={classes.desktopBanner} src={thumbnailWeb} alt="" />
                </div>
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
                    <div className={classes.sectionHead}>
                      <div>
                        <img src={require('images/ic-feed.svg')} alt="" /> {totalComments} Comments
                      </div>
                      <FeedbackWidget
                        totalComments={totalComments}
                        totalLike={totalLike}
                        totalDislike={totalDislike}
                        articleId={titleId}
                      />
                    </div>

                    {showCommentForm ? (
                      <CommentsForm
                        titleId={titleId}
                        onCancel={() => {
                          setShowCommentForm(false);
                        }}
                      />
                    ) : (
                      <div onClick={() => setShowCommentForm(true)} className={classes.formTrigger}>
                        Enter your comments here..
                      </div>
                    )}
                    {comments && comments.length ? (
                      <CommentsList
                        titleId={titleId}
                        commentData={comments}
                        totalComments={totalComments}
                      />
                    ) : (
                      <div className={classes.emptyCommentSection}>
                        <div className={classes.noComments}>
                          <img src={require('images/ic-nocomments.svg')} />
                          <Typography>
                            There are currently no comments for this. Be the first to comment.
                          </Typography>
                        </div>
                      </div>
                    )}
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
      {!onePrimaryUser && <ManageProfile />}
    </div>
  );
};
