import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { BottomLinks } from 'components/BottomLinks';
import { NavigationBottom } from 'components/NavigationBottom';
import { dataLayerTracking } from 'gtmTracking';
import { MetaTagsComp } from 'MetaTagsComp';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      fontSize: 18,
      '& section': {
        paddingTop: 100,
        paddingBottom: 100,
        minHeight: '87vh',
        [theme.breakpoints.down(900)]: {
          paddingTop: 50,
          paddingBottom: 50,
        },
      },
      '& p': {
        marginBottom: 20,
        lineHeight: 1.5,
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f7f8f5',
        padding: 40,
        borderRadius: '0 0 10px 10px',
      },
    },
  };
});

const ContactUs: React.FC = (props) => {
  const classes = useStyles({});

  useEffect(() => {
    /**Gtm code start start */
    dataLayerTracking({
      event: 'pageviewEvent',
      pagePath: window.location.href,
      pageName: 'Contact Page',
      pageLOB: 'Others',
      pageType: 'Contact Page',
    });
    /**Gtm code start end */
  }, []);

  const [metaTagProps, setMetaTagProps] = useState(null);
  useEffect(() => {
    setMetaTagProps({
      title: 'Apollo 247 - Contact Us - Apollo Hospitals',
      description:
        'Apollo 247- Have a query about our products, services, online doctor consultation and more - write to us',
      canonicalLink: typeof window !== 'undefined' && window.location && window.location.href,
    });
  }, []);

  useEffect(() => {
    /**Gtm code start start */
    dataLayerTracking({
      event: 'pageviewEvent',
      pagePath: window.location.href,
      pageName: 'Contact Page',
      pageLOB: 'Others',
      pageType: 'Contact Page',
    });
    /**Gtm code start end */
  }, []);

  return (
    <div className={classes.root}>
      {metaTagProps && <MetaTagsComp {...metaTagProps} />}
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <h1>Contact Us</h1>
          <p>
            <b>Apollo Hospitals</b>
            <br />
            Rd Number 72,
            <br />
            opp. Bharatiya Vidya Bhavan School,
            <br />
            Jubilee Hills,
            <br />
            Hyderabad,
            <br />
            Telangana 500033
          </p>
        </div>
      </div>
      <BottomLinks />
      <NavigationBottom />
    </div>
  );
};

export default ContactUs;
