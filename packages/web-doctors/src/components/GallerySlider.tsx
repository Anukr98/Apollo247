import React from 'react';
import Modal from '@material-ui/core/Modal';
import ReactPanZoom from 'react-image-pan-zoom-rotate';
import { makeStyles } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import PDFViewer from 'components/PDFViewer';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  modalWindowWrap: {
    display: 'table',
    height: '100%',
    width: '100%',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  modalWindow: {
    backgroundColor: '#000',
    maxWidth: 1150,
    margin: 'auto',
    borderRadius: 10,
    boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.2)',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  tableContent: {
    display: 'table-cell',
    verticalAlign: 'middle',
    width: '100%',
    '&:focus': {
      outline: 'none',
    },
  },
  modalContent: {
    textAlign: 'center',
    maxHeight: 'calc(100vh - 212px)',
    overflow: 'hidden',
    position: 'relative',
    '& img': {
      maxWidth: '100%',
      width: 'auto',
      maxHeight: 'calc(100vh - 212px)',
    },
  },
  modalHeader: {
    minHeight: 56,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.5,
    color: '#fff',
    padding: '16px 50px',
    textTransform: 'uppercase',
    position: 'relative',
    wordBreak: 'break-word',
  },
  modalClose: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    cursor: 'pointer',
  },
  modalFooter: {
    height: 56,
    textAlign: 'center',
    padding: 16,
    textTransform: 'uppercase',
  },
  arrowContainer: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '0 30px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  arrow: {
    backgroundColor: '#fff',
    position: 'absolute',
    zIndex: 10,
    pointerEvents: 'auto',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s linear',
    color: '#000',
    '&:hover': {
      backgroundColor: '#fff',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    },
  },
  arrowLeft: {
    left: 30,
  },
  arrowRight: {
    right: 30,
  },
  documentTitleWrapper: {
    fontSize: 13,
    textTransform: 'initial',
    textAlign: 'left',
  },
  documentTitle: {
    margin: 0,
    lineHeight: 1.5,
  },
  documentDate: {
    margin: '10px 0 0',
    '& p': {
      margin: 0,
      fontWeight: 400,
      display: 'inline-block',
      verticalAlign: 'middle',
      '&:first-child': {
        marginRight: 5,
      },
    },
  },
}));

interface GallerySliderProps {
  currentIndex: number | null;
  onClose: any;
  onChange: any;
  documents: Array<any>;
  appointmentDate: string;
}

interface ArrowProps {
  currentIndex: number | null;
  onChange: any;
  documentCount: number;
}

interface DocumentTitleProps {
  title: string;
  date: string;
  currentIndex: number | null;
  documentCount: number;
}

const Arrows: React.FC<ArrowProps> = ({ currentIndex, documentCount, onChange }) => {
  const classes = useStyles({});
  return (
    <div className={classes.arrowContainer}>
      {currentIndex > 0 && (
        <IconButton
          aria-label="Previous"
          onClick={() => {
            onChange('prev');
          }}
          className={`${classes.arrow} ${classes.arrowLeft}`}
        >
          <NavigateBeforeIcon />
        </IconButton>
      )}
      {currentIndex < documentCount - 1 && (
        <IconButton
          aria-label="Next"
          onClick={() => {
            onChange('next');
          }}
          className={`${classes.arrow} ${classes.arrowRight}`}
        >
          <NavigateNextIcon />
        </IconButton>
      )}
    </div>
  );
};

const DocumentTitle: React.FC<DocumentTitleProps> = ({
  title,
  date,
  currentIndex,
  documentCount,
}) => {
  const classes = useStyles({});
  return (
    <div className={classes.documentTitleWrapper}>
      <h3 className={classes.documentTitle}>{title}</h3>
      <div className={classes.documentDate}>
        <p>{`Sent on: ${moment(date).format('Do MMM, YYYY')} | `}</p>
        <p>{`Viewing ${currentIndex + 1} out of ${documentCount}`}</p>
      </div>
    </div>
  );
};

const GallerySlider: React.FC<GallerySliderProps> = ({
  currentIndex,
  onClose,
  onChange,
  documents,
  appointmentDate,
}) => {
  const classes = useStyles({});

  const open = currentIndex !== null;

  const docPrevUrl = open ? documents[currentIndex].documentPath : '';

  const docTitle = open
    ? documents && documents[currentIndex] && documents[currentIndex].documentTitle
      ? documents[currentIndex].documentTitle
      : docPrevUrl.split('/').pop()
    : '';

  const docDate = open
    ? documents && documents[currentIndex] && documents[currentIndex].createdDate
      ? documents[currentIndex].createdDate
      : appointmentDate
    : null;

  const isPdf = open ? documents[currentIndex].documentPath.toLowerCase().includes('.pdf') : null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.modalWindowWrap}>
        <div className={classes.tableContent}>
          <div className={classes.modalWindow}>
            <div className={classes.modalHeader}>
              <DocumentTitle
                title={docTitle}
                date={docDate}
                currentIndex={currentIndex}
                documentCount={documents.length}
              />
              <div className={classes.modalClose} onClick={onClose}>
                <img src={require('images/ic_round_clear.svg')} alt="" />
              </div>
            </div>
            <div className={classes.modalContent}>
              <Arrows
                currentIndex={currentIndex}
                onChange={onChange}
                documentCount={documents.length}
              />
              {isPdf ? <PDFViewer file={docPrevUrl} /> : <ReactPanZoom image={docPrevUrl} alt="" />}
            </div>
            {!isPdf && <div className={classes.modalFooter}></div>}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GallerySlider;
