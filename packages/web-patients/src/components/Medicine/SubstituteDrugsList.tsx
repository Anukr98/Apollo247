import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 288,
      padding: '6px 0 6px 16px',
      '& ul': {
        margin: 0,
        padding: 0,
        paddingRight: 16,
        '& li': {
          listStyleType: 'none',
          borderBottom: 'solid 0.5px rgba(2,71,91,0.2)',
          paddingTop: 8,
          paddingBottom: 8,
          paddingRight: 30,
          cursor: 'pointer',
          position: 'relative',
          '&:last-child': {
            border: 'none',
          },
        },
      },
    },
    rightArrow: {
      position: 'absolute',
      right: 0,
      top: 8,
    },
    name: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
    },
    price: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
  };
});

export const SubstituteDrugsList: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(40vh'}>
        <ul>
          <li>
            <div className={classes.name}>
              Calpol 500mg Tab
            </div>
            <div className={classes.price}>
              Rs. 65.5
            </div>
            <div className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} alt="" />
            </div>
          </li>
          <li>
            <div className={classes.name}>
              Dolo 500mg Tab
            </div>
            <div className={classes.price}>
              Rs. 65.5
            </div>
            <div className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} alt="" />
            </div>
          </li>
          <li>
            <div className={classes.name}>
              Doliprane 500mg Tab
            </div>
            <div className={classes.price}>
              Rs. 65.5
            </div>
            <div className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} alt="" />
            </div>
          </li>
          <li>
            <div className={classes.name}>
              Cabimol 1% 50ml
            </div>
            <div className={classes.price}>
              Rs. 65.5
            </div>
            <div className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} alt="" />
            </div>
          </li>
          <li>
            <div className={classes.name}>
              Lupipara 500mg Tab
            </div>
            <div className={classes.price}>
              Rs. 65.5
            </div>
            <div className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} alt="" />
            </div>
          </li>
          <li>
            <div className={classes.name}>
              Macfast 500mg Tab
            </div>
            <div className={classes.price}>
              Rs. 65.5
            </div>
            <div className={classes.rightArrow}>
              <img src={require('images/ic_arrow_right.svg')} alt="" />
            </div>
          </li>
        </ul>
      </Scrollbars>
    </div>
  );
};
