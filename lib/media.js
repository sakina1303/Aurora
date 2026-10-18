import { Directory, File, Paths } from 'expo-file-system';

const mediaDirectory = new Directory(Paths.document, 'aurora-media');

export function persistImage(uri) {
  if (!uri || uri.includes('/aurora-media/')) return uri;
  const source = new File(uri);
  if (!source.exists) throw new Error('The selected image is no longer available.');
  if (!mediaDirectory.exists) mediaDirectory.create();
  const extension = uri.match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/)?.[1]?.toLowerCase() || 'jpg';
  const destination = new File(mediaDirectory, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${extension}`);
  source.copy(destination);
  return destination.uri;
}

export function migrateImage(uri) {
  if (!uri?.startsWith('file://') || uri.includes('/aurora-media/')) return uri;
  try { return persistImage(uri); } catch { return uri; }
}
