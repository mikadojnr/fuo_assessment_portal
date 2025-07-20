// src/lib/utils.js

/**
 * Utility function to join class names conditionally.
 * Removes falsy values like null, undefined, false, 0, etc.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
