import React, { useEffect, useState } from 'react';
import { Theme, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { BottomLinks } from 'components/BottomLinks';
import { Header } from 'components/Header';
import fetchUtil from 'helpers/fetch';
import { NavigationBottom } from 'components/NavigationBottom';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { SchemaMarkup } from 'SchemaMarkup';
import { MetaTagsComp } from 'MetaTagsComp';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      fontSize: 18,
      '& p': {
        marginBottom: 20,
        lineHeight: 1.5,
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    loader: {
      textAlign: 'center',
      padding: '20px 0',
      outline: 'none',
    },
    pageContainer: {
      // padding: 20,
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f0f1ec',
        // padding: 40,
      },
    },
    textCenter: {
      textAlign: 'center',
    },
    faqHeader: {
      padding: 30,
      background: '#ffffff',
      boxShadow: ' 0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      '& h1': {
        fontSize: 50,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        color: '#02475b',
      },
      '& h5': {
        fontSize: 17,
        color: '#0087ba',
      },
      [theme.breakpoints.down('xs')]: {
        padding: 20,
        '& h1': {
          fontSize: 36,
          lineHeight: '36px',
          margin: '0 0 10px',
        },
        '& h5': {
          fontSize: 16,
        },
      },
    },
    faqBody: {
      padding: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down('xs')]: {
        padding: 20,
      },
    },
    tabsRoot: {
      borderBottom: '1px solid rgba(2, 71, 91, .3)',
      '& button': {
        flex: '1 0 auto',
        [theme.breakpoints.down('xs')]: {
          flex: '0 0 auto',
        },
      },
    },
    tabRoot: {
      textTransform: 'none',
      fontWeight: 'bold',
      fontSize: 14,
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
      background: '#f7f8f5',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    tabContainer: {
      width: 700,
      borderRadius: 10,
      background: '#ffffff',
      overflow: 'hidden',
      position: 'relative',
    },
    tabContent: {},
    heading: {
      margin: '0 !important',
      width: '100%',
      fontSize: 18,
      fontWeight: 'bold',
    },
    expansionContainer: {
      padding: '10px 0',
    },
    expansionPanel: {
      boxShadow: 'none',
      borderBottom: '1px solid rgba(2, 71, 91, .3)',
      borderRadius: '0 !important',
      margin: '0 !important',
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    expansionSummary: {
      minHeight: 'auto !important',
      padding: '16px 20px',
      '& svg': {
        color: '#02475b',
      },
      '& >div': {
        margin: '0 !important',
        padding: '0 !important',
      },
    },
    expansionDetails: {
      '& p': {
        fontSize: 16,
        margin: '0 !important',
        color: '#02475b',
        fontFamily: 'IBM Plex Sans,sans-serif !important',
        '& *': {
          color: '#02475b',
          fontFamily: 'IBM Plex Sans,sans-serif !important',
        },
      },
      '& ul': {
        listStyleType: 'decimal',
        margin: 0,
        padding: ' 0 0 0 30px',
        '& li': {
          padding: '10px 0',
          fontSize: 16,
        },
      },
    },
    fontBold: {
      fontWeight: 'bold',
    },

    pt0: {
      paddingTop: '0 !important',
    },
    tabScrollArrows: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'inline-flex',
      },
    },
  };
});

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

const Faq: React.FC = (props) => {
  const classes = useStyles({});
  const [value, setValue] = useState(0);
  const [faqData, setFaqData] = useState<any>();
  const [currentCategory, setCurrentCategory] = useState<string>('online-consultation');
  const [faqSchema, setFaqSchema] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const createFaqSchema = (faqData: any) => {
    const mainEntity: any[] = [];
    Object.values(faqData).map((faqs: any[]) => {
      faqs.map((faqObj: any) => {
        mainEntity.push({
          '@type': 'Question',
          name: faqObj.faqQuestion,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faqObj.faqAnswer,
          },
        });
      });
    });
    setFaqSchema({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity,
    });
  };

  useEffect(() => {
    fetchUtil(process.env.APOLLO_247_FAQ_BASE_URL, 'GET', {}, '', true).then((res: any) => {
      if (res && res.data) {
        createFaqSchema(res.data);
        setFaqData(res.data);
        setIsLoading(false);
      }
    });
  }, []);

  const metaTagProps = {
    title: 'Frequently Asked Questions (FAQs)  - Doctors, Medicines And More - Apollo 247',
    description:
      "FAQs on doctors, medicines, and more on Apollo 247 - India's online pharmacy store. Have all your questions answered at one place. Visit FAQs by Apollo 247 to get your answer today!",
    canonicalLink: window && window.location && window.location.href,
  };

  return (
    <div className={classes.root}>
      <MetaTagsComp {...metaTagProps} />
      <Header />
      {faqSchema && <SchemaMarkup structuredJSON={faqSchema} />}
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.faqHeader}>
            <Typography component="h1">how can we help you?</Typography>
            <Typography component="h5">
              We are here to answer all your Frequently Asked Questions
            </Typography>
          </div>
          <div className={classes.faqBody}>
            <div className={classes.tabContainer}>
              <Tabs
                value={value}
                classes={{
                  root: classes.tabsRoot,
                  indicator: classes.tabsIndicator,
                  scrollButtons: classes.tabScrollArrows,
                }}
                variant="scrollable"
                onChange={handleChange}
                scrollButtons="on"
                indicatorColor="primary"
                aria-label="scrollable force tabs example"
              >
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Online Consultation"
                  onClick={() => {
                    setCurrentCategory('online-consultation');
                  }}
                />
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Pharmacy"
                  onClick={() => {
                    setCurrentCategory('pharmacy');
                  }}
                />
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="PHR"
                  onClick={() => {
                    setCurrentCategory('phr');
                  }}
                />
                <Tab
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                  label="Diagnostics"
                  onClick={() => {
                    setCurrentCategory('diagnostic');
                  }}
                />
              </Tabs>
              <div className={classes.tabContent}>
                {isLoading ? (
                  <div className={classes.loader}>
                    <CircularProgress />
                  </div>
                ) : (
                  <TabPanel>
                    <div className={classes.expansionContainer}>
                      {faqData &&
                        faqData[currentCategory] &&
                        faqData[currentCategory].map((faq: any) => {
                          return (
                            <ExpansionPanel className={classes.expansionPanel}>
                              <ExpansionPanelSummary
                                className={classes.expansionSummary}
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                              >
                                <Typography className={classes.heading}>
                                  {faq.faqQuestion}
                                </Typography>
                              </ExpansionPanelSummary>
                              <ExpansionPanelDetails className={classes.pt0}>
                                <div
                                  className={classes.expansionDetails}
                                  dangerouslySetInnerHTML={{ __html: faq.faqAnswer }}
                                />
                              </ExpansionPanelDetails>
                            </ExpansionPanel>
                          );
                        })}
                    </div>
                  </TabPanel>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};

export default Faq;
