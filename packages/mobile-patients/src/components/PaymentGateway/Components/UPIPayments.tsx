import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { paymentModeVersionCheck } from '@aph/mobile-patients/src/helpers/helperFunctions';
const { width } = Dimensions.get('window');
const newWidth = width - 40;
export interface UPIPaymentsProps {
  upiApps: any;
  onPressUPIApp: (app: any) => void;
  onPressPay: (VPA: string) => void;
  isVPAvalid: boolean;
  setisVPAvalid: (arg: boolean) => void;
  phonePeReady: boolean;
  googlePayReady: boolean;
}

export const UPIPayments: React.FC<UPIPaymentsProps> = (props) => {
  const {
    upiApps,
    onPressUPIApp,
    onPressPay,
    isVPAvalid,
    setisVPAvalid,
    phonePeReady,
    googlePayReady,
  } = props;
  const [VPA, setVPA] = useState<string>('');

  const isValid = (VPA: string) => {
    const match = /^[\w\.\-_]{3,}@[a-zA-Z]{3,}/;
    return match.test(VPA);
  };
  const upiApp = (item: any) => {
    const marginLeft = item?.index == 0 ? 0 : (newWidth - 192) * 0.33;
    return (
      <View style={{ ...styles.AppCont, marginLeft: marginLeft }}>
        <TouchableOpacity style={styles.imageCont} onPress={() => onPressUPIApp(item?.item)}>
          <Image
            source={{ uri: item?.item?.image_url }}
            resizeMode="contain"
            style={styles.image}
          />
        </TouchableOpacity>
        <Text style={styles.App}>{item?.item?.payment_method_name}</Text>
      </View>
    );
  };

  const showUPI = (upi: any) => {
    console.log(upi);
    if (upi == 'PHONEPE') {
      return phonePeReady ? true : false;
    } else if (upi == 'GOOGLEPAY') {
      return googlePayReady ? true : false;
    } else {
      return false;
    }
  };

  const renderUPIApps = () => {
    return upiApps?.length && (googlePayReady || phonePeReady) ? (
      <View>
        <Text style={styles.UPIHeader}>Select your UPI App</Text>
        <FlatList
          style={{ marginTop: 12 }}
          horizontal={true}
          data={upiApps}
          renderItem={(item: any) => upiApp(item)}
        />
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
        <View style={{ ...styles.inputCont, borderColor: isVPAvalid ? '#00B38E' : '#FF748E' }}>
          <View style={{ flex: 1 }}>
            <TextInputComponent
              conatinerstyles={styles.conatinerstyles}
              inputStyle={styles.inputStyle}
              value={VPA}
              onChangeText={(text) => {
                setVPA(text);
                setisVPAvalid(true);
              }}
              placeholder={'username@bank'}
              onSubmitEditing={(e) => isValid(VPA) && onPressPay(VPA)}
            />
          </View>
          {renderPay()}
        </View>
        {renderUPICollectMsg()}
      </View>
    );
  };

  const renderUPICollectMsg = () => {
    return isVPAvalid ? (
      <Text style={styles.upiCollectMsg}>A payment request will be sent to this UPI ID</Text>
    ) : (
      <Text style={{ ...styles.upiCollectMsg, color: '#FF748E' }}>
        Invalid UPI Id, Please check again
      </Text>
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

  return (
    <CollapseView isDown={true} Heading={'UPI PAYMENTS'} ChildComponent={renderChildComponent()} />
  );
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
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 10,
    color: '#01475B',
    marginTop: 10,
  },
  AppCont: {
    width: 48,
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    height: 37,
    width: 37,
  },
  imageCont: {
    height: 48,
    width: 48,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,124,157,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  App: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 20,
    color: '#01475B',
    textAlign: 'center',
  },
  or: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 14,
    color: 'rgba(1,71,91,0.6)',
    marginBottom: 16,
    marginTop: 8,
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(14),
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
