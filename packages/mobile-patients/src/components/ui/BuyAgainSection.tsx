import {
  MedicineBuyAgain,
  MedicineIcon,
  MedicineRxIcon,
  RightArrowOrange,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import { productsThumbnailUrl } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image, ListItem, ListItemProps } from 'react-native-elements';

interface Props extends ListItemProps {
  products?: MedicineProduct[];
}

export const BuyAgainSection: React.FC<Props> = ({ products, ...props }) => {
  const renderProducts = () =>
    (products || []).map(({ name, thumbnail, is_prescription_required }) => (
      <View style={styles.innerSubtitleContainer}>
        <Image
          source={{ uri: productsThumbnailUrl(thumbnail) }}
          style={styles.productImage}
          placeholderStyle={styles.imagePlaceHolder}
          PlaceholderContent={is_prescription_required == 1 ? <MedicineRxIcon /> : <MedicineIcon />}
        />
        <Text style={styles.itemTextStyle} numberOfLines={2}>
          {name}
        </Text>
      </View>
    ));

  const renderProductsAndCta = () => (
    <View style={styles.subtitleContainer}>
      {renderProducts()}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleStyle}>{string.buyAgain}</Text>
        <RightArrowOrange style={styles.arrow} />
      </View>
    </View>
  );

  return (
    <ListItem
      title={string.lookingForBoughtPreviously}
      subtitle={renderProductsAndCta()}
      leftAvatar={<MedicineBuyAgain style={styles.icon} />}
      pad={20}
      containerStyle={styles.containerStyle}
      titleStyle={styles.titleStyle}
      subtitleStyle={styles.subtitleStyle}
      Component={TouchableOpacity}
      {...props}
    />
  );
};

const { text, card } = theme.viewStyles;
const { APP_YELLOW, LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  containerStyle: {
    ...card(),
    marginVertical: 0,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  titleStyle: {
    ...text('SB', 16, LIGHT_BLUE),
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  innerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(2, 71, 91, 0.5)',
    borderRadius: 3,
    padding: 3,
    marginVertical: 10,
    marginRight: 10,
  },
  subtitleStyle: {
    ...text('SB', 14, APP_YELLOW),
  },
  imagePlaceHolder: { backgroundColor: 'transparent' },
  itemTextStyle: {
    ...text('L', 9, LIGHT_BLUE),
    flex: 1,
  },
  productImage: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
  },
  icon: {
    height: 90,
    width: 45,
    resizeMode: 'contain',
  },
  arrow: {
    height: 10,
    width: 16,
    marginTop: 4,
    marginHorizontal: 5,
    resizeMode: 'contain',
  },
});
