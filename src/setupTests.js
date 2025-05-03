// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// Save the original console.warn
const originalWarn = console.warn;

// Override console.warn immediately
console.warn = (...args) => {
  // Suppress all React Router Future Flag Warnings
  if (args[0]?.includes("React Router Future Flag Warning")) {
    return; // Ignore these warnings
  }
  originalWarn(...args); // Log other warnings
};
