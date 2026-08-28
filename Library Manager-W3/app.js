import {
  getBooks,
  addBook,
  findBookById,
  updateBook,
  deleteBook,
  toggleAvailability
} from "./books.js";

import {
  displayMenu,
  displayBooks,
  displayBook,
  displaySearchResults,
  displayStatistics
} from "./display.js";

import { searchBooks } from "./search.js";
import { getStatistics } from "./statistics.js";
import { ask, closeInput } from "./input.js";


// Add a book
const handleAddBook = async () => {
  const title = await ask("Enter title: ");
  const author = await ask("Enter author: ");
  const year = await ask("Enter year: ");
  const genre = await ask("Enter genre: ");

  addBook(title, author, year, genre);
};


// Find a book
const handleSearch = async () => {
  const type = await ask(
    "Search by (title/author/genre): "
  );

  const term = await ask("Search term: ");

  if (
    type.toLowerCase() !== "title" &&
    type.toLowerCase() !== "author" &&
    type.toLowerCase() !== "genre"
  ) {
    console.log("Invalid search type.");
    return;
  }

  const results = searchBooks(
    getBooks(),
    type.toLowerCase(),
    term
  );

  displaySearchResults(results);
};


// Update a book
const handleUpdate = async () => {
  const id = await ask("Enter book ID to update: ");

  const book = findBookById(id);

  if (!book) {
    console.log("Book not found.");
    return;
  }

  console.log("\nCurrent book:");
  displayBook(book);

  const title = await ask(
    "Enter new title (or press Enter to skip): "
  );

  const author = await ask(
    "Enter new author (or press Enter to skip): "
  );

  const year = await ask(
    "Enter new year (or press Enter to skip): "
  );

  const genre = await ask(
    "Enter new genre (or press Enter to skip): "
  );


  const updates = {};

  if (title !== "") {
    updates.title = title;
  }

  if (author !== "") {
    updates.author = author;
  }

  if (year !== "") {
    if (isNaN(year)) {
      console.log("Year must be a number.");
      return;
    }

    updates.year = Number(year);
  }

  if (genre !== "") {
    updates.genre = genre;
  }

  updateBook(id, updates);
};


// Delete a book
const handleDelete = async () => {
  const id = await ask("Enter book ID to delete: ");

  const book = findBookById(id);

  if (!book) {
    console.log("Book not found.");
    return;
  }

  console.log(`\nBook selected: "${book.title}"`);

  const answer = await ask(
    "Are you sure? (yes/no): "
  );

  if (answer.toLowerCase() === "yes") {
    const deleted = deleteBook(id);

    if (deleted) {
      console.log("\nBook deleted successfully!");
      console.log(`Remaining books: ${getBooks().length}`);

      displayBooks(getBooks());
    }
  } else {
    console.log("\nDeletion cancelled.");
  }
};


// Toggle availability
const handleToggle = async () => {
  const id = await ask(
    "Enter book ID to toggle: "
  );

  toggleAvailability(id);
};


// View statistics
const handleStatistics = () => {
  const books = getBooks();

  if (books.length === 0) {
    console.log("No books in the library.");
    return;
  }

  const stats = getStatistics(books);

  displayStatistics(stats);
};


// Sort books
const handleSort = async () => {
  const choice = await ask(
    "Sort by (title/year/author): "
  );

  const books = getBooks();

  let sortedBooks;


  if (choice.toLowerCase() === "title") {
    sortedBooks = [...books].sort((a, b) => {
      return a.title.localeCompare(b.title);
    });

  } else if (choice.toLowerCase() === "year") {
    sortedBooks = [...books].sort((a, b) => {
      return b.year - a.year;
    });

  } else if (choice.toLowerCase() === "author") {
    sortedBooks = [...books].sort((a, b) => {
      return a.author.localeCompare(b.author);
    });

  } else {
    console.log("Invalid sorting option.");
    return;
  }

  displayBooks(sortedBooks);
};


// Main application
const runApp = async () => {
  let running = true;

  while (running) {
    displayMenu();

    const choice = await ask("Choose an option: ");

    switch (choice) {
      case "1":
        await handleAddBook();
        break;

      case "2":
        displayBooks(getBooks());
        break;

      case "3":
        await handleSearch();
        break;

      case "4":
        await handleUpdate();
        break;

      case "5":
        await handleDelete();
        break;

      case "6":
        await handleToggle();
        break;

      case "7":
        handleStatistics();
        break;

      case "8":
        await handleSort();
        break;

      case "0":
        running = false;
        console.log("\nThank you for using Library Manager!");
        closeInput();
        break;

      default:
        console.log("\nInvalid option. Please choose again.");
    }
  }
};


runApp();