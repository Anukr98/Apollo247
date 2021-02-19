import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, } from 'react-native';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import { WebEngageEvents, WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationScreenProps } from 'react-navigation';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

const styles = StyleSheet.create({
  planContainer: {
  flexDirection:'row',
  flex:1,
  alignItems:'center',
  justifyContent:'center',
  marginVertical:5
  },

  subPlanOne:{
  flex:0.2,
  alignItems:'center',
  justifyContent:'center'
  },

  subPlanTwo:{
  flex:0.2,
  alignItems:'flex-start',
  justifyContent:'center'
  },

  subPlanThree:{
  flex:0.3,
  alignItems:'flex-start',
  justifyContent:'center'
  },

  subPlanFour:{
  flex:0.3,
  alignItems:'center',
  justifyContent:'center',
  },

  circleLogo:{
  alignSelf: 'center',
  width: 46,
  height: 29,
  },

});

export interface CircleTypeCard1Props extends NavigationScreenProps {
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

export const CircleTypeCard1: React.FC<CircleTypeCard1Props> = (props) => {
  const {
    onButtonPress,
    savings,
    expiry,
    credits,
  } = props;

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
   }

  return (
  <View>
    <View style={styles.planContainer}>

            <View style={styles.subPlanOne}>
             <Image style={styles.circleLogo}
             source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.png')} />
             </View>
             <View style={styles.subPlanTwo}>
             <Text style={{...theme.viewStyles.text('M', 12, '#02475B', 1, 16)}}>Savings:</Text>
             <Text style={{...theme.viewStyles.text('M', 20, '#02475B', 1, 25)}}>₹{savings}</Text>
             </View>

             <View style={styles.subPlanThree}>
             <Text style={{...theme.viewStyles.text('M', 12, '#02475B', 1, 16)}}>Plan Expires In:</Text>
             <Text style={{...theme.viewStyles.text('M', 20, '#02475B', 1, 25)}}>{expiry} {expiry==1?'day':'days'}</Text>
             </View>

             <View style={styles.subPlanFour}>
             <Button
                       title={`RENEW NOW`}
                       style={{width:106,height:32}}
                       onPress={onButtonPress}
                       disabled={false}
                     />
             </View>

    </View>

    <View style={styles.planContainer}>
         <Text style={{...theme.viewStyles.text('M', 12, '#666666', 0.6, 16)}}>Available Health Credits:</Text>
         <Text style={{...theme.viewStyles.text('M', 12, '#666666', 1, 16)}}> {credits}</Text>
    </View>

    </View>
  );
};
