import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { mimeType } from '@aph/mobile-doctors/src/helpers/mimeType';
import React from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import Pdf from 'react-native-pdf';
import { NavigationScreenProps } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { CrossPopup, Download } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { StickyBottomComponent } from '@aph/mobile-doctors/src/components/ui/StickyBottomComponent';

const { width, height } = Dimensions.get('window');

export interface RenderPdfProps
  extends NavigationScreenProps<{
    uri: string;
    title: string;
    isPopup: boolean;
    setDisplayPdf?: () => void;
    CTAs?: {
      title: string;
      variant?: 'white' | 'orange' | 'green';
      onPress: () => void;
      titleStyle?: StyleProp<TextStyle>;
      buttonStyle?: StyleProp<ViewStyle>;
      icon?: React.ReactNode;
      disabled?: boolean;
    }[];
  }> {
  uri: string;
  title: string;
  isPopup: boolean;
  setDisplayPdf?: () => void;
}

export const RenderPdf: React.FC<RenderPdfProps> = (props) => {
  const ctas = props.navigation.getParam('CTAs');
  const uri = props.uri || props.navigation.getParam('uri');
  const title = props.title || props.navigation.getParam('title');
  const isPopup = props.isPopup || props.navigation.getParam('isPopup');
  const setDisplayPdf = props.setDisplayPdf || props.navigation.getParam('setDisplayPdf');
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const downloadPDF = () => {
    let dirs = RNFetchBlob.fs.dirs;
    console.log('avilable dir', dirs.DownloadDir + '/' + title, 'title', title);
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
        console.log('error ', err);
        setLoading!(false);
      });
  };

  const renderHeader = () => {
    return (
      <Header
        containerStyle={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        headerText={title || 'Document'}
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
          marginHorizontal: isPopup ? 0 : 14,
          width: width - 40,
          height: isPopup
            ? height - 160
            : ctas
            ? Platform.OS === 'ios'
              ? height - 165
              : height - 175
            : height - 100,
          backgroundColor: 'transparent',
        }}
      />
    );
  };
  const renderCTAs = () => {
    return (
      <StickyBottomComponent
        style={{
          ...theme.viewStyles.cardContainer,
          paddingHorizontal: 0,
          height: 80,
          paddingTop: 0,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 20,
            alignItems: 'center',
          }}
        >
          {ctas &&
            ctas.map((i, index) => (
              <Button
                title={i.title}
                variant={i.variant}
                style={[
                  {
                    width: width / 2 - 30,
                    marginRight: index === ctas.length - 1 ? 0 : 20,
                  },
                  i.buttonStyle,
                ]}
                titleTextStyle={[i.titleStyle]}
                buttonIcon={i.icon}
                disabled={i.disabled}
                onPress={() => i.onPress()}
              />
            ))}
        </View>
      </StickyBottomComponent>
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
          }}
        >
          {PDFView()}
          {ctas && <View style={{ height: 85 }} />}
          {ctas && renderCTAs()}
        </View>
      </SafeAreaView>
    );
  }
};
