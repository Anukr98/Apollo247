import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, Checkbox } from '@material-ui/core';
import React from 'react';
import _isEmpty from 'lodash/isEmpty';
import { AphTextField, AphButton } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';

const useStyles = makeStyles((theme: Theme) => {
  return {
    pageBox: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
      padding: 20,
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
      padding: 20,
      '& button': {
        width: '100%',
      },
    },
  };
});

export const ChennaiCheckout: React.FC = () => {
  const classes = useStyles({});

  return (
    <>
      <Scrollbars autoHide={true} autoHeight autoHeightMax={'43vh'}>
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
          </div>
        </div>
      </Scrollbars>
      <div className={classes.bottomActions}>
        <AphButton color="primary">Submit to confirm order</AphButton>
      </div>
    </>
  );
};
