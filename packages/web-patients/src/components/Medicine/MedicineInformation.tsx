import React, { useRef } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover } from '@material-ui/core';
import { AphButton, AphTextField, AphCustomDropdown } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineNotifyPopover } from 'components/Medicine/MedicineNotifyPopover';
import { SubstituteDrugsList } from 'components/Medicine/SubstituteDrugsList';
import { AddToCartPopover } from 'components/Medicine/AddToCartPopover';
import { MedicineProductDetails, MedicineProduct } from '../../helpers/MedicineApiCalls';
import { useParams } from 'hooks/routerHooks';
import axios from 'axios';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      width: 328,
      borderRadius: 5,
    },
    medicineSection: {
      padding: '20px 5px 0 10px',
      paddingTop: 15,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    customScroll: {
      width: '100%',
      paddingLeft: 10,
      paddingRight: 15,
      paddingBottom: 10,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 600,
      color: '#02475b',
      paddingBottom: 10,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    bottomActions: {
      padding: 20,
      paddingTop: 10,
      display: 'flex',
      '& button': {
        width: '50%',
        borderRadius: 10,
        '&:first-child': {
          marginRight: 8,
          color: '#fc9916',
          backgroundColor: theme.palette.common.white,
        },
        '&:last-child': {
          marginLeft: 8,
        },
      },
    },
    notifyBtn: {
      width: '100% !important',
      color: '#fc9916',
      margin: '0 !important',
    },
    substitutes: {
      backgroundColor: '#f7f8f5',
      padding: 10,
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginBottom: 16,
      cursor: 'pointer',
      position: 'relative',
      paddingRight: 40,
    },
    dropDownArrow: {
      position: 'absolute',
      right: 8,
      top: '50%',
      marginTop: -12,
    },
    deliveryInfo: {
      backgroundColor: '#f7f8f5',
      padding: 10,
      borderRadius: 5,
      paddingTop: 1,
      '& input': {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    deliveryTimeGroup: {
      position: 'relative',
    },
    checkBtn: {
      color: '#fc9916',
      boxShadow: 'none',
      minWidth: 'auto',
      padding: 0,
      position: 'absolute',
      right: 0,
      top: 6,
      fontSize: 13,
      fontWeight: 'bold',
    },
    checkBtnDisabled: {
      opacity: 0.5,
      color: '#fc9916 !important',
    },
    deliveryTimeInfo: {
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      color: '#01475b',
      paddingTop: 10,
      '& span:last-child': {
        fontWeight: 'bold',
        marginLeft: 'auto',
      },
    },
    priceGroup: {
      padding: '10px 20px',
    },
    priceWrap: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: '6px 10px',
      display: 'flex',
      alignItems: 'center',
    },
    medicinePrice: {
      fontSize: 14,
      color: '#02475b',
      letterSpacing: 0.3,
      fontWeight: 'bold',
      width: '50%',
      textAlign: 'right',
    },
    leftGroup: {
      width: '50%',
      borderRight: 'solid 0.5px rgba(2,71,91,0.2)',
      fontSize: 14,
      fontWeight: 500,
    },
    medicinePack: {
      color: '#02475b',
      letterSpacing: 0.33,
    },
    medicineNoStock: {
      color: '#890000',
      lineHeight: '32px',
      fontWeight: 'bold',
    },
    selectMenuItem: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      textTransform: 'uppercase',
      paddingTop: 7,
      paddingBottom: 6,
      paddingLeft: 4,
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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    },
    substitutePopover: {
      margin: 0,
    },
    selectedDrugs: {
      width: '100%',
    },
    price: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.6,
    },
    regularPrice: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      opacity: 0.6,
      textDecoration: 'line-through',
      paddingRight: 5,
    },
  });
});

type MedicineInformationProps = {
  data: MedicineProductDetails;
};

export const MedicineInformation: React.FC<MedicineInformationProps> = (props) => {
  const classes = useStyles({});
  const [medicineQty] = React.useState(1);
  const notifyPopRef = useRef(null);
  const subDrugsRef = useRef(null);
  const addToCartRef = useRef(null);
  const [isSubDrugsPopoverOpen, setIsSubDrugsPopoverOpen] = React.useState<boolean>(false);
  const [isAddCartPopoverOpen, setIsAddCartPopoverOpen] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [substitutes, setSubstitutes] = React.useState<MedicineProductDetails[] | null>(null);
  const [substitute, setSubstitute] = React.useState<MedicineProduct | null>(null);
  const { data } = props;
  const params = useParams<{ sku: string }>();

  const apiDetails = {
    url: `${process.env.PHARMACY_MED_UAT_URL}/popcsrchprdsubt_api.php`,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  };

  const fetchSubstitutes = async () => {
    await axios
      .post(
        apiDetails.url,
        { params: params.sku },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        try {
          if (data) {
            if (data.products && typeof data.products === 'object') {
              setSubstitutes(data.products);
            }
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((err) => console.log({ err }));
  };

  return (
    <div className={classes.root}>
      <div className={`${classes.medicineSection}`}>
        <Scrollbars autoHide={true} style={{ height: 'calc(100vh - 350px' }}>
          <div className={classes.customScroll}>
            <div className={classes.sectionTitle}>Substitute Drugs</div>
            <div
              className={classes.substitutes}
              onClick={() => {
                fetchSubstitutes();
                setIsSubDrugsPopoverOpen(true);
              }}
              ref={subDrugsRef}
            >
              {!substitute ? (
                <span>Pick from 9 available substitutes</span>
              ) : (
                <>
                  <div className={classes.selectedDrugs}>
                    <div>{substitute.name}</div>
                    <div className={classes.price}>{`Rs. ${substitute.price}`}</div>
                  </div>
                  <div className={classes.dropDownArrow}>
                    <img src={require('images/ic_dropdown_green.svg')} alt="" />
                  </div>
                </>
              )}
            </div>
            {data.is_in_stock ? (
              <>
                <div className={classes.sectionTitle}>Check Delivery Time</div>
                <div className={classes.deliveryInfo}>
                  <div className={classes.deliveryTimeGroup}>
                    <AphTextField placeholder="Enter Pin Code" />
                    <AphButton
                      disabled
                      classes={{
                        root: classes.checkBtn,
                        disabled: classes.checkBtnDisabled,
                      }}
                    >
                      Check
                    </AphButton>
                  </div>
                  <div className={classes.deliveryTimeInfo}>
                    <span>Delivery Time</span>
                    <span>By 9th Oct 2019</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </Scrollbars>
      </div>
      <div className={classes.priceGroup}>
        <div className={classes.priceWrap}>
          <div className={classes.leftGroup}>
            {data.is_in_stock ? (
              <div className={classes.medicinePack}>
                QTY :
                <AphCustomDropdown
                  classes={{ selectMenu: classes.selectMenuItem }}
                  value={medicineQty}
                >
                  <MenuItem
                    classes={{
                      root: classes.menuRoot,
                      selected: classes.menuSelected,
                    }}
                    value={1}
                  >
                    1
                  </MenuItem>
                  <MenuItem
                    classes={{
                      root: classes.menuRoot,
                      selected: classes.menuSelected,
                    }}
                    value={2}
                  >
                    2
                  </MenuItem>
                  <MenuItem
                    classes={{
                      root: classes.menuRoot,
                      selected: classes.menuSelected,
                    }}
                    value={3}
                  >
                    3
                  </MenuItem>
                </AphCustomDropdown>
              </div>
            ) : (
              <div className={classes.medicineNoStock}>Out Of Stock</div>
            )}
          </div>
          <div className={classes.medicinePrice}>
            <span className={classes.regularPrice}>(Rs. 999)</span>
            Rs. 120
          </div>
        </div>
      </div>
      <div className={classes.bottomActions}>
        {data.is_in_stock ? (
          <>
            <AphButton onClick={() => setIsAddCartPopoverOpen(true)}>Add To Cart</AphButton>
            <AphButton color="primary">Buy Now</AphButton>
          </>
        ) : (
          <AphButton fullWidth className={classes.notifyBtn} onClick={() => setIsPopoverOpen(true)}>
            Notify when in stock
          </AphButton>
        )}
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={notifyPopRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            <MedicineNotifyPopover />
          </div>
        </div>
      </Popover>
      <Popover
        open={isAddCartPopoverOpen}
        anchorEl={addToCartRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic_mascot.png')} alt="" />
            </div>
            <AddToCartPopover />
          </div>
        </div>
      </Popover>
      <Popover
        open={isSubDrugsPopoverOpen}
        anchorEl={subDrugsRef.current}
        onClose={() => setIsSubDrugsPopoverOpen(false)}
        className={classes.substitutePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <SubstituteDrugsList
          data={substitutes}
          setSubstitute={setSubstitute}
          setIsSubDrugsPopoverOpen={setIsSubDrugsPopoverOpen}
        />
      </Popover>
    </div>
  );
};
