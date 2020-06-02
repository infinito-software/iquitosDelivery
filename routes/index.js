var API_KEY = "1234";
var SECRET_KEY = "INFINITOSOFTWARE_IquitosDelivery_Key_jsdksdkriewr";

var express = require('express')
var router = express.Router();

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }

});

const upload = multer({ storage: storage });

var jwt = require('jsonwebtoken');
var exjwt = require('express-jwt');
const { poolPromise, sql } = require('../db')

/*
 * DECLARAR CLAVE SECRETA
 * */
const jwtMW = exjwt({
    secret: SECRET_KEY
});

//+++++//TEST API//+++++/// - INFINITO SOFTWARE
router.get('/', function (req, res) {
    res.end("API CORRIENDO");
});

//+++++//TEST API CON JWT//+++++/// - INFINITO SOFTWARE
router.get('/testjwt', jwtMW, function (req, res) {
    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    res.send(JSON.stringify({ success: true, message: "FBID: " + fbid }));
});

//=========================================================================
// REQUEST JWT WITH FIREBASE ID
//=========================================================================

router.get('/getKey', async (req, res, next) => {
    var fbid = req.query.fbid;
    if (fbid != null) {
        let token = jwt.sign({ fbid: fbid }, SECRET_KEY, {});
        res.send(JSON.stringify({ success: true, token: token }));
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in request" }));
    }
});

//=========================================================================
// TABLA DESCUENTO Y USUARIO_DESCUENTO
// POST / GET
//=========================================================================

router.get('/descuento', jwtMW, async (req, res, next) => {

    var codigo = req.query.codigo;
    if (codigo != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('FBID', sql.NVarChar, 0) //NO SE USA PERO EL PROCEDIMIENTO LO ESPERA
                .input('Codigo', sql.NChar, codigo)
                .execute('PA_POST_GET_Usuario_Descuento')
            //.query('SELECT Codigo as codigo, Valor as valor, Descripcion as descripcion FROM Descuento WHERE Codigo = @codigo')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing codigo in query" }));
    }

});

router.get('/checkdescuento', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;

    var codigo = req.query.codigo;
    if (codigo != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2)
                .input('fbid', sql.NVarChar, fbid)
                .input('codigo', sql.NChar, codigo)
                .execute('PA_POST_GET_Usuario_Descuento')
            //.query('SELECT * FROM Usuario_Descuento WHERE FBID = @fbid and Codigo = @codigo')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: false, message: "Existe" }));
            }
            else {
                res.send(JSON.stringify({ success: true, message: "No existe" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in JWT" }));
    }

});

router.post('/aplicarDescuento', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    var codigo = req.body.codigo;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 3)
                .input('FBID', sql.NVarChar, fbid)
                .input('Codigo', sql.NChar, codigo)
                .execute('PA_POST_GET_Usuario_Descuento')
            //.query('INSERT INTO Usuario_Descuento (FBID, Codigo) OUTPUT Inserted.FBID, Inserted.Codigo VALUES(@FBID, @codigo)');

            console.log(queryResult); //Debug to see

            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ success: true, message: "Success" }))
            }


        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in JWT" }));
    }

})

//=========================================================================
// TABLA TOKEN
// POST / GET
//=========================================================================
router.get('/token', jwtMW, async (req, res, next) => {

    var fbid = req.query.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('FBID', sql.NVarChar, fbid)
                .input('TOKEN', sql.NVarChar, 0) //NO SE USA PERO EL PROCEDIMIENTO LO ESPERA
                .execute('PA_POST_GET_Token')
            //.query('SELECT FBID, Token FROM Token where FBID = @FBID')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in JWT" }));
    }

});
router.post('/token', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    var token = req.body.token;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2)
                .input('FBID', sql.NVarChar, fbid)
                .input('TOKEN', sql.NVarChar, token)
                .execute('PA_POST_GET_Token')
            /*.query('IF EXISTS(SELECT * FROM Token WHERE FBID = @FBID)'
                + ' UPDATE Token set Token = @TOKEN WHERE FBID = @FBID'
                + ' ELSE'
                + ' INSERT INTO Token (FBID, Token) OUTPUT Inserted.FBID, Inserted.Token'
                + ' VALUES(@FBID, @TOKEN)'
            );*/

            console.log(queryResult); //Debug to see

            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ success: true, message: "Success" }))
            }


        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in JWT" }));
    }

})


//=========================================================================
// TABLA RESTAURANT PROPIETARIO
// POST / GET
//=========================================================================

router.get('/restaurantePropietario', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('Nombre', sql.NVarChar, ' ')
                .input('Celular', sql.NVarChar, ' ')
                .input('NroDocumento', sql.NVarChar, ' ')
                .input('Direccion', sql.NVarChar, ' ')
                .input('Contraseña', sql.NVarChar, ' ')
                .input('IdTipoEmpresa', sql.Int, 0)
                .input('HoraApertura', sql.NVarChar, ' ')
                .input('HoraCierre', sql.NVarChar, ' ')
                .input('PedidoMinimo', sql.Int, 0)
                .input('Correo', sql.NVarChar, ' ')
                .input('AtencionLunes', sql.Bit, 0)
                .input('AtencionMartes', sql.Bit, 0)
                .input('AtencionMiercoles', sql.Bit, 0)
                .input('AtencionJueves', sql.Bit, 0)
                .input('AtencionViernes', sql.Bit, 0)
                .input('AtencionSabado', sql.Bit, 0)
                .input('AtencionDomingo', sql.Bit, 0)
                .input('Imagen', sql.NVarChar, ' ')
                .input('FBID', sql.NVarChar, fbid)
                .execute('PA_POST_GET_Restaurante_Propietario')


            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});
router.post('/restaurantePropietario', jwtMW, async (req, res, next) => {

    try {
        var nombre = req.body.Nombre;
        var celular = req.body.Celular;
        var nroDocumento = req.body.NroDocumento;
        var direccion = req.body.Direccion;
        var contraseña = req.body.Contraseña;
        var idTipoEmpresa = req.body.IdTipoEmpresa;
        var horaApertura = req.body.HoraApertura;
        var horaCierre = req.body.HoraCierre;
        var pedidoMinimo = req.body.PedidoMinimo;
        var correo = req.body.Correo;

        var atencionLunes = req.body.AtencionLunes;
        var atencionMartes = req.body.AtencionMartes;
        var atencionMiercoles = req.body.AtencionMiercoles;
        var atencionJueves = req.body.AtencionJueves;
        var atencionViernes = req.body.AtencionViernes;
        var atencionSabado = req.body.AtencionSabado;
        var atencionDomingo = req.body.AtencionDomingo;

        var imagen = req.body.Imagen;

        var authorization = req.headers.authorization, decoded;
        try {
            decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
        }
        catch (e) {
            return res.status(401).send('Unauthorized');
        }

        var fbid = decoded.fbid;

        if (fbid != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('Opcion', sql.Int, 2)
                    .input('Nombre', sql.NVarChar, nombre)
                    .input('Celular', sql.NVarChar, celular)
                    .input('NroDocumento', sql.NVarChar, nroDocumento)
                    .input('Direccion', sql.NVarChar, direccion)
                    .input('Contraseña', sql.NVarChar, contraseña)
                    .input('IdTipoEmpresa', sql.Int, idTipoEmpresa)
                    .input('HoraApertura', sql.NVarChar, horaApertura)
                    .input('HoraCierre', sql.NVarChar, horaCierre)
                    .input('PedidoMinimo', sql.Int, pedidoMinimo)
                    .input('Correo', sql.NVarChar, correo)
                    .input('AtencionLunes', sql.NVarChar, atencionLunes)
                    .input('AtencionMartes', sql.NVarChar, atencionMartes)
                    .input('AtencionMiercoles', sql.NVarChar, atencionMiercoles)
                    .input('AtencionJueves', sql.NVarChar, atencionJueves)
                    .input('AtencionViernes', sql.NVarChar, atencionViernes)
                    .input('AtencionSabado', sql.NVarChar, atencionSabado)
                    .input('AtencionDomingo', sql.NVarChar, atencionDomingo)
                    .input('Imagen', sql.NVarChar, imagen)
                    .input('FBID', sql.NVarChar, fbid)
                    .execute('PA_POST_GET_Restaurante_Propietario')

                console.log(queryResult); //Debug to see

                if (queryResult.rowsAffected != null) {
                    res.send(JSON.stringify({ success: true, message: "Success" }))
                }


            }
            catch (err) {
                res.status(500) //Internal Server Error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }
        } else {
            res.send(JSON.stringify({ success: false, message: "Missing fbid in JWT" }));
        }
    }
    catch (err) {
        res.status(500) //Internal Server Error
        res.send(JSON.stringify({ success: false, message: err.message }));
    }


})


//=========================================================================
// TABLA TipoEmpresa
// GET
//=========================================================================

router.get('/tipoEmpresa', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .execute('PA_GET_TipoEmpresa')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});

//=========================================================================
// TABLA MetodoPago
// GET
//=========================================================================

router.get('/metodoPago', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('RestauranteId', sql.Int, 0)
                .execute('PA_GET_MetodoPago')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});
router.get('/metodoPagoPorRestaurante', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var restaurante_id = req.query.restauranteId;
    var fbid = decoded.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2)
                .input('RestauranteId', sql.Int, restaurante_id)
                .execute('PA_GET_MetodoPago')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});
router.post('/metodoPagoPorRestaurante', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var restaurante_id = req.body.restauranteId;
    var metodoPago_id = req.body.metodoPagoId;
    var fbid = decoded.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('RestauranteId', sql.Int, restaurante_id)
                .input('MetodoPagoId', sql.Int, metodoPago_id)
                .execute('PA_POST_MetodoPago_Restaurante')


            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ success: true, message: "Success" }))
            }


        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});
router.delete('/metodoPagoPorRestaurante', jwtMW, async (req, res, next) => {


    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    var restaurant_id = req.query.restaurantId;

    if (fbid != null) {

        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('RestaurantId', sql.Int, restaurant_id)
                .query('DELETE FROM Restaurante_MetodoPago WHERE IdRestaurante = @RestaurantId')

            res.send(JSON.stringify({ success: true, message: "Success" }));
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});

//=========================================================================
// TABLA USUARIO
// POST / GET
//=========================================================================

router.get('/usuario', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('FBID', sql.NVarChar, fbid)
                .input('Celular', sql.NVarChar, ' ')
                .input('Nombre', sql.NVarChar, ' ')
                .input('Direccion', sql.NVarChar, ' ')
                .input('Referencia', sql.NVarChar, ' ')
                .input('Correo', sql.NVarChar, ' ')
                .input('Contraseña', sql.NVarChar, ' ')
                .input('Tema', sql.NVarChar, 0)
                .execute('PA_POST_GET_Usuario')


            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});
router.get('/usuarioPorCelular', jwtMW, async (req, res, next) => {

    var celular = req.query.Celular;
    var contraseña = req.query.Contraseña;
    if (celular != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 4)
                .input('FBID', sql.NVarChar, ' ')
                .input('Celular', sql.NVarChar, celular)
                .input('Nombre', sql.NVarChar, ' ')
                .input('Direccion', sql.NVarChar, ' ')
                .input('Referencia', sql.NVarChar, ' ')
                .input('Correo', sql.NVarChar, ' ')
                .input('Contraseña', sql.NVarChar, contraseña)
                .input('Tema', sql.Int, 0)
                .execute('PA_POST_GET_Usuario')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing restauranteId in query" }));
    }

});
router.post('/usuario', jwtMW, async (req, res, next) => {

    var celular = req.body.Celular;
    var nombre = req.body.Nombre;
    var direccion = req.body.Direccion;
    var referencia = req.body.Referencia;
    var correo = req.body.Correo;
    var contraseña = req.body.Contraseña;

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;

    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2)
                .input('Celular', sql.NVarChar, celular)
                .input('Nombre', sql.NVarChar, nombre)
                .input('Direccion', sql.NVarChar, direccion)
                .input('Referencia', sql.NVarChar, referencia)
                .input('Correo', sql.NVarChar, correo)
                .input('Contraseña', sql.NVarChar, contraseña)
                .input('FBID', sql.NVarChar, fbid)
                .input('Tema', sql.NVarChar, 0)
                .execute('PA_POST_GET_Usuario')


            console.log(queryResult); //Debug to see

            if (queryResult.rowsAffected != null) {
                res.send(JSON.stringify({ success: true, message: "Success" }))
            }


        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in body of POST request" }));
    }

})
router.put('/usuario', jwtMW, async (req, res, next) => {

    var tema = req.body.Tema;

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;

    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 3)
                .input('Celular', sql.NVarChar, ' ')
                .input('Nombre', sql.NVarChar, ' ')
                .input('Direccion', sql.NVarChar, ' ')
                .input('Referencia', sql.NVarChar, ' ')
                .input('Correo', sql.NVarChar, ' ')
                .input('Contraseña', sql.NVarChar, ' ')
                .input('FBID', sql.NVarChar, fbid)
                .input('Tema', sql.NVarChar, tema)
                .execute('PA_POST_GET_Usuario')

            if (queryResult.rowsAffected != null)
                res.end(JSON.stringify({ success: true, message: "success" }));
        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing orderID OR orderStatus in body of PUT request" }));
    }

})


//=========================================================================
// TABLA RESTAURANTE
// GET
//=========================================================================

router.get('/restaurante', jwtMW, async (req, res, next) => {

    try {
        const pool = await poolPromise
        const queryResult = await pool.request()
            .input('Opcion', sql.Int, 1)
            .input('RestauranteId', sql.Int, 0)
            .input('IdTipEmpresa', sql.Int, 0)
            .input('SearchQuery', sql.NVarChar, ' ')
            .input('lat', sql.Float, 0)
            .input('lng', sql.Float, 0)
            .input('distance', sql.Int, 0)
            .execute('PA_GET_Restaurante')

        if (queryResult.recordset.length > 0) {
            res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
        }
        else {
            res.send(JSON.stringify({ success: false, message: "Empty" }));
        }
    }
    catch (err) {
        res.status(500) //Internal Server Error
        res.send(JSON.stringify({ success: false, message: err.message }));
    }

});
router.get('/restaurantePorId', jwtMW, async (req, res, next) => {

    var restaurante_id = req.query.restauranteId;
    if (restaurante_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2)
                .input('RestauranteId', sql.Int, restaurante_id)
                .input('IdTipEmpresa', sql.Int, 0)
                .input('SearchQuery', sql.NVarChar, ' ')
                .input('lat', sql.Float, 0)
                .input('lng', sql.Float, 0)
                .input('distance', sql.Int, 0)
                .execute('PA_GET_Restaurante')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing restauranteId in query" }));
    }

});
router.get('/restauranteCerca', jwtMW, async (req, res, next) => {

    var user_lat = parseFloat(req.query.lat)
    var user_lng = parseFloat(req.query.lng)
    var distance = parseInt(req.query.distance)
    if (user_lat != Number.NaN && user_lng != Number.NaN) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 3) //Opcion 3
                .input('RestauranteId', sql.Int, 0)
                .input('IdTipEmpresa', sql.Int, 0)
                .input('SearchQuery', sql.NVarChar, ' ')
                .input('lat', sql.Float, user_lat)
                .input('lng', sql.Float, user_lng)
                .input('distance', sql.Int, distance)
                .execute('PA_GET_Restaurante')

            /*.query('SELECT * FROM(SELECT ID, Nombre, Direccion, Telefono, Lat, Lng, UsuarioPropietario, Imagen, PagoUrl,'
                + 'ROUND(111.045 * DEGREES(ACOS(COS(RADIANS(@lat)) * COS(RADIANS(Lat))'
                + '* COS(RADIANS(Lng) - RADIANS(@lng)) + SIN(RADIANS(@lat))'
                + '* SIN(RADIANS(Lat)))),2) AS distance_in_km FROM Restaurante)tempTable' 
                + ' WHERE distance_in_km < @distance')*/

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing lat or lng in query" }));
    }

});
router.get('/restaurantePorTipo', jwtMW, async (req, res, next) => {

    var tipoempresa_id = req.query.tipoEmpresaId;
    if (tipoempresa_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 4)
                .input('RestauranteId', sql.Int, 0)
                .input('IdTipEmpresa', sql.Int, tipoempresa_id)
                .input('SearchQuery', sql.NVarChar, ' ')
                .input('lat', sql.Float, 0)
                .input('lng', sql.Float, 0)
                .input('distance', sql.Int, 0)
                .execute('PA_GET_Restaurante')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing restauranteId in query" }));
    }

});
router.get('/buscarEmpresa', jwtMW, async (req, res, next) => {

    var search_query = req.query.Nombre;
    if (search_query != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 5)
                .input('RestauranteId', sql.Int, 0)
                .input('IdTipEmpresa', sql.Int, 0)
                .input('SearchQuery', sql.NVarChar, search_query)
                .input('lat', sql.Float, 0)
                .input('lng', sql.Float, 0)
                .input('distance', sql.Int, 0)
                .execute('PA_GET_Restaurante')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing restauranteId in query" }));
    }

});



//=========================================================================
// TABLA MENU
// GET
//=========================================================================

router.get('/categoria', jwtMW, async (req, res, next) => {

    var restaurante_id = req.query.restauranteId;
    if (restaurante_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('RestauranteId', sql.Int, restaurante_id)
                .execute('PA_GET_Categoria')
            /*.query('Select ID as id, Nombre as nombre, Descripcion as descripcion, Imagen as imagen, Color1 as color1, Color2 as color2 FROM Menu WHERE ID IN'
            + '(SELECT MenuId FROM Restaurante_Menu WHERE RestaurantId = @RestauranteId)')*/

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing restaurantid in query" }));
    }

});

//=========================================================================
// TABLA PRODUCTOS
// GET
//=========================================================================

router.get('/productos', jwtMW, async (req, res, next) => {

    var menu_id = req.query.menuId;
    if (menu_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1) //Opcion 1
                .input('CategoriaId', sql.Int, menu_id)
                .input('FoodId', sql.Int, 0)
                .input('SearchQuery', sql.NVarChar, ' ')
                .input('RestauranteId', sql.Int, 0)
                .execute('PA_GET_Producto')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing menuId in query" }));
    }

});
router.get('/productosDesactivos', jwtMW, async (req, res, next) => {

    var menu_id = req.query.menuId;
    if (menu_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 5) //Opcion 5
                .input('CategoriaId', sql.Int, menu_id)
                .input('FoodId', sql.Int, 0)
                .input('SearchQuery', sql.NVarChar, ' ')
                .input('RestauranteId', sql.Int, 0)
                .execute('PA_GET_Producto')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing menuId in query" }));
    }

});
router.get('/productosPorId', jwtMW, async (req, res, next) => {

    var food_id = req.query.foodId;
    if (food_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2) //Opcion 2
                .input('CategoriaId', sql.Int, 0)
                .input('FoodId', sql.Int, food_id)
                .input('SearchQuery', sql.NVarChar, ' ')
                .input('RestauranteId', sql.Int, 0)
                .execute('PA_GET_Producto')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing foodId in query" }));
    }

});
router.get('/BuscarProducto', jwtMW, async (req, res, next) => {

    var search_query = req.query.foodName;
    var menu_id = req.query.menuId;
    if (search_query != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 3) //Opcion 3
                .input('CategoriaId', sql.Int, menu_id)
                .input('FoodId', sql.Int, 0)
                .input('SearchQuery', sql.NVarChar, '%' + search_query + '%')
                .input('RestauranteId', sql.Int, 0)
                .execute('PA_GET_Producto')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing foodName in query" }));
    }

});
router.get('/productosPorRestauranteId', jwtMW, async (req, res, next) => {

    var restauranteId = req.query.restauranteId;
    if (restauranteId != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 4) //Opcion 4
                .input('CategoriaId', sql.Int, 0)
                .input('FoodId', sql.Int, 0)
                .input('SearchQuery', sql.NVarChar, ' ')
                .input('RestauranteId', sql.Int, restauranteId)
                .execute('PA_GET_Producto')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing foodId in query" }));
    }

});
router.post('/producto', jwtMW, upload.single('imagen'), async (req, res, next) => {

    var productoId = req.body.productoId;
    var categoriaId = req.body.categoriaId;
    var presentacionId = req.body.presentacionId;
    var precioPresentacion = req.body.precioPresentacion;
    var extraId = req.body.extraId;
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;
    var imagenruta = req.body.imagenruta;
    var precio = req.body.precio;
    var contienePresentacion = req.body.contienePresentacion;
    var contieneExtra = req.body.contieneExtra;
    var descuento = req.body.descuento;

    try {
        const pool = await poolPromise
        const queryResult = await pool.request()
            .input('Opcion', sql.Int, 1) //Opcion 1
            .input('ProductoId', sql.Int, productoId)
            .input('CategoriaId', sql.Int, categoriaId)
            .input('PresentacionId', sql.Int, presentacionId)
            .input('PrecioPresentacion', sql.Float, precioPresentacion)
            .input('ExtraId', sql.Int, extraId)
            .input('Nombre', sql.NVarChar, nombre)
            .input('Descripcion', sql.NVarChar, descripcion)
            .input('Imagen', sql.NVarChar, imagenruta)
            .input('Precio', sql.Float, precio)
            .input('ContienePresentacion', sql.Bit, contienePresentacion)
            .input('ContieneExtra', sql.Bit, contieneExtra)
            .input('Descuento', sql.Int, descuento)
            .input('Estado', sql.Bit, 1)
            .execute('PA_POST_PUT_Producto')

        if (queryResult.rowsAffected != null)
            res.end(JSON.stringify({ success: true, message: "Success" }));
        else {
            res.send(JSON.stringify({ success: false, message: err.message }))
        }
        n
    }
    catch (err) {
        res.status(500) //Internal Server Error
        res.send(JSON.stringify({ success: false, message: err.message }));
    }

})
router.put('/producto', jwtMW, async (req, res, next) => {

    var productoId = req.body.productoId;
    var categoriaId = req.body.categoriaId;
    var presentacionId = req.body.presentacionId;
    var precioPresentacion = req.body.precioPresentacion;
    var extraId = req.body.extraId;
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;
    var imagenruta = req.body.imagenruta;
    var precio = req.body.precio;
    var contienePresentacion = req.body.contienePresentacion;
    var contieneExtra = req.body.contieneExtra;
    var descuento = req.body.descuento;

    try {
        const pool = await poolPromise
        const queryResult = await pool.request()
            .input('Opcion', sql.Int, 2) //Opcion 2
            .input('ProductoId', sql.Int, productoId)
            .input('CategoriaId', sql.Int, categoriaId)
            .input('PresentacionId', sql.Int, presentacionId)
            .input('PrecioPresentacion', sql.Float, precioPresentacion)
            .input('ExtraId', sql.Int, extraId)
            .input('Nombre', sql.NVarChar, nombre)
            .input('Descripcion', sql.NVarChar, descripcion)
            .input('Imagen', sql.Image, imagenruta)
            .input('Precio', sql.Float, precio)
            .input('ContienePresentacion', sql.Bit, contienePresentacion)
            .input('ContieneExtra', sql.Bit, contieneExtra)
            .input('Descuento', sql.Float, descuento)
            .input('Estado', sql.Bit, 1)
            .execute('PA_POST_PUT_Producto')

        if (queryResult.rowsAffected != null)
            res.end(JSON.stringify({ success: true, message: "Success" }));
    }
    catch (err) {
        res.status(500) //Internal Server Error
        res.send(JSON.stringify({ success: false, message: err.message }));
    }

})
router.put('/productoEstado', jwtMW, async (req, res, next) => {

    var productoId = req.body.productoId;
    var estado = req.body.estado;

    try {
        const pool = await poolPromise
        const queryResult = await pool.request()
            .input('Opcion', sql.Int, 3) //Opcion 3
            .input('ProductoId', sql.Int, productoId)
            .input('CategoriaId', sql.Int, 0)
            .input('PresentacionId', sql.Int, 0)
            .input('PrecioPresentacion', sql.Float, 0)
            .input('ExtraId', sql.Int, 0)
            .input('Nombre', sql.NVarChar, ' ')
            .input('Descripcion', sql.NVarChar, ' ')
            .input('Imagen', sql.Image, ' ')
            .input('Precio', sql.Float, precio)
            .input('ContienePresentacion', sql.Bit, 0)
            .input('ContieneExtra', sql.Bit, 0)
            .input('Descuento', sql.Float, 0)
            .input('Estado', sql.Bit, estado)
            .execute('PA_POST_PUT_Producto')

        if (queryResult.rowsAffected != null)
            res.end(JSON.stringify({ success: true, message: "Success" }));
    }
    catch (err) {
        res.status(500) //Internal Server Error
        res.send(JSON.stringify({ success: false, message: err.message }));
    }

})

//=========================================================================
// TABLA TAMAÑOS
// GET
//=========================================================================

router.get('/presentacion', jwtMW, async (req, res, next) => {

    var food_id = req.query.foodId;
    if (food_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('FoodId', sql.Int, food_id)
                .execute('PA_GET_Presentacion')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing foodId in query" }));
    }

});
router.get('/Allpresentaciones', jwtMW, async (req, res, next) => {


    try {
        const pool = await poolPromise
        const queryResult = await pool.request()
            .input('Opcion', sql.Int, 2)
            .input('FoodId', sql.Int, 0)
            .execute('PA_GET_Presentacion')
        /*.query('Select ID as id, Descripcion as descripcion, PrecioExtra as precioTamaño FROM Tamaño WHERE ID IN'
        +' (SELECT TamañoId FROM Producto_Tamaño WHERE ProductoId = @FoodId )')*/

        if (queryResult.recordset.length > 0) {
            res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
        }
        else {
            res.send(JSON.stringify({ success: false, message: "Empty" }));
        }
    }
    catch (err) {
        res.status(500) //Internal Server Error
        res.send(JSON.stringify({ success: false, message: err.message }));
    }
});

//=========================================================================
// TABLA EXTRAS
// GET
//=========================================================================

router.get('/extras', jwtMW, async (req, res, next) => {

    var food_id = req.query.foodId;
    if (food_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('FoodId', sql.Int, food_id)
                .input('RestaurantId', sql.Int, 0)
                .execute('PA_GET_Extra')
            /*.query('Select ID as id, Nombre as nombre, Descripcion as descripcion, Precio as precioExtra FROM Extras WHERE ID IN'
                + ' (SELECT ExtraId FROM Producto_Extras WHERE ProductoId = @FoodId )')*/

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing foodId in query" }));
    }

});
router.get('/extrasPorRestaurante', jwtMW, async (req, res, next) => {

    var restaurante_id = req.query.restauranteId;
    if (restaurante_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2)
                .input('FoodId', sql.Int, 0)
                .input('RestaurantId', sql.Int, restaurante_id)
                .execute('PA_GET_Extra')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing restaurantid in query" }));
    }



});
router.get('/Allextras', jwtMW, async (req, res, next) => {

    try {
        const pool = await poolPromise
        const queryResult = await pool.request()
            .input('Opcion', sql.Int, 3)
            .input('FoodId', sql.Int, 0)
            .input('RestaurantId', sql.Int, restaurante_id)
            .execute('PA_GET_Extra')

        if (queryResult.recordset.length > 0) {
            res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
        }
        else {
            res.send(JSON.stringify({ success: false, message: "Empty" }));
        }
    }
    catch (err) {
        res.status(500) //Internal Server Error
        res.send(JSON.stringify({ success: false, message: err.message }));
    }

});

//=========================================================================
// TABLA PEDIDOS Y DETALLE DE PEDIDOS
// GET / POST
//=========================================================================
router.get('/hotfood', jwtMW, async (req, res, next) => {

    var restaurante_id = req.query.restauranteId;

    if (restaurante_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('RestauranteId', sql.Int, restaurante_id)
                .execute('PA_HotFood')
            /*.query('SELECT TOP 10 tempTable.itemId, tempTable.nombre, ROUND((COUNT(tempTable.itemId)*100.0/ (SELECT COUNT(*) FROM DetallePedido)),2) AS [percent]'
                + ' FROM (SELECT itemId, nombre FROM Producto pro INNER JOIN DetallePedido det on pro.ID = det.ItemId) tempTable'
                + ' GROUP BY tempTable.itemId, tempTable.nombre'
                + ' ORDER BY [percent] DESC')*/

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else
                res.send(JSON.stringify({ success: false, message: "Empty" }));

        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing restaurantid in query" }));
    }

});

//Desde aca falta pasar a procedimiento

router.get('/detPedidosPorRestaurante', jwtMW, async (req, res, next) => {

    var order_id = req.query.orderId;
    if (order_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 1)
                .input('OrderId', sql.Int, order_id)
                .execute('PA_GET_DetPedido')


            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing orderID in query" }));
    }

});

router.get('/pedidosPorRestaurante', jwtMW, async (req, res, next) => {

    var restaurantId = req.query.restaurantId;
    var estado = req.query.estado;
    var startIndex = req.query.from;
    var endIndex = req.query.to;

    if (restaurantId != null) {
        try {
            if (startIndex == null)
                startIndex = 0
            if (endIndex == null)
                endIndex = 10


            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('RestaurantId', sql.NVarChar, restaurantId)
                .input('Estado', sql.Int, estado)
                .input('StartIndex', sql.Int, startIndex)
                .input('EndIndex', sql.Int, endIndex)
                .execute('PA_GET_Pedidos_Restaurante')


            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing restaurantId in query" }));
    }

});

router.get('/maxpedidosPorRestaurante', jwtMW, async (req, res, next) => {

    var restaurantId = req.query.restaurantId;
    if (restaurantId != null) {
        try {


            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('RestaurantId', sql.NVarChar, restaurantId)
                .query('SELECT MAX(RowNum) as maxRowNum FROM (SELECT ROW_NUMBER() OVER(ORDER BY PedidoId DESC) AS RowNum, PedidoId as pedidoId, UsuarioFBID as usuarioFBID, Celular as celular, Nombre as nombre, Direccion as direccion, Estado as estado,'
                    + 'Fecha as fecha,  RestauranteId as restaurantId, TransaccionId as transaccionId, COD as cod, Total as total, NumItems as numItems'
                    + ' FROM Pedido WHERE RestauranteId = @RestaurantId AND NumItems > 0) AS RowConstrainedResult')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing orderFBID in query" }));
    }

});

router.get('/pedidos', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var order_fbid = decoded.fbid;
    var startIndex = req.query.from;
    var endIndex = req.query.to;

    if (order_fbid != null) {
        try {
            if (startIndex == null)
                startIndex = 0
            if (endIndex == null)
                endIndex = 10


            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('OrderFBID', sql.NVarChar, order_fbid)
                .input('StartIndex', sql.Int, startIndex)
                .input('EndIndex', sql.Int, endIndex)
                .query('SELECT * FROM  (SELECT ROW_NUMBER() OVER(ORDER BY PedidoId DESC) AS RowNum, PedidoId as pedidoId, UsuarioFBID, Celular as celular, Nombre as nombre, Direccion as direccion, Estado as estado,'
                    + ' Fecha as fecha, RestauranteId as restaurantId, TransaccionId as transaccionId, COD as cod, Total as total, NumItems as numItems'
                    + ' FROM Pedido WHERE UsuarioFBID = @OrderFBID AND NumItems > 0) AS RowConstrainedResult'
                    + ' WHERE RowNum >= @StartIndex AND RowNum <= @EndIndex ORDER BY pedidoId DESC')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing orderFBID in query" }));
    }

});

router.get('/maxpedidos', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var order_fbid = decoded.fbid;

    if (order_fbid != null) {
        try {


            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('OrderFBID', sql.NVarChar, order_fbid)
                .query('SELECT MAX(RowNum) as maxRowNum FROM  (SELECT ROW_NUMBER() OVER(ORDER BY PedidoId DESC) AS RowNum, PedidoId as pedidoId, UsuarioFBID, Celular as celular, Nombre as nombre, Direccion as direccion, Estado as estado,'
                    + 'Fecha as fecha, RestauranteId as restaurantId, TransaccionId as transaccionId, COD as cod, Total as total, NumItems as numItems'
                    + ' FROM Pedido WHERE UsuarioFBID = @OrderFBID AND NumItems > 0) AS RowConstrainedResult')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing orderFBID in query" }));
    }

});

router.get('/detPedidos', jwtMW, async (req, res, next) => {

    var order_id = req.query.orderID;
    if (order_id != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('Opcion', sql.Int, 2)
                .input('OrderId', sql.Int, order_id)
                .execute('PA_GET_DetPedido')
            //.query('SELECT PedidoId as pedidoId, ItemId as itemId, Cantidad as cantidad, Precio as precio, iif(Tamaño is null,  , Tamaño) as tamaño, Extra as extra, PrecioExtra as precioExtra FROM DetallePedido WHERE PedidoId = @OrderId  ')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing orderID in query" }));
    }

});

router.post('/AgregarPedido', jwtMW, async (req, res, next) => {

    var celular_pedido = req.body.celularPedido;
    var nombre_pedido = req.body.nombrePedido;
    var direccion_pedido = req.body.direccionPedido;
    var fecha_pedido = req.body.fechaPedido;
    var restaurante_id = req.body.restauranteId;
    var transaccion_id = req.body.transaccionId;
    var cod = (req.body.cod == "true");
    var precio_Total = req.body.precioTotal;
    var num_Items = req.body.numItems;
    var comprobante = req.body.comprobante;
    var nroDocComprobante = req.body.nroDocComprobante;
    var nomClienteComprobante = req.body.nomClienteComprobante;
    var dirClienteComprobante = req.body.dirClienteComprobante;
    //var fbid_usuario = req.body.fbidUsuario;

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid_usuario = decoded.fbid;

    if (num_Items > 0) {
        if (fbid_usuario != null) {
            try {
                const pool = await poolPromise
                const queryResult = await pool.request()
                    .input('FBID_USUARIO', sql.NVarChar, fbid_usuario)
                    .input('CelularPedido', sql.NVarChar, celular_pedido)
                    .input('NombrePedido', sql.NVarChar, nombre_pedido)
                    .input('DireccionPedido', sql.NVarChar, direccion_pedido)
                    .input('FechaPedido', sql.Date, fecha_pedido)
                    .input('RestauranteId', sql.Int, restaurante_id)
                    .input('TransaccionId', sql.NVarChar, transaccion_id)
                    .input('COD', sql.Bit, cod == true ? 1 : 0)
                    .input('PrecioTotal', sql.Float, precio_Total)
                    .input('NumItems', sql.Int, num_Items)
                    .input('Comprobante', sql.NVarChar, comprobante)
                    .input('NroDocComprobante', sql.NVarChar, nroDocComprobante)
                    .input('NomClienteComprobante', sql.NVarChar, nomClienteComprobante)
                    .input('DirClienteComprobante', sql.NVarChar, dirClienteComprobante)
                    .query('INSERT INTO Pedido'
                        + '(UsuarioFBID, Celular, Nombre, Direccion, Estado, Fecha, RestauranteId, TransaccionId, COD, Total, NumItems, Comprobante, NroDocComprobante, NomClienteComprobante, DirClienteComprobante)'
                        + 'VALUES'
                        + '(@FBID_USUARIO, @CelularPedido , @NombrePedido, @DireccionPedido , 0, @FechaPedido , @RestauranteId , @TransaccionId, @COD, @PrecioTotal, @NumItems , @Comprobante, @NroDocComprobante, @NomClienteComprobante, @DirClienteComprobante)'
                        + ' SELECT TOP 1 PedidoId as orderNumber FROM Pedido WHERE UsuarioFBID = @FBID_USUARIO ORDER BY orderNumber DESC ');


                if (queryResult.recordset.length > 0) {
                    res.send(JSON.stringify({ success: true, result: queryResult.recordset }))
                }
                else {
                    res.send(JSON.stringify({ success: true, message: "Empty" }))
                }

            }

            catch (err) {
                res.status(500) //Internal Server Error
                res.send(JSON.stringify({ success: false, message: err.message }));
            }

        }
        else {

            res.send(JSON.stringify({ success: false, message: "Missing fbidPedido in body of POST request" }));

        }
    }

})

router.post('/ActualizarPedido', jwtMW, async (req, res, next) => {

    var order_id = req.body.orderId;
    var order_detail;

    try {
        order_detail = JSON.parse(req.body.orderDetail);
    }
    catch (err) {
        console.log(err);
        res.status(500) //Internal Server Error
        res.send(JSON.stringify({ success: false, message: err.message }));
    }

    if (order_id != null && order_detail != null) {
        try {
            const pool = await poolPromise
            const table = new sql.Table('DetallePedido') //tabla virtual para insertar
            table.create = true

            table.columns.add('PedidoId', sql.Int, { nullable: false, primary: true })
            table.columns.add('ItemId', sql.Int, { nullable: false, primary: true })
            table.columns.add('Cantidad', sql.Int, { nullable: true })
            table.columns.add('Precio', sql.Float, { nullable: true })
            table.columns.add('Tamaño', sql.NVarChar(50), { nullable: true })
            table.columns.add('PrecioExtra', sql.Float, { nullable: true })
            table.columns.add('Extra', sql.NVarChar(50), { nullable: true })

            for (i = 0; i < order_detail.length; i++) {
                table.rows.add(order_id,
                    order_detail[i]["foodId"],
                    order_detail[i]["foodQuantity"],
                    order_detail[i]["foodPrice"],
                    order_detail[i]["foodSize"],
                    parseFloat(order_detail[i]["foodExtraPrice"],
                        order_detail[i]["foodAddon"]),
                )
            }

            const request = pool.request()
            request.bulk(table, (err, resultBulk) => {
                if (err) {
                    console.log(err)
                    res.send(JSON.stringify({ success: false, message: err }));
                }
                else
                    res.send(JSON.stringify({ success: true, message: "update success" }));
            })

        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing orderID OR order_detail in body of POST request" }));
    }
})

router.put('/ActualizarPedido', jwtMW, async (req, res, next) => {

    var order_id = req.body.orderId;
    var order_status = req.body.orderStatus;

    if (order_id != null && order_status != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('OrderId', sql.Int, order_id)
                .input('OrderStatus', sql.Int, order_status)
                .query('UPDATE Pedido set Estado = @OrderStatus WHERE PedidoId = @OrderId')

            if (queryResult.rowsAffected != null)
                res.end(JSON.stringify({ success: true, message: "success" }));
        }
        catch (err) {
            console.log(err);
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing orderID OR orderStatus in body of PUT request" }));
    }

})

//=========================================================================
// TABLA FAVORITOS
// GET / POST / DELETE
//=========================================================================

router.get('/favoritos', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('FBID', sql.NVarChar, fbid)
                .query('SELECT fbid, ProductoId as productoId, RestauranteId as restauranteId, NombreRestaurante as nombreRestaurante, NombreProducto as nombreProducto, ImagenProducto as imagenProducto, Precio as precio'
                    + ' FROM Favoritos WHERE fbid = @fbid')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});

router.get('/favoritosPorRestaurante', jwtMW, async (req, res, next) => {

    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    var restaurant_id = req.query.restaurantId;
    if (fbid != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('FBID', sql.NVarChar, fbid)
                .input('RestaurantId', sql.Int, restaurant_id)
                .query('SELECT fbid, ProductoId as productoId, RestauranteId as restauranteId, NombreRestaurante as nombreRestaurante, NombreProducto as nombreProducto, ImagenProducto as imagenProducto, Precio as precio'
                    + ' FROM Favoritos WHERE fbid = @fbid and RestauranteId = @RestaurantId')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});

router.post('/favoritos', jwtMW, async (req, res, next) => {


    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    var food_id = req.body.foodId;
    var restaurant_id = req.body.restaurantId;
    var restaurant_name = req.body.restaurantName;
    var food_name = req.body.foodName;
    var food_image = req.body.foodImage;
    var food_price = req.body.price;

    if (fbid != null) {

        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('FBID', sql.NVarChar, fbid)
                .input('FoodId', sql.Int, food_id)
                .input('RestaurantId', sql.Int, restaurant_id)
                .input('RestaurantName', sql.NVarChar, restaurant_name)
                .input('FoodName', sql.NVarChar, food_name)
                .input('FoodImage', sql.NVarChar, food_image)
                .input('FoodPrice', sql.Float, food_price)
                .query('INSERT INTO Favoritos'
                    + '(FBID, ProductoId, RestauranteId, NombreRestaurante, NombreProducto, ImagenProducto, Precio)'
                    + 'VALUES'
                    + '(@FBID, @FoodId, @RestaurantId, @RestaurantName, @FoodName, @FoodImage, @FoodPrice)')

            res.send(JSON.stringify({ success: true, message: "Success" }));
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in body of POST request" }));
    }

})

router.delete('/favoritos', jwtMW, async (req, res, next) => {


    var authorization = req.headers.authorization, decoded;
    try {
        decoded = jwt.verify(authorization.split(' ')[1], SECRET_KEY);
    }
    catch (e) {
        return res.status(401).send('Unauthorized');
    }

    var fbid = decoded.fbid;
    var food_id = req.query.foodId;
    var restaurant_id = req.query.restaurantId;

    if (fbid != null) {

        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('FBID', sql.NVarChar, fbid)
                .input('FoodId', sql.Int, food_id)
                .input('RestaurantId', sql.Int, restaurant_id)
                .query('DELETE FROM Favoritos WHERE FBID = @FBID AND ProductoId = @FoodId and RestauranteId = @RestaurantId')

            res.send(JSON.stringify({ success: true, message: "Success" }));
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

})

//=========================================================================
// TABLA REPARTIDOR_PEDIDO
// POST / GET
//=========================================================================


router.post('/repartidorPedido', jwtMW, async (req, res, next) => {

    var orderId = req.body.orderId;
    var restaurantId = req.body.restaurantId;

    if (orderId != null && restaurantId != null) {

        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('OrderId', sql.Int, orderId)
                .input('RestaurantId', sql.Int, restaurantId)
                .query('INSERT INTO Repartidor_Pedido'
                    + '(PedidoId, RepartidorId, RestaurantId, Estado)'
                    + 'VALUES'
                    + '(@OrderId, 1, @RestaurantId, 0)')

            res.send(JSON.stringify({ success: true, message: "Success" }));
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    } else {
        res.send(JSON.stringify({ success: false, message: "Missing orderId, restaurantId in body of POST request" }));
    }

})

router.get('/repartidorPedido', jwtMW, async (req, res, next) => {

    var restaurantId = req.query.restaurantId;
    var startIndex = req.query.from;
    var endIndex = req.query.to;

    if (startIndex == null || isNaN(startIndex))
        startIndex = 0;
    if (endIndex == null || isNaN(endIndex))
        endIndex = 10;

    if (restaurantId != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('RestaurantId', sql.Int, restaurantId)
                .input('StartIndex', sql.Int, startIndex)
                .input('EndIndex', sql.Int, endIndex)
                .query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY rp.PedidoId DESC)'
                    + ' AS RowNum, rp.PedidoId, rp.Estado as Status, p.Nombre, p.Direccion, p.Celular, p.Fecha, p.Estado, p.TransaccionId, p.COD, p.Total, p.NumItems'
                    + ' from Repartidor_Pedido rp INNER JOIN Pedido p on rp.PedidoId = p.PedidoId'
                    + ' WHERE rp.RestaurantId = @RestaurantId AND rp.RepartidorId = 0)'
                    + ' AS RowConstrainedResult WHERE RowNum >= @StartIndex AND RowNum <= @EndIndex ORDER BY PedidoId DESC')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});

//pendiente
router.get('/maxrepartidorPedidoPorRestaurant', jwtMW, async (req, res, next) => {

    var restaurantId = req.query.restaurantId;

    if (restaurantId != null) {
        try {
            const pool = await poolPromise
            const queryResult = await pool.request()
                .input('RestaurantId', sql.Int, restaurantId)

                .query('SELECT * FROM (SELECT ROW_NUMBER() OVER (ORDER BY rp.PedidoId DESC)'
                    + ' AS RowNum, rp.PedidoId, rp.Estado as Status, p.Nombre, p.Direccion, p.Celular, p.Fecha, p.Estado, p.TransaccionId, p.COD, p.Total, p.NumItems'
                    + ' from Repartidor_Pedido rp INNER JOIN Pedido p on rp.PedidoId = p.PedidoId'
                    + ' WHERE rp.RestaurantId = @RestaurantId AND rp.RepartidorId = 0)'
                    + ' AS RowConstrainedResult WHERE RowNum >= @StartIndex AND RowNum <= @EndIndex ORDER BY PedidoId DESC')

            if (queryResult.recordset.length > 0) {
                res.send(JSON.stringify({ success: true, result: queryResult.recordset }));
            }
            else {
                res.send(JSON.stringify({ success: false, message: "Empty" }));
            }
        }
        catch (err) {
            res.status(500) //Internal Server Error
            res.send(JSON.stringify({ success: false, message: err.message }));
        }
    }
    else {
        res.send(JSON.stringify({ success: false, message: "Missing fbid in query" }));
    }

});

module.exports = router;