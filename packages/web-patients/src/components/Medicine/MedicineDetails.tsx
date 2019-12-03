import React from 'react';
import { Theme, Tabs, Tab } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { clientRoutes } from 'helpers/clientRoutes';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineFilter } from 'components/Medicine/MedicineFilter';
import ImageGallery from 'react-image-gallery';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    medicineDetailsPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
      },
    },
    medicineDetailsGroup: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 20px 20px 3px',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingRight: 20,
        paddingTop: 14,
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    customScroll: {
      paddingLeft: 20,
      paddingRight: 17,
      paddingBottom: 10,
    },
    productInformation: {
      backgroundColor: theme.palette.common.white,
      padding: 20,
      borderRadius: 5,
      display: 'flex',
    },
    imageGalleryGroup: {
      width: 290,
      '& .image-gallery-slides': {
        border: 'solid 1px rgba(151,151,151,0.24)',
        borderRadius: 10,
        overflow: 'hidden',
      },
      '& .image-gallery-thumbnails': {
        paddingTop: 20,
        '& a': {
          width: 60,
          backgroundColor: theme.palette.common.white,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
          padding: 8,
          border: '1px solid transparent',
          marginLeft: 8,
          '&.active': {
            border: '1px solid #00b38e',
          },
          '&:first-child': {
            marginLeft: 0,
          },
        },
      },
      '& .image-gallery-bullets': {
        position: 'static',
        marginTop: 8,
        '& >div': {
          display: 'flex',
          justifyContent: 'center',
        },
        '& button': {
          padding: 0,
          width: 8,
          height: 8,
          backgroundColor: '#0087ba',
          opacity: 0.4,
          border: '2px solid #fff',
          boxShadow: 'none',
          margin: '0 2px',
          '&.active': {
            border: '4px solid #0087ba',
            opacity: 1,
          },
        },
      },
    },
    productDetails: {
      paddingLeft: 20,
      width: 'calc(100% - 290px)',
      '& h2': {
        fontSize: 20,
        fontWeight: 600,
        color: '#02475b',
        margin: 0,
        paddingBottom: 10,
      },
    },
    textInfo: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      textTransform: 'uppercase',
      paddingBottom: 8,
      '& label': {
        textTransform: 'none',
        color: '#658f9b',
        display: 'block',
      },
    },
    tabsRoot: {
      borderRadius: 0,
      minHeight: 'auto',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      marginTop: 5,
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
      padding: 0,
      paddingBottom: 6,
      textTransform: 'none',
      opacity: 0.5,
      lineHeight: 'normal',
      minWidth: 'auto',
      minHeight: 'auto',
      flexBasis: 'auto',
    },
    tabSelected: {
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 3,
    },
    tabContainer: {
      fontSize: 14,
      color: '#0087ba',
      lineHeight: '22px',
      '& p': {
        margin: '5px 0',
      },
    },
  };
});

export const MedicineDetails: React.FC = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = React.useState<number>(0);
  const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1019/1000/600/',
      thumbnail: 'https://picsum.photos/id/1019/250/150/',
    },
  ];

  return (
    <div className={classes.welcome}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.medicineDetailsPage}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => (window.location.href = clientRoutes.welcome())}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            Product Detail
          </div>
          <div className={classes.medicineDetailsGroup}>
            <div className={classes.searchSection}>
              <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 195px'}>
                <div className={classes.customScroll}>
                  <div className={classes.productInformation}>
                    <div className={classes.imageGalleryGroup}>
                      <ImageGallery
                        items={images}
                        showFullscreenButton={false}
                        showPlayButton={false}
                        showNav={false}
                        showBullets={true}
                      />
                    </div>
                    <div className={classes.productDetails}>
                      <h2>Crocin Advance Tab</h2>
                      <div className={classes.textInfo}>
                        <label>Manufacturer</label>
                        GSK-GSK Consumer Healthcare
                      </div>
                      <div className={classes.textInfo}>
                        <label>Composition</label>
                        Paracetamol-500MG
                      </div>
                      <div className={classes.textInfo}>
                        <label>Pack Of</label>
                        15 Tablets
                      </div>
                      <Tabs
                        value={tabValue}
                        variant="fullWidth"
                        classes={{
                          root: classes.tabsRoot,
                          indicator: classes.tabsIndicator,
                        }}
                        onChange={(e, newValue) => {
                          setTabValue(newValue);
                        }}
                      >
                        <Tab
                          classes={{
                            root: classes.tabRoot,
                            selected: classes.tabSelected,
                          }}
                          label="Overview"
                        />
                        <Tab
                          classes={{
                            root: classes.tabRoot,
                            selected: classes.tabSelected,
                          }}
                          label="Side Effects"
                        />
                        <Tab
                          classes={{
                            root: classes.tabRoot,
                            selected: classes.tabSelected,
                          }}
                          label="Usage"
                        />
                        <Tab
                          classes={{
                            root: classes.tabRoot,
                            selected: classes.tabSelected,
                          }}
                          label="Drug Warnings"
                        />
                      </Tabs>
                      {tabValue === 0 && (
                        <div className={classes.tabContainer}>
                          <p>
                            Paracetamol belongs to a group of medicines called pain-killers or
                            analgesics and it is used for mild to moderate pain including headache,
                            migraine, nerve pain, toothache, sore throat, period pains and general
                            aches and pains. It is also used to relieve the symptoms of cold and flu
                            It is also used to help reduce a fever (high temperature).
                          </p>
                        </div>
                      )}
                      {tabValue === 1 && (
                        <div className={classes.tabContainer}>
                          <p>
                            Paracetamol belongs to a group of medicines called pain-killers or
                            analgesics and it is used for mild to moderate pain including headache,
                            migraine, nerve pain, toothache, sore throat, period pains and general
                            aches and pains. It is also used to relieve the symptoms of cold and flu
                            It is also used to help reduce a fever (high temperature).
                          </p>
                        </div>
                      )}
                      {tabValue === 2 && (
                        <div className={classes.tabContainer}>
                          <p>
                            Paracetamol belongs to a group of medicines called pain-killers or
                            analgesics and it is used for mild to moderate pain including headache,
                            migraine, nerve pain, toothache, sore throat, period pains and general
                            aches and pains. It is also used to relieve the symptoms of cold and flu
                            It is also used to help reduce a fever (high temperature).
                          </p>
                        </div>
                      )}
                      {tabValue === 3 && (
                        <div className={classes.tabContainer}>
                          <p>
                            Paracetamol belongs to a group of medicines called pain-killers or
                            analgesics and it is used for mild to moderate pain including headache,
                            migraine, nerve pain, toothache, sore throat, period pains and general
                            aches and pains. It is also used to relieve the symptoms of cold and flu
                            It is also used to help reduce a fever (high temperature).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Scrollbars>
            </div>
            <MedicineFilter />
          </div>
        </div>
      </div>
    </div>
  );
};
