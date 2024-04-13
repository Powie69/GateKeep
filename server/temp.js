const crypto = require('crypto');

const rawData = '2'
const salt = 'ilyKurt<3'
const id = rawData + salt;
const hashOfId = crypto.createHash('sha256').update(id).digest('hex').substring(0, 80);

const targetHash = '5898b2b79a08a4ae79454c2655a22e5595803fa9395dede112b2f452767baec4';
console.log(hashOfId);

if (hashOfId == targetHash) {
    console.log("Hash matches '1'");
} else {
    console.log("not match");
}