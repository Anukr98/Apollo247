import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { Tab, Tabs, Theme, Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/styles';
import axios from 'axios';
import { Alerts } from 'components/Alerts/Alerts';
import { BottomLinks } from 'components/BottomLinks';
import { Header } from 'components/Header';
import { ManageProfile } from 'components/ManageProfile';
import { HotSellers } from 'components/Medicine/Cards/HotSellers';
import { MedicineAutoSearch } from 'components/Medicine/MedicineAutoSearch';
import { MedicineImageGallery } from 'components/Medicine/MedicineImageGallery';
import { MedicineInformation } from 'components/Medicine/MedicineInformation';
import { MedicinesCartContext, useShoppingCart } from 'components/MedicinesCartProvider';
import { NavigationBottom } from 'components/NavigationBottom';
import { UploadEPrescriptionCard } from 'components/Prescriptions/UploadEPrescriptionCard';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
import { clientRoutes } from 'helpers/clientRoutes';
import { deepLinkUtil, getPackOfMedicine } from 'helpers/commonHelpers';
import { useCurrentPatient } from 'hooks/authHooks';
import { useParams } from 'hooks/routerHooks';
import { MetaTagsComp } from 'MetaTagsComp';
import moment from 'moment';
import React, { useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { SchemaMarkup } from 'SchemaMarkup';
import stripHtml from 'string-strip-html';
import {
  medicinePageOpenTracking,
  pharmacyPdpOverviewTracking,
  pharmacyProductViewTracking,
  uploadPrescriptionTracking,
} from 'webEngageTracking';
import { dataLayerTracking, gtmTracking } from '../../gtmTracking';
import { MedicineProductDetails, PharmaOverview } from '../../helpers/MedicineApiCalls';
import { hasOnePrimaryUser } from '../../helpers/onePrimaryUser';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    progressLoader: {
      textAlign: 'center',
      padding: 20,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    visibilityHidden: {
      visibility: 'hidden',
      position: 'absolute',
    },
    medicineDetailsPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        zIndex: 999,
        width: '100%',
      },
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      paddingTop: 17,
      paddingBottom: 11,
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 999,
        top: 0,
        width: '100%',
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        boxShadow: '0px 0px 5px rgba(128, 128, 128, 0.2)',
        textAlign: 'center',
      },
    },
    medicineDetailsGroup: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px',
      },
      [theme.breakpoints.down('xs')]: {
        marginTop: 27,
        background: '#F7F8F5',
      },
    },
    medicineDetailsHeader: {
      display: 'none',
      background: '#fff',
      padding: 20,
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 999,
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      padding: '0 10px 0 0',
      backgroundColor: '#fff',
      marginRight: 10,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        padding: 0,
      },
    },
    scrollResponsive: {
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 250px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        maxHeight: 'inherit !important',
        height: 'auto !important',
      },
      '& > div': {
        [theme.breakpoints.down('xs')]: {
          maxHeight: 'inherit !important',
        },
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      zIndex: 2,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 0,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    detailsHeader: {
      flex: 1,
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    productInformation: {
      backgroundColor: theme.palette.common.white,
      padding: 20,
      borderRadius: 5,
      display: 'flex',
      [theme.breakpoints.down(992)]: {
        display: 'block',
        width: '100%',
      },
      [theme.breakpoints.down(768)]: {
        display: 'flex',
        backgroundColor: '#f7f8f5',
        flexDirection: 'row-reverse',
        justifyContent: 'flex-end',
      },
    },
    webImages: {
      [theme.breakpoints.down(768)]: {
        display: 'none',
      },
    },
    mobileImages: {
      position: 'absolute',
      top: 20,
      right: 20,
      [theme.breakpoints.up(768)]: {
        display: 'none',
      },
    },
    imageDisplay: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      boxShadow: '0px 0px 5px rgba(128, 128, 128, 0.2)',
      '& img': {
        width: '72%',
      },
    },
    imageDesc: {
      color: '#0087ba',
      fontSize: 10,
      fontWeight: 600,
      textAlign: 'center',
      marginTop: 10,
    },
    noImageWrapper: {
      width: 290,
      border: 'solid 1px rgba(151,151,151,0.24)',
      borderRadius: 10,
      [theme.breakpoints.down(991)]: {
        width: '100%',
      },
      [theme.breakpoints.down('xs')]: {
        width: 80,
        height: 80,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        boxShadow: '0px 0px 5px rgba(128, 128, 128, 0.2)',
        position: 'absolute',
        top: 20,
        right: 20,
      },
      '& img': {
        width: '100%',
      },
    },
    productDetails: {
      paddingLeft: 20,
      width: 'calc(100% - 290px)',
      [theme.breakpoints.down(992)]: {
        width: '100%',
        paddingTop: 20,
      },
      [theme.breakpoints.down('xs')]: {
        paddingTop: 0,
        paddingLeft: 0,
      },
      '& h1': {
        fontSize: 20,
        fontWeight: 600,
        color: '#02475b',
        margin: 0,
      },
    },
    productBasicInfo: {
      [theme.breakpoints.down('xs')]: {
        width: '70%',
        minHeight: 150,
      },
    },
    productDetailed: {
      [theme.breakpoints.down('xs')]: {
        padding: '20px 0 0',
      },
    },
    productInfo: {
      fontSize: 14,
      color: '#02475b',
      lineHeight: '22px',
      fontWeight: 500,
      '& p': {
        margin: '5px 0',
      },
      [theme.breakpoints.down('xs')]: {
        borderTop: '0.5px solid rgba(2,71,91,0.3)',
        padding: '10px 20px',
      },
    },
    textInfo: {
      fontSize: 10,
      fontWeight: 500,
      color: '#02475b',
      textTransform: 'uppercase',
      paddingBottom: 8,
      '& label': {
        textTransform: 'none',
        color: '#658f9b',
        display: 'block',
      },
      '& h2': {
        textTransform: 'none',
        color: '#658f9b',
        display: 'block',
        fontSize: 10,
        fontWeight: 500,
      },
      '& h3': {
        fontSize: 10,
        fontWeight: 500,
      },
    },
    packOfText: {
      textTransform: 'none',
      color: '#658f9b',
      display: 'block',
      fontSize: 10,
      fontWeight: 500,
    },
    tabsRoot: {
      borderRadius: 0,
      minHeight: 'auto',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      // margin: '5px 0 0 0',
      '& svg': {
        color: '#02475b',
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#f7f8f5',
      },
      // '&:before': {
      //   content: '""',
      //   borderTop: '0.5px solid rgba(2,71,91,0.3)',
      //   position: 'absolute',
      //   left: 0,
      //   right: 0,
      // },
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      color: '#02475b',
      padding: '10px 12px',
      textTransform: 'none',
      opacity: 0.5,
      lineHeight: 'normal',
      minWidth: 'auto',
      minHeight: 'auto',
      flexBasis: 'auto',
      margin: '0 15px 0 0',
      '& h2, h3': {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    tabSelected: {
      opacity: 1,
      fontWeight: 700,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 3,
    },
    tabContainer: {
      fontSize: 14,
      color: '#0087ba',
      lineHeight: '22px',
      [theme.breakpoints.down('xs')]: {
        padding: '15px 20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      },
      '& p': {
        margin: '5px 0',
      },
    },
    productDescription: {
      fontSize: 14,
      color: '#0087ba',
      lineHeight: '22px',
      '& p': {
        margin: '5px 0',
      },
      '& ul': {
        padding: '0 0 0 20px',
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        padding: '10px 20px',
        borderRadius: 5,
      },
    },
    prescriptionBox: {
      backgroundColor: '#f7f8f5',
      padding: '8px 12px',
      display: 'flex',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#02475b',
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
      [theme.breakpoints.down('xs')]: {
        background: '#fff',
      },
    },
    preImg: {
      marginLeft: 'auto',
      paddingLeft: 20,
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
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
    autoSearch: {
      backgroundColor: '#fff',
      padding: '20px 40px',
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      marginTop: -57,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        boxShadow: 'none',
        padding: 0,
        marginTop: -10,
      },
      '& >div:first-child': {
        flex: 1,
        [theme.breakpoints.down('xs')]: {
          top: 50,
        },
      },
    },
    searchRight: {
      marginLeft: 'auto',
      paddingLeft: 40,
      display: 'flex',
      alignItems: 'center',
    },
    uploadPreBtn: {
      backgroundColor: '#fff',
      color: '#fcb716',
      border: '1px solid #fcb716',
      minWidth: 105,
      '&:hover': {
        backgroundColor: '#fff',
        color: '#fcb716',
      },
    },
    ePrescriptionTitle: {
      zIndex: 9999,
    },
    specialOffer: {
      cursor: 'pointer',
      paddingLeft: 20,
      fontSize: 16,
      color: '#01475b',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      '& img': {
        verticalAlign: 'middle',
        marginRight: 10,
      },
    },
    itemCount: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      backgroundColor: '#ff748e',
      position: 'absolute',
      right: -4,
      top: -7,
      fontSize: 9,
      fontWeight: 'bold',
      color: theme.palette.common.white,
      lineHeight: '14px',
      textAlign: 'center',
    },
    cartContainer: {
      '& a': {
        position: 'relative',
        display: 'block',
      },
    },
    mobileView: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    tabWrapper: {
      padding: 20,
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    similarProducts: {
      fontSize: 14,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      borderBottom: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      paddingBottom: 8,
      marginBottom: 10,
    },
    sliderSection: {
      padding: 20,
      [theme.breakpoints.down('xs')]: {
        padding: '0 20px 20px',
        overflowX: 'hidden',
      },
    },
    mobileResponseView: {
      [theme.breakpoints.up(768)]: {
        display: 'none',
      },
    },
    webResponseView: {
      [theme.breakpoints.down(768)]: {
        display: 'none',
      },
    },
    ppWrapper: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      background: 'rgba(0,0,0,0.5)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.down(768)]: {
        display: 'flex',
      },
    },
    productPopup: {
      position: 'relative',
      width: 600,
      height: 400,
      background: '#fff',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        height: '100%',
      },
      '& h1': {
        padding: '0 0 5px 10px',
        fontSize: 16,
        fontWeight: 700,
        margin: 0,
        width: 240,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      },
    },
    closePopup: {
      // position: 'absolute',
      // top: 20,
      // borderBottomLeftRadius: 20,
    },
    ppContent: {
      height: 'auto',
      padding: 30,
      '& >div': {
        position: 'static',
        width: 'auto',
      },
    },
    ppHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: 20,
    },
    myImageClass: {
      [theme.breakpoints.up(768)]: {
        zIndex: 1,
        position: 'absolute',
        top: 200,
        left: 530,
      },
    },
  };
});

type MedicineOverViewDetails = {
  Caption: string;
  CaptionDesc: string;
};

type MedicineOverView = MedicineOverViewDetails[] | string;

const MedicineDetails: React.FC = (props) => {
  const classes = useStyles({});
  const [tabValue, setTabValue] = React.useState<number>(0);
  const params = useParams<{ sku: string; searchText: string }>();
  const [medicineDetails, setMedicineDetails] = React.useState<MedicineProductDetails | null>(null);
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [productSchemaJSON, setProductSchemaJSON] = React.useState(null);
  const [drugSchemaJSON, setDrugSchemaJSON] = React.useState(null);
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [metaTagProps, setMetaTagProps] = React.useState(null);
  const [imageClick, setImageClick] = React.useState<boolean>(false);
  const [isSkuVersion, setIsSkuVersion] = React.useState<boolean>(false);
  const { cartItems } = useShoppingCart();
  const { diagnosticsCartItems } = useDiagnosticsCart();
  useEffect(() => {
    deepLinkUtil(`MedicineDetail?${params.sku}`);
    medicinePageOpenTracking();
  });

  const apiDetails = {
    skuUrl: process.env.PHARMACY_MED_PROD_SKU_URL,
    url: process.env.PHARMACY_MED_PROD_DETAIL_URL,
    authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  };

  const patient = useCurrentPatient();
  const age = patient && patient.dateOfBirth ? moment().diff(patient.dateOfBirth, 'years') : null;

  const handleUploadPrescription = () => {
    uploadPrescriptionTracking({ ...patient, age });
    setIsUploadPreDialogOpen(true);
  };

  const getMedicineDetails = async (sku: string) => {
    await axios
      .post(
        apiDetails.skuUrl || '',
        { params: sku, level: 'product' },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(async ({ data }: any) => {
        await axios
          .post(
            apiDetails.url || '',
            { params: data.sku || sku },
            {
              headers: {
                Authorization: apiDetails.authToken,
              },
            }
          )
          .then(({ data }) => {
            if (data.productdp[0] && data.productdp[0].url_key === null) {
              window.location.href = clientRoutes.medicines();
              return;
            }
            setMedicineDetails(data.productdp[0]);
            /**schema markup  start*/
            const {
              manufacturer,
              image,
              name,
              special_price,
              price,
              id,
              sku,
              type_id,
              PharmaOverview,
              url_key,
              mou,
              category_id,
              is_in_stock,
              MaxOrderQty,
              is_prescription_required,
              similar_products,
            } = data && data.productdp && data.productdp.length && data.productdp[0];
            let { description } = data.productdp[0];
            pharmacyProductViewTracking({
              productName: name,
              source: '',
              productId: sku,
              brand: '',
              brandId: '',
              categoryName: '',
              categoryId: category_id,
              sectionName: '',
            });
            if (
              type_id &&
              type_id.toLowerCase() === 'pharma' &&
              Array.isArray(PharmaOverview) &&
              PharmaOverview.length
            ) {
              const { Overview } = PharmaOverview && PharmaOverview.length > 0 && PharmaOverview[0];
              const desc = Overview.filter((desc: any) => desc.Caption === 'USES');
              description = desc.length ? desc[0].CaptionDesc : '';
            }
            const similarProducts =
              similar_products && similar_products.map((key: MedicineProductDetails) => key.name);
            setProductSchemaJSON({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name,
              sku,
              image: process.env.PHARMACY_MED_IMAGES_BASE_URL + image,
              alternateName: name,
              brand: {
                '@type': 'brand',
                logo: '',
              },
              manufacturer: {
                '@type': 'Organization',
                name: manufacturer,
              },
              itemCondition: 'NewCondition',
              description,
              offers: {
                '@type': 'Offer',
                availability:
                  is_in_stock == 1 ? 'http://schema.org/InStock' : 'http://schema.org/OutOfStock',
                acceptedPaymentMethod: 'COD, Card, Paytm, UPI',
                addOn: '',
                advanceBookingRequirement: '',
                areaServed: '',
                priceCurrency: 'INR',
                availabilityEnds: '',
                availabilityStarts: '',
                availableAtOrFrom: '',
                availableDeliveryMethod: 'Home Delivery',
                deliveryLeadTime: '',
                eligibleCustomerType: '',
                eligibleDuration: '',
                eligibleQuantity: MaxOrderQty,
                eligibleRegion: '',
                eligibleTransactionVolume: '',
                itemCondition: 'NewCondition',
                ineligibleRegion: '',
                price: special_price || price,
                seller: 'APOLLO HOSPITALS ENTERPRISES LTD',
                serialNumber: '',
                validFrom: '',
                validThrough: '',
                warranty: '',
                priceValidUntil: '2020-12-31',
                url: `https://www.apollo247.com/medicine/${url_key}`,
              },
              category: {
                '@type': 'Thing',
                image: process.env.PHARMACY_MED_IMAGES_BASE_URL + image,
              },
              gtin8: id,
              isSimilarTo: similarProducts ? similarProducts.join(', ') : '',
            });
            if (type_id && type_id.toLowerCase() === 'pharma') {
              const { generic, Doseform, Strengh, Unit, Overview } =
                PharmaOverview && PharmaOverview.length > 0 && PharmaOverview[0];
              const renderContent = (reqKey: string) =>
                Overview &&
                Overview.length > 0 &&
                Overview.filter((key: any) => key.Caption === reqKey);
              setDrugSchemaJSON({
                '@context': 'https://schema.org/',
                '@type': 'Drug',
                name,
                mainEntityOfPage: `https://www.apollo247.com/medicine/${url_key}`,
                image: process.env.PHARMACY_MED_IMAGES_BASE_URL + image,
                description,
                activeIngredient: `${generic}-${Strengh}${Unit}`,
                alcoholWarning: renderContent('DRUG ALCOHOL INTERACTION')[0].CaptionDesc,
                availableStrength: {
                  '@context': 'http://schema.org/',
                  '@type': 'DrugStrength',
                  activeIngredient: `${generic}-${Strengh}${Unit}`,
                },
                breastfeedingWarning: renderContent('DRUG BREAST FEEDING INTERACTION')[0]
                  .CaptionDesc,
                pregnancyWarning: renderContent('DRUG PREGNANCY INTERACTION')[0].CaptionDesc,
                clinicalPharmacology: '',
                dosageForm: Doseform,
                drugUnit: Unit,
                foodWarning: '',
                isAvailableGenerically: 'True',
                legalStatus: 'country: india, status: Approved',
                overdosage: '',
                manufacturer: {
                  '@type': 'Organization',
                  legalName: manufacturer,
                },
                mechanismOfAction: '',
                nonProprietaryName: name,
                isProprietary: true,
                prescriptionStatus:
                  is_prescription_required == 1 ? 'Available by prescription' : 'over-the-counter',
                url: `https://www.apollo247.com/medicine/${url_key}`,
              });
            }
            /**schema markup End */
            /**Gtm code start  */
            data &&
              data.productdp &&
              data.productdp.length &&
              gtmTracking({
                category: 'Pharmacy',
                action: 'Product Views',
                label: name,
                value: null,
                ecommObj: {
                  event: 'view_item',
                  ecommerce: {
                    items: [
                      {
                        item_name: name, // Name or ID is required.
                        item_id: sku,
                        price: special_price || price,
                        item_brand: manufacturer,
                        item_category: 'Pharmacy',
                        item_category_2: type_id
                          ? type_id.toLowerCase() === 'pharma'
                            ? 'Drugs'
                            : 'FMCG'
                          : null,
                        // 'item_category_4': '', //parked for future
                        item_variant: 'Default',
                        index: 1,
                        quantity: mou,
                      },
                    ],
                  },
                },
              });
            /**Gtm code End  */

            /**Gtm code start start */
            dataLayerTracking({
              event: 'pageviewEvent',
              pagePath: window.location.href,
              pageName: 'Pharmacy Details Page',
              pageLOB: 'Pharmacy',
              pageType: 'Details Page',
              productlist: JSON.stringify([
                {
                  item_name: name, // Name or ID is required.
                  item_id: sku,
                  price: special_price || price,
                  item_brand: manufacturer,
                  item_category: 'Pharmacy',
                  item_category_2: type_id
                    ? type_id.toLowerCase() === 'pharma'
                      ? 'Drugs'
                      : 'FMCG'
                    : null,
                  item_variant: 'Default',
                  index: 1,
                  quantity: mou,
                },
              ]),
            });
            /**Gtm code start end */

            data &&
              data.productdp &&
              data.productdp.length &&
              setMetaTagProps({
                title: `${name} Price, Uses, Side Effects - Apollo 247`,
                description: `Buy ${name}, Pack of ${getPackOfMedicine(
                  data.productdp[0]
                )} at &#8377;${special_price ||
                  price} in India. Order ${name} online and get the medicine delivered within 4 hours at your doorsteps. Know the uses, side effects, precautions and more about ${name}. `,
                canonicalLink:
                  typeof window !== 'undefined' &&
                  window.location &&
                  window.location.origin &&
                  `${window.location.origin}/medicine/${url_key}`,
              });
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const onePrimaryUser = hasOnePrimaryUser();
  const history = useHistory();

  useEffect(() => {
    if (params.sku === 'null') {
      window.location.href = clientRoutes.medicines();
      return;
    }
    if (params.sku.match('[A-Z]{3}[0-9]{4}')) {
      setIsSkuVersion(true);
    }
    getMedicineDetails(params.sku);
  }, [params.sku]);

  useEffect(() => {
    if (params && params.searchText && params.searchText !== 'null') {
      window.history.replaceState(null, '', clientRoutes.medicineDetails(params.sku));
    }
  }, []);

  let medicinePharmacyDetails: PharmaOverview[] | null = null;

  if (medicineDetails && medicineDetails.PharmaOverview) {
    medicinePharmacyDetails = medicineDetails.PharmaOverview;
  }

  const renderComposition = () => {
    const generics = medicinePharmacyDetails[0].generic.split('+ ');
    const strength = medicinePharmacyDetails[0].Strength
      ? medicinePharmacyDetails[0].Strength.split('+ ')
      : '';
    const units = medicinePharmacyDetails[0].Unit.split('+ ');
    const compositionArray = generics.map((key, ind) => `${key}-${strength[ind]}${units[ind]}`);
    return compositionArray.join(' + ');
  };

  const getHeader = (caption: string) => {
    switch (caption) {
      case 'DRUG ALCOHOL INTERACTION':
        return 'Alcohol';
      case 'DRUG PREGNANCY INTERACTION':
        return 'Pregnancy';
      case 'DRUG MACHINERY INTERACTION (DRIVING)':
        return 'Driving';
      case 'KIDNEY':
        return 'Kidney';
      case 'LIVER':
        return 'Liver';
      default:
        return null;
    }
  };

  const getData = (overView: MedicineOverView) => {
    const modifiedData = [
      { key: 'Overview', value: '' },
      { key: 'Usage', value: '' },
      { key: 'Side Effects', value: '' },
      { key: 'Precautions', value: '' },
      { key: 'Drug Warnings', value: '' },
      { key: 'Storage', value: '' },
    ];

    if (typeof overView !== 'string') {
      overView.forEach((v) => {
        if (v.Caption === 'USES') {
          modifiedData.forEach((x) => {
            if (x.key === 'Overview') {
              x.value = x.value.concat(stripHtml(v.CaptionDesc).result);
            }
          });
        } else if (v.Caption === 'SIDE EFFECTS') {
          modifiedData.forEach((x) => {
            if (x.key === 'Side Effects') {
              x.value = `${x.value}${v.CaptionDesc.split('&lt;')
                .join('<')
                .split('&gt;')
                .join('>')
                .replace(/&amp;bull;/g, '-')
                .replace(/(<([^>]+)>)/gi, '')
                .replace(/&amp;amp;/g, '&')
                .replace(/&amp;nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '')
                .replace(/&gt/g, '')
                .replace(/br \//g, '')}`;
            }
          });
        } else if (v.Caption === 'HOW TO USE' || v.Caption === 'HOW IT WORKS') {
          modifiedData.forEach((x) => {
            if (x.key === 'Usage') {
              if (v.Caption === 'HOW TO USE') {
                x.value = `${stripHtml(v.CaptionDesc).result}${x.value}`;
              } else {
                x.value = `${x.value}${stripHtml(v.CaptionDesc).result} `;
              }
            }
          });
        } else if (
          v.Caption === 'DRUG ALCOHOL INTERACTION' ||
          v.Caption === 'DRUG PREGNANCY INTERACTION' ||
          v.Caption === 'DRUG MACHINERY INTERACTION (DRIVING)' ||
          v.Caption === 'KIDNEY' ||
          v.Caption === 'LIVER'
        ) {
          modifiedData.forEach((x) => {
            if (x.key === 'Precautions') {
              x.value = `${x.value}
              ${getHeader(v.Caption)}: \n
              ${v.CaptionDesc.split('&amp;lt')
                .join('<')
                .split('&amp;gt;')
                .join('>')
                .replace(/(<([^>]+)>)/gi, '')
                .replace(/&amp;amp;/g, '&')
                .replace(/&amp;bull;/g, '-')
                .replace(/&amp;nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/\.t/g, '.')}; \n
                `;
            }
          });
        } else if (v.Caption === 'DRUGS WARNINGS') {
          modifiedData.forEach((x) => {
            if (x.key === 'Drug Warnings') {
              x.value = `${x.value}${v.CaptionDesc.split('&lt;')
                .join('<')
                .split('&gt;')
                .join('>')
                .replace(/(<([^>]+)>)/gi, '')
                .replace(/&amp;amp;/g, '&')
                .replace(/&amp;nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&bull;/g, '-')
                .replace(/&lt;/g, '')
                .replace(/&gt/g, '')
                .replace(/bull;/g, '-')
                .replace(/br \//g, '')
                .replace(/&#039;/g, '')}`;
            }
          });
        } else if (v.Caption === 'STORAGE') {
          modifiedData.forEach((x) => {
            if (x.key === 'Storage') {
              x.value = x.value.concat(stripHtml(v.CaptionDesc).result);
            }
          });
        }
      });
    }
    return modifiedData;
  };

  const getUsageDesc = (desc: string) => {
    return desc.split('.').map((eachDesc) => {
      return <p>{eachDesc}.</p>;
    });
  };

  const renderOverviewTabDesc = (overView: MedicineOverView) => {
    const data = getData(overView);
    if (typeof overView !== 'string') {
      return data.map((item, index) => (
        <div
          key={index}
          className={
            tabValue === index
              ? `${classes.tabContainer}`
              : `${classes.tabContainer} ${classes.visibilityHidden}`
          }
        >
          {item.value.split(';').map((description, idx) => {
            if (item.key === 'Usage') {
              return <div key={index}>{getUsageDesc(description)}</div>;
            } else {
              return <p key={idx}>{description}</p>;
            }
          })}
        </div>
      ));
    }
    return [];
  };
  const headerTags = ['Usage', 'Side Effects', 'Precautions'];

  const renderOverviewTabs = (overView: MedicineOverView) => {
    const data = getData(overView);
    return data.map((item, index) => (
      <Tab
        key={index}
        classes={{
          root: classes.tabRoot,
          selected: classes.tabSelected,
        }}
        label={
          <Typography component={headerTags.includes(item.key) ? 'h2' : 'h3'}>
            {item.key}
          </Typography>
        }
      />
    ));
  };

  const renderInfo = () => {
    return (
      medicineDetails.description &&
      medicineDetails.description
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;rn/g, '>')
        .replace(/&gt;r/g, '>')
        .replace(/&gt;/g, '>')
        .replace(/\.t/, '.')
    );
  };

  const similarProducts = { products: medicineDetails && medicineDetails.similar_products };

  const renderSimilarProducts = (responseView: any) => {
    return (
      medicineDetails &&
      medicineDetails.similar_products && (
        <div
          className={
            responseView === 'webDisplay'
              ? `${classes.sliderSection} ${classes.webResponseView}`
              : `${classes.sliderSection} ${classes.mobileResponseView}`
          }
        >
          <div className={classes.similarProducts}>{`SIMILAR TO ${medicineDetails.name}`}</div>
          <HotSellers data={similarProducts} />
        </div>
      )
    );
  };

  return (
    <div className={classes.root}>
      <Helmet>
        <link rel="alternate" href={`apollopatients://MedicineDetail?${params.sku}`} />
        {isSkuVersion && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>
      <MetaTagsComp {...metaTagProps} />

      {productSchemaJSON && <SchemaMarkup structuredJSON={productSchemaJSON} />}
      {drugSchemaJSON && <SchemaMarkup structuredJSON={drugSchemaJSON} />}
      <MedicinesCartContext.Consumer>
        {() => (
          <>
            <Header />
            <div className={classes.container}>
              <div className={classes.medicineDetailsPage}>
                <div className={classes.breadcrumbs}>
                  <a
                    onClick={() => {
                      sessionStorage.getItem('categoryClicked')
                        ? history.goBack()
                        : history.push(clientRoutes.medicines());
                    }}
                  >
                    <div className={classes.backArrow}>
                      <img
                        className={classes.blackArrow}
                        src={require('images/ic_back.svg')}
                        alt="Back Arrow"
                        title="Back Arrow"
                      />
                      <img
                        className={classes.whiteArrow}
                        src={require('images/ic_back_white.svg')}
                        alt="Back Arrow"
                        title="Back Arrow"
                      />
                    </div>
                  </a>
                  <div className={classes.detailsHeader}>Product Detail</div>
                  <div className={classes.cartContainer}>
                    <Link to={clientRoutes.medicinesCart()}>
                      <img src={require('images/ic_cart.svg')} alt="Cart" title={'cart'} />
                      <span className={classes.itemCount}>
                        {cartItems.length + diagnosticsCartItems.length || 0}
                      </span>
                    </Link>
                  </div>
                </div>
                <div className={classes.autoSearch}>
                  <div className={classes.mobileView}>
                    <MedicineAutoSearch />
                  </div>

                  <div className={classes.searchRight}>
                    <AphButton
                      className={classes.uploadPreBtn}
                      onClick={() => {
                        handleUploadPrescription();
                      }}
                      title={'Upload Prescription'}
                    >
                      Upload
                    </AphButton>
                    <div
                      className={classes.specialOffer}
                      onClick={() =>
                        (window.location.href = clientRoutes.searchByMedicine(
                          'deals-of-the-day',
                          'exclusive-offers' // this is hardcoded as per the request.
                        ))
                      }
                    >
                      <span>
                        <img
                          src={require('images/offer-icon.svg')}
                          alt="Offer Icon"
                          title="Offer Icon"
                        />
                      </span>
                      <span>Special offers</span>
                    </div>
                  </div>
                </div>
                {medicineDetails ? (
                  <>
                    <div className={classes.medicineDetailsGroup}>
                      <div className={classes.searchSection}>
                        <Scrollbars
                          className={classes.scrollResponsive}
                          autoHide={true}
                          autoHeight
                          autoHeightMax={'calc(100vh - 215px'}
                        >
                          <div className={classes.productInformation}>
                            {medicineDetails.image && medicineDetails.image.length > 0 ? (
                              <>
                                <div className={classes.webImages}>
                                  <MedicineImageGallery
                                    data={medicineDetails}
                                    setImageClick={setImageClick}
                                  />
                                </div>
                                <div className={`${classes.mobileImages}`}>
                                  <div className={classes.imageDisplay}>
                                    <img
                                      onClick={() => setImageClick(true)}
                                      src={`${process.env.PHARMACY_MED_IMAGES_BASE_URL}${medicineDetails.image[0]}`}
                                      alt={`${medicineDetails.name}, Pack of ${getPackOfMedicine(
                                        medicineDetails
                                      )}`}
                                      title={`${medicineDetails.name}, Pack of ${getPackOfMedicine(
                                        medicineDetails
                                      )}`}
                                    />
                                  </div>
                                  <div
                                    className={classes.imageDesc}
                                  >{`${medicineDetails.image.length} PHOTOS`}</div>
                                </div>
                              </>
                            ) : (
                              <div className={classes.noImageWrapper}>
                                <img
                                  src={require('images/medicine.svg')}
                                  alt={`${medicineDetails.name}, Pack of ${getPackOfMedicine(
                                    medicineDetails
                                  )}`}
                                  title={`${medicineDetails.name}, Pack of ${getPackOfMedicine(
                                    medicineDetails
                                  )}`}
                                />
                              </div>
                            )}
                            {imageClick && (
                              <div className={classes.ppWrapper}>
                                <div className={classes.productPopup}>
                                  <div className={classes.ppHeader}>
                                    <a
                                      href="javascript:void(0);"
                                      className={classes.closePopup}
                                      onClick={() => setImageClick(false)}
                                    >
                                      <img src={require('images/ic_cross.svg')} alt="close" />
                                    </a>
                                    <h1>{medicineDetails.name}</h1>
                                  </div>
                                  <div className={classes.ppContent}>
                                    {medicineDetails.image && medicineDetails.image.length > 0 ? (
                                      <MedicineImageGallery
                                        data={medicineDetails}
                                        setImageClick={setImageClick}
                                      />
                                    ) : (
                                      <div className={classes.noImageWrapper}>
                                        <img
                                          src={require('images/medicine.svg')}
                                          alt={`${
                                            medicineDetails.name
                                          }, Pack of ${getPackOfMedicine(medicineDetails)}`}
                                          title={`${
                                            medicineDetails.name
                                          }, Pack of ${getPackOfMedicine(medicineDetails)}`}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className={classes.productDetails}>
                              <div className={classes.productBasicInfo}>
                                <h1>{medicineDetails.name}</h1>
                                <div className={classes.textInfo}>
                                  <label>Manufacturer</label>
                                  {medicineDetails.manufacturer}
                                </div>
                                {medicinePharmacyDetails && medicinePharmacyDetails.length > 0 && (
                                  <div className={classes.textInfo}>
                                    <Typography component="h2">Composition</Typography>
                                    <Typography component="h3">{renderComposition()}</Typography>
                                  </div>
                                )}
                                <div className={classes.textInfo}>
                                  <Typography component="h3" className={classes.packOfText}>
                                    Pack Of
                                  </Typography>
                                  <Typography component="h3">
                                    {getPackOfMedicine(medicineDetails)}
                                  </Typography>
                                </div>
                              </div>
                              {Number(medicineDetails.is_prescription_required) !== 0 && (
                                <div className={classes.prescriptionBox}>
                                  <span>This medicine requires doctor’s prescription</span>
                                  <span className={classes.preImg}>
                                    <img src={require('images/ic_tablets.svg')} alt="" />
                                  </span>
                                </div>
                              )}
                              {medicinePharmacyDetails &&
                              medicinePharmacyDetails.length > 0 &&
                              medicinePharmacyDetails[0].Overview &&
                              medicinePharmacyDetails[0].Overview.length > 0 ? (
                                <div className={classes.tabWrapper}>
                                  <Tabs
                                    value={tabValue}
                                    variant="scrollable"
                                    scrollButtons="on"
                                    classes={{
                                      root: classes.tabsRoot,
                                      indicator: classes.tabsIndicator,
                                    }}
                                    onChange={(e, newValue) => {
                                      setTabValue(newValue);
                                      const overviewData = getData(
                                        medicinePharmacyDetails[0].Overview
                                      );
                                      const tabName = overviewData[newValue].key;
                                      pharmacyPdpOverviewTracking(tabName);
                                    }}
                                  >
                                    {renderOverviewTabs(medicinePharmacyDetails[0].Overview)}
                                  </Tabs>
                                  {renderOverviewTabDesc(medicinePharmacyDetails[0].Overview)}
                                </div>
                              ) : medicineDetails.description ? (
                                <div className={classes.productDetailed}>
                                  <div className={classes.productInfo}>Product Information</div>
                                  <div className={classes.productDescription}>
                                    {medicineDetails.description && (
                                      <div dangerouslySetInnerHTML={{ __html: renderInfo() }}></div>
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </Scrollbars>
                      </div>
                      {renderSimilarProducts('mobileDisplay')}
                      <MedicineInformation data={medicineDetails} />
                      <div id="myImage" className={classes.myImageClass} />
                    </div>
                    {renderSimilarProducts('webDisplay')}
                  </>
                ) : (
                  <div className={classes.progressLoader}>
                    <CircularProgress size={30} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </MedicinesCartContext.Consumer>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
      <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
        <AphDialogTitle>Upload Prescription(s)</AphDialogTitle>
        <UploadPrescription
          closeDialog={() => {
            setIsUploadPreDialogOpen(false);
          }}
          isNonCartFlow={true}
          setIsEPrescriptionOpen={setIsEPrescriptionOpen}
        />
      </AphDialog>
      <AphDialog open={isEPrescriptionOpen} maxWidth="sm">
        <AphDialogClose onClick={() => setIsEPrescriptionOpen(false)} title={'Close'} />
        <AphDialogTitle className={classes.ePrescriptionTitle}>E Prescription</AphDialogTitle>
        <UploadEPrescriptionCard
          setIsEPrescriptionOpen={setIsEPrescriptionOpen}
          isNonCartFlow={true}
        />
      </AphDialog>

      <div className={classes.footerLinks}>
        <BottomLinks />
        {!onePrimaryUser && <ManageProfile />}
      </div>
      <NavigationBottom />
    </div>
  );
};

export default MedicineDetails;
