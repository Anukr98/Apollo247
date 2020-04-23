import React from 'react';
import { Theme, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton } from '@aph/web-ui-components';

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
        maxWidth: '100%',
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
  };
});


type ArticleItem = {
  image: string;
  type: string;
  title: string;
  description: string;
};

interface ArticleItemProps {
  item: ArticleItem;
}

const ArticleItem: React.FC<ArticleItemProps> = (props) => {
  const classes = useStyles();
  const { image, title, description, type } = props.item;

  return (
    <Grid item sm={4} xs={12}>
      <div className={classes.card}>
        <Link to="#">
          <div className={classes.cardHeader}>
            <img src={image} alt="" />
            <div className={`${classes.videoOverlay}`}>
              <div className={classes.overlayWrap}>
                <img src={require('images/ic_play.svg')} alt="" />
              </div>
            </div>
          </div>
          <div className={classes.cardContent}>
            <div className={classes.type}>{type}</div>
            <h4 className={classes.title}>{title}</h4>
            <div className={classes.content}>{description}</div>
          </div>
        </Link>
      </div>
    </Grid>
  );
};

export const ArticleCard: React.FC = (props) => {
  const classes = useStyles();
  const articleItems: ArticleItem[] = [
    {
      image: require('images/articles/articles-01.png'),
      type: 'Article',
      title: 'Basic protective measures against the new coronavirus',
      description: `Stay aware of the latest information on the COVID-19 outbreak, available on the WHO website and through your national and local public health authority.`,
    },
    {
      image: require('images/articles/articles-02.png'),
      type: 'Report',
      title: `COVID-19 –Situation Report`,
      description: 'If you are not in an area where COVID-19 is spreading or have not travelled from an area where COVID-19 is spreading or have not been in contact with an infected patient, your risk of infection is low. ',
    },
    {
      image: require('images/articles/articles-03.png'),
      type: 'Article',
      title: 'Advice on the use of masks in the context of COVID-19',
      description: 'The use of masks made of other materials (e.g., cotton fabric), also known as nonmedical masks, in the community setting has not been well evaluated.',
    },
  ];

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        {articleItems.map((item, i) => (
          <ArticleItem item={item} key={i} />
        ))}
      </Grid>
    </div>
  );
};
