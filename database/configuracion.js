//Aquí se creará la conexión con la base de datos y se hacen las consultas a esta

const mysql = require("mysql2/promise"); //conectamos la base de datos que usaremos; en este caso es mySql

//Creamos la función para conectarnos a la base de datos en concreto que usaremos ("gastos"); esta será necesaria en las consultas de las funciones siguientes
function conectar(){
    return new Promise(async callback => {
        //Creamos un try/catch; en el try se espera la conexión a la base de datos mySQL, la cual contiene un objeto con la información del host, el usuario, la contraseña y el nombre de la base de datos al a que accedemos; si la conexión se logra, se llama el callback con el array [null,conexion], donde null representa la ausencia de error y conexion es el objeto de conexión a mySQL
        try{
            let conexion = await mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "",
                database: "gastos"
            });
            callback([null, conexion]);
        //Si ocurre un error, entramos en el catch, donde tenemos un objeto que simplemente contiene una propiedad, "error" (sin valor)   
        }catch(error){
            callback([error]);
        };
    });
};

//Creamos la función para iniciar sesión con los argumentos us(usuario) y pass(password), en la que se reconocerán los usuarios y contraseñas guardados en la tabla "usuarios" en la base de datos; usamos la consulta SELECT
function leerSesion(us, pass){
    return new Promise(async callback => {
        //Desestructuramos la función de arriba llamada conectar en un array de dos elementos: error y conexion
        let [error, conexion] = await conectar();
        //Si conectar no resulta en error, ocurre lo siguiente
        if(!error){
            //Realizamos la consulta a la base de datos para reconocer los items de usuarios y contraseñas contenidos en la tabla usuarios; extraemos el resultado de esa consulta y hacemos que espere la conexion de la función conectar; 
            let consulta = `SELECT * FROM usuarios ${(us, pass) ? "WHERE usuario = ? AND password = ?" : ""}`;
            let [resultado] = await conexion.query(consulta, (us, pass) ? [us, pass] : null);
            //Cerramos la conexión; si la conexión se logra, se llama el callback con el array [null,resultado], donde null representa la ausencia de error y resultado es lo que obtenemos de la anterior consulta
            conexion.close();
            callback([null, resultado]);
        }else{
            //Si ocurre un error, entramos en el else, donde tenemos un objeto con el nombre "error" y un valor con un mensaje que indica lo que pasó
            callback([{ error: "ERROR EN LA BASE DE DATOS" }]);
        };
    });
};

//Creamos la función para acceder a los items correspondientes a la sesión de cada usuario; le damos como argumento el id del usuario; usamos la consulta SELECT e INNER JOIN
function leer(idUsuario){
    return new Promise(async callback => {
        //Desestructuramos la función de arriba llamada conectar en un array de dos elementos: error y conexion
        let [error, conexion] = await conectar();
        //Si conectar no resulta en error, ocurre lo siguiente
        if(!error){
            //Realizamos la consulta a la base de datos para reconocer los cuatro elementos de la tabla items (el id, la fecha, el nombre del item y el precio); combinamos el id de la tabla items con el id de la tabla usuarios_items para que cada usuario tenga sus propios items; además, si existe el id del usuario, se filtra la tabla de tal manera que solo se vean los items en los que el id_u de usuarios_items coincida con el idUsuario indicado
            let consulta = `SELECT items.id_g,items.fecha,items.item,items.precio,usuarios_items.id_u FROM items INNER JOIN usuarios_items ON items.id_g = usuarios_items.id_g ${idUsuario ? "WHERE usuarios_items.id_u = ?" : ""}`;
            //Extraemos el resultado de esa consulta y ponemos la condición de que exista el id de usuario para darle ese valor; cerramos la conexión; si la conexión se logra, se llama el callback con el array [null,resultado], donde null representa la ausencia de error y resultado es lo que obtenemos de la anterior consulta
            let [resultado] = await conexion.query(consulta, idUsuario ? [idUsuario] : null);
            conexion.close();
            callback([null, resultado]);
        }else{
            //Si ocurre un error, entramos en el else, donde tenemos un objeto con el nombre "error" y un valor con un mensaje que indica lo que pasó
            callback([{ error: "ERROR EN LA BASE DE DATOS" }]);
        }
    });
};

//Creamos la función para añadir nuevos items con los argumentos id del usuario, fecha, item y precio; usamos las consultas INSERT INTO y SELECT
function crear(idUsuario, fecha, item, precio){
    return new Promise(async callback => {
        //Creamos una condición: el id del usuario, la fecha, el nombre del item y su precio no deben estar vacíos
        if(idUsuario != "" && fecha != "" && item != "" && precio != ""){
            //Desestructuramos la función de arriba llamada conectar en un array de dos elementos: error y conexion
            let [error, conexion] = await conectar();
            //Si conectar no resulta en error, ocurre lo siguiente
            if(!error){
                //Si no hay error, creamos tres consultas:
                //La primera consulta inserta los valores de fecha, item y precio en los registros fecha, item y precio de la tabla items
                let [resultadoInsercionItems] = await conexion.query("INSERT INTO items(fecha, item, precio) VALUES (?,?,?)", [fecha, item, precio]);
                //La segunda consulta obtiene el id del item (llamado id_g) de la tabla items, donde esté la fecha, item y precio
                let [resultadoObtencionId] = await conexion.query("SELECT id_g FROM items WHERE fecha=? AND item=? AND precio=?", [fecha, item, precio]);
                //La tercera consulta inserta el valor del id del usuario y el item  (obtenido anteiormente) en la tabla usuarios_items, que es donde se determina de qué item es de qué usuario
                let [resultadoInsercionIdUsuario] = await conexion.query("INSERT INTO usuarios_items(id_u,id_g) VALUES (?,?)", [idUsuario, resultadoObtencionId[0].id_g]);
                //Cerramos la conexión; si la conexión se logra, se llama el callback con un array, donde null representa la ausencia de error y el siguiente objeto contiene los resultados de las anteriores consultas
                conexion.close();
                callback([null, {resultadoInsercionItems , resultadoObtencionId , resultadoInsercionIdUsuario}]);
            }else{
                //Si ocurre un error, entramos en el else, donde tenemos un objeto con el nombre "error" y un valor con un mensaje que indica lo que pasó
                callback([{ error: "ERROR EN LA BASE DE DATOS" }]);
            };
        }else{
            //Si ocurre un error (el idUsuario, la fecha, el item o el precio están vacíos), entramos en el else, donde tenemos un objeto con el nombre "error" y un valor con un mensaje que indica lo que pasó
            callback([{ error: "ERROR EN LOS CAMPOS" }]);
        };
    });
};

//Creamos la función para eliminar items identificando cada uno mediante su id; usamos la consulta DELETE
function borrar(id){
    return new Promise(async callback => {
        //Desestructuramos la función de arriba llamada conectar en un array de dos elementos: error y conexion
        let [error, conexion] = await conectar();
        //Si conectar no resulta en error, ocurre lo siguiente
        if(!error){
            //Si no hay error, realizamos la consulta a la base de datos para eliminar el item cuyo id coincida con el del argumento de la función borrar
            let [resultadoBorrardeItems] = await conexion.query("DELETE FROM items WHERE id_g=?", [id]);
            let [resultadoBorrardeUsuariosItems] = await conexion.query("DELETE FROM usuarios_items WHERE id_g=?", [id]);
            //Cerramos la conexión; si la conexión se logra, se llama el callback con un array, donde null representa la ausencia de error y lo que sigue son los resultados de las consultas
            conexion.close();
            callback([null, { resultadoBorrardeItems , resultadoBorrardeUsuariosItems }]);
        }else{
            //Si ocurre un error, entramos en el else, donde tenemos un objeto con el nombre "error" y un valor con un mensaje que indica lo que pasó
            callback({ error: "ERROR EN LA BASE DE DATOS" });
        };
    });
};

//Creamos la función para actualizar la información de los items; como argumentos asignamos el id, fecha, item y precio del elemento; usamos la consulta UPDATE
function editar(id, fecha, item, precio){
    return new Promise(async callback => {
        //Desestructuramos la función de arriba llamada conectar en un array de dos elementos: error y conexion
        let [error, conexion] = await conectar();
        //Si conectar no resulta en error, ocurre lo siguiente
        if(!error){
            //Si no hay error, realizamos la consulta a la base de datos para actualizar los datos fecha, item, precio e id (los dos últimos previamente convertidos a número) en la tabla items
            let [resultado] = await conexion.query("UPDATE items SET fecha = ? , item = ? , precio = ? WHERE id_g=?", [fecha, item, Number(precio), Number(id)]);
            //Cerramos la conexión; si la conexión se logra, se llama el callback con el array [null,resultado], donde null representa la ausencia de error y resultado es lo que obtenemos de la anterior consulta
            conexion.close();
            callback([null, resultado]);
        }else{
            //Si ocurre un error, entramos en el else, donde tenemos un objeto con el nombre "error" y un valor con un mensaje que indica lo que pasó
            callback({ error: "ERROR EN LA BASE DE DATOS" });
        };
    });
};

//Exportamos las funciones creadas (para luego importarlas en index.js)
module.exports = { leerSesion, leer, crear, borrar, editar };