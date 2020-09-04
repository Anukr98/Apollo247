import React, { useState } from 'react';
import { makeStyles, mergeClasses } from '@material-ui/styles';
import { Theme, Typography, Grid } from '@material-ui/core';
import { Header } from 'components/Header';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) => {
  return {
    sitemapContainer: {},
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    sitemapContent: {
      background: '#f7f8f5',
      padding: '0 0 20px',
    },
    sitemapHeader: {
      padding: '20px 20px 0',
    },
    sectionTitle: {
      '& h2': {
        fontSize: 24,
        fontWeight: 700,
        textTransform: 'uppercase',
        margin: '0 0 10px 3px',
      },
    },
    breadcrumbs: {
      margin: '0 0 20px',
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
    font48: {
      fontSize: 48,
    },
    showMore: {
      fontSize: 14,
      color: '#FC9916',
      textTransform: 'uppercase',

      textAlign: 'center',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& svg': {
        color: '#FC9916',
        margin: '0 0 0 10px',
        transition: '0.5s ease-in-out',
      },
    },
    sitemapListContainer: {
      padding: 20,
      background: '#fff',
      borderRadius: 10,
      boxShadow: '0px 1px 12px rgba(0, 0, 0, 0.1)',
      position: 'relative',
    },
    sitemapListContent: {
      borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
      padding: '0 20px 20px',
      [theme.breakpoints.down('sm')]: {
        padding: '20px 10px 10px',
      },
      '&:last-child': {
        border: 'none',
      },
    },
    sitemapList: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      height: 335,
      overflow: 'hidden',
      transition: '1s ease',
      [theme.breakpoints.down('sm')]: {
        height: 180,
      },
      '& li': {
        '& a': {
          fontSize: 20,
          lineHeight: '26px',
          letterSpacing: '0.2px',
          padding: '15px  0',
          position: 'relative',
          display: 'block',
          [theme.breakpoints.down('sm')]: {
            padding: '10px 0',
          },
          '&:after': {
            content: "''",
            position: 'absolute',
            bottom: 10,
            width: 70,
            left: 0,
            borderRadius: 6,
            borderBottom: '4px solid transparent',
            [theme.breakpoints.down('sm')]: {
              bottom: 5,
            },
          },
        },
        '&.active': {
          '& a': {
            color: '#00B38E',
            fontWeight: 700,
            '&:after': {
              borderColor: '#00B38E',
            },
          },
        },
      },
    },
    heightFull: {
      height: '100% !important',
    },
    smActive: {
      '& svg': {
        transform: 'rotate(180deg)',
      },
    },
    sitemapLinkContainer: {
      height: 760,
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: 5,
        borderRadius: 5,
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(196, 196, 196, 0.2)',
      },
    },
    categoryTitle: {
      fontSize: 20,
      lineHeight: '26px',
      fontWeight: 600,
      color: '#0087BA',
      padding: '0 0 10px',
    },
    smLinkList: {
      margin: 0,
      padding: '0 0 15px',
      listStyle: 'none',
      '& li': {
        '& a': {
          fontSize: 16,
          lineHeight: '20px',
          fontWeight: 500,
          textTransform: 'capitalize',
          padding: '5px 0',
          display: 'block',
        },
      },
    },
    sLinkContent: {},
    paginationContainer: {
      width: 150,
      position: 'absolute',
      top: -40,
      right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& p': {
        fontSize: 12,
        lineHeight: '13px',
        color: '#4A4A4A',
        padding: '0 10px',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    arrow: {
      position: 'relative',
      width: 15,
      height: 15,
      transform: 'rotate(45deg)',
      border: '4px solid transparent',
      '&:before': {
        content: "''",
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 4,
        background: '#00B38E',
      },
      '&:after': {
        content: "''",
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 4,
        background: '#00B38E',
      },
    },
    prev: {
      borderLeftColor: '#00B38E',
      borderBottomColor: '#00B38E',
      '&:before': {
        top: -2,
        left: 6,
      },
      '&:after': {
        bottom: 10,
        right: -8,
      },
    },
    next: {
      borderTopColor: '#00B38E',
      borderRightColor: '#00B38E',
      '&:before': {
        top: 6,
        left: -2,
      },
      '&:after': {
        right: 10,
        bottom: -8,
      },
    },
    slMobile: {
      display: 'none',
      alignItems: 'center',
      // margin: '0 0 50px',
      '& img': {
        position: 'relative',
        zIndex: 4,
        margin: '0 20px 0 0',
      },
      '& p': {
        fontSize: 20,
        lineHeight: '26px',
        fontWeight: 700,
        color: '#00B38E',
      },
      [theme.breakpoints.down('sm')]: {
        display: 'flex',
      },
    },
    sitemapLeft: {},
    slWrapper: {
      position: 'relative',
      padding: '0 20px',
    },
    slContainer: {
      [theme.breakpoints.down('sm')]: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderRadius: 0,
        zIndex: 2,
        height: 500,
        overFlow: 'auto',
        display: 'none',
      },
    },
  };
});

export const Sitemap: React.FC = (props) => {
  const classes = useStyles({});
  const [showMore, setShowMore] = useState<Boolean>(false);
  const [showMore1, setShowMore1] = useState<Boolean>(false);
  return (
    <div className={classes.sitemapContainer}>
      <Header />
      <div className={classes.container}>
        <div className={classes.sitemapContent}>
          <div className={classes.sitemapHeader}>
            <div className={classes.sectionTitle}>
              <Typography component="h2">
                <span className={classes.font48}>A</span>PPOLO 24|7 SITE MAP
              </Typography>
            </div>
            <ol className={classes.breadcrumbs}>
              <li>
                <a href="javascript:void(0)">Home</a>
              </li>
              <li className="active">
                <a href="javascript:void(0)">Sitemap</a>
              </li>
            </ol>
          </div>
          <div className={classes.slWrapper}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <div className={classes.sitemapLeft}>
                  <div className={classes.slMobile}>
                    <img src={require('images/ham-menu.svg')} alt="Ham Menu" />
                    <img
                      src={require('images/ham-close.svg')}
                      alt="Ham Close
                    "
                    />
                    <Typography>Apollo 24|7 Services</Typography>
                  </div>
                  <div className={`${classes.sitemapListContainer} ${classes.slContainer}`}>
                    <div className={classes.sitemapListContent}>
                      <ul
                        className={`${classes.sitemapList} ${showMore ? classes.heightFull : ''}`}
                      >
                        <li className="active">
                          <a href="javascript: void(0);">Apollo 24|7 Services</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 1</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 2</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 3</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 4</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 5</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 6</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 7</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 8</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 9</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Doctor Sitemap 10</a>
                        </li>
                      </ul>
                      <a
                        href="javascript:void(0);"
                        className={`${classes.showMore} ${showMore ? classes.smActive : ''}`}
                        onClick={() => setShowMore(!showMore)}
                      >
                        {!showMore ? <span>Show More</span> : <span>Hide</span>}
                        <ExpandMoreIcon />
                      </a>
                    </div>
                    <div className={classes.sitemapListContent}>
                      <ul
                        className={`${classes.sitemapList} ${showMore1 ? classes.heightFull : ''}`}
                      >
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 1</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 2</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 3</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 4</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 5</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 6</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 7</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 8</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 9</a>
                        </li>
                        <li>
                          <a href="javascript: void(0);">Medicine Sitemap 10</a>
                        </li>
                      </ul>
                      <a
                        href="javascript:void(0);"
                        className={`${classes.showMore} ${showMore1 ? classes.smActive : ''}`}
                        onClick={() => setShowMore1(!showMore1)}
                      >
                        {!showMore1 ? <span>Show More</span> : <span>Hide</span>}
                        <ExpandMoreIcon />
                      </a>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={8}>
                <div className={classes.sitemapListContainer}>
                  <div className={classes.paginationContainer}>
                    <a
                      href="javascript:void(0);"
                      className={`${classes.arrow} ${classes.prev}`}
                    ></a>
                    <Typography>Page 1 of 50 </Typography>
                    <a
                      href="javascript:void(0);"
                      className={`${classes.arrow} ${classes.next}`}
                    ></a>
                  </div>
                  <div className={classes.sitemapLinkContainer}>
                    <div className={classes.sLinkContent}>
                      <Typography component="h3" className={classes.categoryTitle}>
                        About Apollo24|7
                      </Typography>
                      <ul className={classes.smLinkList}>
                        <li>
                          <a href="javascript:void(0);">
                            online Doctor Consultation and medicine delivery - Apollo 24|7
                          </a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Order Medicine online</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Speciality</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">List of Doctors</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Book online doctor appointment</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Health Records</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">My account</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">about us - apollo 24|7</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">FAQ’s</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Terms and Conditions</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Privacy Policy</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Contact Us</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Check Risk level of Covid-19</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Project Kavach</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Latest updates on covid-19</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Prescription review</a>
                        </li>
                      </ul>
                    </div>
                    <div className={classes.sLinkContent}>
                      <Typography component="h3" className={classes.categoryTitle}>
                        Shop By Category
                      </Typography>
                      <ul className={classes.smLinkList}>
                        <li>
                          <a href="javascript:void(0);">View All Medicine Brands</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Search by brand</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Personal care</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Mom Baby</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Nutrition</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Healthcare devices</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Special offers</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Holland Barret</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Healthcare</a>
                        </li>
                      </ul>
                    </div>
                    <div className={classes.sLinkContent}>
                      <Typography component="h3" className={classes.categoryTitle}>
                        Shop By Health Areas
                      </Typography>
                      <ul className={classes.smLinkList}>
                        <li>
                          <a href="javascript:void(0);">Adult Care</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Beauty Skin Care</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Cardiac</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Mom Baby</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Nutrition</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Healthcare devices</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Special offers</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Holland Barret</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Healthcare</a>
                        </li>
                      </ul>
                    </div>
                    <div className={classes.sLinkContent}>
                      <Typography component="h3" className={classes.categoryTitle}>
                        About Apollo24|7
                      </Typography>
                      <ul className={classes.smLinkList}>
                        <li>
                          <a href="javascript:void(0);">
                            online Doctor Consultation and medicine delivery - Apollo 24|7
                          </a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Order Medicine online</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Speciality</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">List of Doctors</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Book online doctor appointment</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Health Records</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">My account</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">about us - apollo 24|7</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">FAQ’s</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Terms and Conditions</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Privacy Policy</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Contact Us</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Check Risk level of Covid-19</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Project Kavach</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Latest updates on covid-19</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Prescription review</a>
                        </li>
                      </ul>
                    </div>
                    <div className={classes.sLinkContent}>
                      <Typography component="h3" className={classes.categoryTitle}>
                        Shop By Category
                      </Typography>
                      <ul className={classes.smLinkList}>
                        <li>
                          <a href="javascript:void(0);">View All Medicine Brands</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Search by brand</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Personal care</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Mom Baby</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Nutrition</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Healthcare devices</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Special offers</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Holland Barret</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Healthcare</a>
                        </li>
                      </ul>
                    </div>
                    <div className={classes.sLinkContent}>
                      <Typography component="h3" className={classes.categoryTitle}>
                        Shop By Health Areas
                      </Typography>
                      <ul className={classes.smLinkList}>
                        <li>
                          <a href="javascript:void(0);">Adult Care</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Beauty Skin Care</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Cardiac</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Mom Baby</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Nutrition</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Healthcare devices</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Special offers</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Holland Barret</a>
                        </li>
                        <li>
                          <a href="javascript:void(0);">Healthcare</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};
