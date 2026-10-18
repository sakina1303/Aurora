// Expo FileSystem's document directory is native-only. Browser previews keep the
// selected URI for the current session; mobile builds use media.js instead.
export const persistImage = uri => uri;
export const migrateImage = uri => uri;
