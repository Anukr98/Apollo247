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

import { useParams } from '../../hooks/routerHooks';
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
        color: '#67919d',
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
        color: '#67919d',
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
          color: '#67919d',
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
        margin: '0 20px 0 0',
        maxWidth: 24,
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
      height: 100,
      overflow: 'hidden',
      transition: '0.5s ease',
      '& li': {
        padding: '5px 0',
        color: '#67919d',
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
    conclusionContent: {},
  };
});
export const covidProtocolLanding: React.FC = (props: any) => {
  const classes = useStyles({});
  // const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [seemore, setSeemore] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [symptomData, setSymptomData] = React.useState<CovidProtocolData>();
  // const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  // const onePrimaryUser =
  //   allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1;
  const scrollToRef = useRef<HTMLDivElement>(null);

  const params = useParams<{
    symptom: string;
  }>();

  useEffect(() => {
    scrollToRef &&
      scrollToRef.current &&
      scrollToRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isLoading) {
      fetchUtil(process.env.COVID_PROTOCOL_URL + '/covid-diabetes', 'GET', {}, '', true)
        .then((res: any) => {
          if (res && res.success) {
            setSymptomData(res.data);
          } else {
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  });

  useEffect(() => {
    if (props && props.location && props.location.search && props.location.search.length) {
      const qParamsArr = props.location.search.split('=');
      if (qParamsArr && qParamsArr.length) {
        const isWebView = qParamsArr.some((param: string) => param.includes('mobile_app'));
        setIsWebView(isWebView);
      }
    }
  });

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  const [isWebView, setIsWebView] = useState<boolean>(false);
  return (
    <div className={classes.cdLanding} ref={scrollToRef}>
      <Header />
      <div className={classes.container}>
        <div className={classes.cdContent}>
          <Banner isWebView={isWebView} backLocation={clientRoutes.covidLanding()} />
          {isLoading ? (
            <div className={classes.loader}>
              <CircularProgress size={22} color="secondary" />
            </div>
          ) : (
              <>
                <div className={classes.cdIntro}>
                  <Typography component="h4">{symptomData.introductionTitle}</Typography>
                  <Typography>
                    <div
                      // className={classes.htmlContent}
                      dangerouslySetInnerHTML={{ __html: symptomData.introductionBody }}
                    />
                  </Typography>
                </div>

                <div className={` ${classes.expansionContainer} `}>
                  {// eslint-disable-next-line @typescript-eslint/no-explicit-any
                    symptomData[params.symptom] &&
                    symptomData[params.symptom].map((item: any, index: number) => {
                      return (
                        <ExpansionPanel
                          expanded={true}
                          onChange={handleChange(`panel${index + 1}`)}
                          className={classes.panelRoot}
                        >
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
                            <Typography className={classes.panelHeading}>{item.category}</Typography>
                          </ExpansionPanelSummary>
                          <ExpansionPanelDetails className={classes.panelDetails}>
                            <div className={classes.detailsContent}>
                              {item.bodyContent && <div>{item.bodyContent}</div>}
                              <ul
                                className={`${classes.cdList} ${seemore ? classes.heightAuto : ''}`}
                              >
                                {item.bodyContentList &&
                                  item.bodyContentList.map((text: string) => <li>{text}</li>)}
                              </ul>

                              <a
                                href="javascript:void(0);"
                                className={classes.seemore}
                                onClick={() => setSeemore(!seemore)}
                              >
                                {seemore ? <span>See Less</span> : <span>See More</span>}
                              </a>
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
      {/*{!onePrimaryUser && <ManageProfile />}*/}
      <BottomLinks />
      {!isWebView && <NavigationBottom />}
    </div>
  );
};
