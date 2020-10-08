import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ImageGallery from 'react-image-gallery';
import { MedicineProductDetails, MedicineProduct } from '../../helpers/MedicineApiCalls';
import { getPackOfMedicine } from 'helpers/commonHelpers';
import { MedicineImageMagnify } from 'components/Medicine/MedicineImageMagnify';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 290,
      [theme.breakpoints.down(900)]: {
        width: '100%',
      },
      [theme.breakpoints.down('xs')]: {
        width: 80,
        position: 'absolute',
        top: 20,
        right: 20,
      },
      '& .image-gallery-slides': {
        border: 'solid 1px rgba(151,151,151,0.24)',
        borderRadius: 10,
        overflow: 'hidden',
      },
      '& .image-gallery-thumbnails': {
        paddingTop: 20,
        [theme.breakpoints.down('xs')]: {
          paddingTop: 10,
        },
        '& a': {
          width: 60,
          backgroundColor: theme.palette.common.white,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
          padding: 8,
          border: '1px solid transparent',
          marginLeft: 8,
          [theme.breakpoints.down('xs')]: {
            width: 40,
          },
          '&.active': {
            border: '1px solid #00b38e',
          },
          '&:first-child': {
            marginLeft: 0,
          },
        },
      },
      '& .image-gallery-bullets': {
        position: 'static',
        marginTop: 8,
        '& >div': {
          display: 'flex',
          justifyContent: 'center',
        },
        '& button': {
          padding: 0,
          width: 8,
          height: 8,
          backgroundColor: '#0087ba',
          opacity: 0.4,
          border: '2px solid #fff',
          boxShadow: 'none',
          margin: '0 2px',
          '&.active': {
            border: '4px solid #0087ba',
            opacity: 1,
          },
        },
      },
    },
  };
});

type MedicineInformationProps = {
  data: MedicineProductDetails;
  setImageClick: (imageClick: boolean) => void;
};

export const MedicineImageGallery: React.FC<MedicineInformationProps> = (props) => {
  const classes = useStyles({});
  const apiDetails = {
    url: process.env.PHARMACY_MED_IMAGES_BASE_URL,
  };

  let images: any = [];
  props.data.image.map((img: any) => {
    const altTitle = `${props.data.name}, Pack of ${getPackOfMedicine(props.data)}`;
    images.push({
      original: `${apiDetails.url}${img}`,
      thumbnail: `${apiDetails.url}${img}`,
      originalAlt: altTitle,
      originalTitle: altTitle,
      thumbnailAlt: altTitle,
      thumbnailTitle: altTitle,
    });
  });

  const magnifyImage = (imageProps: any) => {
    return <MedicineImageMagnify imageProps={imageProps} />;
  };

  return (
    images && (
      <div className={classes.root}>
        <ImageGallery
          items={images}
          showFullscreenButton={false}
          showPlayButton={false}
          showNav={false}
          showBullets={true}
          onClick={() => props.setImageClick(true)}
          renderItem={magnifyImage}
        />
      </div>
    )
  );
};
