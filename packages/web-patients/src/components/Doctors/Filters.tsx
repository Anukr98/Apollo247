import React from 'react';
import { Theme, RadioGroup, FormControlLabel, Checkbox, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphRadio } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      marginTop: 10,
      marginBottom: 14,
    },
    filters: {
      backgroundColor: '#fff',
      marginTop: 10,
      padding: '12px 20px',
      borderRadius: 5,
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      '& label': {
        marginLeft: 0,
        '& span': {
          fontSize: 12,
          paddingRight: 2,
          fontWeight: 500,
        },
      },
    },
    leftGroup: {
      display: 'flex',
      alignItems: 'center',
    },
    filterAction: {
      marginLeft: 'auto',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        fontWeight: 500,
        textTransform: 'none',
        padding: 0,
        minWidth: 'auto',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
      '& img': {
        marginLeft: 5,
      },
    },
    radioGroup: {
      display: 'flex',
      alignItems: 'center',
      '& label': {
        marginLeft: 0,
        fontSize: 12,
        '& span': {
          paddingRight: 2,
        },
      }
    },
    sortBy: {
      paddingRight: 10,
    },
    modalDialog: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',   
    },
    dialogPaper: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      width: 680,
      outline: 'none',
    },
    dialogHeader: {
      padding: 20,
      display: 'flex',
      '& h3': {
        fontSie: 16,
        fontWeight: 600,
        color: '#01667c',
        margin: 0,
      },
      '& button': {
        marginLeft: 'auto',
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    dialogContent: {
      padding: '0 20px',
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
        backgroundColor: '#ffffff',
        color: '#00b38e',
        textTransform: 'none',
        fontSize: 12,
        fontWeight: 500,
        padding: '8px 8px',
        margin: '4px 0',
        marginRight: 8,
        minWidth: 'auto',
      },
    },
    filterActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    dialogActions: {
      padding: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    resultFound: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.5,
    },
    clearBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#fc9916',
      boxShadow: 'none',
      marginLeft: 10,
    },
    applyBtn: {
      backgroundColor: '#fff',
      color: '#fc9916',
      marginLeft: 10,
    },
  };
});

export const Filters: React.FC = (props) => {
  const classes = useStyles({});
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState('Choose wisely');
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
    setHelperText(' ');
    setError(false);
  };
  const [isFilterOpen, setisFilterOpen] = React.useState(false);

  return (
    <div className={classes.root}>
      <div className={classes.filters}>
        <div className={classes.leftGroup}>
          <span className={classes.sortBy}>Sort by</span>
          <RadioGroup row className={classes.radioGroup} aria-label="quiz" name="quiz" value={value} onChange={handleRadioChange}>
            <FormControlLabel value="nearby" control={<AphRadio color="primary" />} label="Nearby" />
            <FormControlLabel value="availability" control={<AphRadio color="primary" />} label="Availability" />
          </RadioGroup>
          <FormControlLabel
            control={
              <AphCheckbox
                color="primary"
                name="onlineconsults"
              />
            }
            label="Online Consults"
          />
          <FormControlLabel
            control={
              <AphCheckbox
                color="primary"
                name="inperson"
              />
            }
            label="In-Person Consults"
          />
        </div>
        <div className={classes.filterAction}>
          <AphButton
            onClick={()=> setisFilterOpen(true)}
          >
            Filters <img src={require('images/ic_filters.svg')} alt="" />
          </AphButton>
        </div>
      </div>
      <Modal
        className={classes.modalDialog}
        open={isFilterOpen}
        onClose={()=> setisFilterOpen(false)}
      >
        <div className={classes.dialogPaper}>
          <div className={classes.dialogHeader}>
            <h3>Filters</h3>
            <AphButton
              onClick={()=> setisFilterOpen(false)}
            >
              <img src={require('images/ic_cross.svg')} alt="" />
            </AphButton>
          </div>
          <div className={classes.dialogContent}>
            <div className={classes.filterGroup}>
              <div className={classes.filterType}>
                <h4>City</h4>
                <div className={classes.filterBtns}>
                  <AphButton className={classes.filterActive}>Hyderabad</AphButton>
                  <AphButton>Chennai</AphButton>
                </div>
              </div>
              <div className={classes.filterType}>
                <h4>Experience In Years</h4>
                <div className={classes.filterBtns}>
                  <AphButton>0 - 5</AphButton>
                  <AphButton>6 - 10</AphButton>
                  <AphButton>11 - 15</AphButton>
                  <AphButton>16 +</AphButton>
                </div>
              </div>
              <div className={classes.filterType}>
                <h4>Availability</h4>
                <div className={classes.filterBtns}>
                  <AphButton>Now</AphButton>
                  <AphButton>Today</AphButton>
                  <AphButton>Tomorrow</AphButton>
                  <AphButton>Next 3 days</AphButton>
                </div>
              </div>
              <div className={classes.filterType}>
                <h4>Fees In Rupees</h4>
                <div className={classes.filterBtns}>
                  <AphButton>100 - 500</AphButton>
                  <AphButton>500 - 1000</AphButton>
                  <AphButton>1000 +</AphButton>
                </div>
              </div>
              <div className={classes.filterType}>
                <h4>Gender</h4>
                <div className={classes.filterBtns}>
                  <AphButton>Male</AphButton>
                  <AphButton>Female</AphButton>
                </div>
              </div>
              <div className={classes.filterType}>
                <h4>Language</h4>
                <div className={classes.filterBtns}>
                  <AphButton>English</AphButton>
                  <AphButton>English</AphButton>
                  <AphButton>Telugu</AphButton>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.dialogActions}>
            <span className={classes.resultFound}>13 Doctors found</span>
            <AphButton className={classes.clearBtn}>Clear Filters</AphButton>
            <AphButton className={classes.applyBtn}>Apply Filters</AphButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
