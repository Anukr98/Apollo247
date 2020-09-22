import { AphButton, AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import axios from 'axios';
import _lowerCase from 'lodash/lowerCase';
import { MedicineCard } from 'components/Medicine/MedicineCard';
import { NavigationBottom } from 'components/NavigationBottom';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from '../../helpers/onePrimaryUser';
import { BottomLinks } from 'components/BottomLinks';
import { MedicineAutoSearch } from 'components/Medicine/MedicineAutoSearch';
import { MedicineFilter } from 'components/Medicine/MedicineFilter';
import { MedicinesCartContext, useShoppingCart } from 'components/MedicinesCartProvider';
import { UploadEPrescriptionCard } from 'components/Prescriptions/UploadEPrescriptionCard';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
import { GET_RECOMMENDED_PRODUCTS_LIST } from 'graphql/profiles';
import { getRecommendedProductsList_getRecommendedProductsList_recommendedProducts as recommendedProductsType } from 'graphql/types/getRecommendedProductsList';
import { gtmTracking } from 'gtmTracking';
import { clientRoutes } from 'helpers/clientRoutes';
import { getImageUrl, deepLinkUtil } from 'helpers/commonHelpers';
import { useCurrentPatient } from 'hooks/authHooks';
import { useParams } from 'hooks/routerHooks';
import _replace from 'lodash/replace';
import { MetaTagsComp } from 'MetaTagsComp';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo-hooks';
import Scrollbars from 'react-custom-scrollbars';
import { Link } from 'react-router-dom';
import {
  pharmacyCategoryClickTracking,
  pharmacySearchEnterTracking,
  uploadPrescriptionTracking,
} from 'webEngageTracking';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    searchByBrandPage: {
      position: 'relative',
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 999,
        bottom: 0,
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
        top: 0,
        width: '100%',
        zIndex: 999,
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        padding: '20px 20px 10px',
        justifyContent: 'space-between',
      },
    },
    brandListingSection: {
      display: 'flex',
      padding: '20px 3px 20px 20px',

      [theme.breakpoints.down('xs')]: {
        height: '100%',
        padding: 0,
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingTop: 110,
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
      '& img': {
        verticalAlign: 'bottom',
      },
      [theme.breakpoints.down('xs')]: {
        marginRight: 10,
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    customScroll: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 10,
    },
    filterBtn: {
      boxShadow: 'none',
      padding: 0,
      minWidth: 'auto',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    scrollBar: {
      height: 'calc(100vh - 220px) !important',
      zIndex: 1,
      [theme.breakpoints.down(992)]: {
        height: 'calc(100vh - 245px) !important',
      },
      [theme.breakpoints.down('xs')]: {
        height: 'calc(100vh - 135px) !important',
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
          top: 54,
          zIndex: 999,
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
    noData: {
      marginTop: 10,
      fontSize: 14,
      color: '#01475b',
      lineHeight: '18px',
      paddingBottom: 16,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        marginTop: 0,
        paddingLeft: 0,
      },
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
    cartContainer: {
      '& a': {
        position: 'relative',
        display: 'block',
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
  };
});

const apiDetails = {
  skuUrl: process.env.PHARMACY_MED_PROD_SKU_URL,
  url: process.env.PHARMACY_MED_CATEGORY_LIST,
  authToken: process.env.PHARMACY_MED_AUTH_TOKEN,
  imageUrl: process.env.PHARMACY_MED_IMAGES_BASE_URL,
};
const apiDetailsText = {
  url: process.env.PHARMACY_MED_SEARCH_URL,
};
type Params = { searchMedicineType: string; searchText: string };

type PriceFilter = { fromPrice: string; toPrice: string };
type DiscountFilter = { fromDiscount: string; toDiscount: string };

const SearchByMedicine: React.FC = (props) => {
  const classes = useStyles({});
  const patient = useCurrentPatient();
  const recommendedProductsMutation = useMutation(GET_RECOMMENDED_PRODUCTS_LIST);
  const [priceFilter, setPriceFilter] = useState<PriceFilter | null>(null);
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter | null>(null);
  const [filterData, setFilterData] = useState([]);
  const [medicineList, setMedicineList] = useState<MedicineProduct[] | null>(null);
  const [medicineListFiltered, setMedicineListFiltered] = useState<MedicineProduct[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('');
  const [showResponsiveFilter, setShowResponsiveFilter] = useState<boolean>(false);
  const [disableFilters, setDisableFilters] = useState<boolean>(true);
  const [isReloaded, setIsReloaded] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');

  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [heading, setHeading] = React.useState<string>('');
  const { cartItems } = useShoppingCart();
  const { diagnosticsCartItems } = useDiagnosticsCart();

  useEffect(() => {
    deepLinkUtil(`MedicineSearch?${categoryId},${params.searchText}`);
  }, [categoryId]);

  const getTitle = () => {
    let title = params.searchMedicineType;
    if (params.searchMedicineType.includes('-')) {
      title = _replace(title, '-', ' ');
    }
    if (params.searchMedicineType.includes('_')) {
      title = _replace(title, '_', ' & ');
    }
    return title;
  };

  const params = useParams<Params>();
  const paramSearchText = params.searchText;
  const paramSearchType = params.searchMedicineType;

  const onSearchMedicine = async () => {
    setIsLoading(true);
    await axios
      .post(
        apiDetailsText.url,
        {
          params: paramSearchText,
        },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then(({ data }) => {
        pharmacySearchEnterTracking(data.products && data.products.length);
        setMedicineList(data.products);
        setMedicineListFiltered(data.products);
        setHeading(data.search_heading || '');
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setIsLoading(false);
        setHeading('');
      });
  };

  const getCategoryProducts = () => {
    axios
      .post(
        apiDetails.skuUrl || '',
        { params: paramSearchText, level: 'category' },
        {
          headers: {
            Authorization: apiDetails.authToken,
          },
        }
      )
      .then((res) => {
        setCategoryId(res.data.category_id || paramSearchText);
        axios
          .post(
            apiDetails.url || '',
            {
              category_id: res.data.category_id || paramSearchText,
              page_id: 1,
            },
            {
              headers: {
                Authorization: apiDetails.authToken,
                Accept: '*/*',
              },
            }
          )
          .then(({ data }) => {
            if (data && data.products) {
              setMedicineList(data.products);
              setHeading('');
              setIsLoading(false);
              pharmacyCategoryClickTracking({
                source: 'Home',
                categoryName: paramSearchText,
                categoryId: res.data.category_id,
                sectionName: paramSearchType,
              });
              /** gtm code start */
              let gtmItems: any[] = [];
              if (data.products.length) {
                data.products.map((prod: MedicineProduct, key: number) => {
                  const { name, sku, price, type_id, special_price } = prod;
                  gtmItems.push({
                    item_name: name,
                    item_id: sku,
                    price: special_price || price,
                    item_category: 'Pharmacy',
                    item_category_2: type_id
                      ? type_id.toLowerCase() === 'pharma'
                        ? 'Drugs'
                        : 'FMCG'
                      : null,
                    // 'item_category_4': '',             // park for future use
                    item_variant: 'Default',
                    index: key + 1,
                    quantity: 1,
                  });
                });
              }
              gtmTracking({
                category: 'Pharmacy',
                action: 'List Views',
                label: '',
                value: null,
                ecommObj: {
                  event: 'view_item_list',
                  ecommerce: { items: gtmItems },
                },
              });
              /** gtm code end */
            }
          })
          .catch((e) => {
            setHeading('');
          });
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getUrlKey = (name: string) => {
    const formattedName = name
      ? name.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '-')
      : '';
    return formattedName.replace(/\s+/g, '-');
  };

  const getRecommendedProducts = () => {
    if (patient && patient.uhid) {
      recommendedProductsMutation({
        variables: {
          patientUhid: patient.uhid,
        },
      })
        .then((res: any) => {
          if (
            res &&
            res.data &&
            res.data.getRecommendedProductsList &&
            res.data.getRecommendedProductsList.recommendedProducts
          ) {
            const dataList = res.data.getRecommendedProductsList.recommendedProducts;
            setMedicineList(
              dataList.map((data: recommendedProductsType) => {
                const {
                  productSku,
                  productName,
                  productImage,
                  productPrice,
                  productSpecialPrice,
                  isPrescriptionNeeded,
                  categoryName,
                  status,
                  mou,
                  imageBaseUrl,
                  id,
                  is_in_stock,
                  small_image,
                  thumbnail,
                  type_id,
                  quantity,
                  isShippable,
                  MaxOrderQty,
                  urlKey,
                } = data;
                return {
                  id,
                  image: productImage ? getImageUrl(productImage) : null,
                  is_in_stock,
                  is_prescription_required: isPrescriptionNeeded,
                  name: productName,
                  price: productPrice,
                  special_price: productSpecialPrice,
                  sku: productSku,
                  small_image,
                  status,
                  categoryName,
                  thumbnail,
                  type_id,
                  quantity,
                  mou,
                  isShippable,
                  MaxOrderQty,
                  imageBaseUrl,
                  url_key: urlKey && urlKey !== '' ? urlKey : getUrlKey(productName),
                };
              })
            );
          } else {
            setMedicineList([]);
          }
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (!medicineList && paramSearchType !== 'search-medicines') {
      setIsLoading(true);
      if (paramSearchText === 'recommended-products') {
        getRecommendedProducts();
      } else {
        getCategoryProducts();
      }
    } else if (!medicineList && paramSearchText.length > 0) {
      onSearchMedicine();
    } else {
      setMedicineListFiltered(medicineList);
    }
  }, [medicineList, patient]);

  const getSpecialPrice = (special_price?: string | number) =>
    special_price
      ? typeof special_price == 'string'
        ? parseInt(special_price)
        : special_price
      : null;

  const onePrimaryUser = hasOnePrimaryUser();

  useEffect(() => {
    let priceFilterArray: MedicineProduct[] | null = null;
    if (
      priceFilter &&
      priceFilter.fromPrice &&
      priceFilter.toPrice &&
      filterData &&
      filterData[0] === '' &&
      discountFilter &&
      discountFilter.fromDiscount === '0' &&
      discountFilter.toDiscount === '100' &&
      sortBy === ''
    ) {
      setMedicineListFiltered(medicineList);
      return;
    } else if (priceFilter && (priceFilter.fromPrice || priceFilter.toPrice)) {
      if (priceFilter.fromPrice && priceFilter.toPrice) {
        priceFilterArray =
          medicineList &&
          medicineList.filter((value) => {
            if (Number(priceFilter.fromPrice) <= value.price) {
              if (value.price <= Number(priceFilter.toPrice)) {
                return value;
              }
            }
          });
      } else if (priceFilter.fromPrice) {
        priceFilterArray =
          medicineList &&
          medicineList.filter((value) => {
            if (Number(priceFilter.fromPrice) <= value.price) {
              return value;
            }
          });
      } else if (priceFilter.toPrice) {
        priceFilterArray =
          medicineList &&
          medicineList.filter((value) => {
            if (value.price <= Number(priceFilter.toPrice)) {
              return value;
            }
          });
      }
    } else if (priceFilter && !priceFilter.fromPrice && !priceFilter.toPrice) {
      priceFilterArray = medicineList && medicineList.length > 0 ? medicineList : [];
    }

    //Sort By
    if (sortBy.length > 0) {
      const filteredArray = !priceFilterArray ? medicineList || [] : priceFilterArray;
      if (sortBy === 'Price-L-H') {
        priceFilterArray = filteredArray.sort((med1: MedicineProduct, med2: MedicineProduct) => {
          return (
            getSpecialPrice(med1.special_price || med1.price)! -
            getSpecialPrice(med2.special_price || med2.price)!
          );
        });
      } else if (sortBy === 'Price-H-L') {
        priceFilterArray = filteredArray.sort((med1: MedicineProduct, med2: MedicineProduct) => {
          return (
            getSpecialPrice(med2.special_price || med2.price)! -
            getSpecialPrice(med1.special_price || med1.price)!
          );
        });
      } else if (sortBy === 'A-Z') {
        priceFilterArray = filteredArray.sort((med1: MedicineProduct, med2: MedicineProduct) =>
          med1.name < med2.name ? -1 : med1.name > med2.name ? 1 : 0
        );
      } else if (sortBy === 'Z-A') {
        priceFilterArray = filteredArray.sort((med1: MedicineProduct, med2: MedicineProduct) =>
          med1.name > med2.name ? -1 : med1.name < med2.name ? 1 : 0
        );
      }
      setIsReloaded(!isReloaded);
    }
    if (
      discountFilter &&
      !(discountFilter.fromDiscount == '0' && discountFilter.toDiscount == '100') &&
      parseFloat(discountFilter.toDiscount) > 0
    ) {
      const filteredArray = !priceFilterArray ? medicineList || [] : priceFilterArray;
      priceFilterArray = filteredArray.filter((item) => {
        if (item.special_price) {
          const specialPrice = getSpecialPrice(item.special_price);
          const discountPercentage = ((item.price - specialPrice!) / item.price) * 100;
          return discountPercentage >= (discountFilter.fromDiscount || 0) &&
            discountPercentage <= parseFloat(discountFilter.toDiscount)
            ? true
            : false;
        } else if (discountFilter.fromDiscount == '0') {
          return filteredArray;
        }
      });
    }

    if (filterData && filterData.length > 0 && filterData[0] !== '') {
      const categoryFilterArray: MedicineProduct[] = [];
      const filteredArray = !priceFilterArray ? medicineList || [] : priceFilterArray;
      filterData &&
        filterData.map((filter: string) => {
          filteredArray.length > 0 &&
            filteredArray.map((value) => {
              if (value.category_id === filter) {
                categoryFilterArray.push(value);
              }
            });
        });
      priceFilterArray = categoryFilterArray;
    }
    setMedicineListFiltered(priceFilterArray);
  }, [priceFilter, filterData, discountFilter, sortBy]);
  const age = patient && patient.dateOfBirth ? moment().diff(patient.dateOfBirth, 'years') : null;
  const handleUploadPrescription = () => {
    uploadPrescriptionTracking({ ...patient, age });
    setIsUploadPreDialogOpen(true);
  };

  const getMetaTitle =
    paramSearchType === 'shop-by-category'
      ? `Buy ${paramSearchText} - Online Pharmacy Store - Apollo 247`
      : paramSearchType === 'shop-by-brand'
      ? `Buy ${paramSearchText} Medicines Online - Apollo 247`
      : `${paramSearchText} Online - Buy Special Medical Kits Online - Apollo 247`;

  const getMetaDescription =
    paramSearchType === 'shop-by-category'
      ? `Buy ${paramSearchText} online at Apollo 247 - India's online pharmacy store. Get ${paramSearchText} medicines in just a few clicks. Buy ${paramSearchText} at best prices in India.`
      : paramSearchType === 'shop-by-brand'
      ? `Buy medicines from ${paramSearchText} online at Apollo 247 - India's online pharmacy store. Get all the medicines from ${paramSearchText} in a single place and buy them in just a few clicks.`
      : `${paramSearchText} by Apollo 247. Get ${paramSearchText} to buy pre grouped essential medicines online. Buy medicines online at Apollo 247 in just a few clicks.`;

  const metaTagProps = {
    title: getMetaTitle,
    description: getMetaDescription,
    canonicalLink: window && window.location && window.location && window.location.href,
    deepLink: window.location.href,
  };

  return (
    <div className={classes.root}>
      {paramSearchType !== 'search-medicines' && <MetaTagsComp {...metaTagProps} />}
      <Header />
      <div className={classes.container}>
        <div className={classes.searchByBrandPage}>
          <div className={classes.breadcrumbs}>
            <a onClick={() => window.history.back()}>
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
                <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
              </div>
            </a>
            <div>
              {getTitle()} ({medicineListFiltered && medicineListFiltered.length})
            </div>
            <AphButton
              className={classes.filterBtn}
              onClick={() => {
                setShowResponsiveFilter(true);
              }}
            >
              <img src={require('images/ic_filter.svg')} alt="" />
            </AphButton>
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
            <MedicineAutoSearch />
            <div className={classes.searchRight}>
              <AphButton
                className={classes.uploadPreBtn}
                onClick={() => handleUploadPrescription()}
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
                  <img src={require('images/offer-icon.svg')} alt="Offer Icon" />
                </span>
                <span>Special offers</span>
              </div>
            </div>
          </div>
          <div className={classes.brandListingSection}>
            <MedicineFilter
              disableFilters={disableFilters}
              manageFilter={(disableFilters) => {
                setDisableFilters(disableFilters);
              }}
              showResponsiveFilter={showResponsiveFilter}
              setShowResponsiveFilter={(showResponsiveFilter: boolean) =>
                setShowResponsiveFilter(showResponsiveFilter)
              }
              setMedicineList={setMedicineList}
              setPriceFilter={setPriceFilter}
              setDiscountFilter={setDiscountFilter}
              setFilterData={setFilterData}
              setSortBy={setSortBy}
              categoryName={paramSearchText}
              categoryId={categoryId}
            />
            <div className={classes.searchSection}>
              <Scrollbars className={classes.scrollBar} autoHide={true}>
                <div className={classes.customScroll}>
                  <MedicinesCartContext.Consumer>
                    {() => (
                      <>
                        <div className={classes.noData}>{heading}</div>
                        <MedicineCard medicineList={medicineListFiltered} isLoading={isLoading} />
                      </>
                    )}
                  </MedicinesCartContext.Consumer>
                </div>
              </Scrollbars>
            </div>
          </div>
        </div>
      </div>
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
      {!onePrimaryUser && <ManageProfile />}
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      <NavigationBottom />
    </div>
  );
};

export default SearchByMedicine;
