import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { VegetarianIcon, NonVegetarianIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { NewPharmaOverview } from '@aph/mobile-patients/src/helpers/apiCalls';
import { filterHtmlContent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { PrecautionWarnings } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/PrecautionWarnings';

export interface PharmaMedicineInfoProps {
  name: string;
  pharmaOverview?: NewPharmaOverview | null;
  vegetarian: boolean;
  key_ingredient?: string | null;
  size?: string | null;
  flavour_fragrance?: string | null;
  colour?: string | null;
  variant?: string | null;
}

export const PharmaMedicineInfo: React.FC<PharmaMedicineInfoProps> = (props) => {
  const {
    name,
    pharmaOverview,
    vegetarian,
    key_ingredient,
    size,
    flavour_fragrance,
    colour,
    variant,
  } = props;

  const [showAllContent, setShowAllContent] = useState<boolean>(false);
  const pharmaUses = pharmaOverview?.HowToTake;
  const pharmaSideEffects = pharmaOverview?.SideEffects;
  const storagePlace = pharmaOverview?.StoragePlace;
  const storage = pharmaOverview?.Storage;
  const coldChain = pharmaOverview?.ColdChain;

  const renderUses = (medicineStorage: string) => {
    const storageInfo = medicineStorage.replace(/\$name/gi, name.toLocaleLowerCase());
    return (
      <View>
        <Text style={styles.subHeading}>{`Uses of ${name.toLocaleLowerCase()}`}</Text>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{storageInfo}</Text>
      </View>
    );
  };

  const renderSideEffects = (medicineSideEffects: string) => {
    const sideEffectsHtml = filterHtmlContent(medicineSideEffects);
    const text = sideEffectsHtml.replace(/(<([^>]+)>)/gi, ' ').trim();
    const sideEffects = text.replace(/\$name/gi, name.toLocaleLowerCase());
    return (
      <View>
        <Text style={styles.subHeading}>{`Side Effects of ${name.toLocaleLowerCase()}`}</Text>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{sideEffects}</Text>
      </View>
    );
  };

  const renderVegetarianIcon = () => {
    return vegetarian ? (
      <VegetarianIcon style={styles.vegIcon} />
    ) : (
      <NonVegetarianIcon style={styles.vegIcon} />
    );
  };

  const renderStorage = () => {
    const pharmaStorage = `${storagePlace} ${storage} ${coldChain}`;
    const storageInfo = pharmaStorage.replace(/\$name/gi, name.toLocaleLowerCase());
    const pharmaStorageInfo = storageInfo.replace(/u00ba/gi, strings.common.DegreeSymbol);
    return (
      <View>
        <Text style={styles.subHeading}>Storage</Text>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{pharmaStorageInfo}</Text>
      </View>
    );
  };

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

  const renderPrecautionsAndWarnings = () => (
    <PrecautionWarnings name={name} pharmaOverview={pharmaOverview} />
  );

  const renderShowMore = () => {
    return (
      <TouchableOpacity onPress={() => setShowAllContent(!showAllContent)}>
        <Text style={styles.showMoreText}>{showAllContent ? `SHOW LESS` : `SHOW MORE`}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.cardStyle}>
      {!!pharmaUses && renderUses(pharmaUses)}
      {showAllContent && (
        <>
          {!!renderSideEffects && renderSideEffects(pharmaSideEffects)}
          {renderVegetarianIcon()}
          {(!!storagePlace || !!storage || !!coldChain) && renderStorage()}
          {!!key_ingredient && renderKeyIngrediant()}
          {!!size && renderSize()}
          {!!flavour_fragrance && renderFlavour()}
          {!!colour && renderColor()}
          {!!variant && renderVariant()}
          {!!pharmaOverview && renderPrecautionsAndWarnings()}
        </>
      )}
      {renderShowMore()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: 10,
  },
  subHeading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 25, 0.35),
    marginVertical: 10,
  },
  vegIcon: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
    marginTop: 10,
  },
  showMoreText: {
    ...theme.viewStyles.text('SB', 13, '#FC9916', 1, 25, 0.35),
    textAlign: 'right',
  },
});
