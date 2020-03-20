import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, Popover, Typography, FormControlLabel, MenuItem } from '@material-ui/core';
import { AphButton, AphCustomDropdown } from '@aph/web-ui-components';
import { MedicineCartItem, useShoppingCart } from 'components/MedicinesCartProvider';
import _uniqueId from 'lodash/uniqueId';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import _unescape from 'lodash/unescape';
import axios from 'axios';
// import { AphCheckbox } from 'components/AphCheckbox';

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
    medicineFor: {
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
    subscriptionAdded: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderTop: 'solid 0.5px rgba(2,71,91,0.2)',
      paddingTop: 10,
      marginTop: 10,
      display: 'flex',
      alignItems: 'center',
      lineHeight: '24px',
      '& span': {
        marginLeft: 'auto',
      },
      '& button': {
        boxShadow: 'none',
        color: '#fc9916',
        padding: 0,
        minWidth: 'auto',
        marginLeft: 40,
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
    selectMenuItemFor: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#02475b',
      letterSpacing: 0.33,
      paddingTop: 7,
      paddingBottom: 6,
      paddingLeft: 2,
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
      minWidth: 30,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
    popHeader: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 15,
      marginBottom: 15,
      display: 'flex',
      alignItems: 'center',
      '& span:first-child': {
        opacity: 0.6,
      },
      '& span:last-child': {
        marginLeft: 'auto',
      },
      '& img': {
        verticalAlign: 'middle',
      },
    },
    showElement: {
      display: 'block',
    },
    hideElement: {
      display: 'none',
    },
    errorColor: {
      color: '#890000',
      fontWeight: 'bold',
    },
  };
});

interface MedicineStripCardProps {
  medicines: MedicineCartItem[];
}

export const MedicineStripCard: React.FC<MedicineStripCardProps> = (props) => {
  const classes = useStyles({});
  const medicineRef = useRef(null);
  const { updateCartItem, removeCartItem } = useShoppingCart();

  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [selectedPackedQty, setSelectedPackedQty] = React.useState<number[]>([]);
  const [selectedPackedContainer, setSelectedPackedContainer] = React.useState<boolean[]>([]);

  const [popoverContent, setPopoverContent] = React.useState<string>('');
  const [popoverPrescriptionIcon, setpopoverPrescriptionIcon] = React.useState<boolean>(false);
  const [popoverItemName, setpopoverItemName] = React.useState<string>('');

  const { medicines } = props;

  const apiDetails = {
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
    imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  const medicinesMarkup = () => {
    return medicines.map((medicineDetails, index) => {
      const medicineName = _startCase(_toLower(medicineDetails.name));
      const medicinePrice = medicineDetails.price.toFixed(2);
      const medicineQty = medicineDetails.quantity;
      const isPrescriptionRequired =
        medicineDetails.is_prescription_required === '0' ? false : true;
      const medicineDescription = medicineDetails.description;
      const isInStock = medicineDetails.is_in_stock;
      const medicineSku = medicineDetails.sku;
      const medicineId = medicineDetails.id;
      const medicineImage = medicineDetails.image;
      const medicineSmallImage = medicineDetails.small_image;
      const status = medicineDetails.status;
      const thumbnail = medicineDetails.thumbnail;
      const typeId = medicineDetails.type_id;
      const mou = medicineDetails.mou;

      // console.log(medicineName, isPrescriptionRequired);
      // console.log(selectedPackedQty[index], medicineDetails.quantity);

      if (!selectedPackedQty[index]) {
        selectedPackedQty[index] = medicineDetails.quantity > 0 ? medicineDetails.quantity : 1;
        selectedPackedContainer[index] = false;
      }
      return (
        <div className={classes.medicineStrip} key={index}>
          <div className={classes.medicineStripWrap}>
            <div className={classes.medicineInformation}>
              <div className={classes.medicineIcon}>
                <img
                  src={
                    isPrescriptionRequired
                      ? require('images/ic_tablets_rx.svg')
                      : `${apiDetails.imageUrl}${medicineImage}`
                  }
                  alt=""
                  title={isPrescriptionRequired ? 'Prescription required' : ''}
                />
              </div>
              <div className={classes.medicineName}>
                {medicineName}
                <div className={`${classes.tabInfo} ${!isInStock ? classes.errorColor : ''}`}>
                  {isInStock ? (mou ? `Pack Of ${mou}` : '') : 'Out Of Stock'}
                </div>
              </div>
            </div>
            <div className={classes.cartRight}>
              {medicineDescription !== '&amp;nbsp;' ? (
                <div
                  className={classes.helpText}
                  ref={medicineRef}
                  onClick={() => {
                    setIsPopoverOpen(true);
                    if (isPrescriptionRequired) setpopoverPrescriptionIcon(true);
                    axios
                      .post(
                        process.env.PHARMACY_MED_PRODUCT_INFO_URL,
                        { params: medicineSku },
                        {
                          headers: {
                            Authorization: process.env.PHARMACY_MED_AUTH_TOKEN,
                          },
                        }
                      )
                      .then((result) => {
                        console.log('........', result);
                      });

                    setpopoverItemName(medicineName);
                    setPopoverContent(medicineDescription);
                  }}
                >
                  <img src={require('images/ic_info.svg')} alt="Medicine information" />
                </div>
              ) : null}
              <div className={classes.medicinePrice}>Rs. {medicinePrice}</div>
              <div
                className={`${classes.medicinePack} ${
                  selectedPackedContainer[index] || medicineQty > 0
                    ? classes.showElement
                    : classes.hideElement
                }`}
              >
                <AphCustomDropdown
                  classes={{ selectMenu: classes.selectMenuItem }}
                  value={selectedPackedQty[index]}
                  onChange={(e) => {
                    const existingValues = selectedPackedQty;
                    existingValues[index] = e.target.value as number;
                    setSelectedPackedQty((previousValues) => [
                      ...previousValues,
                      ...existingValues,
                    ]);
                    updateCartItem &&
                      updateCartItem({
                        description: medicineDescription,
                        id: medicineId,
                        image: medicineImage,
                        is_in_stock: isInStock,
                        is_prescription_required: medicineDetails.is_prescription_required,
                        name: medicineName,
                        price: parseFloat(medicinePrice),
                        sku: medicineSku,
                        small_image: medicineSmallImage,
                        status: status,
                        thumbnail: thumbnail,
                        type_id: typeId,
                        quantity: selectedPackedQty[index],
                        mou: mou,
                      });
                  }}
                  key={_uniqueId('dropdown_')}
                >
                  {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (itemIndex) => (
                    <MenuItem
                      classes={{
                        root: classes.menuRoot,
                        selected: classes.menuSelected,
                      }}
                      value={itemIndex}
                      key={_uniqueId('menuItem_')}
                    >
                      {itemIndex} Pack
                    </MenuItem>
                  ))}
                </AphCustomDropdown>
              </div>
              {isInStock ? (
                <div className={classes.addToCart}>
                  {medicineQty > 0 ? (
                    <AphButton
                      onClick={(e) => {
                        removeCartItem && removeCartItem(medicineId);
                      }}
                    >
                      <img
                        src={require('images/ic_cross_onorange_small.svg')}
                        alt="Remove Item"
                        title="Remove item from Cart"
                      />
                    </AphButton>
                  ) : (
                    <AphButton
                      onClick={(e) => {
                        const existingSelectedPackedValues = selectedPackedContainer;
                        existingSelectedPackedValues[index] = true;
                        setSelectedPackedContainer((previousValues) => [
                          ...previousValues,
                          ...existingSelectedPackedValues,
                        ]);
                      }}
                    >
                      <img
                        src={require('images/ic_plus.svg')}
                        alt="Add Item"
                        title="Add item to Cart"
                      />
                    </AphButton>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={classes.root}>
      {medicinesMarkup()}
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
          {popoverPrescriptionIcon ? (
            <div className={classes.popHeader}>
              <span>This medicine requires doctor's prescription</span>
              <span>
                <img src={require('images/ic_tablets_rx.svg')} alt="" />
              </span>
            </div>
          ) : null}
          <Typography variant="h4">How {popoverItemName} Works</Typography>
          <p>{_unescape(popoverContent).replace(/<\/?[^>]+(>|$)/g, '')}</p>
          {/* <Typography variant="h4">Important Information</Typography>
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
          <p>quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.</p> */}
        </Paper>
      </Popover>
    </div>
  );
};

// {/** medice card section end */}
// {/** medice card section start */}
// <div className={classes.medicineStrip}>
//   <div className={classes.medicineStripWrap}>
//     <div className={classes.medicineInformation}>
//       <div className={classes.medicineIcon}>
//         <img src={require('images/ic_tablets.svg')} alt="" />
//       </div>
//       <div className={classes.medicineName}>
//         Metformin 500mg <div className={classes.noStock}>Out Of Stock</div>
//       </div>
//     </div>
//     <div className={classes.cartRight}>
//       <div
//         className={classes.helpText}
//         ref={medicineRef}
//         onClick={() => setIsPopoverOpen(true)}
//       >
//         <img src={require('images/ic_info.svg')} alt="" />
//       </div>
//       <div className={classes.medicinePrice}>Rs. 120</div>
//       <div className={classes.addToCart}>
//         <AphButton disabled className={classes.buttonDisabled}>
//           <img src={require('images/ic_plus.svg')} alt="" />
//         </AphButton>
//       </div>
//     </div>
//   </div>
// </div>
// {/** medice card section end */}
// {/** medice card section start */}
{
  /* <div className={classes.medicineStrip}>
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
          value={selectedPackQty}
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
  </div> */
}
//   <div className={classes.subscriptionLink}>
//     <FormControlLabel
//       control={<AphCheckbox color="primary" />}
//       label="Need to take this regularly?"
//       labelPlacement="start"
//     />
//   </div>
// </div>
// {/** medice card section end */}
// {/** medice card section start */}
// <div className={classes.medicineStrip}>
//   <div className={classes.medicineStripWrap}>
//     <div className={classes.medicineInformation}>
//       <div className={classes.medicineIcon}>
//         <img src={require('images/ic_tablets.svg')} alt="" />
//       </div>
//       <div className={classes.medicineName}>
//         Metformin 500mg <div className={classes.tabInfo}>Pack Of 10</div>
//       </div>
//     </div>
//     <div className={classes.cartRight}>
//       <div
//         className={classes.helpText}
//         ref={medicineRef}
//         onClick={() => setIsPopoverOpen(true)}
//       >
//         <img src={require('images/ic_info.svg')} alt="" />
//       </div>
//       <div className={classes.medicinePack}>
//         <AphCustomDropdown
//           classes={{ selectMenu: classes.selectMenuItem }}
//           value={selectedPackQty1}
//         >
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={1}
//           >
//             1 Pack
//           </MenuItem>
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={2}
//           >
//             2 Pack
//           </MenuItem>
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={3}
//           >
//             3 Pack
//           </MenuItem>
//         </AphCustomDropdown>
//       </div>
//       <div className={classes.medicinePrice}>Rs. 120</div>
//       <div className={classes.addToCart}>
//         <AphButton>
//           <img src={require('images/ic_cross_onorange_small.svg')} alt="" />
//         </AphButton>
//       </div>
//     </div>
//   </div>
//   <div className={classes.subscriptionAdded}>
//     <span>You have subscribed to this already</span>
//     <AphButton>Edit</AphButton>
//     <AphButton>Add New Subscription</AphButton>
//   </div>
// </div>
// {/** medice card section end */}
// {/** medice card section start */}
// <div className={classes.medicineStrip}>
//   <div className={classes.medicineStripWrap}>
//     <div className={classes.medicineInformation}>
//       <div className={classes.medicineIcon}>
//         <img src={require('images/ic_tablets.svg')} alt="" />
//       </div>
//       <div className={classes.medicineName}>
//         Metformin 500mg <div className={classes.tabInfo}>Pack Of 10</div>
//       </div>
//     </div>
//     <div className={classes.cartRight}>
//       <div className={classes.medicineFor}>
//         For
//         <AphCustomDropdown
//           classes={{ selectMenu: classes.selectMenuItemFor }}
//           value={selectedForName}
//         >
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={1}
//           >
//             Surj
//           </MenuItem>
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={2}
//           >
//             Surj
//           </MenuItem>
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={3}
//           >
//             Surj
//           </MenuItem>
//         </AphCustomDropdown>
//       </div>
//       <div className={classes.medicinePack}>
//         <AphCustomDropdown
//           classes={{ selectMenu: classes.selectMenuItem }}
//           value={selectedPackQty2}
//         >
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={1}
//           >
//             1 Pack
//           </MenuItem>
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={2}
//           >
//             2 Pack
//           </MenuItem>
//           <MenuItem
//             classes={{ root: classes.menuRoot, selected: classes.menuSelected }}
//             value={3}
//           >
//             3 Pack
//           </MenuItem>
//         </AphCustomDropdown>
//       </div>
//       <div className={classes.medicinePrice}>Rs. 120</div>
//       <div className={classes.addToCart}>
//         <AphButton>
//           <img src={require('images/ic_cross_onorange_small.svg')} alt="" />
//         </AphButton>
//       </div>
//     </div>
//   </div>
// </div>
// {/** medice card section end */}

{
  /** medice card section start */
}
// <div className={classes.medicineStrip}>
//   <div className={classes.medicineStripWrap}>
//     <div className={classes.medicineInformation}>
//       <div className={classes.medicineIcon}>
//         <img src={require('images/ic_tablets.svg')} alt="" />
//       </div>
//       <div className={classes.medicineName}>
//         Metformin 500mg <div className={classes.tabInfo}>Pack Of 10</div>
//       </div>
//     </div>
//     <div className={classes.cartRight}>
//       <div
//         className={classes.helpText}
//         ref={medicineRef}
//         onClick={() => setIsPopoverOpen(true)}
//       >
//         <img src={require('images/ic_info.svg')} alt="" />
//       </div>
//       <div className={classes.medicinePrice}>Rs. 120</div>
//       <div className={classes.addToCart}>
//         <AphButton>
//           <img src={require('images/ic_plus.svg')} alt="" />
//         </AphButton>
//       </div>
//     </div>
//   </div>
// </div>
