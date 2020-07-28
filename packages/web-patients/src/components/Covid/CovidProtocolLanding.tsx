import React, { useEffect, useRef, useState } from 'react';
import {
  CircularProgress,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Theme,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';
import { clientRoutes } from 'helpers/clientRoutes';
import { Banner } from 'components/Covid/Banner';
import { CheckRiskLevel } from 'components/Covid/CheckRiskLevel';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import fetchUtil from 'helpers/fetch';

interface CovidProtocolData {
  introductionBody: string;
  introductionTitle: string;
  [index: string]: any;
}

const useStyles = makeStyles((theme: Theme) => {
  return {
    cdLanding: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    cdContent: {
      // padding: 30,
      background: '#f7f8f5',
      [theme.breakpoints.down('sm')]: {
        padding: '20px 15px',
      },
    },
    loader: {
      display: 'flex',
      justifyContent: 'center',
      padding: 20,
    },
    pageContainer: {
      marginTop: -72,
      [theme.breakpoints.up('sm')]: {
        marginTop: 0,
      },
    },
    expansionContainer: {},
    expandIcon: {
      margin: 0,
      padding: 0,
      [theme.breakpoints.down('sm')]: {
        color: '#02475b',
      },
    },
    panelExpanded: {
      margin: '0 !important',
    },
    summaryContent: {
      margin: 0,
    },
    panelDetails: {
      borderTop: '1px solid rgba(2, 71, 91, .2)',
      padding: '10px 0',
      margin: '10px 0 0',
      '& p': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
      },
    },
    panelRoot: {
      padding: '20px 40px',
      boxShadow: '0 0px 10px 0 rgba(208, 205, 205, 0.3)',
      borderRadius: '8px !important',
      margin: '0 0 20px !important',
      '&:before': {
        display: 'none',
      },
      [theme.breakpoints.down('sm')]: {
        padding: 10,
      },
    },
    cdIntro: {
      margin: '20px 0 ',
      borderRadius: 10,
      padding: '30px 50px',
      background: '#fff',
      boxShadow: '0 2px 6px 0 rgba(208, 205, 205, 0.2)',
      '& h4': {
        fontSize: 23,
        color: '#02475b',
        fontWeight: 700,
        margin: '0 0 10px',
      },
      '& p': {
        fontSize: 16,
        color: '#02475b',
        margin: '0 0 20px',
      },
      [theme.breakpoints.down('sm')]: {
        padding: 20,
        '& h4': {
          fontSize: 18,
        },
        '& p': {
          fontSize: 14,
        },
      },
    },
    refList: {
      margin: 0,
      '& li': {
        color: '#67919d',
        '& a': {
          fontSize: 16,
          padding: '5px 0',
          color: '#02475b',
        },
      },
      [theme.breakpoints.down('sm')]: {
        padding: '0 0 0 20px',
        '& li': {
          '& a': {
            fontSize: 14,
          },
        },
      },
    },
    panelHeader: {
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      margin: '0 !important',
      minHeight: 'auto !important',
      '& img': {
        margin: '0 10px 0 0',
        maxWidth: 50,
      },
    },

    panelHeading: {
      margin: 0,
      fontSize: 23,
      fontWeight: 600,
      [theme.breakpoints.down('sm')]: {
        fontSize: 16,
      },
    },
    detailsContent: {
      width: '100%',
      '& p': {
        fontSize: 16,
        margin: '0 0 10px',
        padding: '0 12px',
        '&:last-child': {
          margin: 0,
        },
      },
    },
    listStyleNone: {
      listStyle: 'none',
    },
    heightAuto: {
      height: 'auto !important',
    },
    cdList: {
      padding: '0 0 0 25px',
      margin: 0,
      height: 75,
      overflow: 'hidden',
      transition: '0.5s ease',
      '& li': {
        padding: '5px 0',
        color: '#02475b',
      },
    },
    fontBold: {
      fontWeight: 700,
    },
    seemore: {
      textAlign: 'right',
      display: 'block',
      fontSize: 13,
      color: '#fcb716',
      margin: '10px 0 0',
      fontWeight: 'bold',
    },
    zeroState: {
      textAlign: 'center',
      marginTop: 30,
    },
    conclusionContent: {},
  };
});

export const covidProtocolLanding: React.FC = (props: any) => {
  const classes = useStyles({});
  const [seemore, setSeemore] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [zeroState, showZeroState] = React.useState<boolean>(false);
  const [symptomData, setSymptomData] = React.useState<CovidProtocolData>(null);
  const scrollToRef = useRef<HTMLDivElement>(null);
  const { currentPatient } = useAllCurrentPatients();
  const { isSignedIn, isSigningIn } = useAuth();

  useEffect(() => {
    scrollToRef &&
      scrollToRef.current &&
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    !isSigningIn && !isSignedIn && props.history.push(clientRoutes.covidLanding());
  }, [isSignedIn, isSigningIn]);

  const covidProtocolUrl = process.env.COVID_PROTOCOL_URL;

  useEffect(() => {
    if (isLoading && currentPatient && currentPatient.mobileNumber) {
      fetchUtil(
        covidProtocolUrl + '/' + currentPatient.mobileNumber.substring(3),
        'GET',
        {},
        '',
        true
      )
        .then((res: any) => {
          if (res && res.success) {
            setSymptomData(res.data);
          } else {
            setSymptomData(null);
            showZeroState(true);
          }
        })
        .catch(() => showZeroState(true))
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [currentPatient]);
  const isWebView =
    sessionStorage.getItem('webView') && sessionStorage.getItem('webView').length > 0;
  const subtitle = (symptomData && symptomData['covidProtocolData'][0].category) || '';
  return (
    <div className={classes.cdLanding} ref={scrollToRef}>
      {!isWebView && <Header />}
      <div className={classes.container}>
        <div className={classes.cdContent}>
          <Banner
            title={'Personalized Coronavirus (COVID-19) guide'}
            subtitle={subtitle}
            isWebView={false}
            backLocation={clientRoutes.covidLanding()}
          />
          {isLoading && !symptomData ? (
            <div className={classes.loader}>
              <CircularProgress size={22} color="secondary" />
            </div>
          ) : zeroState ? (
            <div className={classes.zeroState}>
              <img src={require('images/zero-state.png')} alt={'zero state'} />
              <div>No results found</div>
              <div>It seems we can’t find any results.</div>
            </div>
          ) : (
            <>
              <div className={classes.cdIntro}>
                <Typography component="h4">
                  {symptomData && symptomData.introductionTitle}
                </Typography>
                <Typography>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: symptomData && symptomData.introductionBody,
                    }}
                  />
                </Typography>
              </div>

              <div className={` ${classes.expansionContainer} `}>
                {// eslint-disable-next-line @typescript-eslint/no-explicit-any
                symptomData['covidProtocolData'] &&
                  symptomData['covidProtocolData'].map((item: any, index: number) => {
                    return (
                      <ExpansionPanel defaultExpanded className={classes.panelRoot}>
                        <ExpansionPanelSummary
                          expandIcon={<ExpandMoreIcon />}
                          classes={{
                            root: classes.panelHeader,
                            content: classes.summaryContent,
                            expandIcon: classes.expandIcon,
                            expanded: classes.panelExpanded,
                          }}
                        >
                          <img src={item.iconImage} />
                          <Typography className={classes.panelHeading}>{item.title}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.panelDetails}>
                          <div className={classes.detailsContent}>
                            {item.bodyContent && <p>{item.bodyContent}</p>}
                            {item && item.bodyContentList && (
                              <ul>
                                {item.bodyContentList && seemore === item.id
                                  ? item.bodyContentList.map((text: string) => {
                                      return <li>{text}</li>;
                                    })
                                  : item.bodyContentList.slice(0, 2).map((text: string) => {
                                      return <li>{text}</li>;
                                    })}
                              </ul>
                            )}
                            {item && item.bodyContentList && (
                              <a href="javascript:void(0);" className={classes.seemore}>
                                {seemore === item.id ? (
                                  <span onClick={() => setSeemore('')}>See Less</span>
                                ) : (
                                  <span onClick={() => setSeemore(item.id)}>See More</span>
                                )}
                              </a>
                            )}
                          </div>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    );
                  })}
              </div>
            </>
          )}
          <CheckRiskLevel />
        </div>
      </div>
      <BottomLinks />
      {!isWebView && <NavigationBottom />}
    </div>
  );
};
