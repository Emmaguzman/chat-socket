const { io } = require("../server");
const { Usuarios } = require("../classes/usuarios");
const { crearMensaje } = require('../utils/utiliadaes')
const usuarios = new Usuarios();

io.on("connection", (client) => {
    client.on("entrarAlChat", (data, callback) => {
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: "el nombre y sala son necesarios",
            });
        }
        client.join(data.sala);
        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);
        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonas());
        callback(personas);
    });


    // ENVIAR MENSAJE!
    // console->socket.emit('crearMensaje',{ mensaje:'HOLA!'});
    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });

    client.on("disconnect", () => {
        //console.log('alguien se desconecto Oo');
        let personaBorrada = usuarios.borrarPersona(client.id);
        //client.broadcast.emit('crearMensaje', { usuario: 'administrador', mensaje: `${personaBorrada.nombre} ha salido del chat` })
        client.broadcast.emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} Salio del chat`))
        client.broadcast.emit('listaPersonas', usuarios.getPersonas());

    });

    //MENSAJES PRIVADOS MANDAR
    //socket.emit('mensajePrivado',{ mensaje:'HOLA PESHA!',para:"224vDqIKird8A3wYAAAD"});

    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        // console.log(data.para);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje))
    });
    socket.emit('mensajePrivado', { mensaje: 'HOLA PESHA!', para: "224vDqIKird8A3wYAAAD" });

});