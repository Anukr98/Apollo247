import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Link } from '@material-ui/core';
import { Header } from 'components/Header';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Modal from '@material-ui/core/Modal';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import CancelIcon from '@material-ui/icons/Cancel';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    payMedicineContainer: {
      background: '#f7f8f5',
      padding: 20,
      borderRadius: '0 0 10px 10px',
      height: '100%',
    },
    sectionHeader: {
      padding: '0 0 10px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      margin: '0 0 20px',
      '& h4': {
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#01475b'
      },
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      }
    },
    paymentContainer: {
      height: '100%',
    },
    paper: {
      borderRadius: 5,
      padding: 20,
      boxShadow: 'none',
      [theme.breakpoints.down('sm')]: {
        background: 'none',
        padding: 0
      }
    },
    paperHeading: {
      padding: '0 0 10px',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      margin: '0 0 20px',
      '& h3': {
        fontSize: 15,
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#01475b'
      }
    },
    checkbox: {
      '& span': {
        fontSize: 13,
        fontWeight: 700
      }
    },
    paymentOptions: {
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridGap: 20,
      listStyleType: 'none',
      padding: 0,
      '& li': {
        background: '#fff',
        borderRadius: 10,
        color: '#fc9916',
        textTransform: 'uppercase',
        boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
        fontWeight: 700,
        fontSize: 13,
        padding: 15,
        display: 'flex',
        alignItems: 'center',
        lineHeight: 'normal',
        '& >svg': {
          margin: '0 10px 0 0'
        },
        '&:last-child': {
          padding: '0 10px'
        }
      },
      [theme.breakpoints.down('xs')]: {
        gridTemplateColumns: 'auto',
        '& li:last-child': {
          padding: 10
        }
      },
    },
    charges: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 14,
      color: '#01475b',
      padding: '6px 0',
      fontWeight: 600,
      '& p': {
        margin: 0
      }
    },
    total: {
      padding: '10px 0 0 !important',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      margin: '10px 0 0'
    },
    discount: {
      color: '#0187ba !important'
    },
    payBtn: {
      padding: '10px 20px',
      borderRadius: '10px',
      fontSize: 13,
      fontWeight: 700,
      margin: '50px auto 0',
      boxShadow: 'none',
      color: '#fff',
      textTransform: 'uppercase',
      background: '#fcb716',
      display: 'block',
      border: 'none',
      width: 200,
    },
    chargesContainer: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      }
    },
    chargesMobile: {
      display: 'none',
      [theme.breakpoints.down('sm')]: {
        display: 'flex',
        padding: 10,
        borderRadius: 10,
        background: 'rgba(0, 135, 186, .15)',
        margin: '0 0 20px'
      }
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

    },
    modalContent: {
      width: '600px',
      height: 'auto',
      background: '#fff',
      [theme.breakpoints.down('sm')]: {
        width: 400,
        height: '100vh',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%'
      },
    },
    modalHeader: {
      padding: 20,
      textAlign: 'center',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
      position: 'relative',
      '& h5': {
        fontSize: 16,
        color: '#02475b',
        fontWeight: 700,
      }
    },
    closePopup: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      right: '-50px',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    mobileBack: {
      display: 'none',
      top: '20px',
      left: '20px',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    modalBody: {
      padding: 20,
      '& button': {
        margin: '0 auto'
      },
      [theme.breakpoints.down('sm')]: {
        height: 'calc(100% - 64px)',
        overflow: 'auto',
      },
    },
    modalSHeader: {
      [theme.breakpoints.down('sm')]: {
        display: 'block !important'
      },
    },
    StatusCard: {
      padding: 20,
      borderRadius: 10,
      textAlign: 'center',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
      margin: '0 0 20px',
      '& svg': {
        width: 50,
        height: 50,
      },
      '& h5': {
        fontSize: 13,
        fontWeight: 700,
        textTransform: 'uppercase',
        padding: '5px 0'
      },
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666',
        lineHeight: '24px'
      }
    },
    orderDetails: {
      padding: 20,
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridColumnGap: '20px',
      boxShadow: '0px 5px 20px 5px rgba(0,0,0,0.1)',
    },
    details: {
      '& h6': {
        fontSize: 13,
        fontWeight: 700,
        color: '#02475b'
      },
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666'
      }
    },
    note: {
      width: '80%',
      textAlign: 'center',
      margin: '20px  auto',
      '& p': {
        fontSize: 13,
        fontWeight: 700,
        color: '#666666'
      }
    },
    pending: {
      background: '#eed9c6',
      '& svg': {
        color: '#e87e38',
      },
      '& h5': {
        color: '#e87e38'
      }
    },
    error: {
      background: '#edc6c2',
      '& svg': {
        color: '#e02020',
      },
      '& h5': {
        color: '#e02020'
      }
    },
    success: {
      background: '#edf7ed',
      '& svg': {
        color: '#4aa54a',
      },
      '& h5': {
        color: '#4aa54a'
      }
    },
    refund: {
      background: '#edc6c2',
      '& svg': {
        color: '#a30808',
      },
      '& h5': {
        color: '#a30808'
      }
    },
  }
})

export const PayMedicine: React.FC = (props) => {
  const classes = useStyles({});
  const [checked, setChecked] = React.useState(true);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(true);


  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.payMedicineContainer}>
          <div className={classes.sectionHeader}>
            <Typography component="h4">Payment</Typography>
          </div>
          <div className={`${classes.charges} ${classes.chargesMobile}`}> <p>Amount To Pay</p><p>Rs.316</p></div>
          <Grid container spacing={2} className={classes.paymentContainer}>
            <Grid item xs={12} sm={8}>
              <Paper className={classes.paper}>
                <div className={classes.paperHeading}>
                  <Typography component="h3">Pay Via</Typography>
                </div>
                <ul className={classes.paymentOptions}>
                  <li> <CreditCardIcon style={{ color: '#02475b' }}></CreditCardIcon> Debit Card </li>
                  <li> <CreditCardIcon style={{ color: '#02475b' }}></CreditCardIcon> Credit Card</li>
                  <li>PayTm</li>
                  <li> Upi</li>
                  <li>Net Banking</li>
                  <li>
                    <FormGroup >
                      <FormControlLabel className={classes.checkbox} control={<Checkbox onChange={handleChange} name="checked" />}
                        label="Cash On Delivery" />
                    </FormGroup>
                  </li>
                </ul>
                <button className={classes.payBtn}>Pay Rs.499 On delivery</button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} className={classes.chargesContainer}>
              <div className={classes.paperHeading}>
                <Typography component="h3">Total Charges</Typography>
              </div>
              <Paper className={classes.paper}>
                <div className={classes.charges}> <p>MRP Total</p> <p>Rs.300</p></div>
                <div className={`${classes.charges} ${classes.discount}`}><p>Product Discount</p> <p>-Rs.50.00</p></div>
                <div className={classes.charges}><p>Delivery Charges</p> <p>+ Rs.60</p></div>
                <div className={classes.charges}><p>Packing Charges</p> <p>+ Rs.60</p></div>
                <div className={`${classes.charges} ${classes.total}`}><p>To Pay</p> <p>Rs.270</p></div>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>

      <Modal
        open={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        className={classes.modal}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <div className={classes.modalContent}>
          <div className={classes.modalHeader}>
            <Typography component="h5">Payment Status</Typography>
            <Link href="javascript:void(0);" className={classes.closePopup}><img src={require('images/ic_cross_popup.svg')} /></Link>
            <Link href="javascript:void(0);" className={`${classes.closePopup} ${classes.mobileBack}`}><img src={require('images/ic_back.svg')} /></Link>
          </div>
          <div className={classes.modalBody}>
            <div className={`${classes.StatusCard} ${classes.pending}`}>
              <ErrorOutlineIcon></ErrorOutlineIcon>
              <Typography component="h5">Payment Pending</Typography>
              <Typography component="p">Rs. 499</Typography>
              <Typography component="p">Payment Ref. Number - 123456</Typography>
              <Typography component="p">Order ID : 123456789</Typography>
            </div>
            <div className={`${classes.sectionHeader} ${classes.modalSHeader}`}>
              <Typography component="h4">Order Details</Typography>
            </div>
            <Paper className={classes.orderDetails}>
              <div className={classes.details}>
                <Typography component="h6">Order Date &amp; Time</Typography>
                <Typography component="p">23 May 2019,  10 A.M.</Typography>
              </div>
              <div className={classes.details}>
                <Typography component="h6">Mode of Payment</Typography>
                <Typography component="p">Debit Card</Typography>
              </div>
            </Paper>
            <div className={classes.note}>
              <Typography component="p">Note : Your payment is in progress and this may take a couple of
              minutes to confirm your booking. We’ll intimate you once your
bank confirms the payment.</Typography>
            </div>
            <button className={classes.payBtn}>Try Again</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}