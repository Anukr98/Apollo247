import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { mimeType } from '@aph/mobile-doctors/src/helpers/mimeType';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
  Text,
  Linking,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { NavigationScreenProps } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { CrossPopup, Download, DotIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { StickyBottomComponent } from '@aph/mobile-doctors/src/components/ui/StickyBottomComponent';
import { RenderPdfStyles } from '@aph/mobile-doctors/src/components/ui/RenderPdf.styles';
import { nameFormater } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { string } from '@aph/mobile-doctors/src/strings/string';

const { width, height } = Dimensions.get('window');

const styles = RenderPdfStyles;

export interface RenderPdfProps
  extends NavigationScreenProps<{
    uri: string;
    title: string;
    isPopup: boolean;
    setDisplayPdf?: () => void;
    menuCTAs?: {
      title: string;
      onPress: () => void;
    }[];
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
  menuCTAs?: {
    title: string;
    onPress: () => void;
  }[];
  CTAs?: {
    title: string;
    variant?: 'white' | 'orange' | 'green';
    onPress: () => void;
    titleStyle?: StyleProp<TextStyle>;
    buttonStyle?: StyleProp<ViewStyle>;
    icon?: React.ReactNode;
    disabled?: boolean;
  }[];
}

export const RenderPdf: React.FC<RenderPdfProps> = (props) => {
  const ctas = props.CTAs || props.navigation.getParam('CTAs');
  const uri = props.uri || props.navigation.getParam('uri');
  const title = props.title || props.navigation.getParam('title');
  const isPopup = props.isPopup || props.navigation.getParam('isPopup');
  const setDisplayPdf = props.setDisplayPdf || props.navigation.getParam('setDisplayPdf');
  const menuCTAs = props.menuCTAs || props.navigation.getParam('menuCTAs');
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const downloadPDF = () => {
    const dirs = RNFetchBlob.fs.dirs;
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
        rightIcons={
          menuCTAs
            ? [
                {
                  icon: <DotIcon />,
                  onPress: () => {
                    setShowMenu(!showMenu);
                  },
                },
              ]
            : undefined
        }
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
          showAphAlert &&
            showAphAlert({
              title: string.common.alert,
              description: 'Loading pdf failed. Opening in browser.',
              onPressOk: () => {
                hideAphAlert && hideAphAlert();
                Linking.openURL(uri);
                setDisplayPdf && setDisplayPdf();
              },
            });
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
              ? isIphoneX()
                ? height - 196
                : height - 165
              : height - 175
            : height - 100,
          backgroundColor: 'transparent',
        }}
      />
    );
  };
  const renderMenu = () => {
    return (
      <View style={styles.fullScreen}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            setShowMenu(false);
          }}
          activeOpacity={1}
        >
          <View style={styles.menucontainer}>
            {menuCTAs &&
              menuCTAs.map((i, index) => {
                return (
                  <View style={styles.menuTextContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        i.onPress();
                        setShowMenu(false);
                      }}
                      activeOpacity={1}
                    >
                      <Text style={styles.menuItemText}>{nameFormater(i.title, 'title')}</Text>
                    </TouchableOpacity>
                    {index !== menuCTAs.length - 1 ? <View style={styles.seperatorStyle} /> : null}
                  </View>
                );
              })}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderCTAs = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle}>
        <View style={styles.ctaContainer}>
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
      <View style={styles.popUPContainer}>
        <View
          style={{
            paddingHorizontal: 20,
          }}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => downloadPDF()}
              style={styles.headerIconStyle}
            >
              <Download />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setDisplayPdf && setDisplayPdf();
              }}
              style={styles.headerIconStyle}
            >
              <CrossPopup />
            </TouchableOpacity>
          </View>
          <View style={styles.pdfContainer}>{PDFView()}</View>
        </View>
      </View>
    );
  } else {
    return (
      <View>
        {showMenu ? renderMenu() : null}
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
      </View>
    );
  }
};
