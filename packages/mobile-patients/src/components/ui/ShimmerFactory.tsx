import React from 'react';
import {
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CovidOrange } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { cardWidth } from '@aph/mobile-patients/src/components/ConsultRoom/Components/ConsultedDoctorsCard';

const { width, height } = Dimensions.get('window');
const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

const shimmerColors = ['#E8E5E5', '#F2F2F2', '#F0F0F0'];

const styles = StyleSheet.create({
  covidContainer: {
    marginHorizontal: 20,
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 20,
  },
  covidTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 10,
  },
  covidIcon: {
    width: 20,
    height: 20,
  },
  covidTitle: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHERPA_BLUE),
    marginLeft: 10,
    width: width - 100,
  },
  planContainer: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: 5,
  },

  subPlanOne: {
    flex: 0.2,
  },

  subPlanTwo: {
    flex: 0.3,
  },

  subPlanThree: {
    flex: 0.5,
    alignItems: 'center',
  },

  circleLogo: {
    alignSelf: 'center',
    width: 46,
    height: 29,
  },
  sliderDots: {
    height: 6,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 8,
    justifyContent: 'flex-start',
    backgroundColor: theme.colors.CAROUSEL_INACTIVE_DOT,
    width: 6,
  },

  sliderDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: 10,
    alignSelf: 'center',
  },
  listItemCardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 11,
    paddingLeft: 18,
    paddingRight: 25,
  },

  appointMentBlock: {
    height: 180,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
  },
  covidVaccinationShimmer: {
    borderRadius: 10,
    height: 40,
    width: '43%',
    margin: 10,
  },
  circleCard: {
    borderRadius: 10,
    height: 100,
    width: '45%',
    margin: 10,
  },
  healthRecordLine: {
    height: 27,
    borderRadius: 10,
    width: 40,
    marginVertical: 10,
    marginRight: 20,
  },

  banner1: {
    height: 145,
    width: '100%',
  },
  medicineContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.WHITE,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineCard1: {
    borderRadius: 10,
    height: 47,
    width: '95%',
    margin: 10,
  },
  medicinecCard2: {
    borderRadius: 10,
    height: 100,
    width: '95%',
    margin: 10,
  },
  medicineCard3: {
    borderRadius: 5,
    height: 150,
    width: '95%',
    margin: 10,
  },
  sortBox: {
    borderWidth: 0.5,
    borderColor: theme.colors.ASTRONAUT_BLUE,
    padding: 5,
    marginHorizontal: 10,
    borderRadius: 3,
    width: '40%',
  },
  sortText: {
    height: 20,
    width: '80%',
    borderRadius: 10,
  },
  offer: {
    height: 20,
    marginHorizontal: 10,
    width: '40%',
    borderRadius: 10,
  },
  diagnosticBanner: {
    height: 170,
    width: '100%',
  },
  diagnosticCard1: {
    borderRadius: 10,
    height: 47,
    width: '95%',
    margin: 10,
    marginTop: 30,
  },
  diagnosticCard2: {
    borderRadius: 10,
    height: 20,
    width: '43%',
    margin: 10,
  },
  diagnosticCard3: {
    borderRadius: 10,
    height: 179,
    width: '83%',
    margin: 10,
  },
  diagnosticsCardBottom: {
    borderRadius: 10,
    height: 179,
    width: '90%',
    margin: 10,
  },
  homeBanner: {
    borderRadius: 5,
    borderColor: '#D3D3D3',
    borderWidth: 0.5,
    height: 150,
    width: '95%',
    margin: 10,
  },
  subPlanTwoShimmer1: {
    borderRadius: 5,
    height: 10,
    width: 100,
    margin: 3,
  },
  subPlanTwoShimmer2: {
    borderRadius: 5,
    height: 10,
    width: 60,
    margin: 3,
  },
  subPlanThreeShimmer: {
    borderRadius: 10,
    width: 155,
    height: 32,
    margin: 3,
  },
  vaccinationContainer: {
    backgroundColor: '#f0f1ec',
    paddingBottom: 0,
    paddingTop: 0,
  },

  oneApolloMemebershipCard: {
    height: 175,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
  },

  oneApolloMemebershipCardFooter: {
    height: 50,
    borderRadius: 10,
    width: '70%',
    marginTop: -35,
    marginHorizontal: 50,
  },
  consultedDoctors: {
    marginTop: 10,
    ...theme.viewStyles.cardViewStyle,
    height: 58,
    width: cardWidth,
    marginBottom: 20,
    marginLeft: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  couponBlock: {
    height: 200,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
  },
});

export const renderCovidVaccinationShimmer = () => {
  return (
    <View style={styles.vaccinationContainer}>
      <View style={styles.covidContainer}>
        <View style={styles.covidTitleContainer}>
          <CovidOrange style={styles.covidIcon} />
          <Text style={styles.covidTitle}>Covid-19 Vaccination</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ShimmerPlaceHolder
            shimmerColors={shimmerColors}
            LinearGradient={LinearGradient}
            shimmerStyle={styles.covidVaccinationShimmer}
          />
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            shimmerStyle={styles.covidVaccinationShimmer}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            shimmerStyle={styles.covidVaccinationShimmer}
          />
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            shimmerStyle={styles.covidVaccinationShimmer}
          />
        </View>
      </View>
    </View>
  );
};

export const renderCircleShimmer = () => {
  return (
    <View style={{ paddingTop: 10 }}>
      <View style={styles.planContainer}>
        <View style={styles.subPlanOne}>
          <Image
            style={styles.circleLogo}
            source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.webp')}
          />
        </View>

        <View style={styles.subPlanTwo}>
          <ShimmerPlaceHolder
            shimmerColors={shimmerColors}
            LinearGradient={LinearGradient}
            shimmerStyle={styles.subPlanTwoShimmer1}
          />
          <ShimmerPlaceHolder
            shimmerColors={shimmerColors}
            LinearGradient={LinearGradient}
            shimmerStyle={styles.subPlanTwoShimmer2}
          />
        </View>

        <View style={styles.subPlanThree}>
          <ShimmerPlaceHolder
            shimmerColors={['#CCC', theme.colors.BUTTON_BG]}
            shimmerStyle={styles.subPlanThreeShimmer}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={styles.circleCard}
        />
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={styles.circleCard}
        />
      </View>
    </View>
  );
};

export const renderBannerShimmer = () => {
  return (
    <View style={{ backgroundColor: '#f0f1ec', paddingHorizontal: 8 }}>
      <ShimmerPlaceHolder LinearGradient={LinearGradient} shimmerStyle={styles.homeBanner} />
      <View style={styles.sliderDotsContainer}>
        <View style={styles.sliderDots} />
        <View style={styles.sliderDots} />
        <View style={styles.sliderDots} />
      </View>
    </View>
  );
};

export const renderTestDiagonosticsShimmer = () => {
  return (
    <View style={{ backgroundColor: '#f0f1ec' }}>
      <View style={{ backgroundColor: '#f0f1ec' }}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerStyle={styles.diagnosticBanner}
        />
        <View style={[styles.sliderDotsContainer, { position: 'absolute', bottom: 20 }]}>
          <View style={styles.sliderDots} />
          <View style={styles.sliderDots} />
          <View style={styles.sliderDots} />
        </View>
      </View>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={styles.diagnosticCard1}
      />
      <View style={{ flexDirection: 'row' }}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          shimmerStyle={styles.diagnosticCard2}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          shimmerStyle={styles.diagnosticCard2}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={styles.diagnosticCard3}
        />
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={styles.diagnosticCard3}
        />
      </View>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.diagnosticsCardBottom}
      />
    </View>
  );
};

export const renderMedicinesShimmer = () => {
  return (
    <View>
      <View style={styles.medicineContainer}>
        <View style={styles.sortBox}>
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
            style={{
              alignSelf: 'center',
            }}
            shimmerStyle={styles.sortText}
          />
        </View>

        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          shimmerStyle={styles.offer}
        />
      </View>
      <View style={{ backgroundColor: '#f0f1ec' }}>
        <ShimmerPlaceHolder LinearGradient={LinearGradient} shimmerStyle={styles.banner1} />
        <View style={[styles.sliderDotsContainer, { position: 'absolute', bottom: 20 }]}>
          <View style={styles.sliderDots} />
          <View style={styles.sliderDots} />
          <View style={styles.sliderDots} />
        </View>
      </View>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={styles.medicineCard1}
      />

      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={styles.medicinecCard2}
      />

      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={styles.medicineCard3}
      />
      <View style={styles.sliderDotsContainer}>
        <View style={styles.sliderDots} />
        <View style={styles.sliderDots} />
        <View style={styles.sliderDots} />
      </View>
    </View>
  );
};

export const renderMedicineBannerShimmer = () => {
  return (
    <View style={{ backgroundColor: '#f0f1ec' }}>
      <ShimmerPlaceHolder LinearGradient={LinearGradient} shimmerStyle={styles.banner1} />
      <View style={[styles.sliderDotsContainer, { position: 'absolute', bottom: 20 }]}>
        <View style={styles.sliderDots} />
        <View style={styles.sliderDots} />
        <View style={styles.sliderDots} />
      </View>
    </View>
  );
};

export const renderHealthRecordShimmer = () => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <ShimmerPlaceHolder
        shimmerColors={[theme.colors.LIGHT_GRAY, theme.colors.TEXT_LIGHT_BLUE]}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.healthRecordLine, { width: 40, marginRight: 20 }]}
      />
      <ShimmerPlaceHolder
        shimmerColors={[theme.colors.LIGHT_GRAY, theme.colors.TEXT_LIGHT_BLUE]}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.healthRecordLine, { width: '80%' }]}
      />
    </View>
  );
};

export const renderAppointmentShimmer = () => {
  return (
    <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.appointMentBlock}
      />
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.appointMentBlock}
      />
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.appointMentBlock}
      />
    </View>
  );
};

export const renderOneApolloMembershipShimmer = () => {
  return (
    <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.oneApolloMemebershipCard}
      />
      <ShimmerPlaceHolder
        shimmerColors={[theme.colors.LIGHT_GRAY, theme.colors.WHITE]}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.oneApolloMemebershipCardFooter}
      />
    </View>
  );
};

export const renderConsultedDoctorsShimmer = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.consultedDoctors}
      />
      <ShimmerPlaceHolder
        shimmerColors={[theme.colors.LIGHT_GRAY, theme.colors.WHITE]}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.consultedDoctors, { marginLeft: 10 }]}
      />
    </View>
  );
};

export const renderConsultedDoctorsTitleShimmer = () => {
  return (
    <ShimmerPlaceHolder
      shimmerColors={shimmerColors}
      LinearGradient={LinearGradient}
      shimmerStyle={{ paddingHorizontal: 20, width: 130 }}
    />
  );
};

export const renderCouponViewShimmer = () => {
  return (
    <View style={{ marginVertical: 10 }}>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.couponBlock}
      />
    </View>
  );
};
