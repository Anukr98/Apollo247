import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AlertIcon, GreenClock } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { updateMedicineOrderSubstitutionVariables } from '@aph/mobile-patients/src/graphql/types/updateMedicineOrderSubstitution';

export interface SubstituteItemsCardProps {
  transactionId: number | null;
  orderId: number | null;
  substituteMessage: string;
  substituteTime: number;
  updateOrderSubstitution: (params: updateMedicineOrderSubstitutionVariables) => void;
  setShowSubstituteMessage: (value: boolean) => void;
  setShowSubstituteConfirmation: (value: boolean) => void;
}

enum SUBSTITUTION_RESPONSE {
  OK = 'OK',
  NOT_OK = 'not-OK',
}

export const SubstituteItemsCard: React.FC<SubstituteItemsCardProps> = (props) => {
  const {
    transactionId,
    orderId,
    substituteMessage,
    substituteTime,
    updateOrderSubstitution,
    setShowSubstituteMessage,
    setShowSubstituteConfirmation,
  } = props;
  const { orders } = useShoppingCart();
  const isSplitCart: boolean = orders?.length > 1 ? true : false;

  return (
    <View style={substituteStyles.substituteCard}>
      <View style={{ marginVertical: 15 }}>
        <View style={substituteStyles.noticeContainer}>
          <AlertIcon style={substituteStyles.alertIcon} />
          <Text style={substituteStyles.noticeText}>NOTICE</Text>
        </View>
        <View>
          <View style={substituteStyles.messageBody}>
            <Text style={theme.viewStyles.text('SB', 13, theme.colors.ASTRONAUT_BLUE, 1, 20)}>
              {substituteMessage}
            </Text>
          </View>
        </View>
        <View>
          <TouchableOpacity
            style={[substituteStyles.buttonAgreeStyle, substituteStyles.buttonStyle]}
            onPress={() => {
              const params: updateMedicineOrderSubstitutionVariables = {
                transactionId,
                orderId: transactionId || isSplitCart ? null : orderId,
                substitution: SUBSTITUTION_RESPONSE.OK,
              };
              updateOrderSubstitution(params);
              setShowSubstituteMessage(false);
              setShowSubstituteConfirmation(true);
            }}
          >
            <Text style={{ ...theme.viewStyles.text('SB', 15, '#ffffff', 1, 24) }}>
              Yes, Agree to Receiving Substitutes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[substituteStyles.buttonNotAgreeStyle, substituteStyles.buttonStyle]}
            onPress={() => {
              const params: updateMedicineOrderSubstitutionVariables = {
                transactionId,
                orderId: transactionId || isSplitCart ? null : orderId,
                substitution: SUBSTITUTION_RESPONSE.NOT_OK,
              };
              updateOrderSubstitution(params);
              setShowSubstituteMessage(false);
              setShowSubstituteConfirmation(true);
            }}
          >
            <Text style={{ ...theme.viewStyles.text('SB', 15, '#fcb716', 1, 24) }}>
              No, I want the Exact items Delivered
            </Text>
          </TouchableOpacity>
          <View style={substituteStyles.timeoutTextContainer}>
            <Text style={theme.viewStyles.text('SB', 14, theme.colors.APP_GREEN, 1, 24)}>
              Please Let us Know Within the Next{' '}
              <GreenClock style={substituteStyles.greenClockIcon} />
              <Text style={theme.viewStyles.text('B', 14, theme.colors.APP_GREEN, 1, 24)}>
                {`${substituteTime} seconds`}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const substituteStyles = StyleSheet.create({
  substituteCard: {
    marginVertical: 0.03 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  noticeContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderBottomColor: theme.colors.SHADE_GREY,
  },
  alertIcon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
    marginRight: 7,
    marginLeft: 10,
  },
  noticeText: {
    ...theme.viewStyles.text('SB', 15, theme.colors.ASTRONAUT_BLUE, 1, 20),
    paddingBottom: 10,
  },
  messageBody: {
    justifyContent: 'flex-start',
    margin: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: theme.colors.SHADE_GREY,
  },
  buttonStyle: {
    height: 0.06 * windowHeight,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  buttonAgreeStyle: {
    backgroundColor: '#fcb716',
    marginHorizontal: 15,
  },
  buttonNotAgreeStyle: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#fcb716',
    marginHorizontal: 15,
    marginTop: 10,
  },
  timeoutTextContainer: { marginHorizontal: 15, marginTop: 10, flexDirection: 'row' },
  greenClockIcon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
});
