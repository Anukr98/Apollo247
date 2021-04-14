import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails } from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
    ...theme.viewStyles.text('M', 12, '#02475b'),
    marginTop: 5,
  },
  itemNameTextStyle: {
    ...theme.viewStyles.text('M', 12, '#0087ba'),
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
  const orderedItems = orderDetails.medicineOrderLineItems || [];
  const orderAutoId = `Your order #${orderDetails.orderAutoId} has been modified.`;
  const [removedItems, setRemovedItems] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [updatedItems, setUpdatedItems] = useState([]);
  const itemDetails = g(
    orderDetails,
    'medicineOrderShipments',
    '0' as any,
    'medicineOrderInvoice',
    '0' as any,
    'itemDetails'
  );

  const billedItems = itemDetails ? JSON.parse(itemDetails) : null;

  useEffect(() => {
    sortItems();
  }, []);

  const sortItems = () => {
    let orderedItemIds = orderedItems.map((item: any) => item.medicineSKU);
    let billedItemIds = billedItems.map((item: any) => item.itemId);

    let addedItems = billedItems.filter((item: any) => {
      return orderedItemIds.indexOf(item.itemId) < 0;
    });
    setAddedItems(addedItems);

    let removedItems = orderedItems.filter((item: any) => {
      return billedItemIds.indexOf(item.medicineSKU) < 0;
    });
    setRemovedItems(removedItems);

    let updatedItems: any = [];
    billedItems.forEach((item: any) => {
      orderedItems.forEach((product: any) => {
        if (item.itemId == product.medicineSKU) {
          if (item.mrp != product.mrp || Math.ceil(item.issuedQty) != product.quantity) {
            if (item.mrp != product.mrp) {
              item['updatedprice'] = true;
              item['originalPrice'] = product.mrp;
            }
            if (Math.ceil(item.issuedQty) != product.quantity) {
              item['updatedquantity'] = true;
              item['originalQuantity'] = product.quantity;
            }
            updatedItems.push(item);
          }
        }
      });
    });
    setUpdatedItems(updatedItems);
  };

  const renderItemsRemoved = (item: any) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.itemBlueCircleViewStyle} />
        <Text style={styles.itemNameTextStyle}>{item.medicineName} is out of stock</Text>
      </View>
    );
  };

  const renderItemsAdded = (item: any) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.itemBlueCircleViewStyle} />
        <Text style={styles.itemNameTextStyle}>{item.itemName} is added</Text>
      </View>
    );
  };

  const renderremovedItems = () => {
    if (removedItems && removedItems.length) {
      return (
        <View>
          <Text style={styles.itemsRemovedTextStyle}>{'Items Removed from your Cart'}</Text>
          {removedItems.map((item) => renderItemsRemoved(item!))}
        </View>
      );
    }
  };

  const renderaddedItems = () => {
    if (addedItems && addedItems.length) {
      return (
        <View>
          <Text style={[styles.itemsRemovedTextStyle, { marginTop: 6 }]}>
            {'Items Added to your Cart.'}
          </Text>
          {addedItems.map((item) => renderItemsAdded(item!))}
        </View>
      );
    }
  };

  const renderItemsAddedRemovedCard = () => {
    if ((addedItems && addedItems.length) || (removedItems && removedItems.length)) {
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
              {renderremovedItems()}
              {renderaddedItems()}
            </View>
          </View>
        </View>
      );
    }
  };

  const renderMrpAndQtyItems = (item: any) => {
    const isTablet = (item.itemName || '').includes('TABLET');
    const itemName = `${item.itemName}${
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
              marginHorizontal: 5,
              marginLeft: 10,
              borderRightColor: 'rgba(2, 71, 91, 0.3)',
            }}
          >
            <Text numberOfLines={2} style={styles.mrpQtyItemNameTextStyle}>
              {itemName}
            </Text>
          </View>
          <View
            style={{
              flex: 0.33,
              alignItems: 'center',
              borderRightColor: 'rgba(2, 71, 91, 0.3)',
            }}
          >
            {item.updatedprice && (
              <Text style={styles.mrpQtyOrgValueTextStyle}>
                {`${string.common.Rs} ` + (item.originalPrice! || 0).toFixed(2)}
              </Text>
            )}
            {item.updatedquantity && (
              <Text style={{ ...styles.mrpQtyOrgValueTextStyle, color: 'rgba(2,71,91,0.7)' }}>
                {'QTY-' + item.originalQuantity}
              </Text>
            )}
          </View>
          <View
            style={{
              flex: 0.33,
              alignItems: 'center',
            }}
          >
            {item.updatedprice && (
              <Text style={styles.mrpQtyRevValueTextStyle}>
                {`${string.common.Rs}` + (item.mrp! || 0).toFixed(2)}
              </Text>
            )}
            {item.updatedquantity && (
              <Text style={styles.mrpQtyRevValueTextStyle}>
                {'QTY-' + Math.ceil(item.issuedQty)}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderMrpAndQuantityModification = () => {
    if (updatedItems && updatedItems.length) {
      return (
        <View style={styles.mprAndQtyMainViewStyle}>
          <Text style={styles.mrpQtyTextStyle}>{'MRP | QUANTITY MODIFICATIONS'}</Text>
          <View style={styles.blueLineViewStyle} />
          <View style={styles.mrpQtyCardStyle}>
            <View
              style={{
                flexDirection: 'row',
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
                  alignItems: 'center',
                  paddingVertical: 3,
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
                  paddingVertical: 3,
                }}
              >
                <Text style={styles.headingTextStyle}>{'ORIGINAL\nDETAILS'}</Text>
              </View>
              <View
                style={{
                  flex: 0.33,
                  paddingVertical: 3,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={styles.headingTextStyle}>{'REVISED\nDETAILS'}</Text>
              </View>
            </View>
            {updatedItems.map((item) => renderMrpAndQtyItems(item))}
            {renderBillingQueries()}
          </View>
        </View>
      );
    }
  };

  const renderBillingQueries = (viewMarginHorizontal = false) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#ffffff',
          justifyContent: 'center',
          shadowColor: 'rgba(128, 128, 128, 0.3)',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          borderRadius: 10,
          marginHorizontal: viewMarginHorizontal ? 20 : 0,
          marginVertical: viewMarginHorizontal ? 20 : 0,
        }}
        activeOpacity={1}
        onPress={() => {
          Linking.openURL(
            AppConfig.Configuration.MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK
          ).catch((err) =>
            CommonBugFender(`${AppRoutes.OrderModifiedScreen}_Linking.openURL`, err)
          );
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
          WhatsApp <Text style={{ color: '#fcb716' }}>by clicking here</Text>
        </Text>
      </TouchableOpacity>
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
          {!(updatedItems && updatedItems.length) ? renderBillingQueries(true) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
