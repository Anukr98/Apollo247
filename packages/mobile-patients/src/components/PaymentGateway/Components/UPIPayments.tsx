import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';

export interface UPIPaymentsProps {
  upiApps: any;
  onPressUPIApp: (app: any) => void;
  onPressPay: (VPA: string) => void;
}

export const UPIPayments: React.FC<UPIPaymentsProps> = (props) => {
  const { upiApps, onPressUPIApp, onPressPay } = props;
  const [VPA, setVPA] = useState<string>('');

  const isValid = (VPA: string) => {
    const match = /^[\w\.\-_]{3,}@[a-zA-Z]{3,}/;
    return match.test(VPA);
  };
  const upiApp = (item: any) => {
    return (
      <View style={styles.AppCont}>
        <TouchableOpacity style={styles.imageCont} onPress={() => onPressUPIApp(item?.item)}>
          <Image
            source={{ uri: item?.item?.image_url }}
            resizeMode="contain"
            style={styles.image}
          />
        </TouchableOpacity>
        <Text style={styles.App}>{item?.item?.bank}</Text>
      </View>
    );
  };

  const renderUPIApps = () => {
    return upiApps?.length ? (
      <View>
        <Text style={styles.UPIHeader}>Select your UPI App</Text>
        <FlatList style={{ marginTop: 12 }} data={upiApps} renderItem={(item) => upiApp(item)} />
        <Text style={styles.or}>OR</Text>
      </View>
    ) : null;
  };

  const renderPay = () => {
    return (
      <TouchableOpacity onPress={() => isValid(VPA) && onPressPay(VPA)}>
        <Text
          style={{
            ...styles.payNow,
            color: isValid(VPA) ? 'rgba(252,153,22,1)' : 'rgba(252,153,22,0.6)',
          }}
        >
          {'VERIFY & PAY'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUPICollect = () => {
    return (
      <View style={{}}>
        <Text style={styles.UPIHeader}>Enter your UPI ID</Text>
        <View style={styles.inputCont}>
          <View style={{ flex: 1 }}>
            <TextInputComponent
              conatinerstyles={styles.conatinerstyles}
              inputStyle={styles.inputStyle}
              value={VPA}
              onChangeText={(text) => setVPA(text)}
              placeholder={'username@bank'}
            />
          </View>
          {renderPay()}
        </View>
        <Text style={styles.upiCollectMsg}>A payment request will be sent to this UPI ID</Text>
      </View>
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        {renderUPIApps()}
        {renderUPICollect()}
      </View>
    );
  };

  return <CollapseView Heading={'UPI PAYMENTS'} ChildComponent={renderChildComponent()} />;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  UPIHeader: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: '#01475B',
  },
  conatinerstyles: {
    paddingTop: 1,
    paddingBottom: 0,
  },
  inputStyle: {
    borderBottomWidth: 0,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  upiCollectMsg: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 10,
    color: '#01475B',
    marginTop: 8,
  },
  AppCont: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    height: 30,
    width: 70,
  },
  imageCont: {
    height: 48,
    width: 90,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,124,157,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  App: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 24,
    color: '#01475B',
    marginLeft: 24,
  },
  or: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 14,
    color: 'rgba(1,71,91,0.6)',
    marginBottom: 16,
    marginTop: 8,
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 15,
    color: '#FC9916',
  },
  inputCont: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    marginBottom: 4,
  },
});
