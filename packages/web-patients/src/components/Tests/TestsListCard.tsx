import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { searchDiagnostics_searchDiagnostics_diagnostics } from 'graphql/types/searchDiagnostics';
import { getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics } from 'graphql/types/getDiagnosticsData';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      position: 'relative',
    },
    medicineStripWrap: {
      display: 'flex',
    },
    medicineInformation: {
      paddingRight: 10,
      display: 'flex',
      alignItems: 'center',
    },
    cartRight: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
    },
    medicineIcon: {
      paddingRight: 10,
      '& img': {
        maxWidth: 35,
        verticalAlign: 'middle',
      },
    },
    medicineName: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 5,
        paddingRight: 24,
        flexGrow: 1,
      },
    },
    tabInfo: {
      fontSize: 10,
      color: '#02475b',
      fontWeight: 500,
      paddingTop: 2,
      opacity: 0.6,
    },
    noStock: {
      fontSize: 10,
      color: '#890000',
      fontWeight: 500,
      paddingTop: 2,
    },
    medicinePrice: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingTop: 12,
      paddingBottom: 11,
      minWidth: 90,
      textAlign: 'center',
      '& span': {
        fontWeight: 500,
      },
    },
    addToCart: {
      paddingLeft: 20,
      paddingTop: 8,
      paddingBottom: 8,
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    medicinePack: {
      fontSize: 13,
      fontWeight: 600,
      color: '#02475b',
      letterSpacing: 0.33,
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingTop: 4,
      paddingLeft: 8,
      paddingBottom: 4,
      minWidth: 120,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        borderLeft: 'none',
        flexGrow: 1,
        textAlign: 'left',
        borderTop: '1px solid rgba(2,71,91,0.2)',
      },
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'uppercase',
      paddingTop: 7,
      paddingBottom: 6,
      paddingLeft: 4,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
  };
});

export interface TestListCardProps {
  testData:
    | searchDiagnostics_searchDiagnostics_diagnostics
    | getDiagnosticsData_getDiagnosticsData_diagnosticOrgans_diagnostics
    | null;
}

export const TestsListCard: React.FC<TestListCardProps> = (props) => {
  const classes = useStyles({});
  const { testData } = props;

  return (
    <div className={classes.root}>
      {testData && (
        <div className={classes.medicineStrip}>
          <div className={classes.medicineStripWrap}>
            <Link to={clientRoutes.testDetails(testData.itemId.toString())}>
              <div className={classes.medicineInformation}>
                <div className={classes.medicineIcon}>
                  <img src={require('images/ic_tests_icon.svg')} alt="" />
                </div>
                <div className={classes.medicineName}>
                  {testData.itemName} <div className={classes.tabInfo}>Rs. {testData.rate}</div>
                </div>
              </div>
            </Link>
            <div className={classes.cartRight}>
              <div className={classes.addToCart}>
                <AphButton>
                  <img
                    src={require('images/ic_plus.svg')}
                    alt="Add Item"
                    title="Add item to Cart"
                  />
                </AphButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
