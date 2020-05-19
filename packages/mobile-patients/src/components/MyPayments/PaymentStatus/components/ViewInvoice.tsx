/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import PaymentConstants from '../../constants';
import { textComponent } from './GenericText';

interface ViewInvoiceProps {
  item: any;
  paymentFor: string;
  navigationProps?: any;
}
const ViewInvoice: FC<ViewInvoiceProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentConstants;
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let status = 'PENDING';
    if (paymentFor === 'consult') {
      const { appointmentPayments } = item;
      if (!appointmentPayments.length) {
        status = 'PENDING';
      } else {
        status = appointmentPayments[0].paymentStatus;
      }
      return {
        status: status,
      };
    } else {
      return { status: null };
    }
  };

  const downloadInvoice = () => {
    const item = { blobName: 'f3f269a8-0f8f-4257-b50a-a84d79c3c560_1589438393681.pdf' };
    // const { item } = props;
    if (item.blobName == null) {
      Alert.alert('No Image');
    } else {
      let dirs = RNFetchBlob.fs.dirs;

      let fileName: string = item.blobName.substring(0, item.blobName.indexOf('.pdf')) + '.pdf';
      const downloadPath =
        Platform.OS === 'ios'
          ? (dirs.DocumentDir || dirs.MainBundleDir) +
            '/' +
            (fileName || 'Apollo_Consult_Invoice.pdf')
          : dirs.DownloadDir + '/' + (fileName || 'Apollo_Consult_Invoice.pdf');
      //   setLoading(true);
      RNFetchBlob.config({
        fileCache: true,
        path: downloadPath,
        addAndroidDownloads: {
          title: fileName,
          useDownloadManager: true,
          notification: true,
          path: downloadPath,
          mime: mimeType(downloadPath),
          description: 'File downloaded by download manager.',
        },
      })
        .fetch('GET', AppConfig.Configuration.DOCUMENT_BASE_URL.concat(item.blobName), {
          //some headers ..
        })
        .then((res) => {
          //   setLoading(false);
          if (Platform.OS === 'android') {
            Alert.alert('Download Complete');
          }
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(res.path())
            : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
        })
        .catch((err) => {
          //   CommonBugFender('HealthConsultView_downloadPrescription', err);
          console.log('error ', err);
          //   setLoading(false);
          // ...
        });
    }
  };
  const { paymentFor } = props;
  const { status } = statusItemValues();
  return status === SUCCESS && paymentFor === 'consult' ? (
    <TouchableOpacity
      onPress={() => {
        downloadInvoice();
      }}
      style={styles.mainContainer}
    >
      {textComponent('VIEW INVOICE', undefined, theme.colors.APP_YELLOW, false)}
    </TouchableOpacity>
  ) : null;
};

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 15,
  },
});

export default ViewInvoice;
