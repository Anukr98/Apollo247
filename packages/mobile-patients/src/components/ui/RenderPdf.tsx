import { View, SafeAreaView, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import { NavigationScreenProps } from 'react-navigation';
import React from 'react';
import { Header } from './Header';
import { theme } from '../../theme/theme';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export interface RenderPdfProps extends NavigationScreenProps {}

export const RenderPdf: React.FC<RenderPdfProps> = (props) => {
  const uri = props.navigation.getParam('uri');
  const title = props.navigation.getParam('title');

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={title || 'Document'}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };
  const PDFView = () => {
    return (
      <Pdf
        key={uri}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`number of pages: ${numberOfPages}, fb:${filePath}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`current page: ${page}`);
        }}
        onError={(error) => {
          console.log(error);
        }}
        source={{ uri: uri }}
        style={{
          marginTop: 6,
          marginHorizontal: 20,
          width: width - 40,
          height: height - 100,
          backgroundColor: 'transparent',
        }}
      />
    );
  };
  return (
    <SafeAreaView>
      {renderHeader()}
      <View
        style={{
          backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
          marginBottom: 20,
        }}
      >
        {PDFView()}
      </View>
    </SafeAreaView>
  );
};
