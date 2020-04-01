import React, { useState, useEffect } from 'react';
import { Theme, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';
import useMediaQuery from '@material-ui/core/useMediaQuery';
// import { TestFilter } from 'components/Tests/TestFilter';
import { TestCard } from 'components/Tests/TestCard';
import { useLocationDetails } from 'components/LocationProvider';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import { SEARCH_DIAGNOSTICS, GET_DIAGNOSTIC_DATA } from 'graphql/profiles';
import FormHelperText from '@material-ui/core/FormHelperText';
import {
  searchDiagnostics,
  searchDiagnostics_searchDiagnostics_diagnostics,
} from 'graphql/types/searchDiagnostics';
import { useParams } from 'hooks/routerHooks';
import {
  getDiagnosticsData,
  getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics,
} from 'graphql/types/getDiagnosticsData';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { Alerts } from 'components/Alerts/Alerts';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    searchInput: {
      paddingLeft: 20,
      paddingRight: 20,
      position: 'relative',
      display: 'flex',
      '& input': {
        paddingRight: 30,
      },
    },
    searchBtn: {
      marginLeft: 'auto',
      padding: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent !important',
      minWidth: 'auto',
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        position: 'absolute',
        right: 20,
        top: 6,
        boxShadow: 'none',
        padding: 0,
      },
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
        height: '100%',
        backgroundColor: 'transparent',
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
        paddingBottom: 20,
        borderRadius: 0,
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        zIndex: 99,
      },
    },
    customScroll: {
      width: '100%',
      paddingBottom: 10,
      paddingLeft: 20,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 0,
        padding: '25px 20px 80px 20px',
      },
    },
    loader: {
      display: 'block',
      margin: 'auto',
    },
    helpText: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    testsList: {
      color: '#0087ba',
      fontSize: 14,
      fontWeight: 500,
    },
  };
});

type Params = { searchType: string; searchTestText: string };

export const SearchByTest: React.FC = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const { city } = useLocationDetails();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [loading, setLoading] = useState<boolean>(false);

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const [testsList, setTestsList] = useState<
    (searchDiagnostics_searchDiagnostics_diagnostics | null)[] | null
  >(null);

  const [searchValue, setSearchValue] = useState<string>(
    params.searchType === 'search-test' ? params.searchTestText : ''
  );

  const [
    diagnosticList,
    setDiagnosticList,
  ] = useState<getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics | null>(null);

  const getDiagnosticsOrgansData = async () => {
    setLoading(true);
    await client
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
          const { diagnosticOrgans } = data.getDiagnosticsData;
          const diagnosticsData = diagnosticOrgans.find(
            (organ) =>
              organ &&
              organ.diagnostics &&
              organ.diagnostics.itemId === Number(params.searchTestText)
          );
          diagnosticsData && setDiagnosticList(diagnosticsData.diagnostics);
          setTestsList(null);
        }
      })
      .catch((e) => {
        setIsAlertOpen(true);
        setAlertMessage(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSearchTests = async (value: string) => {
    setLoading(true);
    client
      .query<searchDiagnostics>({
        query: SEARCH_DIAGNOSTICS,
        variables: {
          searchText: value,
          city, //'Hyderabad' | 'Chennai,
          patientId: (currentPatient && currentPatient.id) || '',
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data && data.searchDiagnostics && data.searchDiagnostics.diagnostics) {
          setTestsList(data.searchDiagnostics.diagnostics);
          setDiagnosticList(null);
        }
      })
      .catch((e) => {
        setIsAlertOpen(true);
        setAlertMessage(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchResults = () => {
    if (Number(params.searchTestText)) {
      getDiagnosticsOrgansData();
    } else if (!Number(params.searchTestText)) {
      onSearchTests(params.searchTestText);
    }
  };

  useEffect(() => {
    if (!testsList && !diagnosticList) {
      fetchResults();
    }
  }, [testsList, diagnosticList]);

  useEffect(() => {
    if (searchValue.trim().length > 2) {
      onSearchTests(searchValue);
    } else if ((testsList || diagnosticList) && searchValue.length === 0) {
      fetchResults();
    }
  }, [searchValue]);

  let showError = false;

  if (!loading && testsList && testsList.length === 0 && !diagnosticList) showError = true;

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.medicineDetailsPage}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => window.history.back()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            <div className={classes.detailsHeader}>
              SEARCH TESTS ({testsList ? testsList.length : diagnosticList ? 1 : 0})
            </div>
          </div>
          <div className={classes.medicineDetailsGroup}>
            <div className={classes.medicineSection}>
              <div className={classes.searchInput}>
                <AphTextField
                  placeholder="Search tests"
                  onChange={(e) => {
                    setSearchValue(e.target.value.replace(/\s+/gi, ' ').trimLeft());
                  }}
                  value={searchValue}
                  error={showError}
                />

                <AphButton className={classes.searchBtn}>
                  <img src={require('images/ic_send.svg')} alt="" />
                </AphButton>
              </div>
              {showError ? (
                <FormHelperText className={classes.helpText} component="div" error={showError}>
                  Sorry, we couldn't find what you are looking for :(
                </FormHelperText>
              ) : (
                ''
              )}
            </div>
            <div className={`${classes.searchSection}`}>
              <Scrollbars
                autoHeight
                autoHeightMin={isSmallScreen ? 'calc(100vh - 120px)' : 'calc(100vh - 195px)'}
              >
                <div className={classes.customScroll}>
                  {loading ? (
                    <CircularProgress className={classes.loader} />
                  ) : testsList && testsList.length > 0 ? (
                    testsList.map((test) => <TestCard testData={test} mou={testsList.length} />)
                  ) : diagnosticList ? (
                    <TestCard testData={diagnosticList} mou={1} />
                  ) : (
                    'No data found'
                  )}
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </div>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
