//Aquí se crearán las funciones que tienen que ver con el front end, específicamente las que tienen que ver con editar y eliminar los items

//Para la edición de los items, creamos dos "estados": el de guardar gasto (cuando hemos hecho click en el lápiz para editar) y el de editar gasto (cuando no hemos hecho click en el lápiz)

//Previamente hemos creado en la platilla index.ejs las funciones onclick correspondientes al div que contien el lápiz de editar y el div que contiene el bote de eliminar


//Creamos la función para guardar los cambios hechos en un gasto (estamos en el estado guardar gasto), para lo cual tomamos como argumento el id del item para identificarlo
async function guardarGasto(id) {
    
    //Nos aseguramos de que exista el documento index.ejs por medio de un if, para manipular el DOM
    if(document){
        
        //Definimos tres variables para referirnos al valor de la fecha, item y precio de cada elemento; los identificamos por el id dentro de la clase que le pusimos a cada uno en index.ejs
        let fecha = document.querySelector(".fecha_input_" + id).value;
        let item = document.querySelector(".item_input_" + id).value;
        let precio = document.querySelector(".precio_input_" + id).value;
        
        //Creamos un try/catch; dentro del try usamos fetch para enviar una petición PUT a la URL /api/items/${id} (el id va variando según el elemento); en ella incluimos como body los datos fecha, item y precio indicados arriba y los convertimos en JSON; como content-type le damos application/json, ya que los datos son JSON
        try{
            await fetch(`/api/items/${id}`, {
                body: JSON.stringify({ fecha, item, precio }),
                method: "PUT",
                headers: { "Content-Type" : "application/json" }
            });
            location.reload(); // actualiza la página para mostrar los datos modificados

        //Si ocurre un error, pasa lo siguiente
        }catch(error){
            //Creamos dos constantes que traen el div para editar y el div para guardar; hemos creado la clase displayNone que corresponde a la instrucción display: none en css; en este caso le quitamos la clase displayNone al div editar (que lo tiene por default) para que se muestre el lápiz y le ponemos la clase displayNone al div para guardar para que no se muestre el disquette
            const botonEditar = document.querySelector('.botonEditar_' + id)
            const botonGuardar = document.querySelector('.botonGuardar_' + id)
            botonEditar.classList.remove('displayNone');
            botonGuardar.classList.add('displayNone')

            //Creamos tres variables que traen los datos ya escritos de fecha, item y precio (que están con etiquetas <p> en index.ejs); si estamos en el estado actual de guardar gasto, los mostramos quitándoles la clase displayNone (la cual se les da en el estado de editar gasto)
            let elemento_fecha_dato = document.querySelector(".fecha_dato_" + id);
            let elemento_item_dato = document.querySelector(".item_dato_" + id);
            let elemento_precio_dato = document.querySelector(".precio_dato_" + id);
            elemento_fecha_dato.classList.remove('displayNone')
            elemento_item_dato.classList.remove('displayNone')
            elemento_precio_dato.classList.remove('displayNone')

            //Creamos tres variables que traen los cuadros de texto de fecha, item y precio (que están con etiquetas <input> en index.ejs); si estamos en el estado actual de guardar gasto, los ocultamos dándoles la clase displayNone (la cual se les quita en el estado de editar gasto)
            let elemento_fecha_input = document.querySelector(".fecha_input_" + id);
            let elemento_item_input = document.querySelector(".item_input_" + id);
            let elemento_precio_input = document.querySelector(".precio_input_" + id);
            elemento_fecha_input.classList.add('displayNone')
            elemento_item_input.classList.add('displayNone')
            elemento_precio_input.classList.add('displayNone')
        };
    };
};

//Creamos la función para cambiar los cambios hechos en un gasto (estamos en el estado editar gasto), para lo cual tomamos como argumento el id del item para identificarlo
function editarGasto(id){
    
    if(document){
        //Creamos dos constantes que traen el div para editar y el div para guardar; hemos creado la clase displayNone que corresponde a la instrucción display: none en css; en este caso le quitamos la clase displayNone al div editar (que lo tiene por default) para que se muestre el lápiz y le ponemos la clase displayNone al div para guardar para que no se muestre el disquette
        const botonEditar = document.querySelector('.botonEditar_' + id)
        const botonGuardar = document.querySelector('.botonGuardar_' + id)
        botonEditar.classList.add('displayNone');
        botonGuardar.classList.remove('displayNone')

        //Creamos tres variables que traen los datos ya escritos de fecha, item y precio (que están con etiquetas <p> en index.ejs); si estamos en el estado actual de editar gasto, los ocultamos dándoles la clase displayNone (la cual se les quita en el estado de editar gasto)
        let elemento_fecha_dato = document.querySelector(".fecha_dato_" + id);
        let elemento_item_dato = document.querySelector(".item_dato_" + id);
        let elemento_precio_dato = document.querySelector(".precio_dato_" + id);
        elemento_fecha_dato.classList.add('displayNone')
        elemento_item_dato.classList.add('displayNone')
        elemento_precio_dato.classList.add('displayNone')

        //Creamos tres variables que traen los cuadros de texto de fecha, item y precio (que están con etiquetas <input> en index.ejs); si estamos en el estado actual de editar gasto, los mostramos quitándoles la clase displayNone (la cual se les da en el estado de editar gasto)
        let elemento_fecha_input = document.querySelector(".fecha_input_" + id);
        let elemento_item_input = document.querySelector(".item_input_" + id);
        let elemento_precio_input = document.querySelector(".precio_input_" + id);
        elemento_fecha_input.classList.remove('displayNone')
        elemento_item_input.classList.remove('displayNone')
        elemento_precio_input.classList.remove('displayNone')
    };
};

//Creamos la función para eliminar gastos; al div con el símbolo de basurero se le ha colocado como propiedad un onclick en index.ejs para que al hacerle click venga a esta función
async function borrarGasto(id){
    if(document){
        //Usamos fetch para enviar una petición DELETE a la URL /api/items/${id} (el id va variando según el elemento)
        const respuesta = await fetch(`/api/items/${id}`, { method: "DELETE" })
        .then(respuesta => respuesta.json()); //recibe el "bien" o "mal" del back
        //Traemos cada div con la clase cuadroRegistros, que contiene la infomación de cada item y que identificamos por el id; luego indicamos que, si existe dicho div, este mismo se elimine
        console.log(respuesta);
        let divParaBorrar = document.querySelector(".cuadroRegistros_"+id);
        if(respuesta.resultado == "bien"){
        divParaBorrar.remove();
        };
    };
};
