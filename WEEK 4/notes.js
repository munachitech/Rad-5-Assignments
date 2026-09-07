#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const NOTES_FILE = path.join(__dirname, "notes.json");

// Load notes from file
function loadNotes() {
  if (!fs.existsSync(NOTES_FILE)) {
    return [];
  }

  const data = fs.readFileSync(NOTES_FILE, "utf8");
  return JSON.parse(data);
}

// Save notes to file
function saveNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// Add a note
function addNote(text) {
  const notes = loadNotes();

  const newNote = {
    id: notes.length + 1,
    text: text,
    createdAt: new Date().toISOString()
  };

  notes.push(newNote);
  saveNotes(notes);

  console.log(`✓ Note added: "${text}" (ID: ${newNote.id})`);
}

// List all notes
function listNotes() {
  const notes = loadNotes();

  if (notes.length === 0) {
    console.log("No notes found.");
    return;
  }

  notes.forEach(note => {
    console.log(`#${note.id}: ${note.text}`);
  });
}

// Delete a note
function deleteNote(id) {
  const notes = loadNotes();

  const filtered = notes.filter(note => note.id !== id);

  if (filtered.length === notes.length) {
    console.log(`✗ Note #${id} not found.`);
    return;
  }

  saveNotes(filtered);
  console.log(`✓ Note #${id} deleted`);
}

// Parse command-line arguments
const [,, command, ...args] = process.argv;
const text = args.join(" ");

switch (command) {
  case "add":
    if (!text) {
      console.log("Usage: notes.js add <text>");
      process.exit(1);
    }

    addNote(text);
    break;

  case "list":
    listNotes();
    break;

  case "delete":
    const id = parseInt(args[0]);

    if (isNaN(id)) {
      console.log("Usage: notes.js delete <id>");
      process.exit(1);
    }

    deleteNote(id);
    break;

  default:
    console.log("Usage: notes.js <add|list|delete> [args]");
}