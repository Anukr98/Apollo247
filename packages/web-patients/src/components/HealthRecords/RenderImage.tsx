import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import { downloadDocuments } from '../../graphql/types/downloadDocuments';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { DOWNLOAD_DOCUMENT } from '../../graphql/profiles';

type RenderImageProps = {
  activeData: any;
};
const useStyles = makeStyles((theme: Theme) => {
  return {
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
    prescriptionImage: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: 12,
      padding: 40,
      textAlign: 'center',
      [theme.breakpoints.down('xs')]: {
        padding: 20,
      },
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
  };
});

export const RenderImage: React.FC<RenderImageProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [placeImage, setPlaceImage] = useState<any | null>(null);
  const client = useApolloClient();
  const { data } = props.activeData;

  useEffect(() => {
    if (
      data &&
      (data.prismFileIds ||
        data.hospitalizationPrismFileIds ||
        data.healthCheckPrismFileIds ||
        data.testResultPrismFileIds)
    ) {
      const prismFileds =
        (data.prismFileIds && data.prismFileIds.split(',')) ||
        (data.hospitalizationPrismFileIds &&
          (typeof data.hospitalizationPrismFileIds === 'string'
            ? data.hospitalizationPrismFileIds.split(',')
            : data.hospitalizationPrismFileIds)) ||
        (data.healthCheckPrismFileIds &&
          (typeof data.healthCheckPrismFileIds === 'string'
            ? data.healthCheckPrismFileIds.split(',')
            : data.healthCheckPrismFileIds)) ||
        (data.testResultPrismFileIds &&
          (typeof data.testResultPrismFileIds === 'string'
            ? data.testResultPrismFileIds.split(',')
            : data.testResultPrismFileIds));
      const urls = data.prescriptionImageUrl && data.prescriptionImageUrl.split(',');
      setShowSpinner(true);
      client
        .query<downloadDocuments>({
          query: DOWNLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            downloadDocumentsInput: {
              patientId: currentPatient && currentPatient.id,
              fileIds: prismFileds,
            },
          },
        })
        .then(({ data }) => {
          const uploadUrlscheck = data.downloadDocuments.downloadPaths!.map(
            (item, index) => item || (urls && urls.length <= index + 1 ? urls[index] : '')
          );
          setPlaceImage(uploadUrlscheck);
          setShowSpinner(false);
        })
        .catch((e) => {
          setShowSpinner(false);
        })
        .finally(() => {
          setShowSpinner(false);
        });
    } else if (data.prescriptionImageUrl) {
      setPlaceImage(data.prescriptionImageUrl.split(','));
    }
  }, [data]);

  if (showSpinner) {
    return <CircularProgress className={classes.loader} />;
  }

  return (
    placeImage &&
    placeImage.map((item: string) => {
      return item.includes('.pdf') ? (
        <div className={classes.prescriptionImage}>
          <a href={item}>Download the file</a>
        </div>
      ) : (
        <div className={classes.prescriptionImage}>
          <img src={item} alt="Preview is not available" />
        </div>
      );
    })
  );
};
