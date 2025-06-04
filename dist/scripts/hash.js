"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcryptjs');
const plainPassword = '0123456789';
const saltRounds = 10;
bcrypt.hash(plainPassword, saltRounds, function (err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log('Hashed Password:', hash);
});
