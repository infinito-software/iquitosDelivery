const sql = require('mssql')
var config = {
    user: 'DB_A5E46E_iquitosdelivery_admin',
    password: 'INFINITO0405',
    server: 'sql5059.site4now.net',
    database: 'DB_A5E46E_iquitosdelivery'
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL')
        return pool
    }).catch(err => console.log('Conexion Fallida', err))

module.exports = { sql, poolPromise }