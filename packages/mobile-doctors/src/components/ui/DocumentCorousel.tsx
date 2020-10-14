import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { mimeType } from '@aph/mobile-doctors/src/helpers/mimeType';
import React, { useState, useRef, useEffect } from 'react';
import { Platform, TouchableOpacity, View, Linking, FlatList, BackHandler } from 'react-native';
import Pdf from 'react-native-pdf';
import { NavigationScreenProps } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { DocumentCorouselStyles } from '@aph/mobile-doctors/src/components/ui/DocumentCorousel.styles';
import { permissionHandler } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { PERMISSIONS } from 'react-native-permissions';
import PageControl from 'react-native-page-control';
const pageIndicatorSize = { width: 4, height: 4 };
import { GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { CrossPopup, Download } from '@aph/mobile-doctors/src/components/ui/Icons';
import { chatFilesType } from '@aph/mobile-doctors/src/helpers/dataTypes';

const styles = DocumentCorouselStyles;

export interface DocumentCorouselProps extends NavigationScreenProps {
  pdfFiles?: chatFilesType[];
  patientDetails?: GetCaseSheet_getCaseSheet_caseSheetDetails_patientDetails | null;
  initialDocScrollIndex?: number | 0;
  onClose: () => void;
  scrollToURL?: string;
}

export const DocumentCorousel: React.FC<DocumentCorouselProps> = (props) => {
  const { patientDetails, pdfFiles, initialDocScrollIndex, onClose, scrollToURL } = props;
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = async () => {
    onClose();
    return false;
  };

  useEffect(() => {
    scrollToIndex();
  }, [scrollToURL, flatListRef]);

  const scrollToIndex = () => {
    setLoading && setLoading(true);
    const initialScrollIndex = pdfFiles && pdfFiles.findIndex((item) => item.url === scrollToURL);

    setTimeout(() => {
      flatListRef.current &&
        flatListRef.current.scrollToIndex({
          animated: true,
          index: initialScrollIndex && initialScrollIndex > -1 ? initialScrollIndex : 0,
        });
      setLoading && setLoading(false);
    }, 500);
  };

  const downloadDocument = (item: chatFilesType) => {
    const pdf_title = `${
      patientDetails ? patientDetails.firstName || 'Patient' : 'Patient'
    }_${item.fileName || 'Appointment_Document.pdf'}`;
    permissionHandler(
      Platform.OS === 'ios' ? undefined : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      'Enable storage permission from settings to save pdf.',
      () => {
        const dirs = RNFetchBlob.fs.dirs;
        const downloadPath =
          Platform.OS === 'ios'
            ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + pdf_title
            : dirs.DownloadDir + '/' + pdf_title;
        setLoading!(true);
        RNFetchBlob.config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            title: pdf_title,
            mime: mimeType(downloadPath),
            useDownloadManager: true,
            notification: true,
            description: 'File downloaded by download manager.',
            path: downloadPath,
          },
        })
          .fetch('GET', item.url, {
            //some headers ..
          })
          .then((res) => {
            setLoading!(false);
            showAphAlert!({
              title: 'Alert!',
              description: 'Downloaded : ' + pdf_title,
              onPressOk: () => {
                Platform.OS === 'ios'
                  ? RNFetchBlob.ios.previewDocument(res.path())
                  : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
                hideAphAlert!();
                onClose();
              },
            });
          })
          .catch((err) => {
            CommonBugFender('RenderPdf_downloadPDF', err);
            setLoading!(false);
          });
      }
    );
  };

  const renderItem = (item: chatFilesType, index: number) => {
    return (
      <View key={index}>
        <View style={styles.docContainer}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => downloadDocument(item)}
              style={styles.headerIconStyle}
            >
              <Download />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                onClose();
              }}
              style={styles.headerIconStyle}
            >
              <CrossPopup />
            </TouchableOpacity>
          </View>
        </View>
        <Pdf
          key={item.url}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`number of pages: ${numberOfPages}, fb:${filePath}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`current page: ${page}`);
          }}
          onError={(error) => {
            if (error.toString().indexOf('canceled') > -1) {
              return;
            }
            showAphAlert &&
              showAphAlert({
                title: string.common.alert,
                description: 'Loading pdf failed. Opening in browser.',
                onPressOk: () => {
                  hideAphAlert && hideAphAlert();
                  Linking.openURL(item.url);
                  onClose();
                },
              });
          }}
          source={{ uri: item.url }}
          style={styles.pdfView}
        />
      </View>
    );
  };

  const onViewRef = useRef((event: any) => {
    setCurrentPage(
      (event &&
        event.viewableItems &&
        event.viewableItems.length > 0 &&
        event.viewableItems[0].index) ||
        0
    );
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderDocuments = () => {
    return (
      <FlatList
        horizontal
        data={pdfFiles}
        renderItem={({ item, index }) => renderItem(item, index)}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        showsHorizontalScrollIndicator={false}
        ref={(c) => (flatListRef.current = c)}
      />
    );
  };

  const renderPageControl = (count = 0) => {
    return (
      <PageControl
        style={styles.pageControlView}
        numberOfPages={count}
        currentPage={currentPage}
        pageIndicatorTintColor={'white'}
        currentPageIndicatorTintColor={'white'}
        indicatorStyle={{ borderRadius: 2 }}
        currentIndicatorStyle={styles.currentIndicatorStyle}
        indicatorSize={pageIndicatorSize}
      />
    );
  };

  return (
    <View style={styles.popUPContainer}>
      <View
        style={{
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.pdfContainer}>{renderDocuments()}</View>
      </View>
      {renderPageControl(pdfFiles && pdfFiles.length)}
    </View>
  );
};
