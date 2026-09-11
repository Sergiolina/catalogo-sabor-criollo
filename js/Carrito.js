let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


// =========================
// MOSTRAR CARRITO
// =========================

function mostrarCarrito() {

    const listaCarrito = document.getElementById("lista-carrito");
    const totalCarrito = document.getElementById("total-carrito");

    listaCarrito.innerHTML = "";

    let total = 0;

    if (carrito.length === 0) {

        listaCarrito.innerHTML = `
            <div class="carrito-vacio">
                <h2>Tu carrito está vacío 🛒</h2>

                <p>
                    Agrega algunos productos desde nuestro catálogo.
                </p>

                <a href="Catalogo.html" class="boton">
                    Ver catálogo
                </a>
            </div>
        `;

        totalCarrito.textContent = "$0";

        actualizarContadorCarrito();

        return;
    }


    carrito.forEach(producto => {

        const subtotal = producto.precio * producto.cantidad;

        total += subtotal;

        const tarjeta = document.createElement("div");

        tarjeta.classList.add("item-carrito");

        tarjeta.innerHTML = `
            <div class="item-info">

                <h3>${producto.nombre}</h3>

                <p>
                    $${producto.precio} × ${producto.cantidad}
                </p>

                <strong>
                    Subtotal: $${subtotal}
                </strong>

            </div>


            <div class="item-acciones">

                <button onclick="disminuirCantidad(${producto.id})">
                    −
                </button>

                <span>
                    ${producto.cantidad}
                </span>

                <button onclick="aumentarCantidad(${producto.id})">
                    +
                </button>

                <button
                    class="boton-eliminar"
                    onclick="eliminarDelCarrito(${producto.id})">
                    🗑️
                </button>

            </div>
        `;

        listaCarrito.appendChild(tarjeta);
    });


    totalCarrito.textContent = `$${total}`;

    actualizarContadorCarrito();
}


// =========================
// AUMENTAR CANTIDAD
// =========================

function aumentarCantidad(id) {

    const producto = carrito.find(
        producto => producto.id === id
    );

    if (!producto) return;

    producto.cantidad++;

    guardarCarrito();

    mostrarCarrito();
}


// =========================
// DISMINUIR CANTIDAD
// =========================

function disminuirCantidad(id) {

    const producto = carrito.find(
        producto => producto.id === id
    );

    if (!producto) return;

    producto.cantidad--;

    if (producto.cantidad <= 0) {

        carrito = carrito.filter(
            producto => producto.id !== id
        );
    }

    guardarCarrito();

    mostrarCarrito();
}


// =========================
// ELIMINAR PRODUCTO
// =========================

function eliminarDelCarrito(id) {

    carrito = carrito.filter(
        producto => producto.id !== id
    );

    guardarCarrito();

    mostrarCarrito();
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
// CONTADOR
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
// INICIAR
// =========================

mostrarCarrito();

/* FUNCION DE BOTON DE WHATSAPP*/ 
const botonWhatsApp = document.getElementById("boton-whatsapp");

if (botonWhatsApp) {

    botonWhatsApp.addEventListener(
        "click",
        ordenarPorWhatsApp
    );
}
// =========================
// PEDIDO POR WHATSAPP
// =========================

function ordenarPorWhatsApp() {

    const numeroWhatsApp = "5352999785";

    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let mensaje = "Hola, quisiera realizar este pedido:%0A%0A";

    let total = 0;

    carrito.forEach(producto => {

        const subtotal = producto.precio * producto.cantidad;

        total += subtotal;

        mensaje += `• ${producto.nombre} x${producto.cantidad} - $${subtotal}%0A`;
    });

    mensaje += `%0ATotal: $${total}`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

    window.open(url, "_blank");
}