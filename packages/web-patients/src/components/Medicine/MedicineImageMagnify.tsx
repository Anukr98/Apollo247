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
          width: 640,
          height: 640,
        },
        enlargedImagePortalId: 'myImage',
      }}
    />
  );
};
