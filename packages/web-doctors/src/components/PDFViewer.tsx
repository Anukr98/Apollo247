import React, { useState } from 'react';
import { Document, Page } from 'react-pdf/dist/entry.webpack';
import { pdfjs } from 'react-pdf';
import { makeStyles } from '@material-ui/styles';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import IconButton from '@material-ui/core/IconButton';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import RefreshIcon from '@material-ui/icons/Refresh';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';

const useStyles = makeStyles((theme) => ({
  pdfContainer: {
    height: 'calc(100vh - 210px)',
    display: 'flex',
    flexDirection: 'column',
  },
  pdfDocument: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: '0 0 calc(100vh - 280px)',
  },
  pdfPage: {
    maxWidth: 'calc(100% - 100px)',
    height: 'calc(100vh - 280px)',
    overflow: 'auto',
    '& canvas': {
      maxWidth: '100%',
      height: 'auto !important',
    },
  },
  pdfNavigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: '10px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  pdfMagnify: {
    display: 'flex',
    alignItems: 'center',
  },
  pdfPageInfo: {
    display: 'flex',
    alignItems: 'center',
    '& p': {
      color: '#fff !important',
    },
  },
  pdfNavigationButton: {
    color: '#fff !important',
    '&:disabled': {
      color: '#aaa !important',
    },
  },
  pdfPagenumberInput: {
    backgroundColor: 'transparent',
    border: '0',
    color: '#fff',
    padding: '0',
    margin: '0',
    width: '25px',
    textAlign: 'center',
    marginRight: '-15px',
  },
}));

const options = {
  cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
};

interface PDFViewerProps {
  file: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file }) => {
  const classes = useStyles({});
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
      className={classes.pdfPagenumberInput}
      onChange={(e) => {
        const page = parseInt(e.target.value);
        handlePage(page);
      }}
    />
  );

  return (
    <div className={classes.pdfContainer}>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        options={options}
        className={classes.pdfDocument}
      >
        <Page pageNumber={pageNumber} rotate={rotate} scale={scale} className={classes.pdfPage} />
      </Document>
      <div className={classes.pdfNavigation}>
        <div className={classes.pdfMagnify}>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handleZoom('out');
            }}
            disabled={scale === 1.0}
          >
            <ZoomOutIcon />
          </IconButton>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handleZoom();
            }}
            disabled={scale === 1.0}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handleZoom('in');
            }}
            disabled={scale === 2.0}
          >
            <ZoomInIcon />
          </IconButton>
        </div>
        <div className={classes.pdfPageInfo}>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handlePage('first');
            }}
            disabled={pageNumber === 1}
          >
            <FirstPageIcon />
          </IconButton>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handlePage('prev');
            }}
            disabled={pageNumber === 1}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <p>
            Page {pageInput} of {numPages}
          </p>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handlePage('next');
            }}
            disabled={pageNumber === numPages}
          >
            <NavigateNextIcon />
          </IconButton>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handlePage('last');
            }}
            disabled={pageNumber === numPages}
          >
            <LastPageIcon />
          </IconButton>
        </div>
        <div>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handleRotate();
            }}
            disabled={rotate === 0}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            className={classes.pdfNavigationButton}
            onClick={() => {
              handleRotate('rotate');
            }}
          >
            <RotateRightIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
