import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import HTML from 'react-native-render-html';
import { VegetarianIcon, NonVegetarianIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface ProductInfoProps {
  description: string;
  isReturnable: boolean;
  vegetarian?: 'Yes' | 'No';
  storage?: string | null;
  key_ingredient?: string | null;
  size?: string | null;
  flavour_fragrance?: string | null;
  colour?: string | null;
  variant?: string | null;
  expiryDate?: string | null;
  isPharma: boolean;
}

export const ProductInfo: React.FC<ProductInfoProps> = (props) => {
  const {
    description,
    isReturnable,
    vegetarian,
    storage,
    key_ingredient,
    size,
    flavour_fragrance,
    colour,
    variant,
    expiryDate,
    isPharma,
  } = props;

  const [numberOfLines, setNumberOfLines] = useState<number>(2);
  const [maxLines, setMaxLines] = useState<number>(2);

  const filterHtmlContent = (content: string = '') => {
    return content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;rn/g, '>')
      .replace(/&gt;r/g, '>')
      .replace(/&gt;/g, '>')
      .replace(/\.t/g, '.');
  };

  const onTextLayout = (e) => {
    setNumberOfLines(e.nativeEvent.lines.length);
  };

  const renderDescription = () => {
    const descriptionHtml = filterHtmlContent(description);
    const text = descriptionHtml.replace(/(<([^>]+)>)/gi, ' ').trim();
    return (
      !!text.length && (
        <View>
          <Text style={styles.subHeading}>Description</Text>
          <TouchableOpacity
            onPress={() => {
              setMaxLines(numberOfLines);
            }}
          >
            <Text
              numberOfLines={maxLines}
              onTextLayout={onTextLayout}
              style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}
            >
              {text}
            </Text>
            {numberOfLines > 2 && numberOfLines != maxLines && (
              <Text style={styles.readMoreText}>READ MORE</Text>
            )}
          </TouchableOpacity>
        </View>
      )
    );
  };

  const renderStorage = () => (
    <View>
      <Text style={styles.subHeading}>Storage</Text>
      <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{storage}</Text>
    </View>
  );

  const renderKeyIngrediant = () => (
    <View>
      <Text style={styles.subHeading}>Key Ingrediant</Text>
      <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{key_ingredient}</Text>
    </View>
  );

  const renderSize = () => (
    <View>
      <Text style={styles.subHeading}>Size</Text>
      <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{size}</Text>
    </View>
  );

  const renderFlavour = () => (
    <View>
      <Text style={styles.subHeading}>Flavour</Text>
      <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{flavour_fragrance}</Text>
    </View>
  );

  const renderColor = () => (
    <View>
      <Text style={styles.subHeading}>Color</Text>
      <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{colour}</Text>
    </View>
  );

  const renderVariant = () => (
    <View>
      <Text style={styles.subHeading}>Variant</Text>
      <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{variant}</Text>
    </View>
  );

  const renderVegetarianIcon = () => {
    return vegetarian === 'Yes' ? (
      <VegetarianIcon style={styles.vegIcon} />
    ) : (
      <NonVegetarianIcon style={styles.vegIcon} />
    );
  };

  const renderOtherInformation = () => (
    <View style={styles.otherInfo}>
      <Text style={styles.subHeading}>Other Information</Text>
      <View style={styles.flexRow}>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{`This item is `}</Text>
        <Text style={theme.viewStyles.text('SB', 14, '#02475B', 1, 20)}>
          {isReturnable ? `Returnable. ` : `Not Returnable. `}
        </Text>
      </View>
      {!!expiryDate && (
        <View style={styles.flexRow}>
          <Text
            style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}
          >{`Expires on or after - `}</Text>
          <Text style={theme.viewStyles.text('SB', 14, '#02475B', 1, 20)}>{expiryDate}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.cardStyle}>
      <Text style={styles.heading}>{isPharma ? `Medicine Detail` : `Product Detail`}</Text>
      {!!description && renderDescription()}
      {!!vegetarian && renderVegetarianIcon()}
      {!!storage && renderStorage()}
      {!!key_ingredient && renderKeyIngrediant()}
      {!!size && renderSize()}
      {!!flavour_fragrance && renderFlavour()}
      {!!colour && renderColor()}
      {!!variant && renderVariant()}
      {renderOtherInformation()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: 10,
  },
  heading: {
    ...theme.viewStyles.text('SB', 17, '#02475B', 1, 25, 0.35),
    marginBottom: 2,
  },
  subHeading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 25, 0.35),
    marginVertical: 10,
  },
  flexRow: {
    flexDirection: 'row',
  },
  otherInfo: {
    marginTop: 10,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#02475B',
    borderTopColor: '#02475B',
    borderTopWidth: 0.5,
    borderStyle: 'dashed',
  },
  vegIcon: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
    marginTop: 7,
  },
  readMoreText: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 30),
    textAlign: 'right',
  },
});
