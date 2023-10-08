const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'myCompany_db'
    },
    console.log('Connected to the myCompany_db database.')

)

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database!')
})

module.exports = connection;