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
        borderRadius: '0 0 10px 10px',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
        paddingBottom: 20,
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
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '10px !important',
      marginTop: '0 !important',
      width: '100%',
      '&:before': {
        display: 'none',
      },
      [theme.breakpoints.up('sm')]: {
        borderRadius: '0 !important',
        boxShadow: 'none',
        marginBottom: '0 !important',
      },
    },
    panelsGroup: {
      '& >div:last-child': {
        marginBottom: '0 !important',
      },
      [theme.breakpoints.up('sm')]: {
        '& >div:nth-child(even)': {
          backgroundColor: 'transparent',
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
        padding: 20,
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
        padding: '20px 0',
        margin: '0 20px',
      },
    },
    bottomActions: {
      textAlign: 'center',
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

export const CovidLanding: React.FC = (props: any) => {
  const classes = useStyles();
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const headingArr = [
    {
      heading: 'How can I stay safe?',
      subheading:
        'Articles and videos on precautions and protective measures to avoid Coronavirus.',
      category: 'stay-safe',
      defaultExpanded: true,
    },
    {
      heading: 'What to do if I have symptoms?',
      subheading: 'Know more about symptoms of Coronavirus and what to do if infected.',
      category: 'covid-symptoms',
      defaultExpanded: false,
    },
    {
      heading: 'How are we getting ahead?',
      subheading: 'Learn about the efforts around the world to win over Coronavirus.',
      category: 'going-ahead',
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
  const [expandedSourceUrl, setExpandedSourceUrl] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const didMount = useRef(false);
  const covidArticleBaseUrl =
    process.env.NODE_ENV !== 'production'
      ? `${process.env.COVID_ARTICLE_LIST_URL}?st=2`
      : process.env.COVID_ARTICLE_LIST_URL;
  useEffect(() => {
    typeof window !== 'undefined' && window.scrollTo(0, 0);
    if (props && props.location && props.location.search && props.location.search.length) {
      const qParamsArr = props.location.search.split('=');
      if (qParamsArr && qParamsArr.length) {
        const isWebView = qParamsArr.some((param: string) => param.includes('mobile_app'));
        setIsWebView(isWebView);
      }
    }
  });
  useEffect(() => {
    fetchUtil(covidArticleBaseUrl!, 'GET', {}, '', true).then((res: any) => {
      const body = res.data;
      const sortedStaySafeData = !_isEmpty(body['stay-safe']) && body['stay-safe'];
      const sortedCovidSymptomsData = !_isEmpty(body['covid-symptoms']) && body['covid-symptoms'];
      const sortedGoingAheadData = !_isEmpty(body['going-ahead']) && body['going-ahead'];
      let covidObj: CovidContentInterface = {};
      covidObj['stay-safe'] = sortedStaySafeData;
      covidObj['covid-symptoms'] = sortedCovidSymptomsData;
      covidObj['going-ahead'] = sortedGoingAheadData;
      covidObj['total-term'] = body['totalterm'];
      setCovidContent(covidObj);
    });
  }, []);

  useEffect(() => {
    if (didMount.current && categoryToFetch !== '') {
      const currentOffset = covidContent[categoryToFetch].length;
      fetchUtil(
        `${covidArticleBaseUrl}?catid=${categoryToFetch}&limit=3&offset=${currentOffset}`,
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
      {isDesktopOnly ? <Header /> : ''}
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <Banner isWebView={isWebView} />
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
                  {_isEmpty(covidContent['stay-safe']) ? (
                    <div className={classes.progressLoader}>
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      {covidContent &&
                        covidContent[parentCat.category] &&
                        covidContent[parentCat.category].length && (
                          <ArticleCard
                            handleInfographicClick={(data) => handleInfographicClick(data)}
                            content={covidContent[parentCat.category]}
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
      <NavigationBottom />
    </div>
  );
};
