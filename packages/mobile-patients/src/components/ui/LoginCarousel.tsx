import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, Image, StyleSheet } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getLoginCarouselBannerTexts } from '@aph/mobile-patients/src/helpers/apiCalls';

interface Props {
  focused: boolean;
}

export const LoginCarousel: React.FC<Props> = ({ focused }) => {
  interface Data {
    image: string;
    text: string;
  }
  const [data, setdata] = useState<Array<Data>>([]);
  const [slideIndex, setSlideIndex] = useState(0);

  const { width, height } = Dimensions.get('window');
  let imageHeight = height * 0.25;

  useEffect(() => {
    getBannerTexts();
  }, []);

  const getBannerTexts = async () => {
    try {
      const { data } = await getLoginCarouselBannerTexts();
      const { consult, diagnostic, pharma } = data?.data || {};
      setdata([
        {
          image: require('@aph/mobile-patients/src/images/home/login_banner1.webp'),
          text: pharma?.title,
        },
        {
          image: require('@aph/mobile-patients/src/images/home/login_banner2.webp'),
          text: diagnostic?.title,
        },
        {
          image: require('@aph/mobile-patients/src/images/home/login_banner3.webp'),
          text: consult?.title,
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const renderLoginCarousel = ({ item }: { item: Data }) => {
    return (
      <View>
        <Image source={item?.image} resizeMode="contain" style={{ height: imageHeight, width }} />
        <View style={styles.descriptionContainer}>
          <Text style={styles.imageTitle}>{item?.text}</Text>
        </View>
      </View>
    );
  };

  const renderDot = (active: boolean) => (
    <View
      style={[
        styles.sliderDots,
        {
          backgroundColor: active ? colors.TURQUOISE_LIGHT_BLUE : colors.CAROUSEL_INACTIVE_DOT,
        },
      ]}
    />
  );

  return (
    <View style={{ marginTop: '5%', height: height * 0.4 }}>
      <Carousel
        onSnapToItem={setSlideIndex}
        sliderWidth={width}
        itemWidth={width}
        loop
        autoplay
        data={data}
        renderItem={renderLoginCarousel}
      />
      <View style={styles.dotsContainer}>
        {data.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  sliderDots: {
    height: 2,
    borderRadius: 60,
    marginHorizontal: 4,
    width: 20,
    justifyContent: 'flex-start',
  },
  imageTitle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.LOGIN_BANNER_TEXT,
    textAlign: 'center',
  },
  descriptionContainer: {
    alignItems: 'center',
    marginTop: 40,
    width: '80%',
    alignSelf: 'center',
  },
});
