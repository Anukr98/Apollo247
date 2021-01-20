import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  CircleLogo,
  HealthLogo,
  DoctorIcon,
  EmergencyCall,
  ExpressDeliveryLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import moment from 'moment';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import Carousel from 'react-native-snap-carousel';
import { WebView } from 'react-native-webview';

const screenWidth = Dimensions.get('window').width;

export interface CircleSavingsProps extends NavigationScreenProps {}

export const CircleSavings: React.FC<CircleSavingsProps> = (props) => {
  const { circleSubscription, totalCircleSavings } = useAppCommonData();
  const [slideIndex, setSlideIndex] = useState(0);
  const videoLinks = strings.Circle.video_links;
  
  const renderCircleExpiryBanner = () => {
    return (
      <View style={[styles.expiryBanner, { alignItems: 'center' }]}>
        <CircleLogo style={styles.circleLogo} />
        <Text style={theme.viewStyles.text('R', 12, '#01475B')}>
          Membership expires on{' '}
          <Text style={theme.viewStyles.text('M', 12, '#01475B')}>
            {moment(circleSubscription?.endDate).format('DD/MM/YYYY')}
          </Text>
        </Text>
      </View>
    );
  };

  const renderCircleSavings = () => {
    const totalSavingsDone = totalCircleSavings?.totalSavings! + totalCircleSavings?.callsUsed!;
    return (
      <View
        style={{
          backgroundColor: 'rgba(0, 179, 142, 0.1)',
          padding: 15,
          alignItems: 'center',
        }}
      >
        <Text style={theme.viewStyles.text('M', 14, '#02475B', 1, 18, 0.35)}>
          Total Savings Using Circle Plan{'  '}
          <Text style={theme.viewStyles.text('SB', 18, '#00B38E', 1, 28, 0.35)}>
            {strings.common.Rs}
            {totalCircleSavings?.totalSavings.toFixed(2) || 0}
          </Text>
        </Text>
        {renderSavingsCard()}
      </View>
    );
  };

  const renderSaveFromCircle = () => {
    return (
      <View>
        <View
          style={[styles.expiryBanner, { justifyContent: 'flex-start', paddingHorizontal: 20 }]}
        >
          <View style={styles.saveCircleContainer}>
            <DoctorIcon style={styles.doctorIcon} />
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text style={theme.viewStyles.text('M', 16, '#01475B', 1, 24, 0.35)}>
              UNLIMITED Doctor Consult
            </Text>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate(AppRoutes.DoctorSearch);
              }}
            >
              <Text style={theme.viewStyles.text('SB', 16, '#FC9916', 1, 24, 0.35)}>
                BOOK APPOINTMENT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={[styles.expiryBanner, { justifyContent: 'flex-start', paddingHorizontal: 20 }]}
        >
          <View style={styles.saveCircleContainer}>
            <HealthLogo style={styles.doctorIcon} />
          </View>
          <View style={{ marginLeft: 20 }}>
            <Text style={theme.viewStyles.text('M', 16, '#01475B', 1, 24, 0.35)}>
              Get 20% Cashback on Medicines
            </Text>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('MEDICINES');
              }}
            >
              <Text style={theme.viewStyles.text('SB', 16, '#FC9916', 1, 24, 0.35)}>
                ORDER MEDICINES
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderViewCarousel = () => {
    return (
      <View
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <Text style={styles.howToHeader}>
          How to Book Consult?
        </Text>
        <Carousel
          onSnapToItem={setSlideIndex}
          data={videoLinks}
          renderItem={rendeSliderVideo}
          sliderWidth={screenWidth}
          itemWidth={screenWidth - 30}
          loop={true}
          autoplay={false}
        />
        {videoLinks && videoLinks.length > 1 ? (
          <View style={styles.sliderDotsContainer}>
            {videoLinks?.map((_, index) =>
              index == slideIndex ? renderDot(true) : renderDot(false)
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const rendeSliderVideo = ({item}) => {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          source={{ uri: item }} 
          style={{
            width: screenWidth,
            height: 150,
          }}
        />
      </View>
    )
  };

  const renderDot = (active: boolean) => (
    <View
      style={[
        styles.sliderDots,
        {
          backgroundColor: active
            ? theme.colors.TURQUOISE_LIGHT_BLUE
            : theme.colors.CAROUSEL_INACTIVE_DOT,
          width: active ? 13 : 6,
        },
      ]}
    />
  );

  const renderSavingsCard = () => {
    return (
      <View style={styles.savingsCard}>
        <View
          style={{
            ...styles.savingsContainer,
            marginTop: 0,
          }}
        >
          <View style={styles.savingsRow}>
            <HealthLogo style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Savings on Pharmacy</Text>
          </View>
          <View style={styles.priceView}>
            <Text style={styles.savingsAmount}>
              {strings.common.Rs}
              {totalCircleSavings?.pharmaSavings.toFixed(2) || 0}
            </Text>
          </View>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <DoctorIcon style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Savings on Doctor Consult</Text>
          </View>
          <View style={styles.priceView}>
            <Text style={styles.savingsAmount}>
              {strings.common.Rs}
              {totalCircleSavings?.consultSavings.toFixed(2) || 0}
            </Text>
          </View>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <Image
              source={{
                uri: 'https://assets.apollo247.com/images/circle/ic_diagnostics.png',
              }}
              style={styles.savingsIcon}
            />
            <Text style={styles.savingsHeading}>Total Savings on Diagnostics</Text>
          </View>
          <View style={styles.priceView}>
            <Text style={styles.savingsAmount}>
              {strings.common.Rs}
              {totalCircleSavings?.diagnosticsSavings.toFixed(2) || 0}
            </Text>
          </View>
        </View>

        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <EmergencyCall style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Free Emergency Calls Made</Text>
          </View>
          <View style={styles.priceView}>
            <Text style={styles.savingsAmount}>
              {totalCircleSavings?.callsUsed || 0}/{totalCircleSavings?.callsTotal || 0}
            </Text>
          </View>
        </View>
        <View style={styles.savingsContainer}>
          <View style={styles.savingsRow}>
            <ExpressDeliveryLogo style={styles.savingsIcon} />
            <Text style={styles.savingsHeading}>Total Delivery Charges Saved</Text>
          </View>
          <View style={styles.priceView}>
            <Text style={styles.savingsAmount}>
              {strings.common.Rs}
              {totalCircleSavings?.deliverySavings.toFixed(2) || 0}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      {renderCircleExpiryBanner()}
      {((totalCircleSavings?.totalSavings + totalCircleSavings?.callsUsed) > 0) ? 
        renderCircleSavings() : renderViewCarousel()}
    </View>
  );
};

const styles = StyleSheet.create({
  circleLogo: {
    resizeMode: 'contain',
    width: 35,
    height: 30,
    marginRight: 10,
  },
  expiryBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  savingsCard: {
    ...theme.viewStyles.cardViewStyle,
    padding: 20,
    margin: 10,
    width: '100%',
  },
  savingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '73%',
  },
  savingsHeading: {
    ...theme.viewStyles.text('M', 12, '#02475B', 1, 20, 0.35),
    marginLeft: 10,
  },
  savingsAmount: {
    ...theme.viewStyles.text('SB', 14, '#00B38E', 1, 18, 0.35),
    textAlign: 'right',
  },
  savingsIcon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  saveCircleContainer: {
    ...theme.viewStyles.cardViewStyle,
    padding: 10,
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
  },
  doctorIcon: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
  },
  priceView: {
    width: '25%',
  },
  sliderDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  sliderDots: {
    height: 6,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 8,
    justifyContent: 'flex-start',
  },
  howToHeader: {
    ...theme.viewStyles.text('M', 14, '#02475B', 1, 18),
    paddingLeft: 15,
    marginBottom: 7,
  }
});
