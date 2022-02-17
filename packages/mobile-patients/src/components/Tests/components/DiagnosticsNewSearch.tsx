import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  AddIcon,
  PolygonIcon,
  RemoveIconOrange,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { isEmptyObject } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  checkPatientWithSkuGender,
  checkSku,
  DiagnosticItemGenderMapping,
  DiagnosticPopularSearchGenderMapping,
  DIAGNOSTIC_ITEM_GENDER,
  DIANGNOSTIC_POPULAR_ITEM_GENDER,
} from '../utils/helpers';
import { GENDER } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { BOTH_GENDER_ARRAY } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
const winHeight = Dimensions.get('window').height;
const winWidth = Dimensions.get('window').width;
export interface DiagnosticsNewSearchProps {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressRemoveFromCart: () => void;
  style?: ViewStyle;
  showSeparator?: boolean;
  loading?: boolean;
  data: any;
  onPressInvalidItem: (msg: string) => void;
}

export const DiagnosticsNewSearch: React.FC<DiagnosticsNewSearchProps> = (props) => {
  const { cartItems, modifiedOrderItemIds, modifiedOrder } = useDiagnosticsCart();
  const [toolTipId, setToolTipId] = useState<number>(0);
  const [toolTipMsg, setToolTipMsg] = useState<string>('');
  const { data } = props;
  const name = data?.diagnostic_item_name || '';
  const imageUri = false;
  const isAddedToCart = !!cartItems?.find(
    (item) => Number(item?.id) == Number(data?.diagnostic_item_id)
  );
  const showTt = toolTipId == data?.diagnostic_item_id;

  const renderNamePriceAndInStockStatus = () => {
    return (
      <View style={{ width: '100%' }}>
        <View style={styles.nameAndPriceViewStyle}>
          <View style={{ width: '85%' }}>
            <Text numberOfLines={2} style={styles.testNameText}>
              {name}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>{renderAddToCartView()}</View>
        </View>
      </View>
    );
  };

  const renderAddToCartView = () => {
    const isModifyOrder = !!modifiedOrder && !isEmptyObject(modifiedOrder);
    const getExisitingOrderItems = isModifyOrder
      ? !!modifiedOrderItemIds && modifiedOrderItemIds
      : [];
    const isAlreadyPartOfOrder =
      getExisitingOrderItems?.length > 0 &&
      getExisitingOrderItems?.find((id: number) => Number(id) == Number(data?.diagnostic_item_id));
    const patientGender = isModifyOrder && modifiedOrder?.patientObj?.gender;
    const isItemActive =
      isModifyOrder &&
      !!patientGender &&
      checkSku(
        patientGender,
        DiagnosticPopularSearchGenderMapping(data?.diagnostic_item_gender),
        true
      );
    const skuType = data?.diagnostic_inclusions?.length > 1 ? 'package' : 'test';
    const msgText =
      isModifyOrder && !isItemActive
        ? string.diagnostics.skuGenderMessage
            .replace('{{skuType}}', skuType)
            .replace('{{gender}}', patientGender?.toLowerCase())
        : '';

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={
          isAlreadyPartOfOrder
            ? () => {}
            : isAddedToCart
            ? props.onPressRemoveFromCart
            : isItemActive
            ? props.onPressAddToCart
            : () => onPressInvalidItem(data?.diagnostic_item_id, msgText)
        }
      >
        {isAlreadyPartOfOrder ? (
          <RemoveIconOrange />
        ) : isAddedToCart ? (
          <RemoveIconOrange />
        ) : (
          <AddIcon style={{ opacity: isItemActive ? 1 : 0.5 }} />
        )}
      </TouchableOpacity>
    );
  };

  function onPressInvalidItem(itemId: number, msg: string) {
    toolTipId != 0 && setToolTipId(0);
    toolTipMsg != '' && setToolTipMsg('');
    setToolTipId(itemId);
    setToolTipMsg(msg);
  }

  const renderToolTip = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setToolTipId(0);
          setToolTipMsg('');
        }}
        style={styles.toolTipTouch}
      >
        <View style={[styles.nonServiceableToolTip]}>
          <PolygonIcon style={[styles.toolTipIcon, { tintColor: theme.colors.SHERPA_BLUE }]} />
          <View style={{ padding: 12 }}>
            <Text style={styles.unserviceableMsg}>{toolTipMsg}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.containerStyle, props.style]}
        onPress={props.onPress}
      >
        <View style={styles.containerStyle} key={data?.name}>
          <View style={styles.iconAndDetailsContainerStyle}>
            <View style={{ width: 16 }} />
            {renderNamePriceAndInStockStatus()}
          </View>
          {props.showSeparator ? <Spearator /> : null}
        </View>
      </TouchableOpacity>
      {showTt && toolTipMsg != '' ? renderToolTip() : null}
    </>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    width: '100%',
    justifyContent: 'space-between',
    margin: 0,
  },
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
  numberPlate: { ...theme.viewStyles.text('SB', 10, theme.colors.SKY_BLUE, 1, 18) },
  flexRow: {
    flexDirection: 'row',
  },
  testNameText: { ...theme.viewStyles.text('M', 12, '#01475b', 1, 24, 0), width: '95%' },
  nonServiceableToolTip: {
    backgroundColor: theme.colors.SHERPA_BLUE,
    flex: 1,
    position: 'absolute',
    top: Platform.OS == 'ios' ? winHeight / 30 : winHeight / (winHeight > 700 ? 10 : 8),
    left: winWidth / 5,
    width: winWidth / 1.7,
  },
  toolTipIcon: {
    height: 20,
    width: 20,
    marginTop: -10,
    resizeMode: 'contain',
    marginBottom: -10,
    marginLeft: winWidth / 5,
    tintColor: '#CE3737',
  },
  toolTipTouch: {
    position: 'absolute',
    height: winHeight,
    width: winWidth,
  },
  unserviceableMsg: { ...theme.viewStyles.text('M', 11, theme.colors.WHITE, 1, 16), marginTop: 8 },
});
