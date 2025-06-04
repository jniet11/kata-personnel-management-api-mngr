const bcrypt = require('bcryptjs');
const plainPassword = '0123456789';
const saltRounds = 10;
bcrypt.hash(plainPassword, saltRounds, function(err: any, hash: any) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log('Hashed Password:', hash);
});