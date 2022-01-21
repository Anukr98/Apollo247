import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Dimensions,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { UPI, BlackArrowUp } from '@aph/mobile-patients/src/components/ui/Icons';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';

const { width } = Dimensions.get('window');
const newWidth = width - 56;
export interface UPIAppsPopupProps {
  onPressUpiCollect: () => void;
  upiApps: any;
  onPressUPIApp: (app: any) => void;
}

export const UPIAppsPopup: React.FC<UPIAppsPopupProps> = (props) => {
  const { onPressUpiCollect, upiApps, onPressUPIApp } = props;

  const getOutageMsg = () => {
    const outageApps = upiApps?.filter(
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

  const upiApp = (item: any, index: number) => {
    const marginLeft = index % 4 == 0 ? 0 : (newWidth - 220) * 0.32;
    const marginTop = index > 3 ? 12 : 0;
    const outageStatus = item?.outage_list?.[0]?.outage_status;
    return (
      <View
        style={{
          ...styles.AppCont,
          marginLeft: marginLeft,
          marginTop: marginTop,
          opacity: outageStatus == 'DOWN' ? 0.5 : 1,
        }}
      >
        <TouchableOpacity
          style={styles.imageCont}
          disabled={outageStatus == 'DOWN' ? true : false}
          onPress={() => onPressUPIApp(item)}
        >
          <Image source={{ uri: item?.image_url }} resizeMode="contain" style={styles.image} />
        </TouchableOpacity>
        <Text style={styles.App}>{item?.payment_method_name}</Text>
      </View>
    );
  };

  const renderUPIApps = () => {
    return upiApps?.length ? (
      <View style={styles.upiAppsCont}>
        {upiApps?.map((item: any, index: number) => {
          return upiApp(item, index);
        })}
      </View>
    ) : null;
  };

  const renderHeader = () => {
    return upiApps?.length ? (
      <View style={styles.headerCont}>
        <Text style={styles.header}>VPA ID</Text>
      </View>
    ) : null;
  };

  const renderChildComponent = () => {
    const msg = getOutageMsg();
    return (
      <View>
        <View style={{ marginLeft: 16 }}>
          {!!msg && <OutagePrompt outageStatus="FLUCTUATE" msg={msg} />}
        </View>
        <View style={styles.ChildComponent}>
          {renderUPIApps()}
          {renderHeader()}
          {renderUPICollect()}
        </View>
      </View>
    );
  };

  return <View>{renderChildComponent()}</View>;
};

const styles = StyleSheet.create({
  ChildComponent: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
  },

  upiCont: {
    backgroundColor: '#FAFEFF',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upiAppsCont: {
    backgroundColor: '#FAFEFF',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
  },
  UPIHeader: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    marginLeft: 10,
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
  headerCont: {
    marginTop: 24,
    marginBottom: 12,
  },
  header: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 16,
    color: '#01475B',
  },
  AppCont: {
    width: 55,
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
});
