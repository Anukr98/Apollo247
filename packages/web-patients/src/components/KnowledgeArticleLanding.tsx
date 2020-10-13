import React, { useEffect, useState, useRef } from 'react';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress, Modal } from '@material-ui/core';
import _isEmpty from 'lodash/isEmpty';
import { Header } from 'components/Header';
import { Banner } from 'components/Covid/Banner';
import { AphButton } from '@aph/web-ui-components';
import { ArticleCard } from 'components/Covid/ArticleCard';
import { CheckRiskLevel } from 'components/Covid/CheckRiskLevel';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import fetchUtil from 'helpers/fetch';
import { NavigationBottom } from 'components/NavigationBottom';
import { BottomLinks } from 'components/BottomLinks';
import { useAllCurrentPatients } from 'hooks/authHooks';
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
    pageContainer: {
      marginTop: -72,
      [theme.breakpoints.up('sm')]: {
        marginTop: 0,
      },
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    sectionGroup: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        padding: 0,
      },
    },
    panelRoot: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '20px !important',
      marginTop: '0 !important',
      width: '100%',
      '&:before': {
        display: 'none',
      },
    },
    panelsGroup: {
      [theme.breakpoints.up('sm')]: {
        '& >div:first-child': {
          borderRadius: '0 0 10px 10px',
        },
      },
    },
    panelHeader: {
      padding: 16,
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      alignItems: 'flex-start',
      [theme.breakpoints.up('sm')]: {
        padding: 40,
      },
    },
    summaryContent: {
      margin: 0,
      display: 'block',
      '& h3': {
        fontSize: 17,
        margin: 0,
        color: '#01475b',
        fontWeight: 500,
        [theme.breakpoints.up('sm')]: {
          color: '#0087ba',
        },
      },
      '& p': {
        fontSize: 12,
        margin: 0,
        paddingTop: 5,
        color: '#01475b',
        opacity: 0.6,
      },
    },
    expandIcon: {
      padding: 0,
      margin: 0,
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    panelExpanded: {
      minHeight: 'auto !important',
      margin: '0 !important',
    },
    panelDetails: {
      padding: '16px 0',
      margin: '0 16px',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      display: 'inherit',
      [theme.breakpoints.up('sm')]: {
        padding: '40px 0',
        margin: '0 40px',
      },
    },
    bottomActions: {
      textAlign: 'center',
      [theme.breakpoints.up('sm')]: {
        paddingTop: 20,
      },
    },
    viewmoreBtn: {
      backgroundColor: 'transparent',
      color: '#fc9916',
      boxShadow: 'none',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fc9916',
      },
    },
    modalWindowWrap: {
      display: 'table',
      height: '100%',
      width: '100%',
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
    },
    tableContent: {
      display: 'table-cell',
      verticalAlign: 'middle',
      width: '100%',
      '&:focus': {
        outline: 'none',
      },
    },
    modalWindow: {
      maxWidth: 600,
      margin: 'auto',
      borderRadius: 10,
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
    },
    modalHeader: {
      minHeight: 24,
      textAlign: 'left',
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: 0.5,
      color: theme.palette.common.white,
      position: 'relative',
      wordBreak: 'break-word',
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 12,
      },
    },
    fullScreen: {
      transform: 'rotate(-90deg)',
      transformOrigin: 'left top',
      transition: 'all .1s',
      width: '100vh !important',
      height: '100vw',
      overflowX: 'hidden',
      position: 'absolute',
      top: '100%',
      left: 0,
    },
    modalClose: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: 24,
      height: 24,
      cursor: 'pointer',
    },
    headerCovid: {
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        '& header': {
          display: 'none',
        },
        '& >div': {
          position: 'static',
        },
      },
    },
    modalFooter: {
      textAlign: 'left',
      position: 'relative',
      color: theme.palette.common.white,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 12,
      },
    },
    modalContent: {
      textAlign: 'center',
      maxHeight: 'calc(100vh - 212px)',
      overflow: 'hidden',
      '& img': {
        width: '100%',
        maxHeight: 'calc(100vh - 212px)',
      },
    },
    fullScreenImg: {
      position: 'absolute',
      bottom: 32,
      right: 12,
    },
    fullScreenImgCross: {
      position: 'absolute',
      top: 16,
      right: 12,
    },
  };
});

const KnowledgeArticleLanding: React.FC = (props: any) => {
  const classes = useStyles({});
  const onePrimaryUser = hasOnePrimaryUser();
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const headingArr = [
    {
      heading: 'Diabetes Management',
      subheading: 'Explore and learn how to keep your blood sugar levels controlled',
      category: 'diabetes-management',
      defaultExpanded: true,
    },
    {
      heading: 'Heart health',
      subheading: 'Get expert advice on how to keep your heart healthy and strong',
      category: 'heart-health',
      defaultExpanded: false,
    },
    {
      heading: 'Respiratory conditions',
      subheading: 'Know how to manage respiratory conditions effectively',
      category: 'respiratory-conditions',
      defaultExpanded: false,
    },
  ];
  interface CovidContentInterface {
    [key: string]: any;
  }
  const [covidContent, setCovidContent] = useState<CovidContentInterface>({});
  const [categoryToFetch, setCategoryToFetch] = useState<string>('');
  const [moreContentLoading, setMoreContentLoading] = useState<boolean>(false);
  const [fullScreenOn, setFullScreenOn] = useState<boolean>(false);
  const [isWebView, setIsWebView] = useState<boolean>(false);
  const [expandedImage, setExpandedImage] = useState<string>('');
  const [expandedTitle, setExpandedTitle] = useState<string>('');
  const [covidCategory, setCovidCategory] = useState<string>('');
  const [expandedSourceUrl, setExpandedSourceUrl] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const scrollToRef = useRef<HTMLDivElement>(null);
  const { currentPatient } = useAllCurrentPatients();
  const didMount = useRef(false);
  const covidArticleBaseUrl =
    process.env.NODE_ENV !== 'production'
      ? `${process.env.COVID_ARTICLE_LIST_URL}?st=2`
      : process.env.COVID_ARTICLE_LIST_URL;
  useEffect(() => {
    scrollToRef &&
      scrollToRef.current &&
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (props && props.location && props.location.search && props.location.search.length) {
      const qParamsArr = props.location.search.split('=');
      if (qParamsArr && qParamsArr.length) {
        const isWebView = qParamsArr.some((param: string) => param.includes('mobile_app'));
        if (isWebView) {
          sessionStorage.setItem('webView', 'true');
          setIsWebView(isWebView);
        }
      }
    } else {
      if (sessionStorage.getItem('webView') && sessionStorage.getItem('webView').length > 0) {
        setIsWebView(true);
      }
    }
  }, []);
  useEffect(() => {
    fetchUtil(process.env.BLOG_ARTICLE_LIST_URL, 'GET', {}, '', true).then((res: any) => {
      const body = res.data;
      const sortedStaySafeData =
        !_isEmpty(body['diabetes-management']) && body['diabetes-management'];
      const sortedCovidSymptomsData = !_isEmpty(body['heart-health']) && body['heart-health'];
      const sortedGoingAheadData =
        !_isEmpty(body['respiratory-conditions']) && body['respiratory-conditions'];
      let covidObj: CovidContentInterface = {};
      covidObj['diabetes-management'] = sortedStaySafeData;
      covidObj['heart-health'] = sortedCovidSymptomsData;
      covidObj['respiratory-conditions'] = sortedGoingAheadData;
      covidObj['total-term'] = body['totalterm'];
      setCovidContent(covidObj);
    });
  }, []);

  useEffect(() => {
    if (didMount.current && categoryToFetch !== '') {
      const currentOffset = covidContent[categoryToFetch].length;
      fetchUtil(
        `${process.env.BLOG_ARTICLE_LIST_URL}?catid=${categoryToFetch}&limit=3&offset=${currentOffset}`,
        'GET',
        {},
        '',
        true
      ).then((res: any) => {
        const sortedData = res.data[categoryToFetch];
        let tempCovidObj: CovidContentInterface = covidContent;
        tempCovidObj[categoryToFetch] = tempCovidObj[categoryToFetch].concat(sortedData);
        setCovidContent(tempCovidObj);
        setMoreContentLoading(false);
        setCategoryToFetch('');
      });
    } else didMount.current = true;
  }, [categoryToFetch]);

  const handleInfographicClick = (data: any) => {
    setExpandedImage(data.image);
    setExpandedTitle(data.postTitle);
    setExpandedSourceUrl(data.sourceUrl);
    setModalOpen(true);
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerCovid}>
        <Header backArrowVisible={true} isWebView={isWebView} />
      </div>
      <div className={classes.container}>
        <div className={classes.pageContainer} ref={scrollToRef}>
          <Banner
            isBlog={true}
            title={'Healthcare Articles and Resources'}
            subtitle={''}
            isWebView={isWebView}
          />
          <div className={classes.sectionGroup}>
            <div className={classes.panelsGroup}>
              {headingArr.map((parentCat) => (
                <ExpansionPanel
                  key={parentCat.category}
                  className={classes.panelRoot}
                  defaultExpanded={parentCat.defaultExpanded}
                >
                  <ExpansionPanelSummary
                    expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
                    classes={{
                      root: classes.panelHeader,
                      content: classes.summaryContent,
                      expandIcon: classes.expandIcon,
                      expanded: classes.panelExpanded,
                    }}
                  >
                    <h3>{parentCat.heading}</h3>
                    <p>{parentCat.subheading}</p>
                  </ExpansionPanelSummary>
                  {_isEmpty(covidContent['diabetes-management']) ? (
                    <div className={classes.progressLoader}>
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      {covidContent &&
                        covidContent[parentCat.category] &&
                        covidContent[parentCat.category].length && (
                          <ArticleCard
                            isWebView={isWebView}
                            handleInfographicClick={(data) => handleInfographicClick(data)}
                            content={covidContent[parentCat.category]}
                            pageType="blog"
                          />
                        )}
                      {moreContentLoading ? (
                        <div className={classes.progressLoader}>
                          <CircularProgress size={30} />
                        </div>
                      ) : (
                        <div className={classes.bottomActions}>
                          {!_isEmpty(covidContent) &&
                            !_isEmpty(covidContent[parentCat.category]) &&
                            covidContent[parentCat.category].length <
                              parseInt(covidContent['total-term'][parentCat.category]) && (
                              <AphButton
                                className={classes.viewmoreBtn}
                                onClick={() => {
                                  setMoreContentLoading(true);
                                  setCategoryToFetch(parentCat.category);
                                }}
                              >
                                View More
                              </AphButton>
                            )}
                        </div>
                      )}
                    </ExpansionPanelDetails>
                  )}
                </ExpansionPanel>
              ))}
            </div>
            <CheckRiskLevel />
          </div>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <div className={classes.modalWindowWrap}>
              <div className={classes.tableContent}>
                <div className={classes.modalWindow}>
                  <div className={classes.modalHeader}>
                    {expandedTitle}
                    <div
                      className={classes.modalClose}
                      onClick={() => {
                        setModalOpen(false);
                        setExpandedImage('');
                        setExpandedSourceUrl('');
                        setExpandedTitle('');
                      }}
                    >
                      <img src={require('images/ic_round_clear.svg')} alt="" />
                    </div>
                  </div>
                  <div className={classes.modalContent}>
                    <img
                      src={expandedImage}
                      className={fullScreenOn ? classes.fullScreen : ''}
                      alt=""
                    />
                    {fullScreenOn && (
                      <>
                        <span
                          className={classes.fullScreenImgCross}
                          onClick={() => {
                            setFullScreenOn(false);
                            setModalOpen(false);
                            setExpandedImage('');
                            setExpandedSourceUrl('');
                            setExpandedTitle('');
                          }}
                        >
                          <img src={require('images/ic_cross.svg')} />
                        </span>
                        <span
                          className={classes.fullScreenImg}
                          onClick={() => setFullScreenOn(false)}
                        >
                          <img src={require('images/on.svg')} />
                        </span>
                      </>
                    )}
                  </div>
                  <div className={classes.modalFooter}>
                    {!isDesktopOnly && !fullScreenOn && (
                      <span className={classes.fullScreenImg} onClick={() => setFullScreenOn(true)}>
                        <img src={require('images/off.svg')} />
                      </span>
                    )}
                    {!fullScreenOn && <div>{expandedSourceUrl}</div>}
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      <BottomLinks />
      {!isWebView && <NavigationBottom />}
      {!onePrimaryUser && <ManageProfile />}
    </div>
  );
};

export default KnowledgeArticleLanding;