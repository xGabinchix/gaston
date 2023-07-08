//Aquí se gestionará la API y las funciones CRUD realizadas por el usuario

/*DESDE AQUÍ ASIGNAMOS LAS VARIABLES*/

//Creamos el servidor con Express; también importamos bodyParser y sesiones
const express = require("express");
const servidor = express();
const bodyParser = require("body-parser");
const session = require("express-session");

//Importamos las funciones con las consultas a la bbdd creadas en configuracion.js
const { leerSesion, leer, crear, borrar, editar } = require("./database/configuracion");


/*DESDE AQUI EMPIEZA EL MIDDLEWARE*/

//Importamos la plantilla ejs (la usaremos para index.ejs y login.ejs)
servidor.set("view engine", "ejs");

//Gestionamos el uso de sesiones
servidor.use(session({
    secret: "1234",
    resave: true,
    saveUninitialized: false,
    store: ""
}));

//Importamos body-parser y declaramos que procese el body enviado desde funciones.js y lo vuelva .json (que ponga content-type "json" automáticamente)
servidor.use(bodyParser.urlencoded({ extended: true }));
servidor.use(bodyParser.json());

//Importamos la carpeta de archivos estáticos, que en este caso se llama publico
servidor.use("/", express.static("./publico"));


//Creamos la ruta del login; siempre que el usuario no esté logueado, es redirigido a login
servidor.get("/login", (peticion, respuesta) => {
    if (!peticion.session.usuario) {
        return respuesta.render("login", { error: false, mensajeError: null });
    }
    respuesta.redirect("/");
});

//Creamos la gestión del login, de tal manera que se acepte solo el usuario y la contraseña de la base de datos para acceder a cada sesión; usamos la petición POST
servidor.post("/login", async (peticion, respuesta) => {
    //Creamos un objeto que extrae el usuario y la contraseña del body de la petición
    let { usuario,password } = peticion.body;
    //Usamos un try/catch; en el try esperamos los resultados de la función leerSesion de configuracion.js
    try{
        const [error, resultados] = await leerSesion(usuario, password);
        if(resultados.length > 0){
        //Si los resultados de leer Sesion tienen ALGO (al menos un caracter), significa que se logró el login, y para confirmarlo colocamos un console.log; luego definimos dos propiedades de peticion.session: primero para la información del usuario se le asigna el valor del primer elemento del array de resultados, y luego para la información del id del usuario se le asigna el valor del primer elemento del array de resultados también; finalmente, redirigimos a la página del index, donde el usuario podrá interactuar con sus items
            console.log("LOGIN SATISFACTORIO");
            peticion.session.usuario = { usuario: resultados[0].usuario };
            peticion.session.id_u = { id: resultados[0].id_u };
            return respuesta.redirect("/");
        }else{
        //Si leerSesion resulta en error, enviamos a la consola un mensaje apropiado; también redirigimos a la página de login pero con un mensaje incluido que explique al usuario cuál fue el error 
            console.log("LOGIN ERRÓNEO")
            respuesta.render("login", { error: true, mensajeError: "HAY UN ERROR EN EL USUARIO O LA CONTRASEÑA. POR FAVOR, ESCRÍBELAS OTRA VEZ." });
        }
    }catch(error){
    //Si hay un error en la petición, redirigimos a la página de login con un mensaje incluido que explique al usuario cuál fue el error
        return respuesta.render("login", { error: true, mensajeError: "ERROR EN EL SERVIDOR" });
    };
});

//Creamos la ruta para la página de cada usuario (el index), donde leerá sus propios items (gastos); usamos la petición GET
servidor.get("/", async (peticion, respuesta) => {
    if(peticion.session.usuario){
    //Si el login fue satisfactorio (existe el usuario), esperamos la función leer de configuracion.js con el argumento peticion.session.id_u.id creado anteriormente
        [error, resultados] = await leer(peticion.session.id_u.id);
        if(!error){
        //Si no hay error en la función leer, accedemos al index.ejs y le enviamos dos datos: el usuario y sus gastos
            return respuesta.render("index", {
                usuario: peticion.session.usuario.usuario,
                gastos: resultados
            });
        };
    };
    //Si el login no es satisfactorio, redirigimos a la página de login
    return respuesta.redirect("/login");
});

//Creamos la ruta para crear nuevos items en cada sesión; usamos la petición POST, que hace alusión al formulario de index.ejs
servidor.post("/", async (peticion, respuesta) => {
    if(peticion.session.usuario){
        //Si el login fue satisfactorio (existe el usuario), extraemos los elementos fecha, item y precio del cuerpo de la petición
        let { fecha, item, precio } = peticion.body;
        //A dichos elementos se le añade el id de usuario (peticion.session.id_u.id), y estos cuatro se ponen como argumentos de la función crear de configuracion.js
        [error, resultados] = await crear(peticion.session.id_u.id, fecha, item, precio);
        if(!error){
            //Si no hay error en la función crear, accedemos al index.ejs donde se visualizarán los nuevos items
            return respuesta.redirect("/");
        };
        //Si el login no es satisfactorio, redirigimos a la página de login
        return respuesta.redirect("/login");
    };
});

//Creamos la ruta para eliminar items, identificándolos por su id; usamos la petición DELETE
servidor.delete("/api/items/:id", async (peticion, respuesta) => {
    if(peticion.session.usuario){
        //Si el login fue satisfactorio (existe el usuario), creamos una constante para identificar el id del item que irá variando
        const id = peticion.params.id;
        //Dicho id se le asigna a la función borrar de configuracion.js, la cual esperamos
        [error, resultados] = await borrar(id);
        if(!error){
            //Si no hay error en la función borrar, accedemos al index.ejs donde se visualizarán los items menos los borrados
            return respuesta.status(200).redirect("/");
        };
    };
    //Si el login no es satisfactorio, redirigimos a la página de login
    return respuesta.redirect("/login");
});

//Creamos la ruta para editar items, identificándolos por su id
servidor.put("/api/items/:id", async (peticion, respuesta) => {
    if(peticion.session.usuario){
        //Si el login fue satisfactorio (existe el usuario), extraemos los elementos fecha, item y precio del cuerpo de la petición y también creamos una constante para identificar el id del item que irá variando
        let { fecha, item, precio } = peticion.body;
        const id = peticion.params.id;
        //Estos cuatro elementos se le asignan como argumentos a la función editar de configuracion.js, a la cual esperamos
        [error, resultados] = await editar(id, fecha, item, precio);
        if(!error){
            //Si no hay error en la función editar, accedemos al index.ejs donde se visualizarán los items editados
            return respuesta.status(200).redirect("/login");
        };
    };
    //Si el login no es satisfactorio, redirigimos a la página de login
    return respuesta.status(200).redirect("/login");
});

//Creamos la ruta para cerrar sesión, redirigiendo al usuario al login
servidor.get("/logout", (peticion, respuesta) => {
    peticion.session.destroy(() => respuesta.redirect("/login"));
});


/*HACEMOS LA CONEXIÓN AL PUERTO 9001*/
servidor.listen(9001);