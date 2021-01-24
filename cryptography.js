function crypto_rhex(n) {
    const hex_chr = '0123456789abcdef'.split('');
    var s='', j=0;
    for(; j<4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
}
    
function crypto_hex(x) {
    for(var i=0; i<x.length; i++) x[i] = crypto_rhex(x[i]);
    return Array.isArray(x) ? x.join('') : x;
}

function add32(a, b) { return (a + b) & 0xFFFFFFFF; }

/**
 * Basic hash string algorythm
 * @param {string} str 
 */
export function basicHashString(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * cyrb53 crypto algorythm 
 * @param {string} str 
 * @param {number} seed 
 * @returns {number}
 */
export function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

/**
 * md5 hash algorythm
 * @param {string} str
 * @returns {string}
 */
export function md5(str) {
    var txt = "";
    function md5_cycle(x, k) {
        txt += ',' + k;
        var a = x[0], b = x[1], c = x[2], d = x[3];
        
        a = md5_ff(a, b, c, d, k[0], 7 , -680876936);
        d = md5_ff(d, a, b, c, k[1], 12, -389564586);
        c = md5_ff(c, d, a, b, k[2], 17,  606105819);
        b = md5_ff(b, c, d, a, k[3], 22, -1044525330);
        a = md5_ff(a, b, c, d, k[4], 7 , -176418897);
        d = md5_ff(d, a, b, c, k[5], 12,  1200080426);
        c = md5_ff(c, d, a, b, k[6], 17, -1473231341);
        b = md5_ff(b, c, d, a, k[7], 22, -45705983);
        a = md5_ff(a, b, c, d, k[8], 7 ,  1770035416);
        d = md5_ff(d, a, b, c, k[9], 12, -1958414417);
        c = md5_ff(c, d, a, b, k[10], 17, -42063);
        b = md5_ff(b, c, d, a, k[11], 22, -1990404162);
        a = md5_ff(a, b, c, d, k[12], 7 ,  1804603682);
        d = md5_ff(d, a, b, c, k[13], 12, -40341101);
        c = md5_ff(c, d, a, b, k[14], 17, -1502002290);
        b = md5_ff(b, c, d, a, k[15], 22,  1236535329);
        
        a = md5_gg(a, b, c, d, k[1], 5 , -165796510);
        d = md5_gg(d, a, b, c, k[6], 9 , -1069501632);
        c = md5_gg(c, d, a, b, k[11], 14,  643717713);
        b = md5_gg(b, c, d, a, k[0], 20, -373897302);
        a = md5_gg(a, b, c, d, k[5], 5 , -701558691);
        d = md5_gg(d, a, b, c, k[10], 9 ,  38016083);
        c = md5_gg(c, d, a, b, k[15], 14, -660478335);
        b = md5_gg(b, c, d, a, k[4], 20, -405537848);
        a = md5_gg(a, b, c, d, k[9], 5 ,  568446438);
        d = md5_gg(d, a, b, c, k[14], 9 , -1019803690);
        c = md5_gg(c, d, a, b, k[3], 14, -187363961);
        b = md5_gg(b, c, d, a, k[8], 20,  1163531501);
        a = md5_gg(a, b, c, d, k[13], 5 , -1444681467);
        d = md5_gg(d, a, b, c, k[2], 9 , -51403784);
        c = md5_gg(c, d, a, b, k[7], 14,  1735328473);
        b = md5_gg(b, c, d, a, k[12], 20, -1926607734);
        
        a = md5_hh(a, b, c, d, k[5], 4 , -378558);
        d = md5_hh(d, a, b, c, k[8], 11, -2022574463);
        c = md5_hh(c, d, a, b, k[11], 16,  1839030562);
        b = md5_hh(b, c, d, a, k[14], 23, -35309556);
        a = md5_hh(a, b, c, d, k[1], 4 , -1530992060);
        d = md5_hh(d, a, b, c, k[4], 11,  1272893353);
        c = md5_hh(c, d, a, b, k[7], 16, -155497632);
        b = md5_hh(b, c, d, a, k[10], 23, -1094730640);
        a = md5_hh(a, b, c, d, k[13], 4 ,  681279174);
        d = md5_hh(d, a, b, c, k[0], 11, -358537222);
        c = md5_hh(c, d, a, b, k[3], 16, -722521979);
        b = md5_hh(b, c, d, a, k[6], 23,  76029189);
        a = md5_hh(a, b, c, d, k[9], 4 , -640364487);
        d = md5_hh(d, a, b, c, k[12], 11, -421815835);
        c = md5_hh(c, d, a, b, k[15], 16,  530742520);
        b = md5_hh(b, c, d, a, k[2], 23, -995338651);
        
        a = md5_ii(a, b, c, d, k[0], 6 , -198630844);
        d = md5_ii(d, a, b, c, k[7], 10,  1126891415);
        c = md5_ii(c, d, a, b, k[14], 15, -1416354905);
        b = md5_ii(b, c, d, a, k[5], 21, -57434055);
        a = md5_ii(a, b, c, d, k[12], 6 ,  1700485571);
        d = md5_ii(d, a, b, c, k[3], 10, -1894986606);
        c = md5_ii(c, d, a, b, k[10], 15, -1051523);
        b = md5_ii(b, c, d, a, k[1], 21, -2054922799);
        a = md5_ii(a, b, c, d, k[8], 6 ,  1873313359);
        d = md5_ii(d, a, b, c, k[15], 10, -30611744);
        c = md5_ii(c, d, a, b, k[6], 15, -1560198380);
        b = md5_ii(b, c, d, a, k[13], 21,  1309151649);
        a = md5_ii(a, b, c, d, k[4], 6 , -145523070);
        d = md5_ii(d, a, b, c, k[11], 10, -1120210379);
        c = md5_ii(c, d, a, b, k[2], 15,  718787259);
        b = md5_ii(b, c, d, a, k[9], 21, -343485551);
        
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
        
    }

    function md5_cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }
        
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
        
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
        
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
        
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md5_prepare(s) {
        txt = '';
        var n = s.length,
        state = [1732584193, -271733879, -1732584194, 271733878], i;
        for (i=64; i<=s.length; i+=64) {
        // blah with s.substring(i-16, i)
        md5_cycle(state, md5_blk(s.substring(i-64, i)));
        }
        s = s.substring(i-64);
        var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
        for (i=0; i<s.length; i++)
        tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
        tail[i>>2] |= 0x80 << ((i%4) << 3);
        if (i > 55) {
            md5_cycle(state, tail);
            for (i=0; i<16; i++) tail[i] = 0;
        }
        tail[14] = n*8;
        md5_cycle(state, tail);
        return state;
    }

    var md5blks = [];
    function md5_blk(s) {
        var i;
        for (i=0; i<64; i+=4) {
        md5blks[i>>2] = s.charCodeAt(i)
        + (s.charCodeAt(i+1) << 8)
        + (s.charCodeAt(i+2) << 16)
        + (s.charCodeAt(i+3) << 24);
        }
        return md5blks;
    }
    
    return crypto_hex(md5_prepare(str));
}