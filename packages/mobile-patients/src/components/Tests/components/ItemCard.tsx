import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { AddIcon, RemoveIcon, TestsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';
import { nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '../../DiagnosticsCartProvider';

export interface ItemCardProps {
  onPress?: () => void;
  addtoCart?: () => void;
  removeFromCart?: () => void;
  style?: ViewStyle;
  showSeparator?: boolean;
  loading?: boolean;
  data: any;
}

export const ItemCard: React.FC<ItemCardProps> = (props) => {
  const { cartItems } = useDiagnosticsCart();
  const { data } = props;
  const name = data?.diagnostic_item_name || '';
  const imageUri = false;

  const renderItemCard = (item: any) => {
    const imageUrl = 'https://apolloaphstorage.blob.core.windows.net/organs/ic_ortho.png';
    const name = item?.item?.itemTitle;
    const parameters = item?.item?.itemParameter;
    const isAddedToCart = !!cartItems?.find(
      (items) => Number(items?.id) == Number(item?.item?.itemId)
    );
    return (
      <TouchableOpacity activeOpacity={1} onPress={props.onPress} key={item?.item?.itemId}>
        <View
          style={{
            ...theme.viewStyles.card(12, 0),
            elevation: 10,
            height: 210,
            width: 180,
            marginHorizontal: 4,
            marginRight: 10,
            alignItems: 'flex-start',
            marginLeft: item?.index == 0 ? 20 : 6,
            marginTop: 16,
            marginBottom: 20,
          }}
        >
          <Image
            placeholderStyle={{ backgroundColor: '#f7f8f5', opacity: 0.5, borderRadius: 5 }}
            source={{ uri: imageUrl }}
            style={{ height: 40, width: 40, marginBottom: 8 }}
          />

          <View style={{ minHeight: 30 }}>
            <Text
              style={{
                ...theme.viewStyles.text('M', 16, '#01475b', 1, 20),
                textAlign: 'left',
                textTransform: 'capitalize',
              }}
              numberOfLines={2}
            >
              {name}
            </Text>
          </View>
          {parameters ? (
            <Text
              style={{
                ...theme.viewStyles.text('R', 11, '#01475b', 1, 16),
                textAlign: 'left',
                marginTop: '5%',
              }}
            >
              {parameters} Parameters included
            </Text>
          ) : null}
          <Spearator style={{ marginBottom: 7.5, marginTop: '6%' }} />
          {/* {renderPricesView()} */}
          {renderAddToCart(isAddedToCart)}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddToCart = (isAddedToCart: boolean) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text(
            'B',
            14,
            // isDiagnosticLocationServiceable ? '#fc9916' : '#FED984',
            '#fc9916',
            1,
            24
          ),
          textAlign: 'left',
          position: 'absolute',
          left: 16,
          bottom: 10,
        }}
        onPress={isAddedToCart ? props.removeFromCart : props.addtoCart}
      >
        {isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
      </Text>
    );
  };

  return (
    <>
      {data?.diagnosticWidgetData?.length > 0 ? (
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={data?.diagnosticWidgetData}
          renderItem={renderItemCard}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  containerStyle: {},
  iconAndDetailsContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9.5,
  },
  iconOrImageContainerStyle: {
    width: 40,
  },
  nameAndPriceViewStyle: {
    flex: 1,
    flexDirection: 'row',
  },
  flexRow: {
    flexDirection: 'row',
  },
  testNameText: { ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0), width: '95%' },
  imageIcon: { height: 40, width: 40 },
});
