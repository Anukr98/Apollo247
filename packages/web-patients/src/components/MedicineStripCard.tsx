import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, FormControlLabel, Paper, Popover, Typography, MenuItem } from '@material-ui/core';
import { AphButton, AphCustomDropdown } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
    },
    medicineStripWrap: {
      display: 'flex',
    },
    medicineInformation: {
      paddingRight: 10,
      display: 'flex',
      alignItems: 'center',
    },
    cartRight: {
      marginLeft: 'auto',
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
    noStock: {
      fontSize: 10,
      color: '#890000',
      fontWeight: 500,
      paddingTop: 2,
    },
    medicinePrice: {
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 12,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 12,
      paddingBottom: 11,
      '& span': {
        fontWeight: 500,
      },
    },
    addToCart: {
      paddingLeft: 20,
      paddingTop: 8,
      paddingBottom: 8,
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    medicinePack: {
      fontSize: 13,
      fontWeight: 600,
      color: '#02475b',
      letterSpacing: 0.33,
      borderLeft: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 4,
      paddingBottom: 4,
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
      display: 'flex',
      alignItems: 'center',
      '& label': {
        margin: 0,
        marginLeft: 'auto',
        '& span:last-child': {
          fontSize: 12,
          fontWeight: 500,
          color: '#02475b',
          paddingRight: 20,
        },
      },
    },
    preRequired: {
      paddingLeft: 44,
      color: '#890000',
      fontSize: 12,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
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
    storeAddress: {
      fontSize: 10,
      color: '#658f9b',
      fontWeight: 500,
      paddingTop: 2,
      '& span': {
        paddingLeft: 20,
      },
    },
    buttonDisabled: {
      opacity: 0.3,
    },
    mLeftAuto: {
      marginLeft: 'auto',
    },
    preUploadBtn: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#fc9916',
      textTransform: 'uppercase',
      cursor: 'pointer',
      marginLeft: 20,
    },
    preUploadInfo: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 10,
      color: '#658f9b',
      '& span:nth-child(3)': {
        marginBottom: -2,
      },
    },
    docIcon: {
      marginRight: 20,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    preDoctorName: {
      fontSize: 12,
      color: '#02475b',
      fontWeight: 500,
      paddingRight: 10,
    },
    checkIcon: {
      marginLeft: 10,
      '& img': {
        maxWidth: 24,
        verticalAlign: 'middle',
      },
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'uppercase',
      paddingTop: 7,
      paddingBottom: 6,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
  };
});

export const MedicineStripCard: React.FC = (props) => {
  const classes = useStyles();
  const medicineRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [selectedQty] = React.useState<number>(1);

  return (
    <div className={classes.root}>
      {/** medice card section start */}
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Metformin 500mg <div className={classes.tabInfo}>Pack Of 10</div>
            </div>
          </div>
          <div className={classes.cartRight}>
            <div
              className={classes.helpText}
              ref={medicineRef}
              onClick={() => setIsPopoverOpen(true)}
            >
              <img src={require('images/ic_info.svg')} alt="" />
            </div>
            <div className={classes.medicinePrice}>Rs. 120</div>
            <div className={classes.addToCart}>
              <AphButton>
                <img src={require('images/ic_plus.svg')} alt="" />
              </AphButton>
            </div>
          </div>
        </div>
      </div>
      {/** medice card section end */}
      {/** medice card section start */}
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Metformin 500mg <div className={classes.tabInfo}>Pack Of 10</div>
            </div>
          </div>
          <div className={classes.cartRight}>
            <div
              className={classes.helpText}
              ref={medicineRef}
              onClick={() => setIsPopoverOpen(true)}
            >
              <img src={require('images/ic_info.svg')} alt="" />
            </div>
            <div className={classes.medicinePrice}>Rs. 120</div>
            <div className={classes.addToCart}>
              <AphButton>
                <img src={require('images/ic_plus.svg')} alt="" />
              </AphButton>
            </div>
          </div>
        </div>
      </div>
      {/** medice card section end */}
      {/** medice card section start */}
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Metformin 500mg <div className={classes.noStock}>Out Of Stock</div>
            </div>
          </div>
          <div className={classes.cartRight}>
            <div
              className={classes.helpText}
              ref={medicineRef}
              onClick={() => setIsPopoverOpen(true)}
            >
              <img src={require('images/ic_info.svg')} alt="" />
            </div>
            <div className={classes.medicinePrice}>Rs. 120</div>
            <div className={classes.addToCart}>
              <AphButton disabled className={classes.buttonDisabled}>
                <img src={require('images/ic_plus.svg')} alt="" />
              </AphButton>
            </div>
          </div>
        </div>
      </div>
      {/** medice card section end */}
      {/** medice card section start */}
      <div className={classes.medicineStrip}>
        <div className={classes.medicineStripWrap}>
          <div className={classes.medicineInformation}>
            <div className={classes.medicineIcon}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.medicineName}>
              Metformin 500mg <div className={classes.tabInfo}>Pack Of 10</div>
            </div>
          </div>
          <div className={classes.cartRight}>
            <div
              className={classes.helpText}
              ref={medicineRef}
              onClick={() => setIsPopoverOpen(true)}
            >
              <img src={require('images/ic_info.svg')} alt="" />
            </div>
            <div className={classes.medicinePack}>
              <AphCustomDropdown
                classes={{ selectMenu: classes.selectMenuItem }}
                value={selectedQty}
              >
                <MenuItem
                  classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
                  value={1}
                >
                  1 Pack
                </MenuItem>
                <MenuItem
                  classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
                  value={2}
                >
                  2 Pack
                </MenuItem>
                <MenuItem
                  classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
                  value={3}
                >
                  3 Pack
                </MenuItem>
              </AphCustomDropdown>
            </div>
            <div className={classes.medicinePrice}>Rs. 120</div>
            <div className={classes.addToCart}>
              <AphButton>
                <img src={require('images/ic_cross_onorange_small.svg')} alt="" />
              </AphButton>
            </div>
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
      {/** medice card section end */}
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
