import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { getPricesForItem } from '@aph/mobile-patients/src/utils/commonUtils';

interface RecommedationGroupCardProps {
  showRecommedation?: boolean;
  data?: any;
  cartItems?: any;
  patientItems?: any;
  onPressAdd?: any;
  showAddButton?: boolean;
  showTestWorth?: boolean;
  containerStyle?: any,
  scrollEnabled?: boolean
}

export const RecommedationGroupCard: React.FC<RecommedationGroupCardProps> = (props) => {
  const { showRecommedation, onPressAdd, showAddButton, showTestWorth, containerStyle, scrollEnabled, data, cartItems,patientItems } = props;
  const [isOnPopUp, setIsOnPopUp] = useState<any>(!showAddButton);

  const inclusionNameArray = data?.inclusionData
  const cartItemIds = cartItems?.map((item: { id: any; })=>{return Number(item?.id)})


  const getDiagnosticPricingForItem = data?.diagnosticPricing;
  const packageMrpForItem = data?.packageCalculatedMrp!;
  const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);
  return (
    <>
      {showRecommedation ? (
        <ScrollView style={[styles.container,containerStyle]}>
          <View style={styles.nameContainer}>
            <Text style={styles.cartItemText}>
              {data?.itemName}
            </Text>
            <Text style={styles.mainPriceText}>{string.common.Rs}{pricesForItem?.price}</Text>
          </View>
          <Text style={styles.textInclusionsRecom}>
            Includes {showTestWorth ? <Text style={styles.boldTextRecom}>Tests worth {string.common.Rs}{pricesForItem?.price}</Text> : null}
          </Text>
          <View>
            {inclusionNameArray?.map((item: any) => {
              return (
                <View style={styles.inclusionItemView}>
                  <Text style={{...theme.viewStyles.text(cartItemIds?.includes(item?.itemId) && isOnPopUp ? 'B' : 'M', 12, colors.SHERPA_BLUE, 1)}}>
                    {' • '} {item?.name}
                  </Text>
                </View>
              );
            })}
          </View>
          {showAddButton ? <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              onPressAdd();
            }}
          >
            <Text style={styles.textButton}>{nameFormater(string.common.add,'upper')}</Text>
          </TouchableOpacity> : null}
        </ScrollView>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EBFFFB',
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    borderWidth: 1,
    borderColor: colors.LIGHT_GRAY,
  },
  nameContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inclusionItemView: { paddingHorizontal: 10, paddingBottom: 5 },
  cartItemText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 1, 22),
    width: '75%',
  },
  inclusionTextStyle: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1),
  },
  addButton: {
    flex: 1,
    alignSelf: 'flex-end',
    backgroundColor: colors.WHITE,
    borderColor: colors.APP_YELLOW,
    borderRadius: 6,
    borderWidth: 1,
    margin: 15,
  },
  textButton: {
    ...theme.viewStyles.text('SB', 14, colors.APP_YELLOW, 1),
    textAlign: 'center',
    paddingHorizontal: 25,
    paddingVertical: 5,
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12.5 : 14, theme.colors.SHERPA_BLUE, 1, 16),
    marginTop: 5,
    width: '20%',
    textAlign: 'center',
  },
  textInclusionsRecom: {
    ...theme.viewStyles.text('R', isSmallDevice ? 13 : 14, colors.SHERPA_BLUE, 1),
    padding: 10,
  },
  boldTextRecom: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, colors.SHERPA_BLUE, 1),
  },
});
