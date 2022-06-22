class Aes {
    static cipher(input, w){
        const Nb = 4;
        const Nr = w.length/Nb-1;
        
        let state = [ [], [], [], [] ];
        for(let i=0; i<4*Nb; i++)
            state[i%4][Math.floor(i/4)]=input[i];
        
        state = Aes.addRoundKey(state, w, 0, Nb);

        for(let round=1; round<Nr; round++){
            state = Aes.subBytes(state, Nb);
            state = Aes.shiftRows(state, Nb);
            state = Aes.mixColumns(state, Nb);
            state = Aes.addRoundKey(state, w, round, Nb);
        }

        state = Aes.subBytes(state, Nb);
        state = Aes.shiftRows(state, Nb);
        state = Aes.addRoundKey(state, w, Nr, Nb);

        const output = new Array(4*Nb);
        for(let i=0; i<4*Nb; i++)
            output[i] = state[i%4][Math.floor(i/4)];

        return output;
    }

    static keyExpansion(key){
        const Nb = 4;
        const Nk = key.length/4;
        const Nr = Nk + 6;

        const w = new Array(Nb*(Nr+1));
        let temp = new Array(4);

        for(let i=0; i<Nk; i++){
            const r = [ key[4*i], key[4*i+1], key[4*i+2], key[4*i+3] ];
            w[i] = r;
        }

        for(let i=Nk; i<(Nb*(Nr+1)); i++){
            w[i] = new Array(4);
            for(let t=0; t<4; t++)
                temp[t] = w[i-1][t];
            if(i % Nk == 0){
                temp = Aes.subWord(Aes.rotWord(temp));
                for(let t=0; t<4; t++) temp[t] ^= Aes.rCon[i/Nk][t];
            }
            else if(Nk>6 && i%Nk==4){
                temp = Aes.subWord(temp);
            }
            for(let t=0; t<4; t++) w[i][t] = w[i-Nk][t]^temp[t];
        }
        return w;
    }

    static subBytes(s, Nb){
        for(let r=0; r<4; r++){
            for(let c=0; c<Nb; c++) s[r][c] = Aes.sBox[s[r][c]];
        }
        return s;
    }

    static shiftRows(s, Nb){
        const t = new Array(4);
        for(let r=1; r<4; r++){
            for(let c=0; c<4; c++) t[c]=s[r][(c+r)%Nb];
            for(let c=0; c<4; c++) s[r][c]=t[c];
        }
        return s;
    }

    static mixColumns(s, Nb){
        for(let c=0; c<Nb; c++){
            const a = new Array(Nb);
            const b = new Array(Nb);
            for(let r=0; r<4; r++){
                a[r] = s[r][c];
                b[r] = s[r][c]&0x80 ? s[r][c]<<1 ^ 0x011b : s[r][c]<<1;
            }
            s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
            s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
            s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
            s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
        }
        return s;
    }

    static addRoundKey(state, w, rnd, Nb){
        for(let r=0; r<4; r++){
            for(let c=0; c<Nb; c++) state[r][c] ^= w[rnd*4+c][r];
        }
        return state;
    }

    static subWord(w){
        for(let i=0; i<4; i++) w[i] = Aes.sBox[w[i]];
        return w;
    }

    static rotWord(w){
        const tmp = w[0];
        for(let i=0; i<3; i++) w[i] = w[i+1];
        w[3] = tmp;
        return w;
    }
}

export default Aes;