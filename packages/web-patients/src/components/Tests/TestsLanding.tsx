import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, MenuItem, Popover } from '@material-ui/core';
import { AphSelect, AphButton } from '@aph/web-ui-components';
import { Header } from 'components/Header';
import { BrowsePackages } from 'components/Tests/Cards/BrowsePackages';
import { HotSellers } from 'components/Tests/Cards/HotSellers';
import { TestsAutoSearch } from 'components/Tests/TestsAutoSearch';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { useParams } from 'hooks/routerHooks';
import { NavigationBottom } from 'components/NavigationBottom';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import _isEmpty from 'lodash/isEmpty';
import { GET_DIAGNOSTIC_DATA } from 'graphql/profiles';
import {
  getDiagnosticsData,
  getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers,
  getDiagnosticsData_getDiagnosticsData_diagnosticOrgans,
} from 'graphql/types/getDiagnosticsData';
import { useApolloClient } from 'react-apollo-hooks';
import { OrderPlacedTest } from 'components/Tests/Cart/OrderPlacedTest';

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
        backgroundColor: 'transparent',
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
        marginTop: 68,
      },
      [theme.breakpoints.down(457)]: {
        marginTop: 85,
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
        padding: 16,
        borderRadius: 10,
      },
    },
    textVCenter: {
      alignItems: 'center',
      minHeight: 54,
    },
    serviceIcon: {
      marginRight: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
      [theme.breakpoints.down('xs')]: {
        marginRight: 16,
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
        borderRadius: 0,
        position: 'absolute',
        top: 158,
        width: '100%',
        padding: '16px 20px',
      },
    },
    allProductsList: {
      padding: '30px 40px',
      paddingBottom: 10,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 25,
        paddingRight: 0,
        paddingLeft: 0,
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
      [theme.breakpoints.down('xs')]: {
        marginLeft: 20,
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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
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
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
  };
});
type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const TestsLanding: React.FC = (props) => {
  const classes = useStyles({});
  const addToCartRef = useRef(null);
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const client = useApolloClient();
  const params = useParams<{ orderAutoId: string; orderStatus: string }>();

  const [diagnosisHotSellerData, setDiagnosisHotSellerData] = useState<
    (getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers | null)[] | null
  >(null);

  const [diagnosticOrgansData, setDiagnosticOrgansData] = useState<
    (getDiagnosticsData_getDiagnosticsData_diagnosticOrgans | null)[] | null
  >(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [diagnosisDataError, setDiagnosisDataError] = useState<boolean>(false);

  const [showOrderPopup, setShowOrderPopup] = useState<boolean>(
    params.orderStatus ? true : false
  );
  useEffect(() => {
    if (!diagnosisHotSellerData && !diagnosticOrgansData) {
      setIsLoading(true);
      client
        .query<getDiagnosticsData>({
          query: GET_DIAGNOSTIC_DATA,
          variables: {},
          fetchPolicy: 'cache-first',
        })
        .then(({ data }) => {
          if (
            data &&
            data.getDiagnosticsData &&
            data.getDiagnosticsData.diagnosticHotSellers &&
            data.getDiagnosticsData.diagnosticOrgans
          ) {
            setDiagnosisHotSellerData(data.getDiagnosticsData.diagnosticHotSellers);
            setDiagnosticOrgansData(data.getDiagnosticsData.diagnosticOrgans);
            setDiagnosisDataError(false);
          }
        })
        .catch((e) => {
          alert(e);
          setDiagnosisDataError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [diagnosisHotSellerData, diagnosticOrgansData]);

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
                          // setIsAddNewProfileDialogOpen(true);
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
                      to={clientRoutes.testOrders()}
                    >
                      <span className={classes.serviceIcon}>
                        <img src={require('images/ic_tests_icon.svg')} alt="" />
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
            {diagnosisHotSellerData && diagnosisHotSellerData.length > 0 && (
              <div className={classes.sliderSection}>
                <div className={classes.sectionTitle}>
                  <span>Hot sellers</span>
                </div>
                <HotSellers data={diagnosisHotSellerData} isLoading={isLoading} />
              </div>
            )}
            {diagnosticOrgansData && diagnosticOrgansData.length > 0 && (
              <div className={classes.sliderSection}>
                <div className={classes.sectionTitle}>
                  <span>Browse Packages</span>
                </div>
                <BrowsePackages data={diagnosticOrgansData} isLoading={isLoading} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Popover
        open={showOrderPopup}
        anchorEl={addToCartRef.current}
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
            <OrderPlacedTest
              orderAutoId={params.orderAutoId}
              setShowOrderPopup={setShowOrderPopup}
            />
          </div>
        </div>
      </Popover>
      <NavigationBottom />
    </div>
  );
};
