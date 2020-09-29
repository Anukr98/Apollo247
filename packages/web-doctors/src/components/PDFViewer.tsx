import React, { useState } from 'react';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'components/PDFViewer.css';
import IconButton from '@material-ui/core/IconButton';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import RefreshIcon from '@material-ui/icons/Refresh';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';

const options = {
  cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
};

interface PDFViewerProps {
  file: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }: any) => {
    setNumPages(numPages);
  };

  const handleZoom = (type?: string) => {
    switch (type) {
      case 'out':
        setScale((zoom) => zoom - 0.5);
        break;
      case 'in':
        setScale((zoom) => zoom + 0.5);
        break;
      default:
        setScale(1.0);
    }
  };

  const handleRotate = (type?: string) => {
    switch (type) {
      case 'rotate':
        if (rotate === 270) {
          setRotate(0);
        } else {
          console.log(rotate);
          setRotate((r) => r + 90);
        }
        break;
      default:
        setRotate(0);
    }
  };

  const handlePage = (type: string | number) => {
    switch (type) {
      case 'prev':
        setPageNumber((p) => p - 1);
        break;
      case 'next':
        setPageNumber((p) => p + 1);
        break;
      case 'first':
        setPageNumber(1);
        break;
      case 'last':
        setPageNumber(numPages);
        break;
      default:
        if (typeof type === 'number') setPageNumber(type);
    }
  };

  const pageInput = (
    <input
      type="number"
      value={pageNumber}
      className="pdf-pagenumber-input"
      onChange={(e) => {
        const page = parseInt(e.target.value);
        handlePage(page);
      }}
    />
  );

  return (
    <div className="pdf-container">
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
        <Page pageNumber={pageNumber} rotate={rotate} scale={scale} />
      </Document>
      <div className="pdf-navigation">
        <div className="pdf-magnify">
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handleZoom('out');
            }}
            disabled={scale === 1.0}
          >
            <ZoomOutIcon className="pdf-navigation-icon" />
          </IconButton>
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handleZoom();
            }}
          >
            <RefreshIcon className="pdf-navigation-icon" />
          </IconButton>
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handleZoom('in');
            }}
            disabled={scale === 2.0}
          >
            <ZoomInIcon className="pdf-navigation-icon" />
          </IconButton>
        </div>
        <div className="pdf-page-info">
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handlePage('first');
            }}
            disabled={pageNumber === 1}
          >
            <FirstPageIcon className="pdf-navigation-icon" />
          </IconButton>
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handlePage('prev');
            }}
            disabled={pageNumber === 1}
          >
            <NavigateBeforeIcon className="pdf-navigation-icon" />
          </IconButton>
          <p>
            Page {pageInput} of {numPages}
          </p>
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handlePage('next');
            }}
            disabled={pageNumber === numPages}
          >
            <NavigateNextIcon className="pdf-navigation-icon" />
          </IconButton>
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handlePage('last');
            }}
            disabled={pageNumber === numPages}
          >
            <LastPageIcon className="pdf-navigation-icon" />
          </IconButton>
        </div>
        <div className="pdf-rotate">
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handleRotate();
            }}
          >
            <RefreshIcon className="pdf-navigation-icon" />
          </IconButton>
          <IconButton
            className="pdf-navigation-button"
            onClick={() => {
              handleRotate('rotate');
            }}
          >
            <RotateRightIcon className="pdf-navigation-icon" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
