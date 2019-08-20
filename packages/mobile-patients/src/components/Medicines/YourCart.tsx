import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ArrowRight, CouponIcon, MedicineIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  getProductsBasedOnCategory,
  MedicineProductsResponse,
  quoteId,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import Axios from 'axios';

const styles = StyleSheet.create({
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  labelTextStyle: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  yellowTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: theme.colors.APP_YELLOW,
    padding: 16,
  },
  blueTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  medicineCostStyle: {
    ...theme.fonts.IBMPlexSansBold(11),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
});

export interface YourCartProps extends NavigationScreenProps {}

export const YourCart: React.FC<YourCartProps> = (props) => {
  const tabs = [{ title: 'Home Delivery' }, { title: 'Store Pick Up' }];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedHomeDelivery, setselectedHomeDelivery] = useState<number>(0);

  const [medicineList, setMedicineList] = useState<MedicineProductsResponse['products']>([]);
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    Axios.get(
      `http://api.apollopharmacy.in/apollo_api.php?type=guest_quote_info&quote_id=${quoteId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms',
        },
      }
    )
      .then((res) => {
        console.log(res, 'YourCartProps dt');
      })
      .catch((err) => {
        console.log(err, 'YourCartProps err');
      });
  }, []);

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'YOUR CART'}
        rightComponent={
          <View>
            <TouchableOpacity onPress={() => {}}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(13),
                  color: theme.colors.APP_YELLOW,
                }}
              >
                ADD ITEMS
              </Text>
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };

  const renderItemsInCart = () => {
    return (
      <View>
        {renderLabel('ITEMS IN YOUR CART', '02')}
        {medicineList.map((medicine, index, array) => {
          const medicineCardContainerStyle = [
            { marginBottom: 8, marginHorizontal: 20 },
            index == 0 ? { marginTop: 20 } : {},
            index == array.length - 1 ? { marginBottom: 20 } : {},
          ];
          return (
            <MedicineCard
              personName={
                currentPatient && currentPatient.firstName ? currentPatient.firstName : ''
              }
              containerStyle={medicineCardContainerStyle}
              key={medicine.id}
              onPress={(_, sku) => {
                props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
                  sku: sku,
                  title: medicine.name,
                });
              }}
              id={medicine.id}
              sku={medicine.sku}
              medicineName={medicine.name}
              price={medicine.price}
              //   unit={(medicineCardStatus[medicine.id] && medicineCardStatus[medicine.id].unit) || 1}
              isAddedToCart={true}
              onPressAdd={(id) => {
                // setMedicineCardStatus({
                //   ...medicineCardStatus,
                //   [id]: { isAddedToCart: true, isCardExpanded: true },
                // });
                // Call Add to cart API
              }}
              onPressRemove={(id) => {
                // setMedicineCardStatus({
                //   ...medicineCardStatus,
                //   [id]: { isAddedToCart: false, isCardExpanded: false },
                // });
                // Call Remove from cart API
              }}
              onChangeUnit={(id, unit) => {
                // setMedicineCardStatus({
                //   ...medicineCardStatus,
                //   [id]: { ...medicineCardStatus[id], unit },
                // });
                // Update no. of units to cart for this item via API
              }}
              unit={1}
              isCardExpanded={
                true
                // medicineCardStatus[medicine.id] && medicineCardStatus[medicine.id].isCardExpanded
              }
              isInStock={!!medicine.is_in_stock}
              isPrescriptionRequired={!!!medicine.is_prescription_required}
              //   subscriptionStatus={
              //     (medicineCardStatus[medicine.id] &&
              //       medicineCardStatus[medicine.id].subscriptionStatus) ||
              //     'unsubscribed'
              //   }
              //   onChangeSubscription={(id, status) => {
              //     setMedicineCardStatus({
              //       ...medicineCardStatus,
              //       [id]: { ...medicineCardStatus[id], subscriptionStatus: status },
              //     });
              //   }}
              onEditPress={() => {}}
              onAddSubscriptionPress={() => {}}
            />
          );
        })}
      </View>
    );
  };

  const renderUploadPrescription = () => {
    return (
      <View>
        {renderLabel('UPLOAD PRESCRIPTION')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 15,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: theme.colors.SKY_BLUE,
              padding: 16,
            }}
          >{`Some of your medicines require prescription to make a purchase.\nPlease upload the necessary prescriptions.`}</Text>
          <Text
            style={{
              ...styles.yellowTextStyle,
              paddingTop: 0,
              textAlign: 'right',
            }}
          >
            UPLOAD
          </Text>
        </View>
      </View>
    );
  };

  const homeDeliveryAddresses = [
    '27/A, Kalpataru Enclave Jubilee Hills Hyderabad, Telangana — 500033',
    '27/A, Kalpataru Enclave Jubilee Hills Hyderabad, Telangana — 500033',
  ];

  const renderDelivery = () => {
    return (
      <View>
        {renderLabel('WHERE SHOULD WE DELIVER?')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          <TabsComponent
            style={{
              //   ...theme.viewStyles.cardViewStyle,
              borderRadius: 0,
              borderBottomWidth: 0.5,
              borderBottomColor: 'rgba(2, 71, 91, 0.2)',
            }}
            data={tabs}
            onChange={(selectedTab: string) => {
              setselectedTab(selectedTab);
            }}
            selectedTab={selectedTab}
          />
          {selectedTab === tabs[0].title ? (
            <View
              style={{
                marginTop: 8,
                marginHorizontal: 16,
              }}
            >
              {homeDeliveryAddresses.map((item: string, index: number) => (
                <RadioSelectionItem
                  title={item}
                  isSelected={selectedHomeDelivery === index}
                  onPress={() => setselectedHomeDelivery(index)}
                  containerStyle={{
                    marginTop: 16,
                  }}
                  hideSeparator={index + 1 === homeDeliveryAddresses.length}
                />
              ))}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    ...styles.yellowTextStyle,
                  }}
                >
                  ADD NEW ADDRESS
                </Text>
                <Text
                  style={{
                    ...styles.yellowTextStyle,
                  }}
                >
                  VIEW ALL
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const renderTotalCharges = () => {
    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 4,
            flexDirection: 'row',
            height: 56,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
        >
          <CouponIcon />
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.SHERPA_BLUE,
              lineHeight: 24,
              paddingLeft: 16,
            }}
          >
            Apply Coupon
          </Text>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
            }}
          >
            <ArrowRight />
          </View>
        </View>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 4,
            marginBottom: 12,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.blueTextStyle}>Subtotal</Text>
            <Text style={styles.blueTextStyle}>Rs. 300</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.blueTextStyle}>Delivery Charges</Text>
            <Text style={styles.blueTextStyle}>+ Rs. 60</Text>
          </View>
          <View style={[styles.separatorStyle, { marginTop: 16, marginBottom: 7 }]} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.blueTextStyle}>To Pay </Text>
            <Text style={[styles.blueTextStyle, { ...theme.fonts.IBMPlexSansBold }]}>Rs. 360 </Text>
          </View>
        </View>
      </View>
    );
  };
  const medicineSuggestions = [
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
  ];

  const renderMedicineItem = (item, index, length) => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          shadowRadius: 4,
          marginBottom: 20,
          marginTop: 11,
          marginHorizontal: 6,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <MedicineIcon />
        <Text style={[styles.blueTextStyle, { paddingTop: 4 }]}>{item.name}</Text>
        <View style={[styles.separatorStyle, { marginTop: 3, marginBottom: 5 }]} />
        <Text style={styles.medicineCostStyle}>
          {item.cost} <Text style={{ ...theme.fonts.IBMPlexSansMedium(12) }}>/strip</Text>
        </Text>
      </View>
    );
  };

  const renderMedicineSuggestions = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          paddingTop: 16,
          marginTop: 12,
        }}
      >
        {renderLabel('YOU SHOULD ALSO ADD')}

        <FlatList
          contentContainerStyle={{
            marginHorizontal: 14,
          }}
          horizontal={true}
          bounces={false}
          data={medicineSuggestions}
          renderItem={({ item, index }) =>
            renderMedicineItem(item, index, medicineSuggestions.length)
          }
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        <ScrollView>
          <View
            style={{
              marginVertical: 24,
            }}
          >
            {renderItemsInCart()}
            {renderUploadPrescription()}
            {renderDelivery()}
            {renderTotalCharges()}
            {renderMedicineSuggestions()}
          </View>
          <View style={{ height: 70 }} />
        </ScrollView>
        <StickyBottomComponent defaultBG>
          <Button title={'PROCEED TO PAY — RS. 360'} style={{ flex: 1, marginHorizontal: 40 }} />
        </StickyBottomComponent>
      </SafeAreaView>
    </View>
  );
};
