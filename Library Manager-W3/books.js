const sampleBooks = [
  {
    id: 1,
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    year: 2008,
    genre: "Programming",
    available: true
  },
  {
    id: 2,
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    year: 2018,
    genre: "Programming",
    available: true
  },
  {
    id: 3,
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    year: 2019,
    genre: "Programming",
    available: false
  },
  {
    id: 4,
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "Fiction",
    available: true
  },
  {
    id: 5,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    year: 1988,
    genre: "Science",
    available: true
  }
];

let books = [...sampleBooks];

let nextId = 6;


// Get all books
export const getBooks = () => {
  return books;
};


// Add a new book
export const addBook = (title, author, year, genre) => {
  if (title.trim() === "" || author.trim() === "") {
    console.log("Title and author cannot be empty.");
    return false;
  }

  if (isNaN(year)) {
    console.log("Year must be a valid number.");
    return false;
  }

  const newBook = {
    id: nextId,
    title: title.trim(),
    author: author.trim(),
    year: Number(year),
    genre: genre.trim(),
    available: true
  };

  books = [...books, newBook];

  nextId++;

  console.log("\nBook added successfully!");
  console.log(`ID: ${newBook.id}`);
  console.log(`Title: ${newBook.title}`);
  console.log(`Author: ${newBook.author}`);

  return true;
};


// Find one book by ID
export const findBookById = (id) => {
  return books.find(book => book.id === Number(id));
};


// Update a book
export const updateBook = (id, updates) => {
  const book = findBookById(id);

  if (!book) {
    console.log("Book not found.");
    return false;
  }

  books = books.map(book => {
    if (book.id === Number(id)) {
      return {
        ...book,
        ...updates
      };
    }

    return book;
  });

  console.log("\nBook updated successfully!");

  return true;
};


// Delete a book
export const deleteBook = (id) => {
  const book = findBookById(id);

  if (!book) {
    console.log("Book not found.");
    return false;
  }

  books = books.filter(book => book.id !== Number(id));

  return true;
};


// Toggle availability
export const toggleAvailability = (id) => {
  const book = findBookById(id);

  if (!book) {
    console.log("Book not found.");
    return false;
  }

  books = books.map(book => {
    if (book.id === Number(id)) {
      return {
        ...book,
        available: !book.available
      };
    }

    return book;
  });

  const updatedBook = findBookById(id);

  if (updatedBook.available) {
    console.log(`\nBook "${updatedBook.title}" is now available.`);
  } else {
    console.log(`\nBook "${updatedBook.title}" is now unavailable.`);
  }

  return true;
};