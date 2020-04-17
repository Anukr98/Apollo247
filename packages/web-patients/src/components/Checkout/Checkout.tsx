import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, Checkbox } from '@material-ui/core';
import React from 'react';
import _isEmpty from 'lodash/isEmpty';
import { useAuth } from 'hooks/authHooks';
import { Header } from 'components/Header';
import { NavigationBottom } from 'components/NavigationBottom';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphTextField, AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      borderRadius: '0 0 10px 10px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f7f8f5',
      marginBottom: 20,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
      },
    },
    pageHeader: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: theme.palette.secondary.dark,
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        padding: '16px 20px',
        position: 'fixed',
        top: 72,
        width: '100%',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 20,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        width: 48,
        height: 48,
        top: 0,
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
    pageContent: {
      padding: 20,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 75,
      },
    },
    pageBox: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 10,
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      },
      '& p': {
        marginTop: 10,
        marginBottom: 10,
      },
    },
    name: {
      paddingBottom: 10,
    },
    greeting: {
      textTransform: 'uppercase',
    },
    formGroup: {
      paddingTop: 10,
      maxWidth: 360,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
      '& label': {
        fontSize: 13,
      },
    },
    checkboxGroup: {
      paddingTop: 15,
      marginBottom: 15,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        alignItems: 'flex-start',
        marginLeft: 0,
        '& span': {
          fontSize: 12,
          fontWeight: 500,
          color: '#02475b',
        },
      },
    },
    checkboxRoot: {
      padding: 0,
      marginRight: 8,
      '& svg': {
        width: 20,
        height: 20,
        fill: '#00b38e',
      },
    },
    borderTop: {
      borderTop: 'solid 0.5px rgba(2,71,91,0.2)',
      marginBottom: 0,
    },
    bottomActions: {
      paddingTop: 20,
      '& button': {
        [theme.breakpoints.down('xs')]: {
          width: '100%',
        },
      },
    },
  };
});

export const Checkout: React.FC = () => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();

  return (
    <div>
      <Header />
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <div className={classes.pageHeader}>
            <Link to={clientRoutes.medicinesCart()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </Link>
            Checkout
          </div>
          <div className={classes.pageContent}>
            <div className={classes.pageBox}>
              <div className={classes.name}>Dear &lt;customer name&gt;,</div>
              <div className={classes.greeting}>Superb!</div>
              <p>Your order request is in process</p>
              <p>
                <b>Just one more step. New Regulation in your region requires your email id.</b>
              </p>
              <div className={classes.formGroup}>
                <AphTextField label="Your email id please" placeholder="name@email.com" />
                <div className={classes.checkboxGroup}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        classes={{
                          root: classes.checkboxRoot,
                        }}
                      />
                    }
                    label="Check this box if you don’t have an Email Id & want us to share your order details over SMS."
                  />
                </div>
                <div className={`${classes.checkboxGroup} ${classes.borderTop}`}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        classes={{
                          root: classes.checkboxRoot,
                        }}
                      />
                    }
                    label="I agree to share my medicine requirements with Apollo Pharmacy for home delivery."
                  />
                </div>
                <div className={classes.bottomActions}>
                  <AphButton color="primary">Submit to confirm order</AphButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isSignedIn && <NavigationBottom />}
    </div>
  );
};
