alert("ESTE ES EL CATALOGO.JS NUEVO");
// =========================
// PRODUCTOS
// =========================
console.log("Catalogo.js cargado");

let productos = [];
async function cargarProductos() {

    try {

        const respuesta = await fetch(`${API_URL}/api/Productos`);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los productos."
            );
        }

        const productosAPI = await respuesta.json();

        productos = productosAPI.filter(
            producto => producto.disponible === true
        );

        mostrarProductos();

    } catch (error) {

        console.error(error);

    }
}
// =========================
// CARRITO
// =========================

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


// =========================
// MOSTRAR PRODUCTOS
// =========================

function mostrarProductos() {

    const listaComidas = document.getElementById("lista-comidas");
    const listaBebidas = document.getElementById("lista-bebidas");

    listaComidas.innerHTML = "";
    listaBebidas.innerHTML = "";

    productos.forEach(producto => {

        const tarjeta = document.createElement("div");

        tarjeta.classList.add("producto");

        tarjeta.innerHTML = `
            <div class="producto-info">

                <h3>${producto.nombre}</h3>

                <p>${producto.descripcion}</p>

            </div>

            <div class="producto-accion">

                <strong>$${producto.precio}</strong>

                <button onclick="agregarAlCarrito(${producto.id})">
                    Agregar
                </button>

            </div>
        `;

        if (producto.categoria === "Comida") {

            listaComidas.appendChild(tarjeta);

        } else if (producto.categoria === "Bebida") {

            listaBebidas.appendChild(tarjeta);
        }

    });
}


// =========================
// AGREGAR AL CARRITO
// =========================

function agregarAlCarrito(id) {

    const producto = productos.find(
        producto => producto.id === id
    );

    if (!producto) return;

    const productoEnCarrito = carrito.find(
        item => item.id === id
    );

    if (productoEnCarrito) {

        productoEnCarrito.cantidad++;

    } else {

        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    guardarCarrito();

    actualizarContadorCarrito();
}


// =========================
// GUARDAR CARRITO
// =========================

function guardarCarrito() {

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );
}


// =========================
// CONTADOR DEL CARRITO
// =========================

function actualizarContadorCarrito() {

    const contador = document.getElementById("contador-nav");

    if (!contador) return;

    const cantidadTotal = carrito.reduce(
        (total, producto) => total + producto.cantidad,
        0
    );

    contador.textContent = cantidadTotal;
}


// =========================
// INICIALIZACIÓN
// =========================

cargarProductos();

actualizarContadorCarrito();
