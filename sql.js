const mysql = require('mysql');
const options = require('./sql_options.json');

const connection = mysql.createConnection(options);

connection.connect((err) => {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log('connect to database success!');
});

module.exports = {
    connection: connection,
};