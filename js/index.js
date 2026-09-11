// =========================
// CONTADOR DEL CARRITO
// =========================

function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-nav");

    if (!contador) return;

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const cantidadTotal = carrito.reduce(
        (total, producto) => total + producto.cantidad,
        0
    );

    contador.textContent = cantidadTotal;
}


// Actualizar al cargar la página
actualizarContadorCarrito();