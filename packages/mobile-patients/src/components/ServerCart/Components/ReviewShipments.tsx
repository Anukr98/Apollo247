import React, { useEffect } from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { TatCardwithoutAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/TatCardwithoutAddress';
import { ShipmentItem } from '@aph/mobile-patients/src/components/ServerCart/Components/ShipmentItem';

export interface ReviewShipmentsProps {
  setloading?: (value: boolean) => void;
}

export const ReviewShipments: React.FC<ReviewShipmentsProps> = (props) => {
  const { serverCartItems, noOfShipments, setShipmentArray, shipmentArray } = useShoppingCart();
  const isSplitCart: boolean = noOfShipments > 1;

  useEffect(() => {
    const shipmentArray = getShipmentsArray();
    setShipmentArray?.(shipmentArray || []);
  }, []);

  const renderCartItemsHeader = (index: any, items: any) => {
    const itemsCount = items.length == 0 || items.length > 10 ? items.length : `0${items.length}`;
    return isSplitCart ? (
      <View style={styles.cartItemsHeader}>
        <Text style={styles.cartItemsHeaderText}>SHIPMENT {index + 1}</Text>
        <Text style={styles.cartItemsHeaderText}> No. of items ({itemsCount})</Text>
      </View>
    ) : (
      <View style={{ ...styles.cartItemsHeader, marginBottom: 15 }}>
        <Text style={styles.cartItemsHeaderText}>ITEMS IN YOUR CART</Text>
        <Text style={styles.cartItemsHeaderText}>{itemsCount}</Text>
      </View>
    );
  };

  const renderCartItems = (items: any) => (
    <View style={{}}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={items}
        renderItem={({ item, index }) => {
          return <ShipmentItem item={item} />;
        }}
        keyExtractor={(item) => item?.sku}
      />
    </View>
  );

  const getShipmentsArray = () => {
    const shipments: any[] = [];
    for (var shipmentNumber = 1; shipmentNumber <= noOfShipments; shipmentNumber++) {
      const shipment = serverCartItems?.filter((item) => item?.shipmentNo == shipmentNumber);
      shipments.push({
        items: shipment,
        tat: shipment?.[0]?.tat,
        estimatedAmount: shipment.reduce((acc, curr) => acc + curr?.sellingPrice, 0),
      });
    }
    return shipments;
  };

  const renderOrders = () => {
    if (noOfShipments) {
      return shipmentArray?.map((shipment: any, index: any) => {
        return (
          <View>
            {renderCartItemsHeader(index, shipment?.items || serverCartItems)}
            {isSplitCart && (
              <TatCardwithoutAddress
                style={{ marginTop: 13, marginBottom: 10 }}
                deliveryDate={shipment?.tat}
              />
            )}
            {renderCartItems(shipment?.items)}
          </View>
        );
      });
    } else {
      return (
        <View>
          {renderCartItemsHeader(0, serverCartItems)}
          {renderCartItems(serverCartItems)}
        </View>
      );
    }
  };

  return <View>{renderOrders()}</View>;
};

const styles = StyleSheet.create({
  cartItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginHorizontal: 20,
  },
  cartItemsHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
});
