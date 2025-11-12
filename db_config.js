const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'vovotina'
});

connection.connect(err => {
    if (err) throw err;
    console.log('MySQL conectado');
});

module.exports = connection;
