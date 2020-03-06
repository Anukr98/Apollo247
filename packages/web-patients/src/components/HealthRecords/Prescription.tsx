import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
  CircularProgress,
} from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import {
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheetType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_medicinePrescription as PrescriptionType,
} from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import {
  MEDICINE_TIMINGS,
  MEDICINE_TO_BE_TAKEN,
  MEDICINE_UNIT,
  MEDICINE_CONSUMPTION_DURATION,
} from '../../graphql/types/globalTypes';
import { clientRoutes } from 'helpers/clientRoutes';
import axios from 'axios';
import { useShoppingCart, MedicineCartItem } from '../MedicinesCartProvider';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '12px !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '4px 20px',
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      textTransform: 'uppercase',
    },
    panelExpanded: {
      minHeight: 'auto !important',
      '& >div:first-child': {
        marginTop: 12,
        marginBottom: 12,
      },
    },
    panelDetails: {
      padding: 20,
      paddingTop: 0,
      display: 'inline-block',
      width: '100%',
    },
    noWrapper: {
      padding: '0 10px',
      color: '#01475b',
      fontWeight: 500,
      fontSize: 14,
      textTransform: 'uppercase',
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      letterSpacing: 0.02,
      paddingBottom: 8,
      opacity: 0.8,
    },
    cardSection: {
      padding: 12,
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      lineHeight: 1.43,
      minHeight: 84,
    },
    bottomActions: {
      paddingTop: 20,
      paddingBottom: 10,
      textAlign: 'right',
      '& button': {
        color: '#fc9916',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: 'none',
        padding: 0,
        border: 'none',
        backgroundColor: 'transparent',
      },
    },
  };
});

type PrescriptionProps = {
  caseSheetList: (CaseSheetType | null)[] | null;
};

const apiDetails = {
  url: process.env.PHARMACY_MED_SEARCH_URL,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
};

const cartMedicines: MedicineCartItem[] = [];

export const Prescription: React.FC<PrescriptionProps> = (props) => {
  const classes = useStyles({});
  const caseSheetList = props.caseSheetList;
  const [mutationLoading, setMutationLoading] = useState<boolean>(false);

  const prescriptions: PrescriptionType[] = [];
  caseSheetList &&
    caseSheetList.length > 0 &&
    caseSheetList.forEach(
      (caseSheet: CaseSheetType | null) =>
        caseSheet &&
        caseSheet.doctorType !== 'JUNIOR' &&
        caseSheet.medicinePrescription &&
        caseSheet.medicinePrescription.length > 0 &&
        caseSheet.medicinePrescription.forEach(
          (prescription: PrescriptionType | null) =>
            prescription && prescriptions.push(prescription)
        )
    );

  const { addMultipleCartItems } = useShoppingCart();

  const getMedicineDetails = async (sku: string, medPrescription: PrescriptionType) => {
    await axios
      .post(
        apiDetails.url,
        { params: sku },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        if (data && data.productdp[0]) {
          const index = cartMedicines.findIndex(
            (item: MedicineCartItem) => item.id === data.productdp[0].id
          );
          const _qty =
            medPrescription.medicineUnit == MEDICINE_UNIT.CAPSULE ||
            medPrescription.medicineUnit == MEDICINE_UNIT.TABLET
              ? ((medPrescription.medicineTimings || []).length || 1) *
                parseInt(medPrescription.medicineConsumptionDurationInDays || '1') *
                (medPrescription.medicineToBeTaken!.length || 1) *
                parseFloat(medPrescription.medicineDosage! || '1')
              : 1;
          const qty = Math.ceil(_qty / parseInt(data.productdp[0].mou || '1'));
          if (index === -1) {
            const cartItem: MedicineCartItem = {
              description: data.productdp[0].description,
              id: data.productdp[0].id,
              image: data.productdp[0].image,
              is_in_stock: data.productdp[0].is_in_stock,
              is_prescription_required: data.productdp[0].is_prescription_required,
              name: data.productdp[0].name,
              price: data.productdp[0].price,
              sku: data.productdp[0].sku,
              special_price: data.productdp[0].special_price,
              small_image: data.productdp[0].small_image,
              status: data.productdp[0].status,
              thumbnail: data.productdp[0].thumbnail,
              type_id: data.productdp[0].type_id,
              mou: data.productdp[0].mou,
              quantity: qty,
            };
            cartMedicines.push(cartItem);
          }
        }
        return cartMedicines;
      })
      .catch((e) => {
        setMutationLoading(false);
      });
  };

  const onAddToCart = async () => {
    setMutationLoading(true);
    const medPrescriptionList =
      prescriptions &&
      prescriptions.filter((prescription) => prescription.id && prescription.id.length > 0);
    await Promise.all(
      medPrescriptionList.map(async (medPrescription) => {
        medPrescription.id && (await getMedicineDetails(medPrescription.id, medPrescription));
      })
    );
    if (cartMedicines && cartMedicines.length > 0 && addMultipleCartItems) {
      addMultipleCartItems(cartMedicines);
    }

    setTimeout(() => {
      window.location.href = clientRoutes.medicinesCart();
    }, 5000);
  };

  const getFormattedUnit = (
    unit: MEDICINE_CONSUMPTION_DURATION | null,
    numberOfDays: string | null
  ) => {
    const daysCount = numberOfDays ? parseFloat(numberOfDays) : 0;
    if (unit) {
      if (daysCount === 1 || daysCount === 0) {
        return (unit || '').toLowerCase().replace('s', '');
      }
      return (unit || '').toLowerCase().replace('s', '(s)');
    }
    return daysCount === 1 || daysCount === 0 ? 'day' : 'days';
  };

  return (
    <ExpansionPanel className={classes.root} defaultExpanded={true}>
      <ExpansionPanelSummary
        expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
        classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
      >
        Prescription
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        <Grid container spacing={2}>
          {prescriptions && prescriptions.length > 0 ? (
            prescriptions.map((prescription: PrescriptionType, idx: number) => (
              <Grid key={idx} item xs={12} sm={6}>
                <div className={classes.cardTitle}>{prescription.medicineName}</div>
                {prescription && (
                  <div className={classes.cardSection}>
                    {prescription.medicineUnit && prescription.medicineFormTypes == 'OTHERS'
                      ? 'Take ' +
                        prescription.medicineDosage +
                        ' ' +
                        prescription.medicineUnit.toLowerCase() +
                        ' (s)' +
                        ' '
                      : `Apply ${
                          prescription && prescription.medicineUnit
                            ? prescription.medicineUnit.toLowerCase()
                            : ''
                        } `}

                    {prescription.medicineFrequency! &&
                      prescription.medicineFrequency!.replace(/[^a-zA-Z ]/g, ' ').toLowerCase() +
                        ' '}
                    {prescription.medicineToBeTaken
                      ? prescription.medicineToBeTaken
                          .map(
                            (item: MEDICINE_TO_BE_TAKEN | null) =>
                              item &&
                              item
                                .split('_')
                                .join(' ')
                                .toLowerCase()
                          )
                          .join(', ')
                      : ''}
                    {prescription.medicineTimings && prescription.medicineTimings.length > 0
                      ? ' in the '
                      : ''}
                    {prescription.medicineTimings
                      ? prescription.medicineTimings
                          .map(
                            (item: MEDICINE_TIMINGS | null) =>
                              item &&
                              item
                                .split('_')
                                .join(' ')
                                .toLowerCase()
                          )
                          .map(
                            (val: string | null, idx: number, array: (string | null)[]) =>
                              val &&
                              array &&
                              `${val}${
                                idx == array.length - 2
                                  ? ' and '
                                  : idx > array.length - 2
                                  ? ''
                                  : ', '
                              }`
                          )
                      : ''}
                    {prescription.medicineConsumptionDurationInDays == '' ||
                    prescription.medicineConsumptionDurationInDays == '0'
                      ? ''
                      : prescription.medicineConsumptionDurationInDays &&
                        prescription.medicineConsumptionDurationInDays === '1'
                      ? ` for ${prescription.medicineConsumptionDurationInDays} ${getFormattedUnit(
                          prescription.medicineConsumptionDurationUnit,
                          prescription.medicineConsumptionDurationInDays
                        )} `
                      : ` for ${prescription.medicineConsumptionDurationInDays} ${getFormattedUnit(
                          prescription.medicineConsumptionDurationUnit,
                          prescription.medicineConsumptionDurationInDays
                        )} `}

                    {prescription.medicineInstructions ? (
                      <>
                        <br />
                        {prescription.medicineInstructions}
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                )}
              </Grid>
            ))
          ) : (
            <div className={classes.noWrapper}>No Prescription</div>
          )}
        </Grid>
        {/* {prescriptions && prescriptions.length > 0 && (
          <div className={classes.bottomActions}>
            <AphButton
              onClick={() => {
                onAddToCart();
              }}
            >
              {mutationLoading ? (
                <>
                  <CircularProgress /> Adding to Cart
                </>
              ) : (
                'Order Medicines'
              )}
            </AphButton>
          </div>
        )} */}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
