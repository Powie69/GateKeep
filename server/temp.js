const crypto = require('crypto');

const id = '1';
const hashOfId = crypto.createHash('sha256').update(id).digest('hex').substring(0, 80);

const targetHash = crypto.createHash('sha256').update('1').digest('hex').substring(0, 80);

if (hashOfId === targetHash) {
    console.log("Hash matches '1'");
} else {
    console.log("Hash does not match '1'");
}