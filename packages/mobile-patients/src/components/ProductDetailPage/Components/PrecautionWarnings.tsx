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

  const renderAlcoholWarning = () => {
    const warning = replaceName(alcoholContent);
    return (
      <View style={styles.flexRow}>
        <View style={styles.iconContainer}>
          <AlcoholIcon style={styles.warningIcons} />
          <Text style={styles.warningHeading}>Alcohol</Text>
        </View>
        <View style={styles.warningContainer}>
          <Text style={styles.contentStyle}>{warning}</Text>
        </View>
      </View>
    );
  };

  const renderPregnancyWarning = () => {
    const warning = replaceName(pregnancyContent);
    return (
      <View style={styles.flexRow}>
        <View style={styles.iconContainer}>
          <PrengancyIcon style={styles.warningIcons} />
          <Text style={styles.warningHeading}>Pregnancy</Text>
        </View>
        <View style={styles.warningContainer}>
          <Text style={styles.contentStyle}>{warning}</Text>
        </View>
      </View>
    );
  };

  const renderDrivingWarning = () => {
    const warning = replaceName(drivingContent);
    return (
      <View style={styles.flexRow}>
        <View style={styles.iconContainer}>
          <DrivingIcon style={styles.warningIcons} />
          <Text style={styles.warningHeading}>Driving</Text>
        </View>
        <View style={styles.warningContainer}>
          <Text style={styles.contentStyle}>{warning}</Text>
        </View>
      </View>
    );
  };

  const renderLiverWarning = () => {
    const warning = replaceName(liverContent);
    return (
      <View style={styles.flexRow}>
        <View style={styles.iconContainer}>
          <LiverIcon style={styles.warningIcons} />
          <Text style={styles.warningHeading}>Liver</Text>
        </View>
        <View style={styles.warningContainer}>
          <Text style={styles.contentStyle}>{warning}</Text>
        </View>
      </View>
    );
  };

  const renderKidneyWarning = () => {
    const warning = replaceName(kidneyContent);
    return (
      <View style={styles.flexRow}>
        <View style={styles.iconContainer}>
          <KidneyIcon style={styles.warningIcons} />
          <Text style={styles.warningHeading}>Liver</Text>
        </View>
        <View style={styles.warningContainer}>
          <Text style={styles.contentStyle}>{warning}</Text>
        </View>
      </View>
    );
  };

  const renderBreastfeedingWarning = () => {
    const warning = replaceName(breastfeedingContent);
    return (
      <View style={styles.flexRow}>
        <View style={styles.iconContainer}>
          <BreastfeedingIcon style={styles.warningIcons} />
          <Text style={styles.warningHeading}>Breastfeeding</Text>
        </View>
        <View style={styles.warningContainer}>
          <Text style={styles.contentStyle}>{warning}</Text>
        </View>
      </View>
    );
  };

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
  flexRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  warningHeading: {
    ...theme.viewStyles.text('R', 15, '#02475B', 1, 20),
    marginTop: 8,
  },
  iconContainer: {
    width: '25%',
    alignItems: 'center',
  },
  warningContainer: {
    width: '70%',
    marginLeft: 10,
  },
  contentStyle: theme.viewStyles.text('R', 15, '#02475B', 1, 20),
});
