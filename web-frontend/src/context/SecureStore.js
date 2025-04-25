/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CryptoJS from 'crypto-js';
const SECRET_KEY_TOKEN = import.meta.env.SECRET_KEY_TOKEN ?? "";
const setItemAsync = async (key, value) => {
    const encryptedData = CryptoJS.AES.encrypt(value, SECRET_KEY_TOKEN).toString();
    await sessionStorage.setItem(key, encryptedData);
};
const deleteItemAsync = async (key) => {
    await sessionStorage.removeItem(key);
};
const getItemAsync = async (key) => {
    const value = sessionStorage.getItem(key);
    if (value === null)
        return null; // Return null if item not found
    const bytes = CryptoJS.AES.decrypt(value, SECRET_KEY_TOKEN);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
};
export { setItemAsync, deleteItemAsync, getItemAsync };
