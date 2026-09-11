// =========================
// PRODUCTOS
// =========================

const productos = [
    {
        id: 1,
        nombre: "Pizza Especial",
        descripcion: "Pizza con queso, jamón y vegetales.",
        precio: 350,
        categoria: "comidas"
    },
    {
        id: 2,
        nombre: "Hamburguesa Criolla",
        descripcion: "Carne, queso, vegetales y salsa.",
        precio: 250,
        categoria: "comidas"
    },
    {
        id: 3,
        nombre: "Refresco",
        descripcion: "Refresco frío.",
        precio: 100,
        categoria: "bebidas"
    },
    {
        id: 4,
        nombre: "Jugo Natural",
        descripcion: "Jugo preparado al momento.",
        precio: 150,
        categoria: "bebidas"
    }
];


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

        if (producto.categoria === "comidas") {

            listaComidas.appendChild(tarjeta);

        } else if (producto.categoria === "bebidas") {

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

mostrarProductos();

actualizarContadorCarrito();