import CryptoJS from "crypto-js";
import { JSEncrypt } from "jsencrypt";

export const Decrypt = async (url, inputKey, inputKey1) => {
  // AES Decryption
  const bytes = CryptoJS.AES.decrypt(url, inputKey);
  const firstLevelCipher = bytes.toString(CryptoJS.enc.Utf8);

  // RSA Decryption
  const decryption = new JSEncrypt();
  decryption.setPrivateKey(inputKey1);
  const originalText = decryption.decrypt(firstLevelCipher);

  return originalText;
};
