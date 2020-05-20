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
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import PaymentConstants from '../../constants';
import { textComponent } from './GenericText';
import { CONSULT_ORDER_INVOICE } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';

interface ViewInvoiceProps {
  item: any;
  paymentFor: string;
  navigationProps?: any;
  patientId?: string;
}
const ViewInvoice: FC<ViewInvoiceProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentConstants;
  const client = useApolloClient();
  const { showAphAlert } = useUIElements();

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });
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

  //TODO: refactor the downloadInvoice function and need to handle failure case
  const downloadInvoice = () => {
    const { item, patientId } = props;
    client
      .query({
        query: CONSULT_ORDER_INVOICE,
        variables: {
          patientId: patientId,
          appointmentId: item.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const { data } = res;
        const { getOrderInvoice } = data;
        let dirs = RNFetchBlob.fs.dirs;
        const downloadPath =
          Platform.OS === 'ios'
            ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + 'Apollo_Consult_Invoice.pdf'
            : dirs.DownloadDir + '/' + 'Apollo_Consult_Invoice.pdf';
        RNFetchBlob.config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            title: 'Apollo_Consult_Invoice.pdf',
            useDownloadManager: true,
            notification: true,
            path: downloadPath,
            mime: mimeType(downloadPath),
            description: 'File downloaded by download manager.',
          },
        })
          .fetch('GET', String(getOrderInvoice), {
            //some headers ..
          })
          .then((res) => {
            console.log('invoiceURL-->', res);
            if (Platform.OS === 'android') {
              Alert.alert('Download Complete');
            }
            Platform.OS === 'ios'
              ? RNFetchBlob.ios.previewDocument(res.path())
              : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
          })
          .catch((err) => {
            CommonBugFender('ConsultView_downloadInvoice', err);
            console.log('error ', err);
          });
      })
      .catch((error) => {
        // props.navigationProps.navigate(AppRoutes.MyAccount);
        renderErrorPopup(`Something went wrong, please try again after sometime`);
        CommonBugFender('fetchingConsultInvoice', error);
      });
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
    alignItems: 'center',
    paddingBottom: 15,
    justifyContent: 'flex-start',
  },
});

export default ViewInvoice;
