import React, { Component } from 'react';
import ReactImageMagnify from 'react-image-magnify';

export interface MedicineImageMagnifyProps {
  imageProps: any;
}

export const MedicineImageMagnify: React.FC<MedicineImageMagnifyProps> = (props) => {
  return (
    <ReactImageMagnify
      {...{
        smallImage: {
          alt: props.imageProps.originalAlt,
          isFluidWidth: true,
          src: props.imageProps.original,
        },
        largeImage: {
          src: props.imageProps.original,
          width: 1500,
          height: 1500,
        },
        enlargedImagePortalId: 'myImage',
        isActivatedOnTouch: true,
        enlargedImageContainerDimensions: {
          width: '245%',
          height: '170%',
        },
      }}
    />
  );
};
