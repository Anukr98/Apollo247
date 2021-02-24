import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

import string from '@aph/mobile-patients/src/strings/strings.json';

import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationScreenProps } from 'react-navigation';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { timeDiffFromNow } from '@aph/mobile-patients/src/helpers/helperFunctions';

const styles = StyleSheet.create({
  planContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    marginVertical: 5,
  },

  subPlanOne: {
    flex: 0.2,
    alignItems: 'center',
  },

  subPlanTwo: {
    flex: 0.4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  subPlanThree: {
    flex: 0.4,
    alignItems: 'center',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
});

export interface CircleTypeCard2Props extends NavigationScreenProps {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  credits?: string;
}

type stepsObject = {
  image: Element;
  description: string;
  textColor?: string;
};

export const CircleTypeCard2: React.FC<CircleTypeCard2Props> = (props) => {
  const { onButtonPress, savings, expiry, credits } = props;

  const { currentPatient } = useAllCurrentPatients();
  const { showCircleSubscribed } = useShoppingCart();

  const renderCard = (
    headingImage: Element,
    heading: string,
    question: string,
    time: string | null,
    steps: stepsObject[]
  ) => {
    const timeDiff: Number = timeDiffFromNow(time || '');
    const current = moment(new Date());
    const isTomorrow = moment(time).isAfter(
      current
        .add(1, 'd')
        .startOf('d')
        .set({
          hour: moment('06:00', 'HH:mm').get('hour'),
          minute: moment('06:00', 'HH:mm').get('minute'),
        })
    );
  };

  return (
    <View>
      <View style={styles.planContainer}>
        <View style={styles.subPlanOne}>
          <Image
            style={styles.circleLogo}
            source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.png')}
          />
        </View>

        <View style={styles.subPlanTwo}>
          <View>
            <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B', 1, 16) }}>
              Your Plan {'\n'}Expires In:{'  '}
              <Text
                style={[
                  { ...theme.viewStyles.text('M', 20, '#02475B', 1, 25) },
                  { alignSelf: 'flex-end' },
                ]}
              >
                {expiry} {expiry == '1' ? `day` : `days`}
              </Text>
            </Text>
            {credits ? (
              <View style={[styles.planContainer, { justifyContent: 'flex-start' }]}>
                <Text style={{ ...theme.viewStyles.text('M', 12, '#666666', 0.6, 16) }}>
                  Available Health Credits:
                </Text>
                <Text style={{ ...theme.viewStyles.text('M', 12, '#666666', 1, 16) }}>
                  {' '}
                  {credits || 0}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.subPlanThree}>
          <Button
            title={`RENEW NOW`}
            style={{ width: 106, height: 32 }}
            onPress={onButtonPress}
            disabled={false}
          />
        </View>
      </View>
    </View>
  );
};