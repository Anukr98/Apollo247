import React, { useState, useEffect } from 'react';
import { makeStyles, mergeClasses } from '@material-ui/styles';
import { Theme, Typography, Grid } from '@material-ui/core';
import { Header } from 'components/Header';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_SITEMAP } from 'graphql/profiles';
import { useAuth } from 'hooks/authHooks';
import { clientRoutes } from 'helpers/clientRoutes';
import Pagination from '@material-ui/lab/Pagination';
import { generateSitemap_generateSitemap } from 'graphql/types/generateSitemap';
import { useParams } from 'react-router';

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
          cursor: 'pointer',
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
      // [theme.breakpoints.down('sm')]: {
      //   display: 'none',
      // },
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
    paginationUl: {
      '& li': {
        '& button': {
          fontsize: 14,
          fontWeight: 700,
          color: '#02475b',
          '&:hover': {
            background: '#00B38E',
          },
        },
      },
    },
    gridClass: {
      [theme.breakpoints.down('xs')]: {
        padding: '30px 10px !important',
      },
    },
  };
});

export const Sitemap: React.FC = (props) => {
  const classes = useStyles({});
  const params = useParams<{ sitemap: string; pageNo: string }>();
  const [sitemapData, setSitemapData] = useState<generateSitemap_generateSitemap | null>(null);
  const [doctorSitemapData, setDoctorSitemapData] = useState([]);
  const [medicineSitemapData, setMedicineSitemapData] = useState([]);
  const [selected, setSelected] = useState<string>(params.sitemap);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [pageNo, setPageNo] = useState<number>(parseInt(params.pageNo));
  const apolloClient = useApolloClient();
  const { setIsLoading } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    apolloClient
      .query({
        query: GET_SITEMAP,
        variables: {},
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        if (res && res.data && res.data.generateSitemap) {
          setSitemapData(res.data.generateSitemap);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const next = pageNo * 1000 - 1;
    const prev = next - 999;
    if (selected === 'doctors-sitemap') {
      setDoctorSitemapData(
        sitemapData &&
          sitemapData.doctorUrls &&
          sitemapData.doctorUrls.length > 0 &&
          sitemapData.doctorUrls.slice(prev, next)
      );
      history.replaceState(null, '', clientRoutes.sitemap('doctors-sitemap', pageNo.toString()));
    } else if (selected === 'medicines-sitemap') {
      setMedicineSitemapData(
        sitemapData &&
          sitemapData.medicinesUrls &&
          sitemapData.medicinesUrls.length > 0 &&
          sitemapData.medicinesUrls.slice(prev, next)
      );
      history.replaceState(null, '', clientRoutes.sitemap('medicines-sitemap', pageNo.toString()));
    }
  }, [pageNo, selected, sitemapData]);

  const currentServiceLength =
    selected === 'doctors-sitemap'
      ? sitemapData && sitemapData.doctorUrls && sitemapData.doctorUrls.length
      : sitemapData && sitemapData.medicinesUrls && sitemapData.medicinesUrls.length;

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
                <a href={clientRoutes.welcome()}>Home</a>
              </li>
              <li className="active">
                <a href="">Sitemap</a>
              </li>
            </ol>
          </div>
          <div className={classes.slWrapper}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <div className={classes.sitemapLeft}>
                  <div className={classes.slMobile}>
                    {!isMenuOpen ? (
                      <img
                        src={require('images/ham-menu.svg')}
                        alt="Ham Menu"
                        onClick={() => setIsMenuOpen(true)}
                      />
                    ) : (
                      <img
                        src={require('images/ham-close.svg')}
                        onClick={() => setIsMenuOpen(false)}
                        alt="Ham Close"
                      />
                    )}
                    <Typography>
                      {selected === 'sitemap'
                        ? 'Apollo 24|7 Services'
                        : selected === 'doctors-sitemap'
                        ? 'Doctor Sitemap'
                        : 'Medicine Sitemap'}
                    </Typography>
                  </div>
                  <div
                    className={`${classes.sitemapListContainer} ${
                      isMenuOpen ? '' : classes.slContainer
                    }`}
                  >
                    <div className={classes.sitemapListContent}>
                      <ul className={`${classes.sitemapList}`}>
                        <li
                          className={selected === 'sitemap' ? 'active' : ''}
                          onClick={() => {
                            setSelected('sitemap');
                            setIsMenuOpen(false);
                            history.replaceState(null, '', clientRoutes.sitemap('sitemap', '1'));
                          }}
                        >
                          <a>Apollo 24|7 Services</a>
                        </li>
                        <li
                          className={selected === 'doctors-sitemap' ? 'active' : ''}
                          onClick={() => {
                            setSelected('doctors-sitemap');
                            setPageNo(1);
                            setIsMenuOpen(false);
                            history.replaceState(
                              null,
                              '',
                              clientRoutes.sitemap('doctors-sitemap', '1')
                            );
                          }}
                        >
                          <a>Doctor Sitemap</a>
                        </li>
                        <li
                          className={selected === 'medicines-sitemap' ? 'active' : ''}
                          onClick={() => {
                            setSelected('medicines-sitemap');
                            setPageNo(1);
                            setIsMenuOpen(false);
                            history.replaceState(
                              null,
                              '',
                              clientRoutes.sitemap('medicines-sitemap', '1')
                            );
                          }}
                        >
                          <a>Medicine Sitemap</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={8} className={classes.gridClass}>
                <div className={classes.sitemapListContainer}>
                  {selected !== 'sitemap' && (
                    <div className={classes.paginationContainer}>
                      <Pagination
                        count={Math.ceil(currentServiceLength / 1000)}
                        classes={{ ul: classes.paginationUl }}
                        page={pageNo}
                        onChange={(e, value) => setPageNo(value)}
                        siblingCount={0}
                      />
                    </div>
                  )}
                  <div className={classes.sitemapLinkContainer}>
                    {selected === 'sitemap' ? (
                      <>
                        <div className={classes.sLinkContent}>
                          <Typography component="h3" className={classes.categoryTitle}>
                            About Apollo24|7
                          </Typography>
                          {sitemapData &&
                            sitemapData.staticPageUrls &&
                            sitemapData.staticPageUrls.length > 0 &&
                            sitemapData.staticPageUrls.map((key) => (
                              <ul className={classes.smLinkList}>
                                <li>
                                  <a href={key.url}>{key.urlName}</a>
                                </li>
                              </ul>
                            ))}
                        </div>
                        <div className={classes.sLinkContent}>
                          <Typography component="h3" className={classes.categoryTitle}>
                            Shop By Category
                          </Typography>
                          {sitemapData &&
                            sitemapData.shopByCategoryUrls &&
                            sitemapData.shopByCategoryUrls.length > 0 &&
                            sitemapData.shopByCategoryUrls.map((key) => (
                              <ul className={classes.smLinkList}>
                                <li>
                                  <a href={key.url}>{key.urlName}</a>
                                </li>
                              </ul>
                            ))}
                        </div>
                        <div className={classes.sLinkContent}>
                          <Typography component="h3" className={classes.categoryTitle}>
                            Shop By Health Areas
                          </Typography>
                          {sitemapData &&
                            sitemapData.healthAreasUrls &&
                            sitemapData.healthAreasUrls.length > 0 &&
                            sitemapData.healthAreasUrls.map((key) => (
                              <ul className={classes.smLinkList}>
                                <li>
                                  <a href={key.url}>{key.urlName}</a>
                                </li>
                              </ul>
                            ))}
                        </div>
                        <div className={classes.sLinkContent}>
                          <Typography component="h3" className={classes.categoryTitle}>
                            Specialties
                          </Typography>
                          {sitemapData &&
                            sitemapData.specialityUrls &&
                            sitemapData.specialityUrls.length > 0 &&
                            sitemapData.specialityUrls.map((key) => (
                              <ul className={classes.smLinkList}>
                                <li>
                                  <a href={key.url}>{key.urlName}</a>
                                </li>
                              </ul>
                            ))}
                        </div>
                        <div className={classes.sLinkContent}>
                          <Typography component="h3" className={classes.categoryTitle}>
                            Article URLs
                          </Typography>
                          {sitemapData &&
                            sitemapData.articleUrls &&
                            sitemapData.articleUrls.length > 0 &&
                            sitemapData.articleUrls.map((key) => (
                              <ul className={classes.smLinkList}>
                                <li>
                                  <a href={key.url}>{key.urlName.replace('/', '')}</a>
                                </li>
                              </ul>
                            ))}
                        </div>
                      </>
                    ) : selected === 'medicines-sitemap' ? (
                      <div className={classes.sLinkContent}>
                        {medicineSitemapData &&
                          medicineSitemapData.length > 0 &&
                          medicineSitemapData.map((key) => (
                            <ul className={classes.smLinkList}>
                              <li>
                                <a href={key.url}>{key.urlName}</a>
                              </li>
                            </ul>
                          ))}
                      </div>
                    ) : (
                      selected === 'doctors-sitemap' && (
                        <div className={classes.sLinkContent}>
                          {doctorSitemapData &&
                            doctorSitemapData.length > 0 &&
                            doctorSitemapData.map((key) => (
                              <ul className={classes.smLinkList}>
                                <li>
                                  <a href={key.url}>{key.urlName}</a>
                                </li>
                              </ul>
                            ))}
                        </div>
                      )
                    )}
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
