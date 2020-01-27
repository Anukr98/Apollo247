import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { MedicineCart } from 'components/Cart/MedicineCart';
import { MedicinesCartContext } from 'components/MedicinesCartProvider';
import { LocationContext, LocationProvider } from 'components/LocationProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
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
            <Header />
            <div className={classes.container}>
              <div className={classes.cartPage}>
                <LocationProvider>
                  <MedicineCart />
                </LocationProvider>
              </div>
            </div>
          </>
        )}
      </MedicinesCartContext.Consumer>
    </div>
  );
};
