import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { VegetarianIcon, NonVegetarianIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { NewPharmaOverview } from '@aph/mobile-patients/src/helpers/apiCalls';
import { filterHtmlContent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { PharmaMedicineInfo } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/PharmaMedicineInfo';

export interface ProductInfoProps {
  name: string;
  description: string;
  isReturnable: boolean;
  vegetarian?: 'Yes' | 'No';
  storage?: string | null;
  key_ingredient?: string | null;
  key_benefits?: string | null;
  safety_information?: string | null;
  size?: string | null;
  flavour_fragrance?: string | null;
  colour?: string | null;
  variant?: string | null;
  expiryDate?: string | null;
  isPharma: boolean;
  pharmaOverview?: NewPharmaOverview | null;
}

export const ProductInfo: React.FC<ProductInfoProps> = (props) => {
  const {
    name,
    description,
    isReturnable,
    vegetarian,
    storage,
    key_ingredient,
    key_benefits,
    size,
    flavour_fragrance,
    colour,
    variant,
    expiryDate,
    isPharma,
    pharmaOverview,
    safety_information,
  } = props;

  const [numberOfLines, setNumberOfLines] = useState<number>(2);
  const [maxLines, setMaxLines] = useState<number>(2);

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
              if (numberOfLines != maxLines) {
                setMaxLines(numberOfLines);
              } else {
                setMaxLines(2);
              }
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
            {numberOfLines > 2 && numberOfLines === maxLines && (
              <Text style={styles.readMoreText}>READ LESS</Text>
            )}
          </TouchableOpacity>
        </View>
      )
    );
  };

  const renderKeyBenefits = () => {
    const text = key_benefits?.replace(/u2022/, '');
    const keyBenefit = text?.replace(/u2022/gi, '.').trim();
    return (
      <View>
        <Text style={styles.subHeading}>Key Benefits</Text>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{keyBenefit}</Text>
      </View>
    );
  };

  const renderSafetyInfo = () => {
    const text = safety_information?.replace(/u2022/, '');
    const safetyInfo = text?.replace(/u2022/gi, '.').trim();
    return (
      <View>
        <Text style={styles.subHeading}>Key Benefits</Text>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{safetyInfo}</Text>
      </View>
    );
  };

  const renderStorage = () => {
    return (
      <View>
        <Text style={styles.subHeading}>Storage</Text>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{storage}</Text>
      </View>
    );
  };

  const renderKeyIngredient = () => (
    <View>
      <Text style={styles.subHeading}>Key Ingredient</Text>
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
      {isPharma ? (
        <PharmaMedicineInfo
          name={name}
          pharmaOverview={pharmaOverview}
          vegetarian={vegetarian === 'Yes'}
          key_ingredient={key_ingredient}
          size={size}
          flavour_fragrance={flavour_fragrance}
          colour={colour}
          variant={variant}
        />
      ) : (
        <>
          {!!storage && renderStorage()}
          {!!vegetarian && renderVegetarianIcon()}
          {!!key_benefits && renderKeyBenefits()}
          {!!key_ingredient && renderKeyIngredient()}
          {!!size && renderSize()}
          {!!flavour_fragrance && renderFlavour()}
          {!!colour && renderColor()}
          {!!variant && renderVariant()}
          {!!safety_information && renderSafetyInfo()}
        </>
      )}
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
