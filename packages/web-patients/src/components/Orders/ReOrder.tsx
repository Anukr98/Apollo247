import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { useShoppingCart } from 'components/MedicinesCartProvider';
import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { reOrderItems } from 'helpers/MedicineApiCalls';
import { clientRoutes } from 'helpers/clientRoutes';
import { Route } from 'react-router-dom';
import { getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails as OrderDetails } from 'graphql/types/getMedicineOrderOMSDetailsWithAddress';
import { getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails as LatestOrderDetailsType } from 'graphql/types/getLatestMedicineOrder';

const useStyles = makeStyles((theme: Theme) => {
  return {
    continueBtn: {
      marginTop: 35,
      textAlign: 'center',
      '& button': {
        minWidth: 144,
        borderRadius: 10,
      },
    },
    reorderTitle: {
      padding: '15px 20px',
      '& h2': {
        fontSize: 16,
      },
    },
    cartBody: {
      padding: 16,
      '& ul': {
        color: '#68919d',
        marginBottom: 20,
        '& li': {
          paddingBottom: 10,
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
    cartItem: {
      fontSize: 12,
      color: '#02475b',
      fontWeight: 500,
    },
    cartItemSubheading: {
      marginTop: 10,
    },
    reorderBtn: {
      backgroundColor: 'transparent',
      padding: 0,
      fontSize: 12,
      fontWeight: 500,
      color: '#fcb716',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#fcb716',
      },
    },
  };
});

interface ReOrderProps {
  orderDetailsData: OrderDetails | LatestOrderDetailsType;
  type: string;
  patientName: string;
}

export const ReOrder: React.FC<ReOrderProps> = (props) => {
  const { orderDetailsData, type, patientName } = props;
  const { addMultipleCartItems, updateEprescriptions } = useShoppingCart();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unavailableMedicineItems, setUnavailableMedicineItems] = useState<string[]>([]);
  const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
  const classes = useStyles({});

  return (
    <>
      <Route
        render={({ history }) => (
          <AphButton
            color="primary"
            className={type === 'Order Details' ? '' : classes.reorderBtn}
            onClick={async () => {
              setIsLoading(true);
              const {
                items,
                prescriptions,
                totalItemsCount,
                unAvailableItems,
              } = await reOrderItems(orderDetailsData, type, patientName);
              if (unAvailableItems.length > 0) {
                setUnavailableMedicineItems(unAvailableItems);
                setTotalItemsCount(totalItemsCount);
                setIsDialogOpen(true);
                setIsLoading(false);
              } else {
                prescriptions.length > 0 &&
                  updateEprescriptions &&
                  updateEprescriptions(prescriptions);
                items.length > 0 && addMultipleCartItems && addMultipleCartItems(items);
                history.push(clientRoutes.medicinesCart());
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={22} color="secondary" />
            ) : type === 'Order Details' ? (
              'Re-order'
            ) : (
              'Reorder'
            )}
          </AphButton>
        )}
      />
      <AphDialog open={isDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsDialogOpen(false)} title={'Close'} />
        <AphDialogTitle className={classes.reorderTitle}>Added to Cart</AphDialogTitle>
        <div className={classes.cartBody}>
          {unavailableMedicineItems && totalItemsCount && (
            <div className={classes.cartItem}>
              {totalItemsCount - unavailableMedicineItems.length} out of {totalItemsCount} items
              have been added to cart.
            </div>
          )}
          <div className={`${classes.cartItem} ${classes.cartItemSubheading}`}>
            We couldn't add below items:
          </div>
          <ul>
            {unavailableMedicineItems.map((item) => (
              <li>{item}</li>
            ))}
          </ul>
          <div className={classes.cartItem}>Please continue for purchase.</div>
          <div className={classes.continueBtn}>
            <Route
              render={({ history }) => (
                <AphButton
                  color="primary"
                  onClick={() => {
                    setUnavailableMedicineItems([]);
                    setIsDialogOpen(false);
                    history.push(clientRoutes.medicinesCart());
                  }}
                >
                  Continue
                </AphButton>
              )}
            />
          </div>
        </div>
      </AphDialog>
    </>
  );
};
