import React, { useEffect, useState, useRef } from 'react';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { CircularProgress } from '@material-ui/core';
import { isEmpty } from 'lodash';
import { Header } from 'components/Header';
import { Banner } from 'components/Covid/Banner';
import { AphButton } from '@aph/web-ui-components';
import { ArticleCard } from 'components/Covid/ArticleCard';
import { CheckRiskLevel } from 'components/Covid/CheckRiskLevel';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import fetch from 'helpers/fetch';
import { sortByProperty } from 'helpers/commonHelpers';

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
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f7f8f5',
      paddingBottom: 20,
      [theme.breakpoints.up('sm')]: {
        borderRadius: '0 0 10px 10px',
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
  };
});

export const CovidLanding: React.FC = (props) => {
  const classes = useStyles();
  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const headingArr = [
    {
      heading: 'How can I stay safe?',
      subheading: 'Articles and videos about basic protective measures against the coronavirus',
      category: 'stay-safe',
      defaultExpanded: true,
    },
    {
      heading: 'What to do if I have symptoms?',
      subheading: 'Know more about the symptoms and preventions through articles and videos.',
      category: 'covid-symptoms',
      defaultExpanded: false,
    },
    {
      heading: 'How are we getting ahead?',
      subheading: 'Learn how Apollo is making a difference to help the world against coronavirus.',
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
  const didMount = useRef(false);
  const covidContentPageSize = 3;
  const covidArticleBaseUrl = process.env.COVID_ARTICLE_LIST_URL;

  useEffect(() => {
    fetch(covidArticleBaseUrl!, 'GET', {}, '', true).then((res: any) => {
      const body = res.data;
      const sortedStaySafeData =
        !isEmpty(body['stay-safe']) && sortByProperty(body['stay-safe'], 'displayOrder');
      const sortedCovidSymptomsData =
        !isEmpty(body['covid-symptoms']) && sortByProperty(body['covid-symptoms'], 'displayOrder');
      const sortedGoingAheadData =
        !isEmpty(body['going-ahead']) && sortByProperty(body['going-ahead'], 'displayOrder');

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
      const currentOffset = covidContent[categoryToFetch].length / covidContentPageSize;
      fetch(
        `${covidArticleBaseUrl}?catid=${categoryToFetch}&limit=3&offset=${currentOffset}`,
        'GET',
        {},
        '',
        true
      ).then((res: any) => {
        const sortedData = sortByProperty(res.data[categoryToFetch], 'displayOrder');
        let tempCovidObj: CovidContentInterface = covidContent;
        tempCovidObj[categoryToFetch] = tempCovidObj[categoryToFetch].concat(sortedData);
        setCovidContent(tempCovidObj);
        setMoreContentLoading(false);
        setCategoryToFetch('');
      });
    } else didMount.current = true;
  }, [categoryToFetch]);

  return (
    <div className={classes.root}>
      {isDesktopOnly ? <Header /> : ''}
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <Banner />
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
                  {isEmpty(covidContent['stay-safe']) ? (
                    <div className={classes.progressLoader}>
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <ExpansionPanelDetails className={classes.panelDetails}>
                      {covidContent &&
                        covidContent[parentCat.category] &&
                        covidContent[parentCat.category].length && (
                          <ArticleCard content={covidContent[parentCat.category]} />
                        )}
                      {moreContentLoading ? (
                        <div className={classes.progressLoader}>
                          <CircularProgress size={30} />
                        </div>
                      ) : (
                        <div className={classes.bottomActions}>
                          {!isEmpty(covidContent) &&
                            !isEmpty(covidContent[parentCat.category]) &&
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
        </div>
      </div>
    </div>
  );
};
