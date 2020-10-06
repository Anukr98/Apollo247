import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { MedicineCart } from 'components/Cart/MedicineCart';
import { MedicinesCartContext } from 'components/MedicinesCartProvider';
import { LocationProvider } from 'components/LocationProvider';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from '../../helpers/onePrimaryUser';
import { BottomLinks } from 'components/BottomLinks';

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
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
  };
});

const MedicineCartLanding: React.FC = (props) => {
  const classes = useStyles({});
  const onePrimaryUser = hasOnePrimaryUser();
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
      <div className={classes.footerLinks}>
        <BottomLinks />
        {!onePrimaryUser && <ManageProfile />}
      </div>
    </div>
  );
};

export default MedicineCartLanding;
