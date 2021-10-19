import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { MedicineListingHeader } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingHeader';
import {
  SpecialOffersWidgetsApiResponse,
  getSpecialOffersPageWidgets,
  SpecialOffersCouponsApiResponse,
  getSpecialOffersPageCoupons,
  SpecialOffersCategoryApiResponse,
  getSpecialOffersPageCategory,
  SpecialOffersBrandsApiResponse,
  getSpecialOffersPageBrands,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { BannerSection } from '@aph/mobile-patients/src/components/SpecialOffers/Components/BannerSection';
import { CouponsSection } from '@aph/mobile-patients/src/components/SpecialOffers/Components/CouponsSection';
import { DealsByCategorySection } from '@aph/mobile-patients/src/components/SpecialOffers/Components/DealsByCategorySection';
import { DealsByBrandsSection } from '@aph/mobile-patients/src/components/SpecialOffers/Components/DealsByBrandsSection';
import { HotSellersSection } from '@aph/mobile-patients/src/components/SpecialOffers/Components/HotSellersSection';

export interface SpecialOffersScreenProps
  extends NavigationScreenProps<{
    movedFrom?: 'home';
  }> {}

export const SpecialOffersScreen: React.FC<SpecialOffersScreenProps> = (props) => {
  const movedFrom = props.navigation.getParam('movedFrom');
  const { medicineHomeBannerData, medicineHotSellersData } = useShoppingCart();
  const [loading, setLoading] = useState<boolean>(false);
  const { showAphAlert } = useUIElements();
  const [widgetOrderData, setWidgetOrderData] = useState<SpecialOffersWidgetsApiResponse>();
  const [categoryData, setCategoryData] = useState<SpecialOffersCategoryApiResponse>();
  const [offersData, setOffersData] = useState<SpecialOffersCouponsApiResponse>();
  const [brandsData, setBrandsData] = useState<SpecialOffersBrandsApiResponse>();
  const [widgetArray, setWidgetArray] = useState([
    'Carousel Banner',
    'Offers',
    'Top Deals on Brands',
    'Offers for you',
    'Deals by Category',
  ]);

  useEffect(() => {
    fetchWidgetOrderForSpecialOffersScreen();
    fetchCouponsData();
    fetchCategoryData();
    fetchBrandsData();
  }, []);

  useEffect(() => {
    if (widgetOrderData) {
      const widget = [...widgetOrderData];
      const newArr = widget.sort((a, b) => a.widgetRank.localeCompare(b.widgetRank));
      const widgetArrayOrder = newArr.map((ele) => {
        if (+ele.widgetRank > 0) {
          return ele.widgetTitle;
        }
      });
      setWidgetArray(widgetArrayOrder);
    }
  }, [widgetOrderData]);

  const fetchCouponsData = async () => {
    try {
      setLoading(true);
      const offersResponse = await getSpecialOffersPageCoupons();
      setOffersData(offersResponse.data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: "We're sorry! Unable to fetch products right now, please try later.",
      });
    }
  };

  const fetchCategoryData = async () => {
    try {
      const categoryResponse = await getSpecialOffersPageCategory();
      setCategoryData(categoryResponse.data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: "We're sorry! Unable to fetch products right now, please try later.",
      });
    }
  };

  const fetchBrandsData = async () => {
    try {
      setLoading(true);
      const brandResponse = await getSpecialOffersPageBrands();
      setBrandsData(brandResponse.data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: "We're sorry! Unable to fetch products right now, please try later.",
      });
    }
  };

  const fetchWidgetOrderForSpecialOffersScreen = async () => {
    try {
      setLoading(true);
      const widgetOrderResponse = await getSpecialOffersPageWidgets();
      if (widgetOrderResponse && widgetOrderResponse.data) {
        setWidgetOrderData(widgetOrderResponse.data);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    return <MedicineListingHeader navigation={props.navigation} movedFrom={movedFrom} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView>
        {widgetArray.map((widget) => {
          switch (widget) {
            case 'Carousel Banner':
              {
                return medicineHomeBannerData ? (
                  <BannerSection navigation={props.navigation} />
                ) : null;
              }
              break;
            case 'Offers':
              {
                return offersData ? <CouponsSection offersData={offersData.response} /> : null;
              }
              break;
            case 'Deals by Category':
              {
                return categoryData ? (
                  <DealsByCategorySection
                    categoryData={categoryData}
                    navigation={props.navigation}
                  />
                ) : null;
              }
              break;
            case 'Top Deals on Brands':
              {
                return brandsData ? (
                  <DealsByBrandsSection brandsData={brandsData} navigation={props.navigation} />
                ) : null;
              }
              break;
            case 'Offers for you':
              {
                return medicineHotSellersData ? (
                  <HotSellersSection navigation={props.navigation} />
                ) : null;
              }
              break;
            default:
              null;
          }
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});