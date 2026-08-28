export const getStatistics = (books) => {
  const total = books.length;

  const available = books.filter(book => book.available).length;

  const unavailable = books.filter(book => !book.available).length;


  // Count books by genre
  const byGenre = books.reduce((result, book) => {
    if (result[book.genre]) {
      result[book.genre]++;
    } else {
      result[book.genre] = 1;
    }

    return result;
  }, {});


  // Count books by decade
  const byDecade = books.reduce((result, book) => {
    const decade = Math.floor(book.year / 10) * 10 + "s";

    if (result[decade]) {
      result[decade]++;
    } else {
      result[decade] = 1;
    }

    return result;
  }, {});


  // Find oldest book
  const oldest = books.reduce((oldestBook, book) => {
    if (book.year < oldestBook.year) {
      return book;
    }

    return oldestBook;
  }, books[0]);


  // Find newest book
  const newest = books.reduce((newestBook, book) => {
    if (book.year > newestBook.year) {
      return book;
    }

    return newestBook;
  }, books[0]);


  return {
    total,
    available,
    unavailable,
    byGenre,
    byDecade,
    oldest,
    newest
  };
};