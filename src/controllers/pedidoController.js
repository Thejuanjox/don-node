const PedidoModel = require('../models/pedidoModel');

function registrarPedido(req, res) {
    let { nom_cliente, tamano, ingredientes, cantidad } = req.body;

    
    if (!ingredientes) {
        return res.send(`
            <h2 style="color:red; text-align:center; margin-top:50px;">
                Atencion: Debes seleccionar al menos un ingrediente. 
                <br><a href="/">Volver</a>
            </h2>
        `);
    }

    
    let arregloIngredientes = [];
    if (Array.isArray(ingredientes)) {
        arregloIngredientes = ingredientes;
    } else {
        arregloIngredientes = [ingredientes];
    }


    const cantIng = arregloIngredientes.length;
    let extras = cantIng - 3;
    if (extras < 0) {
        extras = 0;
    }

    let preBase = 0;
    let valExtra = 0;


    if (tamano === 'Chica') {
        preBase = 3990;
        valExtra = 500;
    } else if (tamano === 'Mediana') {
        preBase = 5990;
        valExtra = 800;
    } else if (tamano === 'Grande') {
        preBase = 8490;
        valExtra = 1200;
    }

    const preUnitario = preBase + (extras * valExtra);
    const numCant = parseInt(cantidad);
    const totalVenta = preUnitario * numCant;

    
    const nuevoPedido = {
        cliente: nom_cliente,
        tamano: tamano,
        detalleIngredientes: arregloIngredientes.join(', '),
        precio_uni: preUnitario,
        cant: numCant,
        total: totalVenta
    };

    PedidoModel.guardar(nuevoPedido);
    res.redirect('/pedidos/lista');
}

function listarPedidos(req, res) {
    const todosLosPedidos = PedidoModel.obtenerTodos();

    let acumuladoFinal = 0;
    let filasTabla = '';

    
    let ventaMasAlta = 0;
    let nombreMasCaro = '';

    todosLosPedidos.forEach(p => {
        acumuladoFinal += p.total;
        
        if (p.total > ventaMasAlta) {
            ventaMasAlta = p.total;
            nombreMasCaro = p.cliente;
        }

        filasTabla += `
            <tr>
                <td>${p.cliente}</td>
                <td>${p.tamano}</td>
                <td>${p.detalleIngredientes}</td>
                <td>$${p.precio_uni}</td>
                <td>${p.cant}</td>
                <td class="fw-bold">$${p.total}</td>
            </tr>
        `;
    });


    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Pedidos</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="container mt-5">
            <h1 class="mb-4">Pedidos registrados</h1>
            <a class="btn btn-secondary mb-3" href="/">Volver a registrar</a>

            ${todosLosPedidos.length === 0 ? 
                '<div class="alert alert-warning">Aun no hay pedidos en el sistema</div>' 
                : `
                <table class="table table-bordered table-striped shadow-sm">
                    <thead class="table-dark">
                        <tr>
                            <th>Cliente</th>
                            <th>Tamaño</th>
                            <th>Ingredientes</th>
                            <th>Valor unitario</th>
                            <th>Cant.</th>
                            <th>Total pedido</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasTabla}
                    </tbody>
                    <tfoot class="table-warning">
                        <tr>
                            <th colspan="5" class="text-end">Total acumulado del dia:</th>
                            <th class="fs-5">$${acumuladoFinal}</th>
                        </tr>
                    </tfoot>
                </table>

                ${ventaMasAlta > 0 ? 
                    `<div class="alert alert-success mt-3">
                        <strong> Dato Extra:</strong> La compra mas grande la hizo <strong>${nombreMasCaro}</strong> por un total de <strong>$${ventaMasAlta}</strong>.
                    </div>` 
                : ''}
            `}
        </body>
        </html>
    `);
}

module.exports = { registrarPedido, listarPedidos };