import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, } from 'react-native';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '../../theme/theme';
import moment from 'moment';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import { useAllCurrentPatients } from '../../hooks/authHooks';
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
  overflow:'hidden',
  alignItems:'center',
  justifyContent:'center',
  backgroundColor:'transparent',
  padding:5,
  },

  subPlanTwo:{
  flex:0.5,
  alignItems:'flex-start',
  justifyContent:'center'
  },

  subPlanThree:{
  flex:0.3,
  alignItems:'flex-start',
  justifyContent:'center'
  },


  circleLogo:{
  alignSelf: 'center',
  width: 46,
  height: 29,
  marginTop:-5,
  },

  alertText:{
  transform: [{ rotate: '-43deg' }],
  ...theme.viewStyles.text('M', 9, '#fff', 1, 11),backgroundColor:'#C5411E',
  width:'100%',
  alignSelf:'center',
  left:-25,
  marginTop:-2,
  paddingLeft:20,
  paddingTop:3,
  },

});

export interface CircleTypeCard6Props extends NavigationScreenProps {
  onButtonPress: () => void;
  savings?: string;
  expiry?: string;
  expired?: string;
  credits?: string;
}

type stepsObject = {
  image: Element;
  description: string;
  textColor?: string;
};

export const CircleTypeCard6: React.FC<CircleTypeCard6Props> = (props) => {
  const {
    onButtonPress,
    savings,
    expiry,
    expired,
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
            <Text style={styles.alertText}>
            Awaiting{"\n"}
            Upgrade
            </Text>

             <Image style={styles.circleLogo}
             source={require('../ui/icons/circleLogo.png')} />
             </View>

             <View style={styles.subPlanTwo}>
             <Text style={{...theme.viewStyles.text('M', 12, '#666666', 1, 16)}}>Plan Expired on:</Text>
             <Text style={{...theme.viewStyles.text('M', 20, '#666666', 1, 25)}}>{expired}</Text>
             </View>

             <View style={styles.subPlanThree}>
             <Button
                       title={`UPGRADE`}
                       style={{width:94,height:32}}
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
