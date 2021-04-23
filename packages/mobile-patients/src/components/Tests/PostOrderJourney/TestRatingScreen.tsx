import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { getReviewTag } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';

import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import {
  UserOutline,
  StarEmptyGreen,
  StarFillGreen,
  Emoticon1,
  Emoticon2,
  Emoticon3,
  Emoticon4,
  Emoticon5,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NavigationScreenProps } from 'react-navigation';
import { useApolloClient } from 'react-apollo-hooks';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import _ from 'lodash';
import { savePhleboFeedback } from '@aph/mobile-patients/src/helpers/clientCalls';


export interface DiagnosticsOrderList
  extends getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList {
  maxStatus: string;
  maxTime?: string | undefined | null;
}

export interface TestRatingScreenProps extends NavigationScreenProps {
  showHeader?: boolean;
}

export const TestRatingScreen: React.FC<TestRatingScreenProps> = (props) => {
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [ratingStar, setRatingStar] = useState(props.navigation.getParam('ratingStar'));
  const [orderDetail, setOrderDetail] = useState(props.navigation.getParam('orderDetails'))
  const starCount = [1, 2, 3, 4, 5];
  const [ratedStarsArray, setRatedStarsArray] = useState(starCount.slice(0, ratingStar));
  const [unRatedStarsArray, setUnRatedStarsArray] = useState(starCount.slice(ratingStar, 5));
  const [activeReason, setActiveReason] = useState('');
  const [userInput, setUserInput] = useState('');
  useEffect(() => {
    setLoading!(false);
  }, []);

  const client = useApolloClient();
  useEffect(() => {
    getEmoticon(ratingStar);
    getReviewTag(ratingStar);
  }, [ratingStar]);
  const renderStars = (star: number) => {
    return <StarFillGreen />;
  };
  const getEmoticon = (star: number) => {
    if (star == 1) {
      return <Emoticon1 />;
    } else if (star == 2) {
      return <Emoticon2 />;
    } else if (star == 3) {
      return <Emoticon3 />;
    } else if (star == 4) {
      return <Emoticon4 />;
    } else if (star == 5) {
      return <Emoticon5 />;
    } else {
      return null;
    }
  };
  const reasonList = ratingStar >= 4 ? string.positiveReasonList : string.defaultReasonList;
  const renderInputArea = () => {
    return (
      <View style={styles.inputContainer}>
        <TextInput
          value={userInput}
          placeholder={'Write your Feedback Here'}
          onChangeText={(text) => setUserInput(text)}
          style={{ textAlign: 'center' }}
          underlineColorAndroid={colors.APP_GREEN}
        />
      </View>
    );
  };

  const onStarRatingChange = (item: any) => {
    setRatingStar(item);
    setActiveReason('');
    setUserInput('')
    setRatedStarsArray(starCount.slice(0, item));
    setUnRatedStarsArray(starCount.slice(item, 5));
  };
  const checkDisability = () => {
    let result = false
    if (ratingStar == 0) {
      result = true
    } else if (activeReason == 'I have other Feedback' && userInput?.trim()?.length == 0){
      result = true
    } 
    return result
  }
  const onSubmitFeedback = async (rating: number,feedback: string,id: string) => {
      try {
        setLoading!(true);
        const response = await savePhleboFeedback(client,rating,feedback,id);
       console.log('response :>> ', response);
       
      } catch (error) {
        console.log('error :>> ', error.networkError.result.errors);
      }
  }
  // console.log('object :>> ', orderDetail);
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {props?.showHeader == false ? null : (
          <Header
            leftIcon="backArrow"
            title={string.orders.ratingHeader}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
        )}

        <ScrollView bounces={false} scrollEventThrottle={1}>
          <View style={styles.phleboDetails}>
            <UserOutline style={styles.icon} />
            <Text style={styles.textStylePhlebo}>Phlebotomist • Ramkumar sharma</Text>
          </View>
          <Text style={styles.textStyleHeading}>{string.orders.ratingDetailHeader}</Text>
          <View style={styles.startContainer}>
            {ratedStarsArray.map((item, index) => (
              <TouchableOpacity onPress={() => onStarRatingChange(item)}>
                <StarFillGreen style={styles.startStyle} />
              </TouchableOpacity>
            ))}
            {unRatedStarsArray.map((item, index) => (
              <TouchableOpacity onPress={() => onStarRatingChange(item)}>
                <StarEmptyGreen style={styles.startStyle} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.ratingReview}>
            {getEmoticon(ratingStar)}
            <Text style={styles.reviewText}>{getReviewTag(ratingStar)}</Text>
          </View>
          <View style={styles.reasonList}>
            {reasonList?.map((item) => (
              <TouchableOpacity
                style={[
                  styles.reasonTitleContainer,
                  { backgroundColor: activeReason == item?.title ? colors.APP_GREEN : 'white' },
                ]}
                onPress={() => {
                  setActiveReason(item?.title);
                }}
              >
                <Text
                  style={[
                    styles.reasonTitle,
                    { color: activeReason == item?.title ? 'white' : colors.SHERPA_BLUE },
                  ]}
                >
                  {item?.title}
                </Text>
              </TouchableOpacity>
            ))}
            {activeReason == 'I have other Feedback' || activeReason == 'I have Positive Feedback'
              ? renderInputArea()
              : null}
          </View>
        </ScrollView>
        <View style={styles.submitCtaContainer}>
          <Button 
            title={'SUBMIT FEEDBACK'}
            onPress={()=>{
              console.log(`object`, activeReason,ratingStar,orderDetail?.id)
              onSubmitFeedback(ratingStar,activeReason,orderDetail?.id)
              // props.navigation.navigate(AppRoutes.YourOrdersScene);
            }}
            disabled={checkDisability()}
          />
        </View>
      </SafeAreaView>
      {loading && !props?.showHeader ? null : loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
  phleboDetails: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  icon: {
    width: 22,
    height: 22,
    margin: 10,
  },
  textStylePhlebo: {
    ...theme.viewStyles.text('SB', 13, colors.SHERPA_BLUE, 1, 18),
  },
  textStyleHeading: {
    ...theme.viewStyles.text('R', 14, colors.SHERPA_BLUE, 1, 18),
    textAlign: 'center',
  },
  startContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    margin: 5,
    paddingTop: 10,
  },
  startStyle: {
    width: 30,
    height: 30,
    margin: 5,
  },
  ratingReview: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    marginVertical: 10,
  },
  reviewText: {
    ...theme.viewStyles.text('R', 16, colors.SHERPA_BLUE, 1, 18),
    marginHorizontal: 10,
  },
  reasonList: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonTitleContainer: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    padding: 10,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonTitle: {
    ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1, 18),
  },
  inputContainer: {
    width: '70%',
  },
  submitCtaContainer : {
    width:'100%',
    justifyContent:'center',
    alignContent:'center',
    alignItems: 'center',
    padding:10,
    backgroundColor:'white'
  }
});
