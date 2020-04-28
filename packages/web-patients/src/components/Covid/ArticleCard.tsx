import React from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
// import { clientRoutes } from 'helpers/clientRoutes';
// import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingBottom: 16,
    },
    card: {
      border: '0.5px solid rgba(2,71,91,0.3)',
      backgroundColor: '#ffffff',
      borderRadius: 10,
      height: '100%',
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        border: 'none',
      },
    },
    cardHeader: {
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden',
      position: 'relative',
      '& img': {
        width: '100%',
        verticalAlign: 'middle',
      },
    },
    cardContent: {
      padding: 16,
    },
    type: {
      fontSize: 12,
      color: '#0087ba',
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 16,
      lineHeight: '22px',
      color: '#01475b',
      fontWeight: 500,
      paddingTop: 5,
      margin: 0,
    },
    content: {
      fontSize: 12,
      color: '#01475b',
      lineHeight: '18px',
      opacity: 0.6,
      paddingTop: 8,
      display: '-webkit-box',
      '-webkit-line-clamp': '4',
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden',
    },
    videoOverlay: {
      display: 'none',
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      textAlign: 'center',
    },
    addedOverlay: {
      display: 'block',
    },
    overlayWrap: {
      position: 'absolute',
      width: '100%',
      top: '50%',
      marginTop: -30,
    },
    iFrameVideo: {
      position: 'relative',
      height: '220px',
      width: '100%',
      border: 'none !important',
    },
  };
});

type ArticleItem = {
  thumbnailWeb: string;
  thumbnailMobile: string;
  type: string;
  postTitle: string;
  shortDescription: string;
  slug: string;
  id: string;
  videoUrl: string;
  sourceUrl: string;
};

interface ArticleItemProps {
  item: ArticleItem;
  handleInfographicClick: (obj: object) => void;
}

const ArticleItem: React.FC<ArticleItemProps> = (props) => {
  const classes = useStyles();
  const {
    thumbnailMobile,
    thumbnailWeb,
    postTitle,
    shortDescription,
    type,
    slug,
    id,
    videoUrl,
    sourceUrl,
  } = props.item;
  const image = screen.width > 768 ? thumbnailWeb : thumbnailMobile;
  return (
    <Grid item sm={4} xs={12}>
      <div className={classes.card}>
        <Link
          to={
            type.toLowerCase() === 'video' || type.toLowerCase() == 'infographic'
              ? '#'
              : `/covid19/${type.toLowerCase()}${slug}`
          }
          onClick={
            type.toLowerCase() == 'infographic'
              ? () => props.handleInfographicClick({ image, postTitle, sourceUrl })
              : () => {}
          }
        >
          {((image && image.length) || (videoUrl && videoUrl.length)) && (
            <div className={classes.cardHeader}>
              {type.toLowerCase() === 'video' ? (
                <iframe
                  width="305"
                  height="204"
                  className={classes.iFrameVideo}
                  color="#fcb716"
                  src={videoUrl}
                  allow="accelerometer; fullscreen; autoplay; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              ) : image ? (
                <img src={image} alt="" />
              ) : (
                <span></span>
              )}
              <div className={`${classes.videoOverlay}`}>
                <div className={classes.overlayWrap}>
                  <img src={require('images/ic_play.svg')} alt="" />
                </div>
              </div>
            </div>
          )}

          <div className={classes.cardContent}>
            <div className={classes.type}>{type}</div>
            <h4 className={classes.title}>{postTitle}</h4>
            <div className={classes.content}>{shortDescription}</div>
          </div>
        </Link>
      </div>
    </Grid>
  );
};

interface ArticleCardProps {
  content: [];
  handleInfographicClick: (img: object) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        {props.content.map((item, i) => (
          <ArticleItem handleInfographicClick={props.handleInfographicClick} item={item} key={i} />
        ))}
      </Grid>
    </div>
  );
};
