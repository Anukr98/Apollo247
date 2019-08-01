import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, Paper, Popover, Typography } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingBottom: 10,
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
    },
    medicineStripWrap: {
      display: 'flex',
      alignItems: 'center',
    },
    medicineInformation: {
      paddingRight: 10,
      display: 'flex',
      alignItems: 'center',
    },
    medicineIcon: {
      paddingRight: 20,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    medicineName: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
    },
    tabInfo: {
      fontSize: 10,
      color: '#658f9b',
      fontWeight: 500,
      paddingTop: 2,
    },
    medicinePrice: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingLeft: 14,
      paddingRight: 14,
      paddingTop: 11,
      paddingBottom: 11,
      '& span': {
        fontWeight: 500,
      },
    },
    medicineCount: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingLeft: 14,
      paddingRight: 14,
      fontSize: 12,
      color: '#02475b',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      '& span': {
        paddingLeft: 10,
        paddingRight: 10,
        textTransform: 'uppercase',
      },
    },
    addToCart: {
      paddingLeft: 14,
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      '& button': {
        borderRadius: 10,
      },
    },
    minusIcon: {
      cursor: 'pointer',
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    plusIcon: {
      cursor: 'pointer',
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    helpText: {
      marginLeft: 'auto',
      paddingRight: 10,
      cursor: 'pointer',
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    subscriptionLink: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderTop: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingTop: 10,
      marginTop: 10,
      textAlign: 'right',
      '& label': {
        margin: 0,
        '& span:last-child': {
          fontSize: 12,
          fontWeight: 500,
          color: '#02475b',
          paddingRight: 20,
        },
      },
    },
    medicineInformationPopup: {
      width: 328,
      padding: 15,
      paddingBottom: 5,
      fontSize: 12,
      fontWeight: 500,
      color: '#0087ba',
      '& h4': {
        color: '#02475b',
        fontSize: 12,
        margin: 0,
        paddingBottom: 3,
      },
      '& p': {
        lineHeight: 1.67,
        marginTop: 0,
        marginBottom: 10,
      },
      '& ol': {
        margin: 0,
        marginBottom: 10,
        padding: 0,
        paddingLeft: 15,
      },
    },
  };
});

export const MedicineStripCard: React.FC = (props) => {
  const classes = useStyles();
  const medicineRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Metformin 500mg <div className={classes.tabInfo}>Tablet / Type 2 Diabetes</div>
            </div>
          </div>
          <div
            className={classes.helpText}
            ref={medicineRef}
            onClick={() => setIsPopoverOpen(true)}
          >
            <img src={require('images/ic_info.svg')} alt="" />
          </div>
          <div className={classes.medicinePrice}>
            Rs. 120 <span>/strip</span>
          </div>
          <div className={classes.medicineCount}>
            <div className={classes.minusIcon}>
              <img src={require('images/ic_minus.svg')} alt="" />
            </div>
            <span>1 Strip</span>
            <div className={classes.plusIcon}>
              <img src={require('images/ic_plus.svg')} alt="" />
            </div>
          </div>
          <div className={classes.addToCart}>
            <AphButton color="primary">Add to cart</AphButton>
          </div>
        </div>
        <div className={classes.subscriptionLink}>
          <FormControlLabel
            control={<AphCheckbox color="primary" />}
            label="Need to take this regularly?"
            labelPlacement="start"
          />
        </div>
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={medicineRef.current}
        onClose={() => setIsPopoverOpen(false)}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        <Paper className={classes.medicineInformationPopup}>
          <Typography variant="h4">How Metformin 500mg Works</Typography>
          <p>
            Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus
            id quod maxime placeat facere possimus.
          </p>
          <Typography variant="h4">Important Information</Typography>
          <p>
            Any warnings related to medicine intake if there’s alcohol usage / pregnancy / breast
            feeding
          </p>
          <Typography variant="h4">Alternative Medicines</Typography>
          <ol>
            <li>Medicine a</li>
            <li>Medicine b</li>
            <li>Medicine c</li>
          </ol>
          <Typography variant="h4">Generic Salt Composition</Typography>
          <ol>
            <li>Salt a</li>
            <li>Salt b</li>
            <li>Salt c</li>
          </ol>
          <Typography variant="h4">Side Effects / Warnings</Typography>
          <p>quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.</p>
        </Paper>
      </Popover>
    </div>
  );
};
