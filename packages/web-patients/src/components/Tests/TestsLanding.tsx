import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover, CircularProgress } from '@material-ui/core';
import { Header } from 'components/Header';
import { AphButton, AphSelect } from '@aph/web-ui-components';
import { BrowseByOrgans } from 'components/Tests/Cards/BrowseByOrgans';
import { BrowsePackages } from 'components/Tests/Cards/BrowsePackages';
import { HotSellers } from 'components/Tests/Cards/HotSellers';
import { BrowseByTest } from 'components/Tests/Cards/BrowseByTest';
import { TestsAutoSearch } from 'components/Tests/TestsAutoSearch';
import { AddToCartPopover } from 'components/Medicine/AddToCartPopover';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { ApolloError } from 'apollo-client';
import { MedicinePageAPiResponse } from './../../helpers/MedicineApiCalls';
import axios from 'axios';
import { OrderPlaced } from 'components/Cart/OrderPlaced';
import { useParams } from 'hooks/routerHooks';
import { NavigationBottom } from 'components/NavigationBottom';
import Typography from '@material-ui/core/Typography';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import _isEmpty from 'lodash/isEmpty';
import { AllowLocation } from 'components/AllowLocation';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      [theme.breakpoints.up(900)]: {
        marginBottom: 20,
      },
    },
    doctorListingPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        marginTop: 82,
      },
    },
    pageTopHeader: {
      backgroundColor: theme.palette.common.white,
      padding: '30px 40px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        padding: 0,
        boxShadow: 'none',
      },
    },
    medicineTopGroup: {
      display: 'flex',
      paddingTop: 25,
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        paddingTop: 0,
      },
    },
    searchSection: {
      width: 'calc(100% - 284px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    rightSection: {
      marginLeft: 'auto',
      width: 284,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: '20px 20px 0 20px',
        backgroundColor: '#f7f8f5',
        marginTop: 20,
      },
    },
    medicineSection: {
      paddingLeft: 15,
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
      },
    },
    sectionGroup: {
      marginBottom: 15,
    },
    serviceType: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      paddingbottom: 8,
      display: 'flex',
      width: '100%',
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
      paddingBottom: 10,
    },
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    rightArrow: {
      width: 24,
      marginLeft: 'auto',
    },
    linkText: {
      letterSpacing: 'normal',
      paddingRight: 10,
    },
    marginNone: {
      marginBottom: 0,
    },
    diagnosticsMsg: {
      backgroundColor: '#00b38e',
      borderRadius: 5,
      padding: 8,
      color: '#fff',
      fontSize: 14,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -10,
      paddingTop: 20,
      '& img': {
        maxHeight: 24,
      },
      '& span': {
        borderLeft: 'solid 0.5px #02475b',
        paddingLeft: 18,
        marginLeft: 18,
      },
      [theme.breakpoints.down('xs')]: {
        marginTop: 0,
        paddingTop: 8,
      },
    },
    allProductsList: {
      padding: '30px 40px',
      paddingBottom: 10,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 25,
        paddingRight: 0,
        paddingLeft: 20,
      },
    },
    sliderSection: {
      paddingBottom: 22,
      [theme.breakpoints.down('xs')]: {
        '&:last-child': {
          paddingBottom: 10,
        },
      },
    },
    sectionTitle: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      borderBottom: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      paddingBottom: 8,
      marginBottom: 10,
      display: 'flex',
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
    bannerInfo: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        marginTop: -45,
      },
      '& p': {
        fontSize: 17,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        marginTop: 16,
        marginBottom: 20,
      },
      '& h1': {
        display: 'flex',
        [theme.breakpoints.down('xs')]: {
          fontSize: 36,
        },
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
          maxWidth: 370,
          [theme.breakpoints.down('xs')]: {
            maxWidth: 'calc(100% - 55px)',
          },
        },
      },
    },
    selectMenuRoot: {
      paddingRight: 55,
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 56,
      fontWeight: 600,
      lineHeight: '66px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      [theme.breakpoints.down('xs')]: {
        fontSize: 36,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      marginLeft: 30,
      paddingBottom: 0,
      paddingRight: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    mascotCircle: {
      cursor: 'pointer',
      [theme.breakpoints.up(768)]: {
        marginLeft: 'auto',
        marginBottom: 12,
        marginRight: 15,
      },
      [theme.breakpoints.up(1134)]: {
        marginLeft: 'auto',
        position: 'fixed',
        bottom: 0,
        right: 0,
      },
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
        verticalAlign: 'middle',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
      right: '20px !important',
      bottom: '20px !important',
      left: 'auto !important',
      top: 'auto !important',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
  };
});
type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const TestsLanding: React.FC = (props) => {
  const classes = useStyles({});
  const mascotRef = useRef(null);
  const addToCartRef = useRef(null);
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = useState<boolean>(false);
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = React.useState<boolean>(false);
  const params = useParams<{ orderAutoId: string; orderStatus: string }>();
  if (params.orderStatus === 'success') {
    localStorage.removeItem('cartItems');
    localStorage.removeItem('dp');
  }

  const [data, setData] = useState<MedicinePageAPiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApolloError | null>(null);
  const [showPopup, setShowPopup] = React.useState<boolean>(
    window.location.pathname === '/medicines/added-to-cart'
  );
  const [showOrderPopup, setShowOrderPopup] = useState<boolean>(
    params.orderStatus && params.orderStatus.length > 0 ? true : false
  );

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.doctorListingPage}>
          <div className={classes.pageTopHeader}>
            <div className={classes.bannerInfo}>
              {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) ? (
                <Typography variant="h1">
                  <span title={'hi'}>hi</span>
                  <AphSelect
                    value={currentPatient.id}
                    onChange={(e) => setCurrentPatientId(e.target.value as Patient['id'])}
                    classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
                    title={currentPatient.firstName || ''}
                  >
                    {allCurrentPatients.map((patient) => {
                      // const isSelected = patient.id === currentPatient.id;
                      const isSelected = patient.relation === 'ME';
                      const name = (patient.firstName || '').toLocaleLowerCase();
                      return (
                        <MenuItem
                          selected={isSelected}
                          value={patient.id}
                          classes={{ selected: classes.menuSelected }}
                          key={patient.id}
                          title={name || ''}
                        >
                          {name}
                        </MenuItem>
                      );
                    })}
                    <MenuItem classes={{ selected: classes.menuSelected }}>
                      <AphButton
                        color="primary"
                        classes={{ root: classes.addMemberBtn }}
                        onClick={() => {
                          setIsAddNewProfileDialogOpen(true);
                        }}
                        title={'Add Member'}
                      >
                        Add Member
                      </AphButton>
                    </MenuItem>
                  </AphSelect>
                </Typography>
              ) : (
                <Typography variant="h1">hello there!</Typography>
              )}
            </div>
            <div className={classes.medicineTopGroup}>
              <div className={classes.searchSection}>
                <TestsAutoSearch />
                {/* {loading && (
                  <div className={classes.progressLoader}>
                    <CircularProgress size={30} />
                  </div>
                )} */}
              </div>
              <div className={classes.rightSection}>
                <div className={classes.medicineSection}>
                  <div className={`${classes.sectionGroup} ${classes.marginNone}`}>
                    <Link
                      className={`${classes.serviceType} ${classes.textVCenter}`}
                      to={clientRoutes.yourOrders()}
                    >
                      <span className={classes.serviceIcon}>
                        <img src={require('images/ic_tablets.svg')} alt="" />
                      </span>
                      <span className={classes.linkText}>Your Orders</span>
                      <span className={classes.rightArrow}>
                        <img src={require('images/ic_arrow_right.svg')} alt="" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.diagnosticsMsg}>
            <img src={require('images/ic_shield.svg')} alt="" />
            <span>Most trusted diagnostics from the comfort of your home!</span>
          </div>
          <div className={classes.allProductsList}>
            <div className={classes.sliderSection}>
              <div className={classes.sectionTitle}>
                <>
                  <span>Hot sellers</span>
                </>
              </div>
              <HotSellers />
            </div>
            <div className={classes.sliderSection}>
              <div className={classes.sectionTitle}>
                <>
                  <span>Browse Packages</span>
                </>
              </div>
              <BrowsePackages />
            </div>
          </div>
        </div>
      </div>
      <div className={classes.mascotCircle} ref={mascotRef} onClick={() => setIsPopoverOpen(true)}>
        <img src={require('images/ic-mascot.png')} alt="" />
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <AllowLocation
              setIsLocationPopoverOpen={setIsLocationPopoverOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              isPopoverOpen={isPopoverOpen}
            />
          </div>
        </div>
      </Popover>
      <NavigationBottom />
    </div>
  );
};
