// context.js
const { AsyncLocalStorage } = require('async_hooks');

// Create a single AsyncLocalStorage instance
const asyncLocalStorage = new AsyncLocalStorage();

module.exports = asyncLocalStorage;
