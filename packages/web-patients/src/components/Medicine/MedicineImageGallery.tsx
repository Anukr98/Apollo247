import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ImageGallery from 'react-image-gallery';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: 290,
      '& .image-gallery-slides': {
        border: 'solid 1px rgba(151,151,151,0.24)',
        borderRadius: 10,
        overflow: 'hidden',
      },
      '& .image-gallery-thumbnails': {
        paddingTop: 20,
        '& a': {
          width: 60,
          backgroundColor: theme.palette.common.white,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: 10,
          padding: 8,
          border: '1px solid transparent',
          marginLeft: 8,
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

export const MedicineImageGallery: React.FC = (props) => {
  const classes = useStyles();
  const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1019/1000/600/',
      thumbnail: 'https://picsum.photos/id/1019/250/150/',
    },
  ];

  return (
    <div className={classes.root}>
      <ImageGallery
        items={images}
        showFullscreenButton={false}
        showPlayButton={false}
        showNav={false}
        showBullets={true}
      />
    </div>
  );
};
