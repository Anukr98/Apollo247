import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CovidOrange } from '@aph/mobile-patients/src/components/ui/Icons';
import { cardWidth } from '@aph/mobile-patients/src/components/ConsultRoom/Components/ConsultedDoctorsCard';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';

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
    height: 160,
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
  orderNoticeView: { marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between' },
  orderNoticeIcon: { height: 15, width: '5%', borderRadius: 5 },
  orderNoticeTitle: { height: 15, width: '93%', borderRadius: 5 },
  orderNoticeDescription: { height: 45, width: '100%', borderRadius: 5 },
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
    borderRadius: 6,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    height: 150,
    width: '90%',
    margin: 16,
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
    borderRadius: 6,
    justifyContent: 'center',
  },
  vaccineAppointmentBlock: {
    height: 210,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
  },

  postShareAppointmentBlock: {
    height: 100,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
  },

  vaccinesHospitalLoader: {
    height: 280,
    borderRadius: 10,
    width: '100%',
    marginVertical: 8,
  },
  vaccineDetailHeader: {
    height: 214,
    width: '100%',
    marginHorizontal: 0,
  },
  vaccineHeaderMessage: {
    height: 20,
    borderRadius: 5,
    marginTop: 10,
    width: '40%',
    alignSelf: 'center',
  },
  separatorStyle: {
    height: 0.5,
    width: '110%',
    marginTop: 11,
    backgroundColor: '#D6CEE3',
  },
  covidButtonShimmer: {
    borderRadius: 10,
    width: 145,
    height: 42,
    marginTop: 10,
    marginLeft: 7,
  },
  couponBlock: {
    height: 200,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
  },
  doctorDetails: {
    height: 105,
    width: '100%',
  },
  dateSlots: {
    height: 54,
    width: 101,
    borderRadius: 10,
  },
  totalSlots: {
    marginLeft: 20,
    width: 100,
    height: 15,
  },
  slotsButton: {
    ...theme.viewStyles.cardViewStyle,
    width: 90,
    marginRight: 8,
    marginTop: 12,
    height: 40,
  },
  itemPrice: {
    ...theme.viewStyles.cardViewStyle,
    width: '90%',
    marginRight: 5,
    marginTop: 5,
    height: 50,
    zIndex: 1,
  },
  itemPackagePrice: {
    ...theme.viewStyles.cardViewStyle,
    width: '100%',
    marginRight: 5,
    marginTop: 5,
    height: 60,
    zIndex: 1,
  },
  rowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pharmaFetchAddressTextShimmer: {
    borderRadius: 10,
    height: 150,
    width: 150,
    margin: 12,
  },
  prescriptionOption: {
    borderRadius: 5,
    borderColor: '#D3D3D3',
    borderWidth: 0.5,
    height: 250,
    width: '95%',
    margin: 10,
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
    <LinearGradientComponent
      colors={['#FFEEDB', '#FFFCFA']}
      style={{
        marginVertical: 6,
        marginHorizontal: 16,
        padding: 6,
        borderWidth: 1,
        borderColor: '#F9D5B4',
        borderRadius: 6,
        width: '90%',
      }}
    >
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
    </LinearGradientComponent>
  );
};

export const renderBannerShimmer = () => {
  return (
    <View>
      <ShimmerPlaceHolder LinearGradient={LinearGradient} shimmerStyle={styles.homeBanner} />
      <View style={styles.sliderDotsContainer}>
        <View style={styles.sliderDots} />
        <View style={styles.sliderDots} />
        <View style={styles.sliderDots} />
      </View>
    </View>
  );
};

export const renderOffersForYouShimmer = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      <ShimmerPlaceHolder
        shimmerColors={['#FFE7AA', '#FCDCFF']}
        shimmerStyle={{
          height: 150,
          marginRight: 12,
          marginBottom: 12,
          borderRadius: 6,
          width: width - 32,
        }}
      />
    </View>
  );
};

export const renderGlobalSearchShimmer = () => {
  return (
    <View
      style={{
        width: width,
        marginBottom: 6,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        height: '100%',
        paddingBottom: 16,
      }}
    >
      <View
        style={{
          height: 1.5,
          backgroundColor: '#D4D4D4',
          marginBottom: 4,
          marginHorizontal: -16,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#EAF6FF',
          marginVertical: 16,
          paddingVertical: 8,
        }}
      >
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{
            ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 24),
            marginLeft: 14,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{ width: 25, height: 25 }}
        />
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{
            ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
            marginLeft: 14,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FEE7DA',
          marginVertical: 16,
          paddingVertical: 8,
        }}
      >
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{
            ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 24),
            marginLeft: 14,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{ width: 25, height: 25 }}
        />
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{
            ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
            marginLeft: 14,
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{ width: 25, height: 25 }}
        />
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{
            ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
            marginLeft: 14,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#E5FFFD',
          marginVertical: 16,
          paddingVertical: 8,
        }}
      >
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{
            ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 24),
            marginLeft: 14,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{ width: 25, height: 25 }}
        />
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{
            ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
            marginLeft: 14,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{ width: 25, height: 25 }}
        />
        <ShimmerPlaceHolder
          shimmerColors={shimmerColors}
          LinearGradient={LinearGradient}
          shimmerStyle={{
            ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
            marginLeft: 14,
          }}
        />
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

export const OrderDelayNoticeShimmer = () => {
  return (
    <>
      <View style={styles.orderNoticeView}>
        <ShimmerPlaceHolder LinearGradient={LinearGradient} shimmerStyle={styles.orderNoticeIcon} />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          shimmerStyle={styles.orderNoticeTitle}
        />
      </View>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerStyle={styles.orderNoticeDescription}
      />
    </>
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

export const renderVaccinesHospitalSlotsLoaderShimmer = () => {
  return (
    <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
      <ShimmerPlaceHolder
        shimmerColors={[theme.colors.LIGHT_GRAY, theme.colors.WHITE]}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.vaccinesHospitalLoader}
      />
    </View>
  );
};

export const renderVaccinesTimeSlotsLoaderShimmer = () => {
  return (
    <View style={{ marginVertical: 10, marginHorizontal: 20 }}>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.vaccinesHospitalLoader, { height: 90 }]}
      />
    </View>
  );
};

export const renderVaccineBookingListShimmer = () => {
  return (
    <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.vaccineAppointmentBlock}
      />
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.vaccineAppointmentBlock}
      />

      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.vaccineAppointmentBlock}
      />
    </View>
  );
};

export const renderVaccineDetailShimmer = () => {
  return (
    <View style={{}}>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.vaccineDetailHeader}
      />
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.vaccineHeaderMessage, { width: '70%' }]}
      />

      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.vaccineHeaderMessage, { width: '40%', marginTop: 11 }]}
      />
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.vaccineHeaderMessage, { width: '50%' }]}
      />

      <View style={styles.separatorStyle} />

      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={[
          styles.vaccineHeaderMessage,
          { width: '40%', alignSelf: 'flex-start', marginTop: 20, marginHorizontal: 16 },
        ]}
      />

      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.appointMentBlock, { marginHorizontal: 16 }]}
      />

      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={[styles.vaccineHeaderMessage, { marginTop: 10, width: '100%' }]}
      />

      <View style={styles.separatorStyle} />
    </View>
  );
};

export const CovidButtonShimmer = () => (
  <ShimmerPlaceHolder
    shimmerColors={['#CCC', theme.colors.BUTTON_BG]}
    shimmerStyle={styles.covidButtonShimmer}
  />
);

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

export const renderDoctorDetailsShimmer = (style: any) => {
  return (
    <ShimmerPlaceHolder
      shimmerColors={shimmerColors}
      LinearGradient={LinearGradient}
      shimmerStyle={[styles.doctorDetails, style]}
    />
  );
};

export const renderDateSlotsShimmer = () => {
  return (
    <ShimmerPlaceHolder
      shimmerColors={shimmerColors}
      LinearGradient={LinearGradient}
      shimmerStyle={styles.dateSlots}
    />
  );
};

export const renderTotalSlotsShimmer = () => {
  return (
    <ShimmerPlaceHolder
      shimmerColors={shimmerColors}
      LinearGradient={LinearGradient}
      shimmerStyle={styles.totalSlots}
    />
  );
};

export const renderSlotItemShimmer = () => {
  return (
    <ShimmerPlaceHolder
      shimmerColors={shimmerColors}
      LinearGradient={LinearGradient}
      shimmerStyle={styles.slotsButton}
    />
  );
};
export const renderItemPriceShimmer = () => {
  return (
    <ShimmerPlaceHolder
      shimmerColors={shimmerColors}
      LinearGradient={LinearGradient}
      shimmerStyle={styles.itemPrice}
    />
  );
};

export const renderPackageItemPriceShimmer = () => {
  return (
    <ShimmerPlaceHolder
      shimmerColors={shimmerColors}
      LinearGradient={LinearGradient}
      shimmerStyle={styles.itemPackagePrice}
    />
  );
};

export const renderAppointmentCountShimmer = () => {
  return (
    <ShimmerPlaceHolder
      shimmerColors={['#E8E8E8', theme.colors.SKY_BLUE]}
      LinearGradient={LinearGradient}
      shimmerStyle={{
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E8E8E8',
        borderRadius: 6,
      }}
    />
  );
};

export const renderDiagnosticWidgetShimmer = (showHeading: boolean) => {
  return (
    <View style={{ marginLeft: 16 }}>
      {showHeading && renderDiagnosticWidgetHeadingShimmer()}
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.diagnosticsCardBottom}
      />
    </View>
  );
};

export const renderDiagnosticWidgetHeadingShimmer = () => {
  return (
    <View style={styles.rowStyle}>
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
  );
};

export const renderPostShareAppointmentLoadingShimmer = () => {
  return (
    <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.postShareAppointmentBlock}
      />
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.postShareAppointmentBlock}
      />

      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.postShareAppointmentBlock}
      />
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.postShareAppointmentBlock}
      />
      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.postShareAppointmentBlock}
      />

      <ShimmerPlaceHolder
        shimmerColors={shimmerColors}
        LinearGradient={LinearGradient}
        shimmerStyle={styles.postShareAppointmentBlock}
      />
    </View>
  );
};

export const renderPharmaFetchAddressHeadingShimmer = () => {
  return (
    <View style={[styles.rowStyle, { marginTop: 16 }]}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={styles.pharmaFetchAddressTextShimmer}
      />
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={styles.pharmaFetchAddressTextShimmer}
      />
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={styles.pharmaFetchAddressTextShimmer}
      />
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={styles.pharmaFetchAddressTextShimmer}
      />
    </View>
  );
};

export const pharmaPrescriptionShimmer = () => {
  return (
    <View style={{ backgroundColor: '#f0f1ec', paddingHorizontal: 8 }}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerStyle={styles.prescriptionOption}
      />
    </View>
  );
};
