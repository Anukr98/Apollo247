import { View, SafeAreaView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import Pdf from 'react-native-pdf';
import { NavigationScreenProps } from 'react-navigation';
import React from 'react';
import { Header } from './Header';
import { theme } from '../../theme/theme';
import { colors } from '../../theme/colors';
import { DeviceHelper } from '../../FunctionHelpers/DeviceHelper';
import { CrossPopup } from './Icons';

const { width, height } = Dimensions.get('window');

export interface RenderPdfProps extends NavigationScreenProps {
  uri: string;
  title: string;
  isPopup: boolean;
  setDisplayPdf?: () => void;
}

export const RenderPdf: React.FC<RenderPdfProps> = (props) => {
  const uri = props.uri || props.navigation.getParam('uri');
  const title = props.title || props.navigation.getParam('title');
  const isPopup = props.isPopup || props.navigation.getParam('isPopup');
  const { isIphoneX } = DeviceHelper();

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
          marginHorizontal: isPopup ? 0 : 20,
          width: width - 40,
          height: isPopup ? height - 150 : height - 100,
          backgroundColor: 'transparent',
        }}
      />
    );
  };
  if (isPopup) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, .8)',
          zIndex: 5,
          elevation: 3,
        }}
      >
        <View
          style={{
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              alignItems: 'flex-end',
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                props.setDisplayPdf && props.setDisplayPdf();
              }}
              style={{
                marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 14,
                backgroundColor: 'white',
                height: 28,
                width: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                marginRight: 0,
              }}
            >
              <CrossPopup />
            </TouchableOpacity>
          </View>
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              marginTop: 16,
              marginBottom: 16,
              borderRadius: 0,
              height: 'auto',
              maxHeight: height - 150,
              overflow: 'hidden',
            }}
          >
            {PDFView()}
          </View>
        </View>
      </View>
    );
  } else {
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
  }
};
