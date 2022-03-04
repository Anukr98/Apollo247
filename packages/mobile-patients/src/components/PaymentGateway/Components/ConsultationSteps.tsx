import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Pdf, RightArrowBlue } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
const windowWidth = Dimensions.get('window').width;

export interface ConsultationStepsProps {
  showPdf: () => void;
}

export const ConsultationSteps: React.FC<ConsultationStepsProps> = (props) => {
  const { showPdf } = props;

  const renderSteps = () => {
    return (
      <View style={styles.consultInfoView}>
        <Text style={theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE)}>
          {string.consultPayment.knowConsultation}
        </Text>
        <Text style={styles.callReceiveText}>{string.consultPayment.receiveCallText}</Text>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>1</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.beforeConsultation}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.dashLine} />
          <Text style={styles.consultInfoText}>
            {string.consultPayment.stepOne}
            <Text style={theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY)}>
              {string.consultPayment.stepOneSubheading}
            </Text>
          </Text>
        </View>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>2</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.consultation}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.dashLine} />
          <Text style={styles.consultInfoText}>{string.consultPayment.stepTwo}</Text>
        </View>
        <View style={styles.consultStepView}>
          <View style={styles.stepNumberContainer}>
            <Text style={theme.viewStyles.text('R', 10, theme.colors.WHITE)}>3</Text>
          </View>
          <Text style={theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE)}>
            {string.consultPayment.postConsultation}
          </Text>
        </View>
        <View style={styles.lastStepView}>
          <Text style={styles.consultInfoText}>{string.consultPayment.stepThree}</Text>
        </View>
        <Text style={styles.guidelineText}>{string.consultPayment.detailedGuidelines}</Text>
        {renderViewinPdf()}
      </View>
    );
  };

  const renderViewinPdf = () => {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={showPdf} style={styles.pdfView}>
        <Pdf style={styles.pdfIcon} />
        <Text style={theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE)}>
          {string.consultPayment.viewGuideline}
          <Text style={theme.viewStyles.text('R', 12, theme.colors.SLATE_GRAY)}>
            {string.consultPayment.download}
          </Text>
        </Text>
        <View style={styles.arrowIconView}>
          <RightArrowBlue style={{ height: 12, width: 6 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return <View style={styles.container}>{renderSteps()}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
    marginTop: 16,
  },
  consultInfoView: {
    backgroundColor: theme.colors.WHITE,
    borderRadius: 10,
  },
  callReceiveText: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 16),
    paddingTop: 9,
    paddingBottom: 15,
  },
  separator: {
    height: 1,
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  appointmentView: {
    marginTop: 8,
    marginStart: 12,
  },
  statusView: {
    paddingStart: 18,
  },
  consultStepView: {
    width: 114,
    backgroundColor: theme.colors.AQUA_BLUE,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginStart: 5,
  },
  stepNumberContainer: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 6,
  },
  infoContainer: {
    marginStart: 10,
    flexDirection: 'row',
  },
  dashLine: {
    width: 1,
    height: 56,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.LIGHT_BLUE,
    marginEnd: 16,
  },
  consultInfoText: {
    paddingTop: 4,
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE),
  },
  guidelineText: {
    ...theme.viewStyles.text('R', 10, theme.colors.SLATE_GRAY),
    marginStart: 5,
    marginBottom: 5,
  },
  pdfView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    flex: 1,
    borderRadius: 6,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  pdfIcon: {
    width: 22,
    height: 26,
    marginStart: 9,
    marginEnd: 13,
  },
  arrowIconView: {
    flex: 1,
    alignItems: 'flex-end',
    marginEnd: 16,
  },
  lastStepView: {
    marginStart: 26,
    marginBottom: 14,
  },
});
