import React, { useState, useEffect } from 'react';
import { Theme, Tabs, Tab, Typography, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { clientRoutes } from 'helpers/clientRoutes';
import Scrollbars from 'react-custom-scrollbars';
import { NavigationBottom } from 'components/NavigationBottom';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { AphButton } from '@aph/web-ui-components';
import { useParams } from 'hooks/routerHooks';
import axios from 'axios';
import {
  searchDiagnosticsById,
  searchDiagnosticsByIdVariables,
  searchDiagnosticsById_searchDiagnosticsById_diagnostics as diagnosticTestDetails,
} from 'graphql/types/searchDiagnosticsById';
import { TEST_COLLECTION_TYPE } from 'graphql/types/globalTypes';
import { SEARCH_DIAGNOSTICS_BY_ID } from 'graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';

import { searchDiagnostics_searchDiagnostics_diagnostics } from 'graphql/types/searchDiagnostics';
import { useDiagnosticsCart, DiagnosticsCartItem } from 'components/Tests/DiagnosticsCartProvider';
import stripHtml from 'string-strip-html';
import { GET_DIAGNOSTIC_DATA } from 'graphql/profiles';
import {
  getDiagnosticsData,
  getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers,
  getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics,
  getDiagnosticsData_getDiagnosticsData_diagnosticOrgans,
} from 'graphql/types/getDiagnosticsData';
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
        borderRadius: 0,
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
        paddingBottom: 150,
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
        padding: 20,
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
        borderBottom: 'none',
      },
      '&:before': {
        content: '""',
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
        position: 'fixed',
        bottom: 0,
      },
    },
    customScroll: {
      width: '100%',
      paddingBottom: 10,
    },
    buttonDisable: {
      backgroundColor: '#fed984',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2) !important',
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
        borderBottom: '0.5px solid rgba(2,71,91,0.3)',
        borderRadius: 0,
        backgroundColor: 'transparent',
      },
    },
    addToCart: {
      [theme.breakpoints.down('xs')]: {
        margin: 'auto',
        textAlign: 'center',
      },
      '& button': {
        width: '100%',
        [theme.breakpoints.down('xs')]: {
          minWidth: 240,
          width: 'auto',
        },
      },
    },
    tabsWrapper: {
      paddingTop: 13,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        marginLeft: -20,
        marginRight: -20,
        padding: 20,
        boxShadow: '0 15px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    testsList: {
      color: '#0087ba',
      fontSize: 14,
      fontWeight: 500,
      '& span': {
        '&:nth-child(1)': {
          marginRight: 5,
        },
      },
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    hotsellerName: {
      textTransform: 'capitalize',
    },
  };
});

type TestDetails = {
  TestName: string;
  SampleRemarks: string;
  SampleTypeName: string;
  TestParameters: string;
};

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const TestDetails: React.FC = (props) => {
  const classes = useStyles({});
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [tabValue, setTabValue] = useState<number>(0);
  const deliveryMode = tabValue === 0 ? 'HOME' : 'PICKUP';
  const params = useParams<{ searchTestType: string; itemName: string; itemId: string }>();

  const [testDetails, setTestDetails] = React.useState<diagnosticTestDetails | null>(null);
  const [testDetailsPackage, setTestDetailsPackage] = React.useState<TestDetails[] | null>(null);
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const { addCartItem, removeCartItem, diagnosticsCartItems } = useDiagnosticsCart();
  const [addMutationLoading, setAddMutationLoading] = useState<boolean>(false);

  const [diagnosisDataError, setDiagnosisDataError] = useState<boolean>(false);
  const [diagnosisHotSellerData, setDiagnosisHotSellerData] = useState<
    (getDiagnosticsData_getDiagnosticsData_diagnosticHotSellers) | null
  >(null);

  const apiDetails = {
    url: process.env.GET_PACKAGE_DATA,
  };

  const TestApiCredentials = {
    UserName: process.env.TEST_DETAILS_PACKAGE_USERNAME,
    Password: process.env.TEST_DETAILS_PACKAGE_PASSWORD,
    InterfaceClient: process.env.TEST_DETAILS_PACKAGE_INTERFACE_CLIENT,
  };

  const getPackageDetails = async () => {
    setLoading(true);
    await axios
      .post(apiDetails.url || '', {
        ...TestApiCredentials,
        ItemID: params.itemId,
      })
      .then((data: any) => {
        if (data && data.data && data.data.data && data.data.data) {
          const details = data.data.data;
          if (details && details.length > 0) {
            setTestDetailsPackage(details);
          } else {
            setTestDetailsPackage([]);
          }
          setLoading(false);
        }
      })
      .catch((e: any) => {
        setLoading(false);
      });
  };

  const getTestDetails = async () => {
    setLoading(true);
    await client
      .query<searchDiagnosticsById>({
        query: SEARCH_DIAGNOSTICS_BY_ID,
        variables: {
          itemIds: params.itemId,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data && data.searchDiagnosticsById && data.searchDiagnosticsById.diagnostics) {
          setLoading(false);
          setTestDetails(data.searchDiagnosticsById.diagnostics[0]);
        }
      })
      .catch((e) => {
        setLoading(false);
        console.log(e);
      });
  };

  useEffect(() => {
    if (!testDetails && !testDetailsPackage) {
      getTestDetails();
      getPackageDetails();
    }
  }, [testDetails, testDetailsPackage]);

  const itemIndexInCart = (
    item:
      | searchDiagnostics_searchDiagnostics_diagnostics
      | getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics
  ) => {
    return diagnosticsCartItems.findIndex((cartItem) => cartItem.id == `${item.id}`);
  };

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
          {testDetails ? (
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
                      <h2 className={classes.hotsellerName}>
                        {params.searchTestType === 'hot-seller'
                          ? params.itemName.replace('_', ' ')
                          : testDetails && testDetails.itemName}
                      </h2>

                      {!!testDetails.toAgeInDays && (
                        <div className={classes.textInfo}>
                          <label>Age Group</label>
                          {(testDetails.fromAgeInDays / 365).toFixed(0)} TO{' '}
                          {(testDetails.toAgeInDays / 365).toFixed(0)} YEARS
                        </div>
                      )}
                      {!!testDetails.toAgeInDays && (
                        <div className={classes.textInfo}>
                          <label>Gender</label>
                          {`${'For' + ' '}${
                            testDetails.gender == 'B'
                              ? 'BOYS AND GIRLS'
                              : testDetails.gender == 'M'
                                ? 'BOYS'
                                : 'GIRLS'
                            }`}
                        </div>
                      )}
                      <div className={classes.textInfo}>
                        <label>Sample Type</label>
                        {/* {packageData.SampleTypeName} */}
                        {testDetailsPackage &&
                          testDetailsPackage.length > 0 &&
                          testDetailsPackage
                            .map((packageData: TestDetails) => packageData.SampleTypeName)
                            .join(', ')}
                      </div>
                      <div className={classes.textInfo}>
                        <label>Collection Method</label>
                        {testDetails.collectionType
                          ? testDetails.collectionType === TEST_COLLECTION_TYPE.HC
                            ? 'HOME VISIT OR CLINIC VISIT'
                            : 'CLINIC VISIT'
                          : null}
                      </div>
                    </div>
                    <div>
                      <Tabs
                        value={tabValue}
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
                          label="Test Included"
                          title={'Choose home delivery'}
                        />
                        <Tab
                          classes={{
                            root: classes.tabRoot,
                            selected: classes.tabSelected,
                          }}
                          label="Preparation"
                          title={'Choose store pick up'}
                        />
                      </Tabs>
                      {tabValue === 0 && (
                        <TabContainer>
                          {testDetailsPackage &&
                            testDetailsPackage.length > 0 &&
                            testDetailsPackage.map((packageData: TestDetails, idx: number) => (
                              <div className={classes.tabsWrapper}>
                                <div className={classes.testsList}>
                                  <span>{idx + 1}.</span>
                                  <span>{packageData.TestName}</span>
                                </div>
                              </div>
                            ))}
                        </TabContainer>
                      )}
                      {tabValue === 1 && (
                        <TabContainer>
                          <div className={classes.tabsWrapper}>
                            <div className={classes.testsList}>
                              {(testDetails && testDetails.testPreparationData) || 'Not available'}
                            </div>
                          </div>
                        </TabContainer>
                      )}
                    </div>
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
                    {testDetails && (
                      <div className={classes.substitutes}>
                        Rs. {testDetails && testDetails.rate}
                      </div>
                    )}
                    <div className={classes.addToCart}>
                      <AphButton
                        color="primary"
                        disabled={addMutationLoading || itemIndexInCart(testDetails) !== -1}
                        className={
                          addMutationLoading || itemIndexInCart(testDetails) !== -1
                            ? classes.buttonDisable
                            : ''
                        }
                        onClick={() => {
                          setAddMutationLoading(true);
                          addCartItem &&
                            addCartItem({
                              itemId: `${testDetails.itemId}`,
                              id: testDetails.id,
                              mou: 1,
                              name: stripHtml(testDetails.itemName),
                              price: testDetails.rate,
                              thumbnail: '',
                              collectionMethod: testDetails.collectionType!,
                            });
                          setAddMutationLoading(false);
                        }}
                      >
                        {addMutationLoading ? (
                          <CircularProgress size={22} color="secondary" />
                        ) : itemIndexInCart(testDetails) === -1 ? (
                          'Add To Cart'
                        ) : (
                              'Added To Cart'
                            )}
                      </AphButton>
                    </div>
                  </div>
                </Scrollbars>
              </div>
            </div>
          ) : (
              loading && (
                <div className={classes.progressLoader}>
                  <CircularProgress size={30} />
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
};
