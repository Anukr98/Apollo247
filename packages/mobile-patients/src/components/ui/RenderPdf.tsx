import { View, SafeAreaView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import Pdf from 'react-native-pdf';
import { NavigationScreenProps } from 'react-navigation';
import React from 'react';
import { Header } from './Header';
import { theme } from '../../theme/theme';
import { colors } from '../../theme/colors';
import {
  DeviceHelper,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { CrossPopup, Download } from './Icons';
import RNFetchBlob from 'rn-fetch-blob';
import { useUIElements } from '../UIElementsProvider';
import { mimeType } from '../../helpers/mimeType';

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
  const setDisplayPdf = props.setDisplayPdf || props.navigation.getParam('setDisplayPdf');
  const { isIphoneX } = DeviceHelper();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const downloadPDF = () => {
    let dirs = RNFetchBlob.fs.dirs;
    const downloadPath =
      Platform.OS === 'ios'
        ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + title
        : dirs.DownloadDir + '/' + title;
    setLoading!(true);
    RNFetchBlob.config({
      fileCache: true,
      path: downloadPath,
      addAndroidDownloads: {
        title: title,
        mime: mimeType(downloadPath),
        useDownloadManager: true,
        notification: true,
        description: 'File downloaded by download manager.',
        path: downloadPath,
      },
    })
      .fetch('GET', uri, {
        //some headers ..
      })
      .then((res) => {
        setLoading!(false);
        showAphAlert!({
          title: 'Alert!',
          description: 'Downloaded : ' + title,
          onPressOk: () => {
            Platform.OS === 'ios'
              ? RNFetchBlob.ios.previewDocument(res.path())
              : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
            hideAphAlert!();
            setDisplayPdf && setDisplayPdf();
          },
        });
      })
      .catch((err) => {
        CommonBugFender('RenderPdf_downloadPDF', err);
        setLoading!(false);
      });
  };

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
        source={{ uri: uri }}
        style={{
          marginTop: 6,
          marginHorizontal: isPopup ? 0 : 20,
          width: width - 40,
          height: isPopup ? height - 160 : height - 100,
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
              flexDirection: 'row',
              marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 14,
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 14,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => downloadPDF()}
              style={{
                backgroundColor: 'white',
                height: 28,
                width: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
              }}
            >
              <Download />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setDisplayPdf && setDisplayPdf();
              }}
              style={{
                backgroundColor: 'white',
                height: 28,
                width: 28,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
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
