import React, { useState } from 'react';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { clientRoutes } from 'helpers/clientRoutes';
import Scrollbars from 'react-custom-scrollbars';
import { NavigationBottom } from 'components/NavigationBottom';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { AphButton } from '@aph/web-ui-components';
import { TestFilter } from 'components/Tests/TestFilter';
import { TestsListCard } from 'components/Tests/TestsListCard';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';

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
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        zIndex: 999,
        width: '100%',
        backgroundColor: '#f0f1ec',
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
        boxShadow: 'none',
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
    searchSection: {
      width: 'calc(100% - 328px)',
      padding: '0 10px 0 0',
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
    medicineSection: {
      backgroundColor: theme.palette.common.white,
      width: 328,
      borderRadius: 5,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        backgroundColor: '#f7f8f5',
      },
    },
    customScroll: {
      width: '100%',
      paddingLeft: 20,
      paddingRight: 15,
      paddingBottom: 10,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 0,
        padding: '25px 20px 80px 20px',
      },
    },
    testsList: {
      color: '#0087ba',
      fontSize: 14,
      fontWeight: 500,
    },
    scrollBar: {
      height: 'calc(100vh - 195px) !important',
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 245px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        height: 'auto !important',
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const SearchByTest: React.FC = (props) => {
  const classes = useStyles({});
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [medicineListFiltered, setMedicineListFiltered] = useState<MedicineProduct[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
            <div className={classes.detailsHeader}>SEARCH TESTS (02)</div>
          </div>
          <div className={classes.medicineDetailsGroup}>
            <div className={classes.medicineSection}>
              {/* <Scrollbars
                className={classes.scrollResponsive}
                autoHide={true}
                autoHeight
                autoHeightMin={'calc(100vh - 215px'}
              > */}
              <TestFilter />
              {/* </Scrollbars> */}
            </div>
            <div className={`${classes.searchSection}`}>
              <Scrollbars
                className={classes.scrollBar}
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
                  <TestsListCard medicineList={medicineListFiltered} isLoading={isLoading} />
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </div>
      {/* <NavigationBottom /> */}
    </div>
  );
};
