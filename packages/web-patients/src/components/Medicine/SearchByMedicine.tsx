import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { AphButton, AphDialog, AphDialogTitle, AphDialogClose } from '@aph/web-ui-components';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { clientRoutes } from 'helpers/clientRoutes';
import Scrollbars from 'react-custom-scrollbars';
import { MedicineFilter } from 'components/Medicine/MedicineFilter';
import { MedicinesCartContext } from 'components/MedicinesCartProvider';
import { MedicineProduct } from './../../helpers/MedicineApiCalls';
import { useParams } from 'hooks/routerHooks';
import axios from 'axios';
import _lowerCase from 'lodash/lowerCase';
import _replace from 'lodash/replace';
import { MedicineCard } from 'components/Medicine/MedicineCard';
import { NavigationBottom } from 'components/NavigationBottom';
import { ManageProfile } from 'components/ManageProfile';
import { hasOnePrimaryUser } from '../../helpers/onePrimaryUser';
import { BottomLinks } from 'components/BottomLinks';
import { MedicineAutoSearch } from 'components/Medicine/MedicineAutoSearch';
import { uploadPrescriptionTracking } from '../../webEngageTracking';
import { UploadPrescription } from 'components/Prescriptions/UploadPrescription';
import { UploadEPrescriptionCard } from 'components/Prescriptions/UploadEPrescriptionCard';
import { useCurrentPatient } from 'hooks/authHooks';
import moment from 'moment';

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
      [theme.breakpoints.up('sm')]: {
        backgroundColor: '#f7f8f5',
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
        zIndex: 991,
        borderBottom: 'none',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: 'space-between',
      },
    },
    brandListingSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    searchSection: {
      width: 'calc(100% - 328px)',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingTop: 50,
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
        height: 'calc(100vh - 185px) !important',
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
      marginTop: -48,
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
    noData: {
      marginTop: 10,
      fontSize: 14,
      color: '#01475b',
      lineHeight: '18px',
      paddingBottom: 16,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        marginTop: 25,
        paddingLeft: 10,
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
  };
});

const apiDetails = {
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

export const SearchByMedicine: React.FC = (props) => {
  const classes = useStyles({});
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

  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = React.useState<boolean>(false);
  const [isEPrescriptionOpen, setIsEPrescriptionOpen] = React.useState<boolean>(false);
  const [heading, setHeading] = React.useState<string>('');

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

  useEffect(() => {
    if (!medicineList && paramSearchType !== 'search-medicines' && Number(paramSearchText) > 0) {
      setIsLoading(true);
      axios
        .post(
          apiDetails.url || '',
          {
            category_id: paramSearchText,
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
          }
        })
        .catch((e) => {
          setIsLoading(false);
          setHeading('');
        });
    } else if (!medicineList && paramSearchText.length > 0) {
      onSearchMedicine();
    } else {
      setMedicineListFiltered(medicineList);
    }
  }, [medicineList]);

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

  const patient = useCurrentPatient();
  const age = patient && patient.dateOfBirth ? moment().diff(patient.dateOfBirth, 'years') : null;

  const handleUploadPrescription = () => {
    uploadPrescriptionTracking({ ...patient, age });
    setIsUploadPreDialogOpen(true);
  };

  return (
    <div className={classes.root}>
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
                  (window.location.href = clientRoutes.searchByMedicine('deals-of-the-day', '1195'))
                }
              >
                <span>
                  <img src={require('images/offer-icon.svg')} alt="" />
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
