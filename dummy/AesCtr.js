import Aes from './Aes';

class AesCtr extends Aes{
    static encrypt(plaintext, password, nBits){
        if(![128, 192, 256].includes(nBits)) throw new Error('Key size is not 128/192/256');
        plaintext = AesCtr.utf8Encode(String(plaintext));
        password = AesCtr.utf8Encode(String(password));

        const nBytes = nBits/8;
        const pwBytes = new Array(nBytes);
        for(let i=0; i<nBytes; i++){
            pwBytes[i] = i<password.length ? password.charCodeAt(i) : 0;
        }
        let key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
        key = key.concat(key.slice(0, nBytes-16));

        const timestamp = (new Date()).getTime();
        const nonceMs = timestamp%1000;
        const nonceSec = Math.floor(timestamp/1000);
        const nonceRnd = Math.floor(Math.random()*0xffff);
        const counterBlock = [
            nonceMs & 0xff, nonceMs >>>8 & 0xff,
            nonceRnd & 0xff, nonceRnd >>>8 & 0xff,
            nonceSec & 0xff, nonceSec >>>8 & 0xff, nonceSec>>>16 & 0xff, nonceSec>>>24 & 0xff,
            0, 0, 0, 0, 0, 0, 0, 0,
        ];

        const nonceStr = counterBlock.slice(0, 8).map(i=>String.fromCharCode(i)).join('');

        const plaintextBytes = plaintext.split('').map(ch=>ch.charCodeAt(0));

        const ciphertextBytes = AesCtr.nistEncryption(plaintextBytes, key, counterBlock);
        
        const ciphertextUtf8 = ciphertextBytes.map(i=>String.fromCharCode(i).join(''));

        const ciphertextB64 = AesCtr.base64Encode(nonceStr+ciphertextUtf8);

        return ciphertextB64;
    }

    static nistEncryption(plaintext, key, counterBlock){
        const blockSize = 16;
        
        const keySchedule = Aes.keyExpansion(key);

        const blockCount = Math.ceil(plaintext.length/blockSize);
        const ciphertext = new Array(plaintext.length);

        for(let b=0; b<blockCount; b++){
            const cipherCntr = Aes.cipher(counterBlock, keySchedule);

            const blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize +1;

            for(let i=0; i<blockLength; i++){
                ciphertext[b*blockSize + i] = cipherCntr[i] ^ plaintext[b*blockSize+i];
            }

            counterBlock[blockSize-1]++;
            for(let i=blockSize-1; i>=8; i--){
                counterBlock[i-1] += counterBlock[i] >> 8;
                counterBlock[i] &= 0xff;
            }

            if(typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope){
                if(b%1000 == 0) self.postMessage({ progress: b/blockCount });
            }
        }
        return ciphertext;
    }

    static decrypt(ciphertext, password, nBits){
        if(![128, 192, 256].includes(nBits)) throw new Error('Key size is not 128/192/256');
        ciphertext = AesCtr.base64Decode(String(ciphertext));
        password = AesCtr.utf8Encode(String(password));

        const nBytes = nBits/8;
        const pwBytes = new Array(nBytes);
        for(let i=0; i<nBytes; i++){
            pwBytes[i] = i<password.length ? password.charCodeAt(i) : 0;
        }
        let key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
        key = key.concat(key.slice(0, nBytes-16));

        const counterBlock = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for(let i=0; i<8; i++) counterBlock[i] = ciphertext.charCodeAt(i);

        const ciphertextBytes = new Array(ciphertext.length-8);
        for(let i=8; i<ciphertext.length; i++) ciphertextBytes[i-8] = ciphertext.charCodeAt(i);

        const plaintextBytes = AesCtr.nistDecryption(ciphertextBytes, key, counterBlock);

        const plaintextUtf8 = plaintextBytes.map(i => String.fromCharCode(i)).join('');

        const plaintext = AesCtr.utf8Decode(plaintextUtf8);

        return plaintext;
    }

    static nistDecryption(ciphertext, key, counterBlock){
        const blockSize = 16;
        
        const keySchedule = Aes.keyExpansion(key);

        const blockCount = Math.ceil(ciphertext.length/blockSize);
        const plaintext = new Array(ciphertext.length);

        for(let b=0; b<blockCount; b++){
            const cipherCntr = Aes.cipher(counterBlock, keySchedule);

            const blockLength = b<blockCount-1 ? blockSize : (ciphertext.length-1)%blockSize +1;

            for(let i=0; i<blockLength; i++){
                plaintext[b*blockSize + i] = cipherCntr[i] ^ ciphertext[b*blockSize+i];
            }

            counterBlock[blockSize-1]++;
            for(let i=blockSize-1; i>=8; i--){
                counterBlock[i-1] += counterBlock[i] >> 8;
                counterBlock[i] &= 0xff;
            }

            if(typeof WorkerGlobalScope != 'undefined' && self instanceof WorkerGlobalScope){
                if(b%1000 == 0) self.postMessage({ progress: b/blockCount });
            }
        }
        return plaintext;
    }

    static utf8Encode(str){
        try{
            return new TextEncoder().encode(str, 'utf-8').reduce((prev, curr) => prev +String.fromCharCode(curr), '');
        }catch(e){
            return unescape(encodeURIComponent(str));
        }
    }

    static utf8Decode(str){
        try{
            return new TextEncoder().decode(str, 'utf-8').reduce((prev, curr) => prev +String.fromCharCode(curr), '');
        }catch(e){
            return decodeURIComponent(escape(str));
        }
    }

    static base64Encode(str){
        if(typeof btoa != 'undefined') return btoa(str);
        if(typeof Buffer != 'undefined') return new Buffer(str, 'binary').toString('base64');
        throw new Error('No Base64 Encode');
    }

    static base64Decode(str){
        if(typeof atob != 'undefined') return atob(str);
        if(typeof Buffer != 'undefined') return new Buffer(str, 'base64').toString('binary');
        throw new Error('No Base64 Decode');
    }
}

export default AesCtr;