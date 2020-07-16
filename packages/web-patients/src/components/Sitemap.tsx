import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';
import { Header } from 'components/Header';

const useStyles = makeStyles((theme: Theme) => {
  return {
    sitemapContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    sitemapContent: {
      background: '#f7f8f5',
    },
    sitemapHeader: {
      padding: '20px 20px 0',
    },
    breadcrumbs: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      '& li': {
        '& a': {
          padding: '0 10px',
          position: 'relative',
          '&:before': {
            content: "''",
            position: 'absolute',
            right: -7,
            top: 6,
            border: '4px solid transparent',
            borderLeftColor: '#979797',
          },
        },
        '&:last-child': {
          '& a': {
            '&:before': {
              display: 'none',
            },
          },
        },
        '&.active': {
          '& a': {
            color: '#02475b',
            fontWeight: 500,
            textTransform: 'uppercase',
          },
        },
      },
    },
    sitemapSection: {
      padding: 30,
      position: 'relative',
      borderBottom: '1px solid #ccc',
      minHeight: 400,
      '&:before': {
        content: "''",
        position: 'absolute',
        top: 30,
        left: 0,
        bottom: 30,
        width: 60,
      },
      '& h2': {
        fontSize: 24,
        fontWeight: 700,
        textTransform: 'uppercase',
        margin: '0 0 10px 3px',
      },
    },
    sitemapDetails: {
      width: '35%',
    },
    sitemapList: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 30px',
      '& li': {
        '& a': {
          padding: '5px 0',
          fontSize: 16,
          color: '#02475b',
          fontWeight: 500,
          display: 'inline-block',
        },
      },
    },
    smContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      flexWrap: 'wrap',
      '& h5': {
        fontSize: 20,
        textTransform: 'uppercase',
        fontWeight: 600,
      },
    },
    blue: {
      '& h5': {
        color: '#0087ba',
      },
      '&:before': {
        background: 'rgba(0, 135, 186, 0.15)',
      },
    },
    orange: {
      '& h5': {
        color: '#fc9916',
      },
      '&:before': {
        background: 'rgba(252, 183, 22, 0.15)',
      },
    },
    font48: {
      fontSize: 48,
    },
    mt0: {
      marginTop: '0 !important',
    },
  };
});

export const Sitemap: React.FC = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.sitemapContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.sitemapContent}>
          <div className={classes.sitemapHeader}>
            <ol className={classes.breadcrumbs}>
              <li>
                <a href="javascript:void(0)">Home</a>
              </li>
              <li className="active">
                <a href="javascript:void(0)">Sitemap</a>
              </li>
            </ol>
          </div>
          <div className={`${classes.sitemapSection} ${classes.blue}`}>
            <Typography component="h2">
              <span className={classes.font48}>T</span>itle Heading
            </Typography>
            <div className={classes.smContainer}>
              <div className={classes.sitemapDetails}>
                <Typography component="h5">Heading 1</Typography>
                <ul className={classes.sitemapList}>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                </ul>
              </div>
              <div className={classes.sitemapDetails}>
                <Typography component="h5">Heading 2</Typography>
                <ul className={classes.sitemapList}>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={`${classes.sitemapSection} ${classes.orange}`}>
            <Typography component="h2">
              <span className={classes.font48}>T</span>itle Heading
            </Typography>
            <div className={classes.smContainer}>
              <div className={classes.sitemapDetails}>
                <Typography component="h5">Heading 1</Typography>
                <ul className={classes.sitemapList}>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                </ul>
              </div>
              <div className={classes.sitemapDetails}>
                <Typography component="h5">Heading 2</Typography>
                <ul className={classes.sitemapList}>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                </ul>
              </div>
              <div className={classes.sitemapDetails}>
                <Typography component="h5">Heading 1</Typography>
                <ul className={classes.sitemapList}>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                </ul>
              </div>
              <div className={classes.sitemapDetails}>
                <Typography component="h5">Heading 2</Typography>
                <ul className={classes.sitemapList}>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={`${classes.sitemapSection} ${classes.blue}`}>
            <Typography component="h2">
              <span className={classes.font48}>T</span>itle Heading
            </Typography>
            <div className={classes.smContainer}>
              <div className={classes.sitemapDetails}>
                <Typography component="h5">Heading 1</Typography>
                <ul className={classes.sitemapList}>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                </ul>
              </div>
              <div className={classes.sitemapDetails}>
                <Typography component="h5">Heading 2</Typography>
                <ul className={classes.sitemapList}>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                  <li>
                    <a href="javascript:void(0);">Lorem Ipsum</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
