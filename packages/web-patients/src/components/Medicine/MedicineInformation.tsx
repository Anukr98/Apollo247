import React, { useRef, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover } from '@material-ui/core';
import { AphButton, AphTextField, AphCustomDropdown } from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineNotifyPopover } from 'components/Medicine/MedicineNotifyPopover';
import { SubstituteDrugsList } from 'components/Medicine/SubstituteDrugsList';
import { MedicineProductDetails, MedicineProduct } from '../../helpers/MedicineApiCalls';
import { useParams } from 'hooks/routerHooks';
import axios, { AxiosResponse, Canceler } from 'axios';
import { useShoppingCart, MedicineCartItem } from '../MedicinesCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      width: 328,
      borderRadius: 5,
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        backgroundColor: '#f7f8f5',
        paddingBottom: 60,
      },
    },
    medicineSection: {
      padding: '20px 5px 0 10px',
      paddingTop: 15,
    },
    scrollResponsive: {
      height: 'calc(100vh - 375px) !important',
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 390px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        height: '100% !important',
      },
    },
    customScroll: {
      width: '100%',
      paddingLeft: 10,
      paddingRight: 15,
      paddingBottom: 10,
      [theme.breakpoints.down('xs')]: {
        paddingBottom: 80,
      },
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      },
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
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
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
    bottomGroupResponsive: {
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
        background: '#f7f8f5',
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
      display: 'flex',
      alignItems: 'center',
    },
    dropDown: {
      width: 'calc(100% - 45px)',
      '& > div': {
        width: '100%',
      },
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
  const [medicineQty, setMedicineQty] = React.useState(1);
  const notifyPopRef = useRef(null);
  const subDrugsRef = useRef(null);
  const [isSubDrugsPopoverOpen, setIsSubDrugsPopoverOpen] = React.useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [substitutes, setSubstitutes] = React.useState<MedicineProductDetails[] | null>(null);
  const { data } = props;
  const params = useParams<{ sku: string }>();
  const [pinCode, setPinCode] = React.useState<string>('');
  const [deliveryTime, setDeliveryTime] = React.useState<string>('');
  const { addCartItem, cartItems, updateCartItem } = useShoppingCart();

  const apiDetails = {
    url: process.env.PHARMACY_MED_INFO_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    deliveryUrl: process.env.PHARMACY_MED_DELIVERY_TIME,
    deliveryAuthToken: process.env.PHARMACY_MED_DELIVERY_AUTH_TOKEN,
  };

  const fetchSubstitutes = async () => {
    await axios
      .post(
        apiDetails.url || '',
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
            if (data.products && data.products.length > 0) {
              setSubstitutes(data.products);
            }
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((err) => alert({ err }));
  };

  const fetchDeliveryTime = async () => {
    const CancelToken = axios.CancelToken;
    let cancelGetDeliveryTimeApi: Canceler | undefined;
    await axios
      .post(
        apiDetails.deliveryUrl || '',
        {
          postalcode: pinCode,
          ordertype: 'pharma',
          lookup: [
            {
              sku: params.sku,
              qty: 1,
            },
          ],
        },
        {
          headers: {
            Authentication: apiDetails.deliveryAuthToken,
          },
          cancelToken: new CancelToken((c) => {
            // An executor function receives a cancel function as a parameter
            cancelGetDeliveryTimeApi = c;
          }),
        }
      )
      .then((res: AxiosResponse) => {
        try {
          if (res && res.data) {
            if (
              typeof res.data === 'object' &&
              Array.isArray(res.data.tat) &&
              res.data.tat.length
            ) {
              setDeliveryTime(res.data.tat[0].deliverydate);
            } else if (typeof res.data === 'string') {
              console.log(res.data);
            } else if (typeof res.data.errorMSG === 'string') {
              console.log(res.data.errorMSG);
            }
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error: any) => alert(error));
  };

  useEffect(() => {
    if (!substitutes) {
      fetchSubstitutes();
    }
  }, [substitutes]);

  const applyCartOperations = (cartItem: MedicineCartItem) => {
    const index = cartItems.findIndex((item) => item.id === cartItem.id);
    if (index >= 0) {
      updateCartItem && updateCartItem(cartItem);
    } else {
      addCartItem && addCartItem(cartItem);
    }
  };
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const options = Array.from(Array(20), (_, x) => x + 1);
  console.log(data);
  return (
    <div className={classes.root}>
      <div className={`${classes.medicineSection}`}>
        <Scrollbars
          className={classes.scrollResponsive}
          autoHide={true}
          renderView={(props) =>
            isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
          }
        >
          <div className={classes.customScroll}>
            {substitutes && (
              <>
                <div className={classes.sectionTitle}>Substitute Drugs</div>
                <div
                  className={classes.substitutes}
                  onClick={() => {
                    setIsSubDrugsPopoverOpen(true);
                  }}
                  ref={subDrugsRef}
                >
                  <span>Pick from {substitutes.length} available substitutes</span>
                </div>
              </>
            )}
            {data.is_in_stock ? (
              <>
                <div className={classes.sectionTitle}>Check Delivery Time</div>
                <div className={classes.deliveryInfo}>
                  <div className={classes.deliveryTimeGroup}>
                    <AphTextField
                      placeholder="Enter Pin Code"
                      onChange={(e) => setPinCode(e.target.value)}
                    />
                    <AphButton
                      disabled={pinCode.length !== 6}
                      classes={{
                        root: classes.checkBtn,
                        disabled: classes.checkBtnDisabled,
                      }}
                      onClick={() => fetchDeliveryTime()}
                    >
                      Check
                    </AphButton>
                  </div>
                  {deliveryTime.length > 0 && (
                    <div className={classes.deliveryTimeInfo}>
                      <span>Delivery Time</span>
                      <span>{deliveryTime}</span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </Scrollbars>
      </div>
      <div className={classes.bottomGroupResponsive}>
        <div className={classes.priceGroup}>
          <div className={classes.priceWrap}>
            {data.is_in_stock ? (
              <>
                <div className={classes.leftGroup}>
                  <div className={classes.medicinePack}>
                    <div>QTY :</div>
                    <div className={classes.dropDown}>
                      <AphCustomDropdown
                        classes={{ selectMenu: classes.selectMenuItem }}
                        value={medicineQty}
                        onChange={(e: React.ChangeEvent<{ value: any }>) =>
                          setMedicineQty(parseInt(e.target.value))
                        }
                      >
                        {options.map((option, index) => (
                          <MenuItem
                            key={index}
                            classes={{
                              root: classes.menuRoot,
                              selected: classes.menuSelected,
                            }}
                            value={option}
                          >
                            {option}
                          </MenuItem>
                        ))}
                      </AphCustomDropdown>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={classes.leftGroup}>
                <div className={classes.medicineNoStock}>Out Of Stock</div>
              </div>
            )}
            <div className={classes.medicinePrice}>
              {data.special_price && (
                <span className={classes.regularPrice}>(Rs. {data.price})</span>
              )}
              Rs. {data.special_price || data.price}
            </div>
          </div>
        </div>

        <div className={classes.bottomActions}>
          {data.is_in_stock ? (
            <>
              <AphButton
                onClick={() => {
                  const cartItem: MedicineCartItem = {
                    description: data.description,
                    id: data.id,
                    image: data.image,
                    is_in_stock: data.is_in_stock,
                    is_prescription_required: data.is_prescription_required,
                    name: data.name,
                    price: data.price,
                    sku: data.sku,
                    special_price: data.special_price,
                    small_image: data.small_image,
                    status: data.status,
                    thumbnail: data.thumbnail,
                    type_id: data.type_id,
                    mou: data.mou,
                    quantity: medicineQty,
                  };
                  applyCartOperations(cartItem);
                  window.location.href = clientRoutes.medicinesLandingViewCart();
                }}
              >
                Add To Cart
              </AphButton>
              <AphButton
                color="primary"
                onClick={() => {
                  const cartItem: MedicineCartItem = {
                    description: data.description,
                    id: data.id,
                    image: data.image,
                    is_in_stock: data.is_in_stock,
                    is_prescription_required: data.is_prescription_required,
                    name: data.name,
                    price: data.price,
                    sku: data.sku,
                    special_price: data.special_price,
                    small_image: data.small_image,
                    status: data.status,
                    thumbnail: data.thumbnail,
                    type_id: data.type_id,
                    mou: data.mou,
                    quantity: medicineQty,
                  };
                  applyCartOperations(cartItem);
                  window.location.href = clientRoutes.medicinesCart();
                }}
              >
                Buy Now
              </AphButton>
            </>
          ) : (
            <AphButton
              fullWidth
              className={classes.notifyBtn}
              onClick={() => setIsPopoverOpen(true)}
            >
              Notify when in stock
            </AphButton>
          )}
        </div>
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
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <MedicineNotifyPopover medicineName={data.name} setIsPopoverOpen={setIsPopoverOpen} />
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
          setIsSubDrugsPopoverOpen={setIsSubDrugsPopoverOpen}
        />
      </Popover>
    </div>
  );
};

{
  /* {substitute && (
                ? (
                <span>Pick from 9 available substitutes</span>
              ) : (
                <>
                  <div className={classes.selectedDrugs}>
                    <div>{substitute.name}</div>
                    <div
                      className={classes.price}
                    >{`Rs. ${substitute.price}`}</div>
                  </div>
                  <div className={classes.dropDownArrow}>
                    <img src={require("images/ic_dropdown_green.svg")} alt="" />
                  </div>
                </>
              )}  */
}
