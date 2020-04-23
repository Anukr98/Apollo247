import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { TestsCart } from 'components/Tests/Cart/TestsCart';
import { ManageProfile } from 'components/ManageProfile';
import { Relation } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';

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

export const TestsCartLanding: React.FC = (props) => {
  const classes = useStyles({});
  const { allCurrentPatients } = useAllCurrentPatients()
  const onePrimaryUser =
        allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length === 1;
  return (
    <div className={classes.root}>
      <>
        <Header />
        <div className={classes.container}>
          <div className={classes.cartPage}>
            <TestsCart />
          </div>
        </div>
      </>
      {!onePrimaryUser && <ManageProfile />}
    </div>
  );
};
