import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { MedicineCart } from 'components/Cart/MedicineCart';
import { MedicinesCartContext } from 'components/MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    cartPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
  };
});

export const MedicineCartLanding: React.FC = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.root}>
      <MedicinesCartContext.Consumer>
        {() => (
          <>
            <div className={classes.headerSticky}>
              <div className={classes.container}>
                <Header />
              </div>
            </div>
            <div className={classes.container}>
              <div className={classes.cartPage}>
                <MedicineCart />
              </div>
            </div>
          </>
        )}
      </MedicinesCartContext.Consumer>
    </div>
  );
};
