import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, CircularProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { useLocationDetails } from 'components/LocationProvider';
import { SEARCH_DIAGNOSTICS } from 'graphql/profiles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import {
  searchDiagnostics,
  searchDiagnostics_searchDiagnostics_diagnostics,
} from 'graphql/types/searchDiagnostics';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px 15px 20px',
        position: 'fixed',
        width: '100%',
        top: 74,
        zIndex: 999,
        background: '#fff',
      },
    },
    medicineSearchForm: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px 10px 12px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    searchInput: {
      '& input': {
        [theme.breakpoints.down('xs')]: {
          backgroundColor: '#f7f8f5',
          padding: '15px 33px 15px 12px',
          borderBottom: '2px solid transparent',
          borderRadius: 5,
          '&:focus': {
            backgroundColor: '#fff',
            borderBottom: '2px solid #00b38e',
            paddingLeft: 0,
            borderRadius: 0,
          },
        },
      },
      '& >div': {
        '&:after': {
          display: 'none',
        },
        '&:before': {
          display: 'none',
        },
      },
    },
    searchBtn: {
      marginLeft: 'auto',
      padding: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent !important',
      minWidth: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: -30,
      },
    },
    autoSearchPopover: {
      position: 'absolute',
      top: 53,
      left: 0,
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      width: '100%',
      zIndex: 9,
    },
    searchList: {
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          listStyleType: 'none',
          borderBottom: '0.5px solid rgba(2,71,91,0.1)',
          cursor: 'pointer',
          '& a': {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 12px',
            '&:hover': {
              backgroundColor: '#f7f8f5',
            },
            '&:focus': {
              backgroundColor: '#f7f8f5',
            },
          },
          '&:last-child': {
            borderBottom: 0,
          },
        },
      },
    },
    medicineImg: {
      paddingRight: 16,
      '& img': {
        maxWidth: 40,
      },
    },
    medicineInfo: {
      padding: 0,
    },
    medicineName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
    },
    medicinePrice: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
    noStock: {
      fontSize: 12,
      color: '#890000',
      fontWeight: 500,
    },
    searchBtnDisabled: {
      opacity: 0.5,
      '& img': {
        filter: 'grayscale(100%)c',
      },
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
  };
});

const apiDetails = {
  url: process.env.PHARMACY_MED_SEARCH_URL,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
};

export const TestsAutoSearch: React.FC = (props) => {
  const classes = useStyles({});
  const { city } = useLocationDetails();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();

  const [searchTests, setSearchTests] = useState<
    (searchDiagnostics_searchDiagnostics_diagnostics | null)[]
  >([]);
  const [searchText, setSearchText] = useState('');

  const [loading, setLoading] = useState(false);

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
          setLoading(false);
          setSearchTests(data.searchDiagnostics.diagnostics);
        }
      })
      .catch((e) => {
        setLoading(false);
        console.log('Tests_onSearchMedicine', e);
      });
  };

  useEffect(() => {
    if (searchText.length < 3) {
      setLoading(false);
    }
  }, [searchText]);
  return (
    <div className={classes.root}>
      <div className={classes.medicineSearchForm}>
        <AphTextField
          placeholder="Search test and packages"
          className={classes.searchInput}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value.trimLeft().replace(/\s+/gi, ' '));
            if (e.target.value.length > 2) {
              onSearchTests(e.target.value.trimLeft().replace(/\s+/gi, ' '));
            } else {
              setSearchTests([]);
            }
          }}
        />
        <AphButton
          disabled={searchText.length < 3}
          className={classes.searchBtn}
          onClick={() => {
            const text = searchText;
            setSearchText('');
            window.location.href = clientRoutes.searchByTest(text);
          }}
          classes={{
            disabled: classes.searchBtnDisabled,
          }}
        >
          <img src={require('images/ic_send.svg')} alt="" />
        </AphButton>
      </div>
      <Paper className={classes.autoSearchPopover}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'45vh'}>
          {loading && (
            <div className={classes.progressLoader}>
              <CircularProgress size={30} />
            </div>
          )}
          {searchTests && searchTests.length > 0 && (
            <div className={classes.searchList}>
              <ul>
                {searchTests.map(
                  (test) =>
                    test && (
                      <li key={test.id}>
                        <Link
                          to={clientRoutes.testDetails(
                            'search-test',
                            test.itemName
                              .replace(/\s/g, '_')
                              .replace(/\//g, '_')
                              .toLowerCase(),
                            test.itemId.toString()
                          )}
                        >
                          <div className={classes.medicineImg}>
                            <img src={require('images/ic_tests_icon.svg')} alt="" />
                          </div>
                          <div className={classes.medicineInfo}>
                            {test.itemName && (
                              <div className={classes.medicineName}>{test.itemName}</div>
                            )}
                            {test.rate && (
                              <div className={classes.medicinePrice}>{`Rs. ${test.rate}`}</div>
                            )}
                          </div>
                        </Link>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
        </Scrollbars>
      </Paper>
    </div>
  );
};
