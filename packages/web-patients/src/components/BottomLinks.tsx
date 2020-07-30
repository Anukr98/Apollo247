import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import fetchUtil from 'helpers/fetch';

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
        paddingBottom: 30,
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
            paddingBottom: 20,
            '&:last-child': {
              borderBottom: 'none',
            },
          },
          '& a': {
            color: '#fff',
            fontSize: 14,
            lineHeight: '24px',
            display: 'inline-block',
            width: '100%',
            textAlign: 'left',
            [theme.breakpoints.down('xs')]: {
              color: '#FCB716',
            },
            '&:hover': {
              textDecoration: 'none',
            },
            '&:first-child': {
              color: '#FCB716',
              marginBottom: 15,
              [theme.breakpoints.down('xs')]: {
                color: '#fff',
                textTransform: 'uppercase',
                marginTop: 15,
              },
            },
          },
        },
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
                    <a href={'#'}>{currentItem}</a>
                    {footerData[currentItem].map((currentLink: FooterUrlInterface) => {
                      return (
                        <a key={currentLink.title} href={currentLink.url} target="_blank">
                          {currentLink.title}
                        </a>
                      );
                    })}
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
