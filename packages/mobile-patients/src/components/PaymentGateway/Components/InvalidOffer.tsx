import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { InvalidOfferIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { getErrorMsg } from '@aph/mobile-patients/src/helpers/helperFunctions';

const windowWidth = Dimensions.get('window').width;

export interface InvalidOfferProps {
  onPressContinue: () => void;
  errCode: any;
}

export const InvalidOffer: React.FC<InvalidOfferProps> = (props) => {
  const { onPressContinue, errCode } = props;
  const { hideAphAlert } = useUIElements();

  const renderMessage = () => {
    return (
      <View style={styles.title}>
        <InvalidOfferIcon style={{ height: 24, width: 29 }} />
        <Text style={styles.titleMsg}>{getErrorMsg(errCode)}</Text>
      </View>
    );
  };

  const renderContinue = () => {
    return (
      <TouchableOpacity style={styles.continueCont} onPress={() => onPressContinue()}>
        <Text style={styles.continue}>{`${'CONTINUE WITHOUT OFFER & PAY'}`}</Text>
      </TouchableOpacity>
    );
  };

  const renderRetry = () => {
    return (
      <Button
        title={'RETRY WITH ANOTHER PAYENT METHOD'}
        style={styles.button}
        onPress={() => hideAphAlert?.()}
      />
    );
  };

  return (
    <View style={styles.component}>
      {renderMessage()}
      {renderContinue()}
      {renderRetry()}
    </View>
  );
};

const styles = StyleSheet.create({
  component: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    width: windowWidth - 32,
  },
  titleMsg: {
    ...theme.fonts.IBMPlexSansBold(16),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 8,
  },
  continueCont: {
    width: windowWidth - 50,
    marginHorizontal: 9,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#FC9916',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    marginBottom: 16,
  },
  continue: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FC9916',
    marginVertical: 8,
  },
  button: {
    width: windowWidth - 50,
    marginBottom: 8,
  },
});
