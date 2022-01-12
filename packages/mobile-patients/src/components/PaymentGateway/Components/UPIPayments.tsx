import React, { useState } from 'react';
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
import { UPI, BlackArrowUp } from '@aph/mobile-patients/src/components/ui/Icons';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';

const { width } = Dimensions.get('window');
const newWidth = width - 56;
export interface UPIPaymentsProps {
  upiApps: any;
  onPressUPIApp: (app: any) => void;
  onPressUpiCollect: () => void;
  isVPAvalid: boolean;
  setisVPAvalid: (arg: boolean) => void;
  onPressMoreApps: () => void;
}

export const UPIPayments: React.FC<UPIPaymentsProps> = (props) => {
  const {
    upiApps,
    onPressUPIApp,
    onPressUpiCollect,
    isVPAvalid,
    setisVPAvalid,
    onPressMoreApps,
  } = props;
  const apps = upiApps?.slice(0, 3);
  const isValid = (VPA: string) => {
    const match = /^[\w\.\-_]{3,}@[a-zA-Z]{3,}/;
    return match.test(VPA);
  };

  const getOutageMsg = () => {
    const apps = upiApps?.slice(0, 3);
    const outageApps = apps?.filter(
      (item: any) =>
        item?.outage_list?.[0]?.outage_status == 'FLUCTUATE' ||
        item?.outage_list?.[0]?.outage_status == 'DOWN'
    );
    let msg = '';
    if (outageApps?.length == 1) {
      msg = `${outageApps?.[0]?.payment_method_name} is`;
    } else if (outageApps?.length > 1) {
      outageApps?.forEach((item: any, index: number) => {
        if (index == 0) {
          msg = item?.payment_method_name;
        } else if (index == outageApps?.length - 1) {
          msg = msg + ', and ' + item?.payment_method_name;
        } else {
          msg = msg + ', ' + item?.payment_method_name;
        }
        if (index == outageApps?.length - 1) {
          msg = msg + ' are';
        }
      });
    }
    return msg;
  };

  const upiApp = (item: any) => {
    const marginLeft = item?.index == 0 ? 0 : (newWidth - 192) * 0.33;
    const outageStatus = item?.item?.outage_list?.[0]?.outage_status;
    return (
      <View
        style={{
          ...styles.AppCont,
          marginLeft: marginLeft,
          opacity: outageStatus == 'DOWN' ? 0.5 : 1,
        }}
      >
        <TouchableOpacity
          disabled={outageStatus == 'DOWN' ? true : false}
          style={styles.imageCont}
          onPress={() => onPressUPIApp(item?.item)}
        >
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

  const renderUPIApps = () => {
    return upiApps?.length ? (
      <View>
        <View style={{ borderBottomWidth: 1, borderColor: '#E5E5E5' }}>
          <FlatList
            style={{ marginTop: 12 }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            data={apps}
            renderItem={(item: any) => upiApp(item)}
            ListFooterComponent={renderMoreApps()}
          />
        </View>
        <Text style={styles.or}>or</Text>
      </View>
    ) : null;
  };

  const renderMoreApps = () => {
    return upiApps?.length > 3 ? (
      <View style={{ ...styles.AppCont, marginLeft: (newWidth - 192) * 0.33 }}>
        <TouchableOpacity style={styles.imageCont} onPress={onPressMoreApps}>
          <BlackArrowUp style={{ width: 15, height: 7, transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.App}>More Apps</Text>
      </View>
    ) : null;
  };

  const renderUPICollect = () => {
    return (
      <TouchableOpacity style={styles.upiCont} onPress={onPressUpiCollect}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <UPI style={styles.icon} />
          <Text style={styles.UPIHeader}>Pay with UPI ID</Text>
        </View>
        <BlackArrowUp style={styles.backArrow} />
      </TouchableOpacity>
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

  const renderHeader = () => {
    const msg = getOutageMsg();
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>UPI APPS</Text>
        {!!msg && <OutagePrompt outageStatus="FLUCTUATE" msg={msg} />}
      </View>
    );
  };

  return (
    <View>
      {renderHeader()}
      {renderChildComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  ChildComponent: {
    flex: 1,
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingBottom: 21,
    paddingHorizontal: 12,
  },
  upiCont: {
    marginTop: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  UPIHeader: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    marginLeft: 10,
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
    // borderWidth: 01,
    borderColor: 'rgba(0,124,157,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  App: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: '#01475B',
    textAlign: 'center',
  },
  or: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: 'rgba(1,71,91,0.7)',
    marginTop: 8,
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FC9916',
  },
  inputCont: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    marginBottom: 4,
  },
  header: {
    marginHorizontal: 16,
    paddingBottom: 12,
    marginTop: 24,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
  },
  icon: {
    width: 32,
    height: 8.8,
  },
  backArrow: {
    width: 15,
    height: 7,
    transform: [{ rotate: '90deg' }],
  },
});
