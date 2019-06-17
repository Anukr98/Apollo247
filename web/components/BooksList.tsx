import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { GetBooks } from 'graphql/types/GetBooks';
import { GET_BOOKS } from 'graphql/books';
import { LibraryBooks } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) => {
  return {
    booksList: {
      display: 'flex',
      flexDirection: 'column',
    },
  };
});

export interface BooksListProps {}

export const BooksList: React.FC<BooksListProps> = (props) => {
  const classes = useStyles();
  const { data, error, loading } = useQuery<GetBooks>(GET_BOOKS);
  if (loading) return <CircularProgress />;
  if (error) return <div>Error loading books :(</div>;
  if (data && data.books)
    return (
      <div className={classes.booksList}>
        {data.books.map((b) => (
          <div key={b.id}>
            <LibraryBooks />
            {b.title} by {b.author}
          </div>
        ))}
      </div>
    );
  return <div className={classes.booksList}></div>;
};
