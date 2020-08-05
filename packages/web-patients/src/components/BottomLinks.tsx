import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import fetchUtil from 'helpers/fetch';
import { Visibility } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    bottomLinks: {
      backgroundColor: '#020d11',
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        paddingTop: 30,
        paddingBottom: 10,
      },
      '& ul': {
        padding: 0,
        margin: 0,
        [theme.breakpoints.up('sm')]: {
          display: 'flex',
        },
        '& li': {
          listStyleType: 'none',
          paddingTop: 6,
          paddingBottom: 6,
          [theme.breakpoints.up('sm')]: {
            padding: '0 8px',
            width: '20%',
            textAlign: 'center',
          },
          [theme.breakpoints.down('xs')]: {
            borderBottom: '1px solid rgba(35, 43, 46, 0.86)',
            paddingBottom: 10,
            '&:last-child': {
              borderBottom: 'none',
            },
          },
          '& a': {
            color: '#fff',
            fontSize: 14,
            lineHeight: '27px',
            display: 'inline-block',
            width: '100%',
            textAlign: 'left',
            [theme.breakpoints.down('xs')]: {
              color: '#FCB716',
            },
            '&:hover': {
              textDecoration: 'none',
            },
          },
        },
      },
    },
    collapseHeader: {
      color: '#FCB716 !important',
      marginBottom: 0,
      minHeight: '30px !important',
      [theme.breakpoints.down('xs')]: {
        color: '#fff !important',
        textTransform: 'uppercase',
        marginTop: 7,
        marginBottom: 0,
        paddingLeft: 6,
      },
    },
    logo: {
      paddingBottom: 11,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 12,
        paddingBottom: 9,
      },
      '& a': {
        display: 'block',
      },
      '& img': {
        maxWidth: 105,
        verticalAlign: 'middle',
      },
    },
    LogoMd: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    LogoXs: {
      display: 'none',
      borderBottom: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        '& a': {
          textAlign: 'center !important',
        },
      },
    },
    panelRoot: {
      margin: '0 !important',
      boxShadow: 'none',
      width: '100%',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      borderRadius: '0 !important',
      background: 'transparent',
      '&:before': {
        display: 'none',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
      '& div': {
        '&:nth-child(2)': {
          [theme.breakpoints.up('sm')]: {
            visibility: 'visible !important',
            height: 'auto',
          },
        },
      },
    },
    panelHeader: {
      fontSize: 14,
      padding: 0,
      fontWeight: 600,
      color: '#02475b',
      alignItems: 'flex-start',
      minHeight: '30px !important',
      margin: '0 !important',
      [theme.breakpoints.up('sm')]: {
       pointerEvents: 'none',
      },
    },
    summaryContent: {
      margin: '0 !important',
      display: 'block',
    },
    expandIcon: {
      padding: 0,
      margin: 0,
      position: 'absolute',
      top: 0,
      left: 0,
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'inline-block',
       },
    },
    panelExpanded: {
      minHeight: 'auto !important',
      margin: '0 !important',
    },
    panelDetails: {
      padding: 0,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      height: 'auto',
      paddingBottom: 16,
    },
    innerLinks: {
      display: 'inline-block',
      width: '100%',
    },
    panelDetailsBlock: {
      display: 'block !important',
      minHeight: 0,
      height: 'auto',
      padding: '10px 0px 20px 9px',
      [theme.breakpoints.down('xs')]: {
        padding: '10px 0px 20px 28px',
      }
    },
    defaultOpen: {
      minHeight: 0,
      height: 'auto',
    },
    expandedIcon: {
      opacity: 0,
      [theme.breakpoints.down('xs')]: {
        paddingRight: 5,
        opacity: 1,
       },
      
    },
  };
});

interface FooterUrlInterface {
  url: string;
  title: string;
}

export const BottomLinks: React.FC = (props) => {
  const classes = useStyles({});
  const [footerData, setFooterData] = useState(null);
  const [footerKeys, setFooterkeys] = useState<string[]>([]);
  const footerDataUrl = process.env.FOOTER_DATA_URL;
  useEffect(() => {
    if (sessionStorage.getItem('footerData') && sessionStorage.getItem('footerKeys')) {
      setFooterData(JSON.parse(sessionStorage.getItem('footerData')));
      setFooterkeys(JSON.parse(sessionStorage.getItem('footerKeys')));
    } else {
      fetchUtil(footerDataUrl, 'GET', {}, '', true).then((res: any) => {
        if (res && res.data) {
          sessionStorage.setItem('footerData', JSON.stringify(res.data));
          sessionStorage.setItem('footerKeys', JSON.stringify(Object.keys(res.data)));
          setFooterData(res.data);
          setFooterkeys(Object.keys(res.data));
        }
      });
    }
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.bottomLinks}>
          <ul>
            <li className={classes.LogoMd}>
              <Link to="/" className={classes.logo}>
                <img
                  src={require('images/ic_logo.png')}
                  title={'Online Doctor Consultation & Medicines'}
                  alt={'Online Doctor Consultation & Medicines'}
                />
              </Link>
            </li>
            {footerKeys &&
              footerKeys.map((currentItem: string) => {
                return (
                  
                <li key={currentItem}>
                    <ExpansionPanel  className={classes.panelRoot}>
                      <ExpansionPanelSummary
                          classes={{
                          root: classes.panelHeader,
                          content: classes.summaryContent,                        
                        }}
                      >
                      <a className={classes.collapseHeader} href={'#'}><span className={classes.expandedIcon}>+</span>{currentItem}</a>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.panelDetailsBlock}>
                        {footerData[currentItem].map((currentLink: FooterUrlInterface) => {
                          return (
                            <a className={classes.innerLinks} key={currentLink.title} href={currentLink.url} target="_blank">
                              {currentLink.title}
                            </a>
                          );
                        })}
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </li>
                );
              })}
            <li className={classes.LogoXs}>
              <Link to="/" className={classes.logo}>
                <img
                  src={require('images/ic_logo.png')}
                  title={'Online Doctor Consultation & Medicines'}
                  alt={'Online Doctor Consultation & Medicines'}
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
