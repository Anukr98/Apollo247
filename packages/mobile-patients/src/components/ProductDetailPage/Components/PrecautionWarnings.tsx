import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NewPharmaOverview } from '@aph/mobile-patients/src/helpers/apiCalls';
import { filterHtmlContent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  AlcoholIcon,
  PrengancyIcon,
  BreastfeedingIcon,
  DrivingIcon,
  LiverIcon,
  KidneyIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { FaqComponent } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/FaqComponent';
import { SafetyAdvice } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/SafetyAdvice';

export interface PrecautionWarningsProps {
  name: string;
  pharmaOverview: NewPharmaOverview | null;
}

export const PrecautionWarnings: React.FC<PrecautionWarningsProps> = (props) => {
  const { name, pharmaOverview } = props;
  const drugWarning = pharmaOverview?.WarningsAndPrecautions;
  const alcoholContent = pharmaOverview?.AlcoholContent;
  const pregnancyContent = pharmaOverview?.PregnancyContent;
  const breastfeedingContent = pharmaOverview?.BreastfeedingMothersContent;
  const drivingContent = pharmaOverview?.DrivingContent;
  const liverContent = pharmaOverview?.LiverContent;
  const kidneyContent = pharmaOverview?.KidneyContent;
  const faqContent = pharmaOverview?.CompositionContentFAQs;

  const [numberOfLines, setNumberOfLines] = useState<number>(2);
  const [maxLines, setMaxLines] = useState<number>(2);

  const onTextLayout = (e) => {
    setNumberOfLines(e.nativeEvent.lines.length);
  };

  const replaceName = (string: string) => {
    const warningHtml = filterHtmlContent(string);
    const text = warningHtml.replace(/(<([^>]+)>)/gi, ' ').trim();
    const replacedName = text.replace(/\$name/gi, name.toLocaleLowerCase());
    return replacedName;
  };

  const renderWarning = () => {
    const warning = replaceName(drugWarning);
    return (
      <View>
        <Text style={styles.subHeading}>Drug Warning</Text>
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
            {warning}
          </Text>
          {numberOfLines > 2 && numberOfLines != maxLines && (
            <Text style={styles.readMoreText}>READ MORE</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderSafetyAdvice = () => {
    return (
      <View>
        <Text style={styles.subHeading}>Safety Advice</Text>
        {!!alcoholContent && renderAlcoholWarning()}
        {!!pregnancyContent && renderPregnancyWarning()}
        {!!breastfeedingContent && renderBreastfeedingWarning()}
        {!!drivingContent && renderDrivingWarning()}
        {!!liverContent && renderLiverWarning()}
        {!!kidneyContent && renderKidneyWarning()}
      </View>
    );
  };

  const renderAlcoholWarning = () => (
    <SafetyAdvice
      name={'Alcohol'}
      warning={alcoholContent}
      iconComponent={<AlcoholIcon style={styles.warningIcons} />}
    />
  );

  const renderPregnancyWarning = () => (
    <SafetyAdvice
      name={'Pregnancy'}
      warning={pregnancyContent}
      iconComponent={<PrengancyIcon style={styles.warningIcons} />}
    />
  );

  const renderDrivingWarning = () => (
    <SafetyAdvice
      name={'Driving'}
      warning={drivingContent}
      iconComponent={<DrivingIcon style={styles.warningIcons} />}
    />
  );

  const renderLiverWarning = () => (
    <SafetyAdvice
      name={'Liver'}
      warning={liverContent}
      iconComponent={<LiverIcon style={styles.warningIcons} />}
    />
  );

  const renderKidneyWarning = () => (
    <SafetyAdvice
      name={'Kidney'}
      warning={kidneyContent}
      iconComponent={<KidneyIcon style={styles.warningIcons} />}
    />
  );

  const renderBreastfeedingWarning = () => (
    <SafetyAdvice
      name={'Breastfeeding'}
      warning={breastfeedingContent}
      iconComponent={<BreastfeedingIcon style={styles.warningIcons} />}
    />
  );

  return (
    <View style={styles.cardStyle}>
      <View style={styles.lineBreak} />
      <Text style={styles.heading}>In Depth Precautions & Warning</Text>
      {!!drugWarning && renderWarning()}
      {renderSafetyAdvice()}
      <View style={styles.lineBreak} />
      {!!faqContent && faqContent.length && <FaqComponent faqs={faqContent} name={name} />}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: 10,
  },
  heading: {
    ...theme.viewStyles.text('SB', 16, '#02475B', 1, 25, 0.35),
    marginVertical: 10,
  },
  subHeading: {
    ...theme.viewStyles.text('M', 15, '#02475B', 1, 25, 0.35),
    marginVertical: 10,
  },
  lineBreak: {
    width: '100%',
    borderWidth: 0.25,
    borderColor: '#02475B',
    borderStyle: 'dashed',
    marginTop: 5,
  },
  warningIcons: {
    resizeMode: 'contain',
    width: 40,
    height: 50,
    marginTop: 5,
  },
  readMoreText: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 30),
    textAlign: 'right',
  },
});
