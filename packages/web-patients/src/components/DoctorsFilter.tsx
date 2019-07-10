import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphTextField } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      paddingTop: 10,
      width: 328,
      borderRadius: 5,
    },
    filterSection: {
      padding: 20,
      paddingTop: 15,
    },
    customScroll: {
      height: '70vh',
      overflow: 'auto',
    },
    searchInput: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    filterBox: {
      borderRadius: 5,
      backgroundColor: '#f7f8f5',
      padding: 10,
      marginTop: 5,
    },
    filterType: {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 500,
      paddingBottom: 5,
      borderBottom: '1px solid rgba(1,71,91,0.3)',
    },
    boxContent: {
      paddingTop: 5,
    },
    button: {
      marginRight: 5,
      marginTop: 5,
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
  });
});

export const DoctorsFilter: React.FC = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AphTextField
        classes={{ root: classes.searchInput }}
        placeholder="Search doctors or specialities"
      />
      <div className={classes.filterSection}>
        <div className={classes.customScroll}>
          <div className={classes.filterBox}>
            <div className={classes.filterType}>City</div>
            <div className={classes.boxContent}>
              <AphButton
                color="secondary"
                size="small"
                className={`${classes.button} ${classes.buttonActive}`}
              >
                Hyderabad
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Chennai
              </AphButton>
            </div>
          </div>
          <div className={classes.filterBox}>
            <div className={classes.filterType}>Experience In Years</div>
            <div className={classes.boxContent}>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                0 - 5
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                6 - 10
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                11 - 15
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                16+
              </AphButton>
            </div>
          </div>
          <div className={classes.filterBox}>
            <div className={classes.filterType}>Availability</div>
            <div className={classes.boxContent}>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Now
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Today
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Tomorrow
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Weekend
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Next 3 Days
              </AphButton>
            </div>
          </div>
          <div className={classes.filterBox}>
            <div className={classes.filterType}>Fees In Rupees</div>
            <div className={classes.boxContent}>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                100 - 500
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                500 - 1000
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                1000 - 1500
              </AphButton>
            </div>
          </div>
          <div className={classes.filterBox}>
            <div className={classes.filterType}>Gender</div>
            <div className={classes.boxContent}>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Male
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Female
              </AphButton>
            </div>
          </div>
          <div className={classes.filterBox}>
            <div className={classes.filterType}>Language</div>
            <div className={classes.boxContent}>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Hindi
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                English
              </AphButton>
              <AphButton color="secondary" size="small" className={`${classes.button}`}>
                Telugu
              </AphButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
