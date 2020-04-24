import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { ArticleBanner } from 'components/Covid/ArticleBanner';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { FeedbackWidget } from 'components/Covid/FeedbackWidget';
import { Link } from 'react-router-dom';
import { CommentsForm } from 'components/Covid/CommentsForm';
import { CommentsList } from 'components/Covid/CommentsList';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      padding: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    pageContainer: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f7f8f5',
      paddingBottom: 20,
      [theme.breakpoints.up('sm')]: {
        borderRadius: '0 0 10px 10px',
      }
    },
    imageBanner: {
      padding: 0,
      '& img': {
        verticalAlign: 'middle',
        maxWidth: '100%',
      },
    },
    desktopBanner: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    mobileBanner: {
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },    
    sectionGroup: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 20px 0 20px',
      },
    },
    mainContent: {
      fontSize: 14,
      lineHeight: '24px',
      color: '#01475b',
      padding: 20,
      backgroundColor: '#fff',
      boxShadow: '0 10px 20px 0 rgba(128, 128, 128, 0.3)',
      [theme.breakpoints.up('sm')]: {
        fontSize: 16,
        lineHeight: '26px',
        width: 'calc(100% - 360px)',
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
      '& p': {
        marginTop: 0,
        marginBottom: 20,
        [theme.breakpoints.up('sm')]: {
          marginBottom: 40,
        },
        '&:last-child': {
          marginBottom: 0,
        },
      },
      '& a': {
        color: '#0087ba',
      },
      '& h3': {
        fontSize: 16,
        lineHeight: '24px',
        color: '#0087ba',
        margin: 0,
        paddingBottom: 12,
        fontWeight: 500,
        [theme.breakpoints.up('sm')]: {
          fontSize: 18,
        },
      },
    },
    rightSidebar: {
      padding: 20,
      [theme.breakpoints.up('sm')]: {
        width: 360,
      },
    },
    formCard: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 16,
      borderRadius: 10,
    },
    bottomActions: {
      paddingTop: 20,
      '& button': {
        width: '100%',
        borderRadius: 10,
      },
    },
  };
});

export const CovidArticleDetails: React.FC = (props) => {
  const classes = useStyles();
  const isDesktopOnly = useMediaQuery('(min-width:768px)');

  return (
    <div className={classes.root}>
      {isDesktopOnly ? <Header /> : ''}
      <div className={classes.container}>
        <div className={classes.pageContainer}>
          <ArticleBanner />
          <div className={classes.imageBanner}>
            <img className={classes.mobileBanner} src={require('images/articles/article-details-02.png')} alt="" />
            <img className={classes.desktopBanner} src={require('images/articles/article-details-01.png')} alt="" />
          </div>
          <FeedbackWidget />
          <div className={classes.sectionGroup}>
            <div className={classes.mainContent}>
              <p>Stay aware of the latest information on the COVID-19 outbreak, available on the <Link to="#">WHO website</Link> and through your national and local public health authority. Most people who become infected experience mild illness and recover, but it can be more severe for others. Take care of your health and protect others by doing the following:</p>
              <h3>Wash your hands frequently</h3>
              <p>Regularly and thoroughly clean your hands with an alcohol-based hand rub or wash them with soap and water.</p>
              <p><Link to="#">Why?</Link> Washing your hands with soap and water or using alcohol-based hand rub kills viruses that may be on your hands.</p>
              <h3>Maintain social distancing</h3>
              <p>Maintain at least 1 metre (3 feet) distance between yourself and anyone who is coughing or sneezing.</p>
              <p><Link to="#">Why?</Link> When someone coughs or sneezes they spray small liquid droplets from their nose or mouth which may contain virus. If you are too close, you can breathe in the droplets, including the COVID-19 virus if the person coughing has the disease.</p>
              <h3>Avoid touching eyes, nose and mouth</h3>
              <p><Link to="#">Why?</Link> Hands touch many surfaces and can pick up viruses. Once contaminated, hands can transfer the virus to your eyes, nose or mouth. From there, the virus can enter your body and can make you sick.</p>
              <h3>Practice respiratory hygiene</h3>
              <p>Make sure you, and the people around you, follow good respiratory hygiene. This means covering your mouth and nose with your bent elbow or tissue when you cough or sneeze. Then dispose of the used tissue immediately.</p>
              <p><Link to="#">Why?</Link> Droplets spread virus. By following good respiratory hygiene you protect the people around you from viruses such as cold, flu and COVID-19.</p>
              <h3>If you have fever, cough and difficulty breathing, seek medical care early</h3>
              <p>Stay home if you feel unwell. If you have a fever, cough and difficulty breathing, seek medical attention and call in advance. Follow the directions of your local health authority.</p>
              <p><Link to="#">Why?</Link> National and local authorities will have the most up to date information on the situation in your area. Calling in advance will allow your health care provider to quickly direct you to the right health facility. This will also protect you and help prevent spread of viruses and other infections.</p>
              <h3>Stay informed and follow advice given by your healthcare provider</h3>
              <p>Stay informed on the latest developments about COVID-19. Follow advice given by your healthcare provider, your national and local public health authority or your employer on how to protect yourself and others from COVID-19.</p>
              <p><Link to="#">Why?</Link> National and local authorities will have the most up to date information on whether COVID-19 is spreading in your area. They are best placed to advise on what people in your area should be doing to protect themselves.</p>
            </div>
            <div className={classes.rightSidebar}>
              <div className={classes.formCard}>
                <CommentsForm />
                <CommentsList />
              </div>
              <div className={classes.bottomActions}>
                <AphButton color="primary">Share this article</AphButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
