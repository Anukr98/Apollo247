import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NewPharmaOverview } from '@aph/mobile-patients/src/helpers/apiCalls';
import { filterHtmlContent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { PrecautionWarnings } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/PrecautionWarnings';
import HTML from 'react-native-render-html';
import { FaqComponent } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/FaqComponent';

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
  const faqContent = pharmaOverview?.CompositionContentFAQs;
  const habitForming = pharmaOverview?.HabitForming;
  const dietAndLifeStyle = pharmaOverview?.DietAndLifestyle;
  const specialAdvise = pharmaOverview?.SpecialAdvise;
  const diseaseConditionGlossary = pharmaOverview?.DiseaseConditionGlossary;

  const renderHtmlContent = (title: string, content: string) => (
    <View>
      <Text style={styles.subHeading}>{title}</Text>
      <HTML
        html={content}
        baseFontStyle={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}
        imagesMaxWidth={Dimensions.get('window').width}
        ignoredStyles={[
          'line-height',
          'margin-bottom',
          'color',
          'text-align',
          'font-size',
          'font-family',
        ]}
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

  const renderAdvice = () => {
    const showContent = !!habitForming || !!dietAndLifeStyle || !!specialAdvise;
    if (showContent) {
      return (
        <View style={styles.adviceView}>
          {!!habitForming && renderHabitForming()}
          {!!dietAndLifeStyle && renderDietAndLifeStyle()}
          {!!specialAdvise && renderSpecialAdvice()}
        </View>
      );
    } else return null;
  };

  const renderHabitForming = () => (
    <View>
      <Text style={styles.subHeading}>Habit Forming</Text>
      <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{habitForming}</Text>
    </View>
  );

  const renderDietAndLifeStyle = () => {
    const dnl = filterHtmlContent(dietAndLifeStyle);
    let dietLifestyle = dnl.replace(/\$name/gi, name);
    return !!dietLifestyle.length && renderHtmlContent(`Diet & Lifestyle Advise`, dietLifestyle);
  };

  const renderSpecialAdvice = () => {
    const advice = filterHtmlContent(specialAdvise);
    let splAdvice = advice.replace(/\$name/gi, name);
    return !!splAdvice.length && renderHtmlContent(`Special Advise`, splAdvice);
  };

  const renderDiseaseAndConditionsGlossary = () => {
    const diseaseConditionGlossaryFiltered = filterHtmlContent(diseaseConditionGlossary);
    let glossary = diseaseConditionGlossaryFiltered.replace(/\$name/gi, name);
    return !!glossary.length && renderHtmlContent(`Disease /Condition Glossary `, glossary);
  };

  return (
    <View style={styles.cardStyle}>
      {!!usesOfProduct && renderUsesOfProduct()}
      {(!!pharmaUses || !!pharmaBenefits) && renderUses()}
      {(!!storagePlace || !!storage || !!coldChain) && renderStorage()}
      {!!renderSideEffects && renderSideEffects(pharmaSideEffects)}
      {!!pharmaOverview && renderPrecautionsAndWarnings()}
      {renderAdvice()}
      <Text style={styles.heading}>Patients Concern</Text>
      {!!diseaseConditionGlossary && renderDiseaseAndConditionsGlossary()}
      {!!faqContent && faqContent.length && <FaqComponent faqs={faqContent} name={name} />}
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
  adviceView: {
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.LIGHT_GRAY,
  },
  heading: {
    ...theme.viewStyles.text('SB', 17, '#02475B', 1, 25, 0.35),
    marginBottom: 2,
  },
});
