import CryptoJS from "crypto-js";
import { JSEncrypt } from "jsencrypt";

export const Encrypt = async (url, inputKey, inputKey1) => {
  const encryption1 = new JSEncrypt();
  encryption1.setPublicKey(inputKey1);
  const rsaData = encryption1.encrypt(url);

  const cipherText = CryptoJS.AES.encrypt(rsaData, inputKey).toString();

  return cipherText;
};
