import { getStorage, ref, listAll, StorageReference, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase-config';

export const useFirebaseStorage = (path: string) => {
  const [items, setItems] = useState<StorageReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const storage = getStorage(app);
        const storageRef = ref(storage, path);
        const result = await listAll(storageRef);
        setItems(result.items);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    fetchItems();
  }, [path]);

  return { items, loading, error };
};

export const getItemName = (item: StorageReference): string => {
  // Use a safer way to get the filename from the reference
  const fullPath = item.fullPath;
  const pathParts = fullPath.split('/');
  return pathParts[pathParts.length - 1];
};

export const getUsername = (item: StorageReference): string => {
  // Use a safer way to get the username from the reference
  const fullPath = item.fullPath;
  const pathParts = fullPath.split('/');
  return pathParts.length > 1 ? pathParts[1] : '';
};

export const getSpeech = (item: StorageReference): string => {
  // Use a safer way to get the speech from the reference
  const fullPath = item.fullPath;
  const pathParts = fullPath.split('/');
  return pathParts.length > 1 ? pathParts[1] : '';
};

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
