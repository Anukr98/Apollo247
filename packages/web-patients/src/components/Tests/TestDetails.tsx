import React, { useState } from 'react';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { clientRoutes } from 'helpers/clientRoutes';
import Scrollbars from 'react-custom-scrollbars';
import { NavigationBottom } from 'components/NavigationBottom';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    medicineDetailsPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        zIndex: 999,
        width: '100%',
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
        zIndex: 999,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        boxShadow: '0 15px 20px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      },
    },
    medicineDetailsGroup: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px',
      },
      [theme.breakpoints.down('xs')]: {
        marginTop: 50,
      },
    },
    medicineDetailsHeader: {
      display: 'none',
      background: '#fff',
      padding: 20,
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 999,
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      padding: '0 10px 0 0',
      backgroundColor: '#fff',
      marginRight: 10,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: 0,
      },
    },
    scrollResponsive: {
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 250px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        maxHeight: 'inherit !important',
        height: 'auto !important',
      },
      '& > div': {
        [theme.breakpoints.down('xs')]: {
          maxHeight: 'inherit !important',
        },
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
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
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
    detailsHeader: {
      flex: 1,
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    productInformation: {
      backgroundColor: theme.palette.common.white,
      padding: 20,
      borderRadius: 5,
      [theme.breakpoints.down(992)]: {
        width: '100%',
      },
      [theme.breakpoints.down(768)]: {
        display: 'flex',
        padding: '20px 0 0 0',
        backgroundColor: '#f7f8f5',
      },
    },
    productDetails: {
      paddingLeft: 20,
      width: 'calc(100% - 290px)',
      [theme.breakpoints.down(992)]: {
        width: '100%',
        paddingTop: 20,
      },
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
        paddingLeft: 0,
      },
      '& h2': {
        fontSize: 20,
        fontWeight: 600,
        color: '#02475b',
        margin: 0,
        paddingBottom: 10,
      },
    },
    productBasicInfo: {
      '& h2': {
        marginTop: 0,
      },
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 115,
      },
    },
    productDetailed: {
      [theme.breakpoints.down('xs')]: {
        padding: '20px 0',
      },
    },
    productInfo: {
      fontSize: 14,
      color: '#02475b',
      lineHeight: '22px',
      fontWeight: 500,
      '& p': {
        margin: '5px 0',
      },
      [theme.breakpoints.down('xs')]: {
        borderTop: '0.5px solid rgba(2,71,91,0.3)',
        margin: '0 20px',
        padding: '20px 0',
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
      margin: '5px 0 0 0',
      '& svg': {
        color: '#02475b',
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
      },
      '&:before': {
        content: '""',
        borderTop: '0.5px solid rgba(2,71,91,0.3)',
        position: 'absolute',
        left: 20,
        right: 20,
      },
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
      padding: '10px 0',
      textTransform: 'none',
      opacity: 0.5,
      lineHeight: 'normal',
      minWidth: 'auto',
      minHeight: 'auto',
      flexBasis: 'auto',
      margin: '0 15px 0 0',
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
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      },
      '& p': {
        margin: '5px 0',
      },
    },
    productDescription: {
      fontSize: 14,
      color: '#0087ba',
      lineHeight: '22px',
      '& p': {
        margin: '5px 0',
      },
      '& ul': {
        padding: '0 0 0 20px',
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        padding: 20,
      },
    },
    prescriptionBox: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px',
      display: 'flex',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#02475b',
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    preImg: {
      marginLeft: 'auto',
      paddingLeft: 20,
    },
    medicineSection: {
      backgroundColor: theme.palette.common.white,
      width: 328,
      borderRadius: 5,
      position: 'relative',
      padding: 20,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        backgroundColor: '#f7f8f5',
        paddingBottom: 60,
      },
    },
    customScroll: {
      width: '100%',
      paddingBottom: 10,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 80,
      },
    },
    substitutes: {
      backgroundColor: '#f7f8f5',
      padding: 10,
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#02475b',
      marginBottom: 16,
      textAlign: 'right',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      },
    },
    addToCart: {
      width: '100%',
    },
    testsList: {
      color: '#0087ba',
      fontSize: 14,
      fontWeight: 500,
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const TestDetails: React.FC = (props) => {
  const classes = useStyles({});
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [tabValue, setTabValue] = useState<number>(0);

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.medicineDetailsPage}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => (window.location.href = clientRoutes.tests())}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            <div className={classes.detailsHeader}>Test Detail</div>
          </div>
          <div className={classes.medicineDetailsGroup}>
            <div className={classes.searchSection}>
              <Scrollbars
                className={classes.scrollResponsive}
                autoHide={true}
                autoHeight
                autoHeightMax={'calc(100vh - 215px'}
              >
                <div className={classes.productInformation}>
                  <div className={classes.productBasicInfo}>
                    <h2>Urine Cotinine (Nicotine) Test</h2>
                    <div className={classes.textInfo}>
                      <label>Age Group</label>
                      BELOW 7 YEARS
                    </div>
                    <div className={classes.textInfo}>
                      <label>Gender</label>
                      FOR BOYS AND GIRLS
                    </div>
                    <div className={classes.textInfo}>
                      <label>Sample Type</label>
                      Urine
                    </div>
                    <div className={classes.textInfo}>
                      <label>Collection Method</label>
                      HOME VISIT OR CLINIC VISIT
                    </div>
                  </div>
                  <Tabs value={tabValue}>
                    <Tab
                      classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                      label="Test Included"
                    ></Tab>
                    <Tab
                      classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                      label="Preparation"
                    ></Tab>
                  </Tabs>
                  {tabValue === 0 && (
                    <TabContainer>
                      <div className={classes.testsList}>
                        <span>1.</span>
                        <span>Test a</span>
                      </div>
                      <div className={classes.testsList}>
                        <span>2.</span>
                        <span>Test a</span>
                      </div>
                      <div className={classes.testsList}>
                        <span>3.</span>
                        <span>Test a</span>
                      </div>
                      <div className={classes.testsList}>
                        <span>4.</span>
                        <span>Test a</span>
                      </div>
                      <div className={classes.testsList}>
                        <span>5.</span>
                        <span>Test a</span>
                      </div>
                    </TabContainer>
                  )}
                  {tabValue === 1 && <TabContainer>content two </TabContainer>}
                </div>
              </Scrollbars>
            </div>
            <div className={`${classes.medicineSection}`}>
              <Scrollbars
                className={classes.scrollResponsive}
                autoHide={true}
                renderView={(props) =>
                  isSmallScreen ? (
                    <div {...props} style={{ position: 'static' }} />
                  ) : (
                    <div {...props} />
                  )
                }
              >
                <div className={classes.customScroll}>
                  <div className={classes.substitutes}>Rs. 6,500 </div>
                  <AphButton className={classes.addToCart} color="primary">
                    Add to Cart
                  </AphButton>
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </div>
      <NavigationBottom />
    </div>
  );
};
