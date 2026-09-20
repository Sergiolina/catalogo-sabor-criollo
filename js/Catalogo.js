// =========================
// ESTADO DEL CATÁLOGO
// =========================

let productos = [];          // Solo productos disponibles (vienen de la API)
let categorias = [];         // Ordenadas por el campo "orden" (vienen de la API)
let categoriaActiva = null;  // null = "Todos"


// =========================
// CARRITO
// =========================

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];


// =========================
// UTILIDADES
// =========================

// Los textos vienen del backend: se escapan antes de meterlos en innerHTML.
function escaparHTML(texto) {

    return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[caracter]));
}


// =========================
// CARGAR CATEGORÍAS (API)
// =========================

async function cargarCategorias() {

    try {

        const respuesta = await fetch(`${API_URL}/api/Categorias`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las categorías.");
        }

        const categoriasAPI = await respuesta.json();

        if (!Array.isArray(categoriasAPI)) {
            throw new Error("Respuesta inesperada al cargar las categorías.");
        }

        // Respeta el orden definido en el backend
        return [...categoriasAPI].sort(
            (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
        );

    } catch (error) {

        // Sin categorías el catálogo sigue funcionando (solo "Todos")
        console.error(error);

        return [];
    }
}


// =========================
// CARGAR PRODUCTOS (API)
// =========================

async function cargarProductos() {

    const respuesta = await fetch(`${API_URL}/api/Productos`);

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los productos.");
    }

    const productosAPI = await respuesta.json();

    if (!Array.isArray(productosAPI)) {
        throw new Error("Respuesta inesperada al cargar los productos.");
    }

    return productosAPI.filter(
        producto => producto.disponible === true
    );
}


// =========================
// MENSAJES (cargando / error / vacío)
// =========================

function mostrarMensaje(texto, esError = false) {

    const contenedor = document.getElementById("catalogo-productos");

    const mensaje = document.createElement("p");

    mensaje.classList.add("mensaje-catalogo");

    if (esError) {
        mensaje.classList.add("error");
    }

    mensaje.textContent = texto;

    contenedor.innerHTML = "";
    contenedor.appendChild(mensaje);
}


// =========================
// RENDERIZAR FILTROS
// =========================

function renderizarFiltros() {

    const contenedor = document.getElementById("filtros-categorias");

    contenedor.innerHTML = "";

    const opciones = [{ id: null, nombre: "Todos" }, ...categorias];

    opciones.forEach(opcion => {

        const boton = document.createElement("button");

        boton.type = "button";
        boton.classList.add("filtro-categoria");
        boton.textContent = opcion.nombre;
        boton.dataset.id = opcion.id === null ? "" : String(opcion.id);

        boton.addEventListener(
            "click",
            () => filtrarProductos(opcion.id)
        );

        contenedor.appendChild(boton);
    });

    actualizarFiltroActivo();
}

function actualizarFiltroActivo() {

    const idActivo = categoriaActiva === null ? "" : String(categoriaActiva);

    document
        .querySelectorAll("#filtros-categorias .filtro-categoria")
        .forEach(boton => {

            const activo = boton.dataset.id === idActivo;

            boton.classList.toggle("activo", activo);
            boton.setAttribute("aria-pressed", String(activo));
        });
}


// =========================
// FILTRAR PRODUCTOS
// =========================

function filtrarProductos(categoriaId) {

    categoriaActiva = categoriaId;

    actualizarFiltroActivo();

    mostrarProductos();
}


// =========================
// RENDERIZAR PRODUCTOS
// =========================

function crearTarjetaProducto(producto) {

    const tarjeta = document.createElement("div");

    tarjeta.classList.add("producto");

    // Si no hay imagen válida no se dibuja <img> (no se inventan imágenes)
    const tieneImagen =
        typeof producto.imagenUrl === "string" &&
        producto.imagenUrl.trim() !== "";

    const imagen = tieneImagen
        ? `<img
                src="${escaparHTML(producto.imagenUrl.trim())}"
                alt="${escaparHTML(producto.nombre)}"
                class="producto-imagen"
                onerror="this.remove()"
           >`
        : "";

    const descripcion = producto.descripcion
        ? `<p>${escaparHTML(producto.descripcion)}</p>`
        : "";

    tarjeta.innerHTML = `
        ${imagen}

        <div class="producto-contenido">

            <h3>${escaparHTML(producto.nombre)}</h3>

            ${descripcion}

            <div class="producto-accion">

                <strong>$${escaparHTML(producto.precio)}</strong>

                <button type="button">
                    Agregar
                </button>

            </div>

        </div>
    `;

    tarjeta
        .querySelector("button")
        .addEventListener("click", () => agregarAlCarrito(producto.id));

    return tarjeta;
}

function crearGrupoProductos(titulo, items) {

    const seccion = document.createElement("section");

    seccion.classList.add("categoria-productos");

    if (titulo) {

        const encabezado = document.createElement("h2");

        encabezado.textContent = titulo;

        seccion.appendChild(encabezado);
    }

    const lista = document.createElement("div");

    lista.classList.add("lista-productos");

    items.forEach(producto => {
        lista.appendChild(crearTarjetaProducto(producto));
    });

    seccion.appendChild(lista);

    return seccion;
}

function mostrarProductos() {

    const contenedor = document.getElementById("catalogo-productos");

    if (productos.length === 0) {
        mostrarMensaje("No hay productos disponibles por el momento.");
        return;
    }

    const visibles = categoriaActiva === null
        ? productos
        : productos.filter(
            producto => producto.categoriaId === categoriaActiva
        );

    if (visibles.length === 0) {
        mostrarMensaje("No hay productos disponibles en esta categoría.");
        return;
    }

    // Agrupa por categoría (relación por categoriaId) respetando el orden
    const grupos = categorias
        .map(categoria => ({
            titulo: categoria.nombre,
            items: visibles.filter(
                producto => producto.categoriaId === categoria.id
            )
        }))
        .filter(grupo => grupo.items.length > 0);

    // Productos cuya categoría no existe en /api/Categorias
    const idsConocidos = new Set(categorias.map(categoria => categoria.id));

    const sinCategoria = visibles.filter(
        producto => !idsConocidos.has(producto.categoriaId)
    );

    if (sinCategoria.length > 0) {
        grupos.push({
            titulo: categorias.length > 0 ? "Otros" : null,
            items: sinCategoria
        });
    }

    contenedor.innerHTML = "";

    grupos.forEach(grupo => {
        contenedor.appendChild(
            crearGrupoProductos(grupo.titulo, grupo.items)
        );
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

async function inicializarCatalogo() {

    mostrarMensaje("Cargando catálogo...");

    try {

        // Una sola llamada por endpoint, en paralelo
        const [categoriasAPI, productosAPI] = await Promise.all([
            cargarCategorias(),
            cargarProductos()
        ]);

        categorias = categoriasAPI;
        productos = productosAPI;

    } catch (error) {

        console.error(error);

        document.getElementById("filtros-categorias").innerHTML = "";

        mostrarMensaje(
            "No se pudieron cargar los productos. Intenta de nuevo en unos minutos.",
            true
        );

        return;
    }

    renderizarFiltros();

    mostrarProductos();
}

inicializarCatalogo();

actualizarContadorCarrito();
