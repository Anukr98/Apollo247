import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ArrowRight, CouponIcon, MedicineIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { GET_PATIENT_ADDRESS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientAddressList,
  getPatientAddressList_getPatientAddressList_addressList,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import {
  CartInfoResponse,
  MedicineProductsResponse,
  getCartInfo,
  CartItem,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FlatList,
  NavigationEventSubscription,
  NavigationScreenProps,
  ScrollView,
} from 'react-navigation';

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
    ...theme.viewStyles.yellowTextStyle,
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

let didFocusSubscription: NavigationEventSubscription;
const addresses = [
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
];

type MedicineCardState = {
  // subscriptionStatus: 'already-subscribed' | 'subscribed-now' | 'unsubscribed';
  isCardExpanded: boolean;
  isAddedToCart: boolean;
  unit: number;
};

export interface YourCartProps extends NavigationScreenProps {}

export const YourCart: React.FC<YourCartProps> = (props) => {
  const tabs = [{ title: 'Home Delivery' }, { title: 'Store Pick Up' }];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedHomeDelivery, setselectedHomeDelivery] = useState<number>(0);

  const [medicineList, setMedicineList] = useState<CartItem[]>([]);
  const [addressList, setaddressList] = useState<
    getPatientAddressList_getPatientAddressList_addressList[] | null
  >([]);
  const [cartDetails, setcartDetails] = useState<CartInfoResponse>();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [medicineCardStatus, setMedicineCardStatus] = useState<{
    [sku: string]: MedicineCardState;
  }>({});

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();

  useEffect(() => {
    getCartInfo()
      .then((cartInfo) => {
        setcartDetails(cartInfo);
        let cartStatus = {} as { [sku: string]: MedicineCardState };
        cartInfo &&
          cartInfo.items.forEach((item) => {
            cartStatus[item.sku] = { isAddedToCart: true, isCardExpanded: true, unit: item.qty };
          });
        setMedicineCardStatus({
          ...medicineCardStatus,
          ...cartStatus,
        });
        setMedicineList(cartInfo.items);
        setshowSpinner(false);
      })
      .catch(() => {
        setshowSpinner(false);
      });
  }, []);

  const fetchAddress = useCallback(() => {
    client
      .query<getPatientAddressList>({ query: GET_PATIENT_ADDRESS_LIST, fetchPolicy: 'no-cache' })
      .then(({ data: { getPatientAddressList } }) => {
        // set to context
        console.log('getPatientAddressList qqq', getPatientAddressList);
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        console.log(e, error);
      });
  }, [client]);

  useEffect(() => {
    fetchAddress();
    didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      console.log('didFocus', payload);
      fetchAddress();
    });
  }, [fetchAddress, props.navigation]);

  useEffect(() => {
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, []);

  console.log(currentPatient);
  const { data, error } = useQuery<getPatientAddressList>(GET_PATIENT_ADDRESS_LIST, {
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
  });
  if (error) {
    console.log('error', error);
  } else {
    console.log('getPatientAddressList', data);
    if (
      data &&
      data.getPatientAddressList &&
      addressList !== data.getPatientAddressList.addressList
    ) {
      console.log('data', data.getPatientAddressList);
      setaddressList(data.getPatientAddressList.addressList);
    }
  }

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
            <TouchableOpacity onPress={() => props.navigation.pop()}>
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
    const cartItemsCount = (cartDetails && cartDetails.items.length) || 0;
    const _cartItemsCount = cartItemsCount < 10 ? `0${cartItemsCount}` : cartItemsCount.toString();
    return (
      <View>
        {renderLabel('ITEMS IN YOUR CART', _cartItemsCount)}
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
              key={medicine.sku}
              onPress={() => {
                props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
                  sku: medicine.sku,
                  title: medicine.name,
                });
              }}
              medicineName={medicine.name}
              price={medicine.price}
              unit={
                (medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].unit) || 1
              }
              onPressAdd={() => {
                // onPressAddToCart(medicine);
              }}
              onPressRemove={() => {
                // onPressRemoveFromCart(medicine);
              }}
              onChangeUnit={(unit) => {
                // onChangeUnitFromCart(medicine, unit);
              }}
              isCardExpanded={
                medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].isCardExpanded
              }
              isInStock={true}
              isPrescriptionRequired={/*medicine.is_prescription_required == '1'*/ false} //solve this problem by maintaing a state in cart
              subscriptionStatus={
                // (medicineCardStatus[medicine.sku] && medicineCardStatus[medicine.sku].subscriptionStatus) ||
                'unsubscribed'
              }
              onChangeSubscription={(status) => {
                setMedicineCardStatus({
                  ...medicineCardStatus,
                  // [medicine.sku]: { ...medicineCardStatus[medicine.sku], subscriptionStatus: status },
                });
              }}
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

  const renderHomeDelivery = () => {
    return (
      <View
        style={{
          marginTop: 8,
          marginHorizontal: 16,
        }}
      >
        {addressList &&
          [...addressList].slice(0, 2).map((item, index: number) => (
            <RadioSelectionItem
              title={`${item.addressLine1} ${item.addressLine2}\n ${item.city} ${item.state} ${item.landmark}`}
              isSelected={selectedHomeDelivery === index}
              onPress={() => setselectedHomeDelivery(index)}
              containerStyle={{
                marginTop: 16,
              }}
              hideSeparator={index + 1 === addressList.length}
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
            onPress={() => props.navigation.navigate(AppRoutes.AddAddress)}
          >
            ADD NEW ADDRESS
          </Text>
          <View>
            {addressList && addressList.length > 2 && (
              <Text
                style={{
                  ...styles.yellowTextStyle,
                }}
                onPress={() => props.navigation.navigate(AppRoutes.SelectDeliveryAddress)}
              >
                VIEW ALL
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderStorePickup = () => {
    return (
      <View
        style={{
          margin: 16,
          marginTop: 20,
        }}
      >
        <TextInputComponent />
        {addresses &&
          [...addresses].slice(0, 2).map((item, index: number) => (
            <RadioSelectionItem
              title={item}
              isSelected={selectedHomeDelivery === index}
              onPress={() => setselectedHomeDelivery(index)}
              containerStyle={{
                marginTop: 16,
              }}
              hideSeparator={index + 1 === addresses.length}
            />
          ))}
        <View>
          {addresses && addresses.length > 2 && (
            <Text
              style={{
                ...styles.yellowTextStyle,
                textAlign: 'right',
              }}
              onPress={() => props.navigation.navigate(AppRoutes.StorPickupScene)}
            >
              VIEW ALL
            </Text>
          )}
        </View>
      </View>
    );
  };

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
          {selectedTab === tabs[0].title ? renderHomeDelivery() : renderStorePickup()}
        </View>
      </View>
    );
  };

  const renderTotalCharges = () => {
    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        <TouchableOpacity
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
          onPress={() => props.navigation.navigate(AppRoutes.ApplyCouponScene)}
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
        </TouchableOpacity>
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
            <Text style={styles.blueTextStyle}>
              Rs. {cartDetails ? cartDetails.grand_total : 0}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.blueTextStyle}>Delivery Charges</Text>
            <Text style={styles.blueTextStyle}>+ Rs. {0}</Text>
          </View>
          <View style={[styles.separatorStyle, { marginTop: 16, marginBottom: 7 }]} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.blueTextStyle}>To Pay </Text>
            <Text style={[styles.blueTextStyle, { ...theme.fonts.IBMPlexSansBold }]}>
              {' '}
              Rs. {cartDetails ? cartDetails.grand_total : 0}{' '}
            </Text>
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

  const renderMedicineItem = (
    item: { name: string; cost: string },
    index: number,
    length: number
  ) => {
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
          <Button
            title={`PROCEED TO PAY — RS. ${cartDetails ? cartDetails.grand_total : 0}`}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent>
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
