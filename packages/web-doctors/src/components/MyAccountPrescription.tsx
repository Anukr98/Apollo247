import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Grid from '@material-ui/core/Grid';
import { FavouriteMedicines } from 'components/FavouriteMedicines';
import { FavouriteAdvice } from 'components/FavouriteAdvice';
import { Tests } from 'components/Tests';

const useStyles = makeStyles((theme: Theme) => {
  return {
    card: {
      background: '#fff',
      boxShadow: '0 2px 5px 0 rgba(128, 128, 128, 0.2)',
      padding: '5px 0px',
      borderRadius: 10,
      '& ul': {
        padding: 0,
        margin: '0 0 0 10px',
        '& li': {
          color: '#02475b',
          listStyleType: 'none',
          padding: '10px 50px 10px 10px',
          fontSize: 14,
          fontWeight: 500,
          position: 'relative',
          borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
          '&:last-child': {
            paddingBottom: 0,
            borderBottom: 'none',
            paddingLeft: 0,
          },
          '& img': {
            '&:first-child': {
              position: 'relative',
              top: -2,
              marginRight: 10,
            },
          },
        },
      },
    },
    iconRight: {
      float: 'right',
    },
    updateBtn: {
      backgroundColor: '#fc9916 !important',
    },
    addmedicine_btn: {
      color: '#fc9916',
      fontSize: 14,
      fontWeight: 600,
      '& img': {
        marginRight: 10,
      },
    },
    faverite: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 600,
      borderBottom: 'none',
      margin: '0 0 10px 0',
    },
    ProfileContainer: {
      paddingLeft: 0,
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
        paddingTop: 0,
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 20px',
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 20,
        borderBottom: 'solid 0.5px rgba(98,22,64,0.2)',
        fontWeight: 600,
      },
      '& h5': {
        padding: '5px 5px 3px 20px',
        fontWeight: 500,
      },
      '& h6': {
        color: '#658f9b',
        padding: '5px 5px 0 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontWeight: theme.typography.fontWeightMedium,
        '& span': {
          padding: '0 2px',
        },
      },
    },
  };
});

export const MyAccountPrescription: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.ProfileContainer}>
      <div>
        <Grid container spacing={2}>
          <Grid sm={6} xs={12} key={1} item>
            <div className={classes.faverite}>Favorite Medicines</div>
            <div className={classes.card}>
              <FavouriteMedicines></FavouriteMedicines>
            </div>
          </Grid>
          <Grid sm={6} xs={12} key={2} item>
            <div className={classes.faverite}>Favorite Tests</div>
            <div className={classes.card}>
              <Tests></Tests>
            </div>
          </Grid>
          <Grid sm={6} xs={12} key={3} item>
            <div className={classes.faverite}>Favorite Advice</div>
            <div className={classes.card}>
              <FavouriteAdvice></FavouriteAdvice>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
