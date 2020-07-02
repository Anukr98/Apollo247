import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails } from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';

const styles = StyleSheet.create({
  orderIDViewStyle: {
    backgroundColor: '#f7f8f5',
    justifyContent: 'center',
    shadowColor: 'rgba(128, 128, 128, 0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  orderIDTextStyle: {
    ...theme.viewStyles.text('M', 14, '#02475b'),
    marginVertical: 13,
    textAlign: 'center',
  },
  itemAddedRemovedViewStyle: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    shadowColor: 'rgba(128, 128, 128, 0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderRadius: 10,
    borderColor: '#02475b',
    borderWidth: 0.5,
    paddingLeft: 12,
    paddingTop: 9,
    marginHorizontal: 20,
    marginTop: 18,
    elevation: 5,
    paddingBottom: 20,
  },
  importantOrangeCircleViewStyle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fc9916',
    justifyContent: 'center',
    alignItems: 'center',
  },
  impTextStyle: {
    ...theme.viewStyles.text('B', 13, '#ffffff'),
  },
  importantMsgTextStyle: {
    ...theme.viewStyles.text('M', 13, '#fc9916'),
    paddingTop: 2,
  },
  itemsRemovedTextStyle: {
    ...theme.viewStyles.text('M', 11, '#02475b'),
    marginTop: 5,
  },
  itemNameTextStyle: {
    ...theme.viewStyles.text('M', 10, '#0087ba'),
    flex: 1,
  },
  itemBlueCircleViewStyle: {
    width: 5,
    height: 5,
    backgroundColor: '#0087ba',
    borderRadius: 2.5,
    marginRight: 4,
    alignSelf: 'center',
  },
  mprAndQtyMainViewStyle: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 40,
  },
  mrpQtyTextStyle: {
    ...theme.viewStyles.text('B', 13, '#01475b'),
  },
  blueLineViewStyle: {
    backgroundColor: '#02475b',
    height: 0.5,
    opacity: 0.2,
    marginTop: 4,
    marginBottom: 15,
  },
  mrpQtyCardStyle: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    shadowColor: 'rgba(128, 128, 128, 0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderRadius: 10,
  },
  headingTextStyle: {
    ...theme.viewStyles.text('SB', 12, '#02475b', 1, 17, 0.3),
    textAlign: 'center',
  },
  mrpQtyItemNameTextStyle: {
    ...theme.viewStyles.text('M', 11, '#01475b', 1, 24),
    textAlign: 'center',
  },
  mrpQtyOrgValueTextStyle: {
    ...theme.viewStyles.text('M', 11, '#02475b', 1, undefined, 0.28),
    marginTop: 5,
  },
  mrpQtyRevValueTextStyle: {
    ...theme.viewStyles.text('M', 11, '#00b38e', 1, undefined, 0.28),
    marginTop: 5,
  },
});

export interface OrderModifiedScreenProps
  extends NavigationScreenProps<{
    orderDetails: getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails;
  }> {}

export const OrderModifiedScreen: React.FC<OrderModifiedScreenProps> = (props) => {
  const orderDetails = props.navigation.getParam('orderDetails');
  const offlineOrderNumber = g(orderDetails, 'billNumber');
  const medicineOrderLineItems = orderDetails.medicineOrderLineItems || [];
  const orderAutoId = `Your order #${orderDetails.orderAutoId} has been modified.`;
  console.log('orderDetails', orderDetails);

  const renderItemsRemoved = (item: any) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.itemBlueCircleViewStyle} />
        <Text style={styles.itemNameTextStyle}>{item.medicineName}</Text>
      </View>
    );
  };

  const renderItemsAdded = (item: any) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.itemBlueCircleViewStyle} />
        <Text style={styles.itemNameTextStyle}>{item.medicineName}</Text>
      </View>
    );
  };

  const renderItemsAddedRemovedCard = () => {
    return (
      <View style={styles.itemAddedRemovedViewStyle}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.importantOrangeCircleViewStyle}>
            <Text style={styles.impTextStyle}>{'!'}</Text>
          </View>
          <View style={{ marginLeft: 18 }}>
            <Text style={styles.importantMsgTextStyle}>
              {'Important messages for items in your cart.'}
            </Text>
            <Text style={styles.itemsRemovedTextStyle}>{'Items Removed from your Cart'}</Text>
            {medicineOrderLineItems.map((item) => renderItemsRemoved(item!))}
            <Text style={[styles.itemsRemovedTextStyle, { marginTop: 6 }]}>
              {'Items Added to your Cart.'}
            </Text>
            {medicineOrderLineItems.map((item) => renderItemsAdded(item!))}
          </View>
        </View>
      </View>
    );
  };

  const renderMrpAndQtyItems = (item: any) => {
    const isTablet = (item.medicineName || '').includes('TABLET');
    const medicineName = `${item.medicineName}${
      item.mou! > 1 ? ` (${item.mou}${isTablet ? ' tabs' : ''})` : ''
    }`;
    return (
      <View key={item.medicineSKU!}>
        <View style={[styles.blueLineViewStyle, { marginHorizontal: 3.5, marginBottom: 10 }]} />
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View
            style={{
              flex: 0.33,
              alignItems: 'flex-start',
              paddingLeft: 13,
              borderRightColor: 'rgba(2, 71, 91, 0.3)',
            }}
          >
            <Text numberOfLines={1} style={styles.mrpQtyItemNameTextStyle}>
              {medicineName}
            </Text>
          </View>
          <View
            style={{
              flex: 0.33,
              alignItems: 'center',
              // justifyContent: 'center',
              borderRightColor: 'rgba(2, 71, 91, 0.3)',
            }}
          >
            <Text style={styles.mrpQtyOrgValueTextStyle}>
              {offlineOrderNumber ? item.price! / item.mrp! / item.quantity! : item.quantity}
            </Text>
          </View>
          <View
            style={{
              flex: 0.33,
              alignItems: 'center',
              paddingRight: 29,
            }}
          >
            <Text style={styles.mrpQtyRevValueTextStyle}>
              Rs. {(item.mrp! * item.quantity! || 0).toFixed(2)}
            </Text>
          </View>
        </View>
        {/* <View style={[styles.blueLineViewStyle, { marginHorizontal: 3.5, marginBottom: 15 }]} /> */}
      </View>
    );
  };

  const renderMrpAndQuantityModification = () => {
    return (
      <View style={styles.mprAndQtyMainViewStyle}>
        <Text style={styles.mrpQtyTextStyle}>{'MRP | QUANTITY MODIFICATIONS'}</Text>
        <View style={styles.blueLineViewStyle} />
        <View style={styles.mrpQtyCardStyle}>
          <View
            style={{
              flexDirection: 'row',
              paddingLeft: 26,
              paddingRight: 27,
              paddingTop: 13,
              paddingBottom: 10,
            }}
          >
            <View
              style={{
                flex: 0.33,
                borderWidth: 0,
                borderRightWidth: 0.5,
                justifyContent: 'center',
                borderRightColor: 'rgba(2, 71, 91, 0.2)',
              }}
            >
              <Text style={[styles.headingTextStyle, { textAlign: 'left' }]}>{'ITEM'}</Text>
            </View>
            <View
              style={{
                flex: 0.33,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 0,
                borderRightColor: 'rgba(2, 71, 91, 0.2)',
                borderRightWidth: 0.5,
              }}
            >
              <Text style={styles.headingTextStyle}>{'ORIGINAL VALUE'}</Text>
            </View>
            <View
              style={{
                flex: 0.33,
                paddingVertical: 3,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={styles.headingTextStyle}>{'REVISED VALUE'}</Text>
            </View>
          </View>
          {medicineOrderLineItems.map((item) => renderMrpAndQtyItems(item))}
          <View
            style={{
              backgroundColor: '#ffffff',
              justifyContent: 'center',
              shadowColor: 'rgba(128, 128, 128, 0.3)',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 5,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                ...theme.viewStyles.text('M', 13, '#02475b', 1, 18, 0),
                paddingLeft: 12,
                paddingVertical: 23,
                flex: 1,
              }}
            >
              In case of any queries or concerns regarding your Bill Invoice, please reach us out on
              WhatsApp by clicking here
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="ORDER MODIFIED"
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false}>
          <View style={styles.orderIDViewStyle}>
            <Text style={styles.orderIDTextStyle}>{orderAutoId}</Text>
          </View>
          {renderItemsAddedRemovedCard()}
          {renderMrpAndQuantityModification()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
