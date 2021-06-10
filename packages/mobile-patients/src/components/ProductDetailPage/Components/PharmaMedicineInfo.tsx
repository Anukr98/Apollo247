import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NewPharmaOverview } from '@aph/mobile-patients/src/helpers/apiCalls';
import { filterHtmlContent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { PrecautionWarnings } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/PrecautionWarnings';
import HTML from 'react-native-render-html';

export interface PharmaMedicineInfoProps {
  name: string;
  pharmaOverview?: NewPharmaOverview | null;
}

export const PharmaMedicineInfo: React.FC<PharmaMedicineInfoProps> = (props) => {
  const { name, pharmaOverview } = props;

  const pharmaUses = pharmaOverview?.HowToTake;
  const usesOfProduct = pharmaOverview?.Uses;
  const pharmaBenefits = pharmaOverview?.MedicinalBenefits;
  const pharmaSideEffects = pharmaOverview?.SideEffects;
  const storagePlace = pharmaOverview?.StoragePlace;
  const storage = pharmaOverview?.Storage;
  const coldChain = pharmaOverview?.ColdChain;

  const renderHtmlContent = (title: string, content: string) => (
    <View>
      <Text style={styles.subHeading}>{title}</Text>
      <HTML
        html={content}
        baseFontStyle={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}
        imagesMaxWidth={Dimensions.get('window').width}
        ignoredStyles={['line-height', 'margin-bottom']}
      />
    </View>
  );

  const renderUses = () => {
    const medicine_use = filterHtmlContent(pharmaUses);
    let medicineUse = medicine_use.replace(/\$name/gi, name);
    let pharma_benefits = filterHtmlContent(pharmaBenefits);
    pharma_benefits = pharma_benefits.replace(/\$name/gi, name);
    return (
      <View>
        {!!medicineUse.length && renderHtmlContent(`Directions of Use`, medicineUse)}
        {!!pharma_benefits.length && renderHtmlContent(`Medicinal Benefits`, pharma_benefits)}
      </View>
    );
  };

  const renderUsesOfProduct = () => {
    const medicine_uses = filterHtmlContent(usesOfProduct);
    let medicineUses = medicine_uses.replace(/\$name/gi, name);
    return !!medicineUses.length && renderHtmlContent(`Uses of ${name}`, medicineUses);
  };

  const renderSideEffects = (medicineSideEffects: string) => {
    const sideEffectsHtml = filterHtmlContent(medicineSideEffects);
    const sideEffects = sideEffectsHtml.replace(/\$name/gi, name);
    return !!sideEffects ? renderHtmlContent(`Side Effects of ${name}`, sideEffects) : null;
  };

  const renderStorage = () => {
    const pharmaStorage = `${storagePlace} ${storage} ${coldChain}`;
    const storageInfo = pharmaStorage.replace(/\$name/gi, name);
    const pharmaStorageInfo = storageInfo.replace(/u00ba/gi, strings.common.DegreeSymbol);
    return (
      <View>
        <Text style={styles.subHeading}>Storage</Text>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{pharmaStorageInfo}</Text>
      </View>
    );
  };

  const renderPrecautionsAndWarnings = () => (
    <PrecautionWarnings name={name} pharmaOverview={pharmaOverview} />
  );

  return (
    <View style={styles.cardStyle}>
      {!!usesOfProduct && renderUsesOfProduct()}
      {(!!pharmaUses || !!pharmaBenefits) && renderUses()}
      {(!!storagePlace || !!storage || !!coldChain) && renderStorage()}
      {!!renderSideEffects && renderSideEffects(pharmaSideEffects)}
      {!!pharmaOverview && renderPrecautionsAndWarnings()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginBottom: 10,
  },
  subHeading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 25, 0.35),
    marginVertical: 10,
  },
  heading: {
    ...theme.viewStyles.text('SB', 17, '#02475B', 1, 25, 0.35),
    marginBottom: 2,
  },
});
