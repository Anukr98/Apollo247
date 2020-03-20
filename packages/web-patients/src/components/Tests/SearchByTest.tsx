import React, { useState, useEffect } from 'react';
import { Theme, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import Scrollbars from 'react-custom-scrollbars';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { TestFilter } from 'components/Tests/TestFilter';
import { TestCard } from 'components/Tests/TestCard';
import { useLocationDetails } from 'components/LocationProvider';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import { SEARCH_DIAGNOSTICS, GET_DIAGNOSTIC_DATA } from 'graphql/profiles';
import {
  searchDiagnostics,
  searchDiagnostics_searchDiagnostics_diagnostics,
} from 'graphql/types/searchDiagnostics';
import { useParams } from 'hooks/routerHooks';
import {
  getDiagnosticsData,
  getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics,
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

type Params = { searchTestText: string };

export const SearchByTest: React.FC = (props) => {
  const classes = useStyles({});
  const params = useParams<Params>();
  const { city } = useLocationDetails();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const isSmallScreen = useMediaQuery('(max-width:767px)');
  const [loading, setLoading] = useState<boolean>(false);

  const [testsList, setTestsList] = useState<
    (searchDiagnostics_searchDiagnostics_diagnostics | null)[] | null
  >(null);

  const [
    diagnosticList,
    setDiagnosticList,
  ] = useState<getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics | null>(null);

  const getDiagnosticsOrgansData = () => {
    setLoading(true);
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
          const { diagnosticOrgans } = data.getDiagnosticsData;
          const diagnosticsData = diagnosticOrgans.find(
            (organ) =>
              organ &&
              organ.diagnostics &&
              organ.diagnostics.itemId === Number(params.searchTestText)
          );
          diagnosticsData && setDiagnosticList(diagnosticsData.diagnostics);
        }
      })
      .catch((e) => {
        alert(e);
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
        }
      })
      .catch((e) => {
        alert(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!testsList && !diagnosticList) {
      if (Number(params.searchTestText)) {
        getDiagnosticsOrgansData();
      } else {
        onSearchTests(params.searchTestText);
      }
    }
  }, [testsList]);

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
                  {loading && <CircularProgress size={22} />}
                  {testsList &&
                    testsList.length > 0 &&
                    testsList.map((test) => <TestCard testData={test} mou={testsList.length} />)}
                  {diagnosticList && <TestCard testData={diagnosticList} mou={1} />}
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
