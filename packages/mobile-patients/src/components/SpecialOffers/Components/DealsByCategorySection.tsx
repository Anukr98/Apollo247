import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image as ImageNative,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { productsThumbnailUrl } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { SpecialOffersCategoryApiResponse } from '@aph/mobile-patients/src/helpers/apiCalls';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

export interface DealsByCategoryProps extends NavigationScreenProps<{}> {
  categoryData: SpecialOffersCategoryApiResponse[];
}

export const DealsByCategorySection: React.FC<DealsByCategoryProps> = (props) => {
  const categoryData = props.categoryData;
  const title = 'DEALS BY CATEGORY';

  const onPressImage = (id: number, title: string) => {
    props.navigation.navigate(AppRoutes.MedicineListing, {
      category_id: id,
      title: title || 'Products',
    });
  };

  const renderItem = (imgUrl: string, item: SpecialOffersCategoryApiResponse) => {
    return (
      <View style={styles.categoryContainer}>
        <View style={styles.categoryBoxStyles}>
          <TouchableOpacity onPress={() => onPressImage(item?.category_id, item?.title)}>
            <View style={styles.circleShape}>
              <ImageNative
                source={{ uri: imgUrl }}
                style={styles.imageContainerStyle}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.textStyle}>{item?.title}</Text>
        </View>
      </View>
    );
  };

  const renderHeading = (title: string) => {
    return (
      <View style={styles.headingContainer}>
        <SectionHeaderComponent sectionTitle={title} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeading(title)}
      <View>
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoryData}
          renderItem={({ item, index }) => {
            const imgUrl = productsThumbnailUrl(item?.image_url);
            return renderItem(imgUrl, item);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    flexGrow: 1,
    paddingBottom: 20,
  },
  headingContainer: {
    marginTop: 5,
  },
  categoryContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,
    paddingTop: 10,
  },
  categoryBoxStyles: {
    width: 80,
    marginRight: 10,
  },
  circleShape: {
    width: 76,
    height: 71,
    borderRadius: 76 / 2,
    backgroundColor: theme.colors.CARD_BG,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    paddingTop: 12,
    fontWeight: '500',
    lineHeight: 15.6,
    alignSelf: 'center',
    textAlign: 'center',
    color: '#007C9D',
  },
  imageContainerStyle: {
    height: 35,
    width: 45,
    alignSelf: 'center',
    top: 15,
  },
});
