export const displayMenu = () => {
  console.log(`
=== Library Manager ===

1. Add a Book
2. List All Books
3. Find a Book
4. Update a Book
5. Delete a Book
6. Toggle Availability
7. View Statistics
8. Sort Books
0. Exit
`);
};


// Display all books
export const displayBooks = (books) => {
  if (books.length === 0) {
    console.log("\nLibrary is empty.");
    return;
  }

  console.log(`\n=== Library Collection (${books.length} books) ===\n`);

  console.log(
    "ID | Title                          | Author              | Year | Genre        | Available"
  );

  console.log(
    "---|--------------------------------|---------------------|------|--------------|----------"
  );

  books.forEach(book => {
    let availability = "No";

    if (book.available) {
      availability = "Yes";
    }

    console.log(
      `${String(book.id).padEnd(3)}| ` +
      `${book.title.padEnd(30)}| ` +
      `${book.author.padEnd(20)}| ` +
      `${String(book.year).padEnd(6)}| ` +
      `${book.genre.padEnd(13)}| ` +
      `${availability}`
    );
  });
};


// Display one book
export const displayBook = (book) => {
  console.log(`
ID: ${book.id}
Title: ${book.title}
Author: ${book.author}
Year: ${book.year}
Genre: ${book.genre}
Available: ${book.available ? "Yes" : "No"}
`);
};


// Display search results
export const displaySearchResults = (books) => {
  if (books.length === 0) {
    console.log("\nNo books found.");
    return;
  }

  console.log(`\nFound ${books.length} book(s):`);

  books.forEach(book => {
    console.log(
      `${book.id}. ${book.title} — ${book.author}`
    );
  });
};


// Display statistics
export const displayStatistics = (stats) => {
  console.log(`
=== Library Statistics ===

Total books: ${stats.total}
Available: ${stats.available}
Unavailable: ${stats.unavailable}
`);

  console.log("By Genre:");

  Object.entries(stats.byGenre).forEach(([genre, count]) => {
    console.log(`  ${genre}: ${count}`);
  });

  console.log("\nBy Decade:");

  Object.entries(stats.byDecade).forEach(([decade, count]) => {
    console.log(`  ${decade}: ${count}`);
  });

  console.log(
    `\nOldest: "${stats.oldest.title}" (${stats.oldest.year})`
  );

  console.log(
    `Newest: "${stats.newest.title}" (${stats.newest.year})`
  );
};