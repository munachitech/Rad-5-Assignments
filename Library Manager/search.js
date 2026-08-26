export const searchBooks = (books, type, searchTerm) => {
  const term = searchTerm.toLowerCase();

  return books.filter(book => {
    if (type === "title") {
      return book.title.toLowerCase().includes(term);
    }

    if (type === "author") {
      return book.author.toLowerCase().includes(term);
    }

    if (type === "genre") {
      return book.genre.toLowerCase() === term;
    }

    return false;
  });
};