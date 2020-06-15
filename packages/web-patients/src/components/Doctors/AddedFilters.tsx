import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      marginTop: -10,
      marginBottom: 22,
      borderRadius: '0 0 5px 5px',
    },
    dialogContent: {
      padding: 20,
    },
    filterGroup: {
      display: 'flex',
    },
    filterType: {
      paddingLeft: 16,
      paddingRight: 8,
      borderRight: '0.5px solid rgba(2,71,91,0.3)',
      '& h4': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        margin: 0,
        paddingBottom: 4,
      },
      '&:first-child': {
        paddingLeft: 0,
      },
      '&:last-child': {
        paddingRight: 0,
        borderRight: 'none',
      },
    },
    filterBtns: {
      '& button': {
        borderRadius: 10,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: '#00b38e',
        color: '#fff',
        textTransform: 'none',
        fontSize: 12,
        fontWeight: 500,
        padding: '8px 8px',
        margin: '4px 0',
        marginRight: 7,
        minWidth: 'auto',
        '&:hover': {
          backgroundColor: '#00b38e',
          color: '#fff',            
        },
      },
    },
  };
});

export const AddedFilters: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div className={classes.dialogContent}>
        <div className={classes.filterGroup}>
          <div className={classes.filterType}>
            <h4>City</h4>
            <div className={classes.filterBtns}>
              <AphButton>Hyderabad</AphButton>
            </div>
          </div>
          <div className={classes.filterType}>
            <h4>Experience In Years</h4>
            <div className={classes.filterBtns}>
              <AphButton>0 - 5</AphButton>
              <AphButton>6 - 10</AphButton>
            </div>
          </div>
          <div className={classes.filterType}>
            <h4>Availability</h4>
            <div className={classes.filterBtns}>
              <AphButton>Now</AphButton>
            </div>
          </div>
          <div className={classes.filterType}>
            <h4>Fees In Rupees</h4>
            <div className={classes.filterBtns}>
              <AphButton>100 - 500</AphButton>
              <AphButton>500 - 1000</AphButton>
            </div>
          </div>
          <div className={classes.filterType}>
            <h4>Gender</h4>
            <div className={classes.filterBtns}>
              <AphButton>Male</AphButton>
            </div>
          </div>
          <div className={classes.filterType}>
            <h4>Language</h4>
            <div className={classes.filterBtns}>
              <AphButton>English</AphButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
