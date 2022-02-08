import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ExpressSlotClock, WidgetLiverIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { DiagnosticData } from '../Tests';
import { LocationData } from '../../AppCommonDataProvider';
import { getDiagnosticExpressSlots } from '@aph/mobile-patients/src/helpers/clientCalls';

import { useApolloClient } from 'react-apollo-hooks';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const screenWidth = Dimensions.get('window').width;
interface ExpressSlotMessageRibbonProps {
  serviceabilityObject: DiagnosticData;
  selectedAddress: LocationData;
}

export const ExpressSlotMessageRibbon: React.FC<ExpressSlotMessageRibbonProps> = (props) => {
  const { serviceabilityObject, selectedAddress } = props;
  const client = useApolloClient();

  const [expressSlotMsg, setExpressSlotMsg] = useState<string>('');

  async function getExpressSlots(
    serviceabilityObject: DiagnosticData,
    selectedAddress: LocationData
  ) {
    const getLat = selectedAddress?.latitude!;
    const getLng = selectedAddress?.longitude!;
    const getZipcode = selectedAddress?.pincode;
    const getServiceablityObject = {
      cityID: Number(serviceabilityObject?.cityId),
      stateID: Number(serviceabilityObject?.stateId),
    };
    //response when unserviceable
    if (Number(serviceabilityObject?.stateId) == 0 && serviceabilityObject?.city == '') {
      setExpressSlotMsg('');
      return;
    }
    try {
      const res: any = await getDiagnosticExpressSlots(
        client,
        getLat,
        getLng,
        String(getZipcode),
        getServiceablityObject
      );
      if (res?.data?.getUpcomingSlotInfo) {
        const getResponse = res?.data?.getUpcomingSlotInfo;
        if (getResponse?.status) {
          setExpressSlotMsg(getResponse?.slotInfo);
        } else {
          setExpressSlotMsg('');
        }
      } else {
        setExpressSlotMsg('');
      }
    } catch (error) {
      CommonBugFender('getExpressSlots_Tests', error);
      setExpressSlotMsg('');
    }
  }

  useEffect(() => {
    if (!!serviceabilityObject && !!selectedAddress) {
      getExpressSlots(serviceabilityObject, selectedAddress);
    }
  }, [serviceabilityObject, selectedAddress]);
  return expressSlotMsg != '' ? (
    <View style={styles.outerExpressView}>
      <View style={styles.innerExpressView}>
        <ExpressSlotClock style={styles.expressSlotIcon} />
        <Text style={styles.expressSlotText}>{expressSlotMsg}</Text>
      </View>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  outerExpressView: { backgroundColor: colors.APP_GREEN, marginBottom: 2 },
  innerExpressView: {
    flexDirection: 'row',
    padding: 4,
    paddingLeft: 8,
    paddingRight: 8,
    alignItems: 'center',
    width: '97%',
  },
  expressSlotIcon: { width: 35, height: 35, resizeMode: 'contain' },
  expressSlotText: { ...theme.viewStyles.text('SB', 14, colors.WHITE, 1, 18), marginLeft: 10 },
});
