const botones = document.querySelectorAll(".pestanas button");
const ventanas = document.querySelectorAll(".contenidos section");
botones.forEach(boton => {
    boton.addEventListener("click", () => {
        ventanas.forEach(ventana => {
            ventana.style.display = "none";
        });
        const nombreVentana = boton.dataset.ventana;
        const ventanaSeleccionada =
            document.getElementById(nombreVentana);
        ventanaSeleccionada.style.display = "block";

        if (nombreVentana === "batalla") {
            prepararBatalla();
        }
    });
});
function cambiarSubpestana(subpestana) {
    const btnPersonajes = document.getElementById("btn-sub-personajes");
    const btnTarjetas = document.getElementById("btn-sub-tarjetas");
    const subPersonajes = document.getElementById("sub-personajes");
    const subTarjetas = document.getElementById("sub-tarjetas");

    if (subpestana === "personajes") {
        btnPersonajes.classList.add("activo");
        btnTarjetas.classList.remove("activo");
        subPersonajes.style.display = "block";
        subPersonajes.classList.add("activo");
        subTarjetas.style.display = "none";
        subTarjetas.classList.remove("activo");
    } else if (subpestana === "tarjetas") {
        btnTarjetas.classList.add("activo");
        btnPersonajes.classList.remove("activo");
        subTarjetas.style.display = "block";
        subTarjetas.classList.add("activo");
        subPersonajes.style.display = "none";
        subPersonajes.classList.remove("activo");
    }
}
let personajes = [];
let tarjetasGuardadas = [];

async function cargarTarjetas() {
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasGuardadas = await respuesta.json();
            mostrarTarjetas(tarjetasGuardadas);
        }
    } catch (error) {
        console.warn("No hay tarjetas previas o hubo un error al cargar tarjeta.json");
    }
}
cargarTarjetas();
function mostrarTarjetas(lista) {
    const contenedorGrid = document.getElementById("grid-tarjetas-galeria");
    if (!contenedorGrid) return;
    contenedorGrid.innerHTML = "";
    
    lista.forEach(tarjeta => {
        const div = document.createElement("div");
        div.className = "tarjeta-personaje tarjeta-mini";
        div.onclick = () => abrirModalTarjeta(tarjeta);
        
        div.innerHTML = `
            <h3 class="titulo-carta">${tarjeta.nombre}</h3>
            <img src="${tarjeta.imagen || ''}" alt="${tarjeta.nombre}" class="imagen-personaje">
            ${generarEtiquetasTipo(tarjeta.tipo || 'Tarjeta')}
        `;
        contenedorGrid.appendChild(div);
    });
}

function abrirModalTarjeta(tarjeta) {
    const modal = document.getElementById("modal-detalle-tarjeta");
    const detalle = document.getElementById("contenido-detalle-tarjeta");
    if (!modal || !detalle) return;
    
    let efectosHtml = "";
    if (tarjeta.efectos && tarjeta.efectos.length > 0) {
        efectosHtml = "<ul style='padding-left: 20px; margin-top: 10px; color: #eeeeee; font-size: 14px;'>" + tarjeta.efectos.map(e => `<li style="margin-bottom: 6px;"><strong>${e.atributo ? e.atributo.toUpperCase() : ''}:</strong> <span style="color: #88ff88;">${e.modificacion > 0 ? '+' : ''}${e.modificacion || e.valor || ''}</span></li>`).join("") + "</ul>";
    } else {
        efectosHtml = "<p style='color: #888; font-size: 13px; margin-top: 10px;'>Sin efectos registrados.</p>";
    }

    let excepcionesHtml = "";
    if (tarjeta.excepciones && tarjeta.excepciones.length > 0) {
        excepcionesHtml = "<ul style='padding-left: 20px; margin-top: 10px; color: #eeeeee; font-size: 14px;'>" + tarjeta.excepciones.map(ex => {
            let objetivo = ex.personajeId ? "Un personaje específico" : (ex.tipo || "Todos");
            const detalleCondicion = ex.condicion === "Inmune" ? " (esta tarjeta no surte efecto contra ese objetivo)" : (ex.porcentaje ? '('+ex.porcentaje+'%)' : '');
            return `<li style="margin-bottom: 6px;"><strong>Objetivo:</strong> ${objetivo} <br><span style="color: #ff8888;">➤ Condición: ${ex.condicion} ${detalleCondicion}</span></li>`;
        }).join("") + "</ul>";
    } else {
        excepcionesHtml = "<p style='color: #888; font-size: 13px; margin-top: 10px;'>Sin excepciones.</p>";
    }

    detalle.innerHTML = `
        <div class="detalle-modal">
            <img src="${tarjeta.imagen || ''}" alt="${tarjeta.nombre}" class="detalle-imagen">
            <div class="detalle-info">
                <h2>${tarjeta.nombre}</h2>
                ${generarEtiquetasTipo(tarjeta.tipo || 'Tarjeta')}
                <div class="bloque-descripcion-tarjeta">
                    <p style="color: #cccccc; font-size: 14px; font-style: italic; margin: 0; line-height: 1.5;">"${tarjeta.descripcion || 'Sin descripción detallada.'}"</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background-color: #2b2b2b; padding: 15px; border-radius: 6px; border: 1px solid #4a3621;">
                        <h4 style="color: #ffcc00; margin: 0; border-bottom: 1px solid #4a3621; padding-bottom: 8px;">⚔️ Efectos</h4>
                        ${efectosHtml}
                    </div>
                    <div style="background-color: #2b2b2b; padding: 15px; border-radius: 6px; border: 1px solid #4a3621;">
                        <h4 style="color: #ff8888; margin: 0; border-bottom: 1px solid #4a3621; padding-bottom: 8px;">⚠️ Excepciones</h4>
                        ${excepcionesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = "block";
}

function cerrarModalTarjetaDetalle() {
    const modalTarjeta = document.getElementById("modal-detalle-tarjeta");
    if (modalTarjeta) {
        modalTarjeta.style.display = "none";
    }
}

const modalDetalleTarjeta = document.getElementById("modal-detalle-tarjeta");
if (modalDetalleTarjeta) {
    modalDetalleTarjeta.addEventListener("click", (event) => {
        if (event.target === modalDetalleTarjeta) {
            cerrarModalTarjetaDetalle();
        }
    });
}
function guardarTarjetaEquipamiento() {
    const tipo = document.getElementById("tipo-tarjeta-equipamiento").value;
    const nombre = document.getElementById("nombre-tarjeta-equipamiento").value;
    const descripcion = document.getElementById("descripcion-tarjeta-equipamiento").value;
    const puntos = parseInt(document.getElementById("puntos-tarjeta-equipamiento").value) || 0;

    const mapaAtributos = {
        "Arma": "fuerza",
        "Armadura": "defensa",
        "Reliquia": "magia",
        "Montura": "velocidad",
        "Conocimiento": "inteligencia"
    };

    const atributoCorrespondiente = mapaAtributos[tipo] || "fuerza";

    const nuevaTarjeta = {
        idTarjeta: "T_" + Date.now(),
        nombre: nombre,
        tipo: tipo,
        descripcion: descripcion,
        efectos: [
            {
                atributo: atributoCorrespondiente,
                modificacion: puntos
            }
        ]
    };

    tarjetasGuardadas.push(nuevaTarjeta);
    if (typeof cerrarFormularioEquipamiento === "function") {
        cerrarFormularioEquipamiento();
    }
}
function guardarTarjetaEntorno() {
    const tipo = document.getElementById("tipo-tarjeta-entorno").value;
    const nombre = document.getElementById("nombre-tarjeta-entorno").value;
    const descripcion = document.getElementById("descripcion-tarjeta-entorno").value;
    const puntos = parseInt(document.getElementById("puntos-tarjeta-entorno").value) || 0;
    const tipoAfectado = document.getElementById("tipo-afectado-entorno").value;

    const nuevaTarjeta = {
        idTarjeta: "T_" + Date.now(),
        nombre: nombre,
        tipo: tipo,
        descripcion: descripcion,
        tipoAfectado: tipoAfectado,
        efectos: [
            {
                atributo: "todos",
                modificacion: puntos
            }
        ]
    };

    tarjetasGuardadas.push(nuevaTarjeta);
    if (typeof cerrarFormularioEntorno === "function") {
        cerrarFormularioEntorno();
    }
}
function guardarTarjetaBenMal() {
    const tipo = document.getElementById("tipo-tarjeta-ben-mal").value;
    const nombre = document.getElementById("nombre-tarjeta-ben-mal").value;
    const descripcion = document.getElementById("descripcion-tarjeta-ben-mal").value;
    const puntos = parseInt(document.getElementById("puntos-tarjeta-ben-mal").value) || 0;

    const nuevaTarjeta = {
        idTarjeta: "T_" + Date.now(),
        nombre: nombre,
        tipo: tipo,
        descripcion: descripcion,
        puntos: puntos,
        efectos: [
            {
                atributo: "todos",
                modificacion: (tipo === "Maldición" || tipo === "Maldicion") ? -Math.abs(puntos) : Math.abs(puntos)
            }
        ]
    };

    tarjetasGuardadas.push(nuevaTarjeta);
    if (typeof cerrarFormularioBenMal === "function") {
        cerrarFormularioBenMal();
    }
}function abrirFormularioVinculo(tipo) {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("titulo-formulario-vinculo").innerText = `CREAR VÍNCULO: ${tipo.toUpperCase()}`;
    document.getElementById("tipo-tarjeta-vinculo").value = tipo;
    document.getElementById("descripcion-tarjeta-vinculo").value = "";
    document.getElementById("puntos-tarjeta-vinculo").value = 25;

    const select = document.getElementById("personaje-tarjeta-vinculo");
    if (select) {
        select.innerHTML = "";
        personajes.forEach(p => {
            if (p.id !== idPropietarioTarjetaActual) {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = p.nombre;
                select.appendChild(opt);
            }
        });
    }

    document.getElementById("modal-formulario-vinculo").style.display = "block";
}

function cerrarFormularioVinculo() {
    document.getElementById("modal-formulario-vinculo").style.display = "none";
}

function guardarTarjetaVinculo() {
    const tipo = document.getElementById("tipo-tarjeta-vinculo").value;
    const vinculadoId = document.getElementById("personaje-tarjeta-vinculo").value;
    const descripcion = document.getElementById("descripcion-tarjeta-vinculo").value;
    const puntos = parseInt(document.getElementById("puntos-tarjeta-vinculo").value) || 0;

    const propietarioId = idPropietarioTarjetaActual || window.personajeActualId || document.getElementById("personaje-actual-id")?.value;
    const personajeB = personajes.find(p => p.id === vinculadoId);

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: propietarioId,
        tipo: tipo,
        nombre: tipo === "Amor" ? `Amor hacia ${personajeB ? personajeB.nombre : 'Objetivo'}` : "Vínculo: " + tipo,
        descripcion: descripcion,
        vinculadosIds: [vinculadoId],
        puntosVinculo: puntos,
        efectos: [
            {
                atributo: "todos",
                modificacion: puntos
            }
        ],
        excepciones: []
    };

    if (typeof tarjetasGuardadas === 'undefined') {
        window.tarjetasGuardadas = [];
    }
    tarjetasGuardadas.push(nuevaTarjeta);

    const blob = new Blob([JSON.stringify(tarjetasGuardadas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    cerrarFormularioVinculo();
    mostrarTarjetas(tarjetasGuardadas);

    const personaje = personajes.find(p => p.id === propietarioId);
    if (personaje) {
        abrirModal(personaje);
    }
}
function abrirModalTarjetaPorId(idTarjeta) {
    const tarjeta = tarjetasGuardadas.find(t => t.idTarjeta === idTarjeta);
    if(tarjeta) {
        abrirModalTarjeta(tarjeta);
    }
}
function generarEtiquetasTipo(tiposString) {
    if (!tiposString) return '';
    const tipos = tiposString.split(',').map(t => t.trim());
    return `<div class="contenedor-tipos">` + tipos.map(tipo => {
        const claseTipo = "tipo-" + tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        return `<span class="etiqueta-tipo ${claseTipo}">${tipo}</span>`;
    }).join('') + `</div>`;
}
async function cargarPersonajes() {
    try {
        const respuesta = await fetch("personajes.json");
        personajes = await respuesta.json();
        mostrarPersonajes(personajes);
        mostrarMazosGuardados();
        mostrarMazosParaBatalla();
    } catch (error) {
        console.error("Error al cargar el archivo de personajes:", error);
    }
}
function mostrarPersonajes(lista) {
    const contenedorSub = document.getElementById("sub-personajes");
    if (!contenedorSub) return;
    contenedorSub.innerHTML = "";
    const contenedorGrid = document.createElement("div");
    contenedorGrid.className = "galeria-grid";
    lista.forEach(personaje => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-personaje";
        tarjeta.onclick = () => abrirModal(personaje);
        tarjeta.innerHTML = `
            <h3 class="titulo-carta">${personaje.nombre}</h3>
            <img src="${personaje.imagen}" alt="${personaje.nombre}" class="imagen-personaje">
            ${generarEtiquetasTipo(personaje.tipo)}
        `;
        contenedorGrid.appendChild(tarjeta);
    });
    contenedorSub.appendChild(contenedorGrid);
}
const modal = document.getElementById("modal-personaje");
const btnCerrar = document.querySelector(".cerrar-modal");
function obtenerColorAtributo(atributo) {
    const colores = {
        velocidad: "#2dd4bf",
        inteligencia: "#60a5fa",
        fuerza: "#f97316",
        defensa: "#a3e635",
        magia: "#c084fc"
    };

    return colores[atributo] || "#88c0d0";
}

function generarBarraAtributo(atributo, valor) {
    const info = getStatInfo(atributo, valor);
    const color = obtenerColorAtributo(atributo);
    const medida = info.esEv ? Math.min(100, (info.evValue / 10) * 100) : Math.min(100, (info.statValue % 100 || (info.statValue > 0 ? 100 : 0)));
    const etiquetaMedida = info.esEv ? `EV ${info.evValue}/10` : `${info.statValue}/100`;

    return `
        <div class="atributo-medidor" style="--color-atributo: ${color};">
            <div class="atributo-medidor-encabezado">
                <span class="atributo-medidor-nombre ${info.esEv ? 'texto-dorado' : ''}">${info.nombreDisplay}</span>
                <span class="atributo-medidor-valor">${info.valorDisplay}</span>
            </div>
            <div class="atributo-barra" aria-label="${info.nombreDisplay}: ${etiquetaMedida}">
                <span style="width: ${medida}%"></span>
            </div>
            <small class="atributo-medidor-medida">${etiquetaMedida}</small>
        </div>
    `;
}

function abrirModal(personaje) {
    const detalle = document.getElementById("detalle-personaje");
    const stats = personaje.atributos || {};
    const evolucionDisponible = ((personaje.puntosPositivos || 0) + (personaje.puntosNegativos || 0)) >= 25;
    const tarjetaDisponible = (personaje.duelos || 0) >= 15;
    const accionesDisponibles = `
        <div class="acciones-personaje">
            ${tarjetaDisponible ? `<button id="btn-tarjeta-disponible" class="boton-alerta-personaje boton-alerta-tarjeta" onclick="abrirModalTarjetaHistoria('${personaje.id}')">✨ TARJETA DISPONIBLE</button>` : ''}
            ${evolucionDisponible ? `<button id="btn-evolucion-pendiente" class="boton-alerta-personaje boton-alerta-evolucion" onclick="abrirModalEvolucion('${personaje.id}')">⚡ EVOLUCIÓN DISPONIBLE</button>` : ''}
        </div>
    `;
    
    const tarjetasPersonaje = tarjetasGuardadas.filter(t => t.propietarioId === personaje.id);
    let htmlTarjeta = "";
    if (tarjetasPersonaje.length > 0) {
        htmlTarjeta = `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">`;
        tarjetasPersonaje.forEach(tarjeta => {
            let efectosTexto = "Sin efectos";
            if (tarjeta.efectos && tarjeta.efectos.length > 0) {
                efectosTexto = tarjeta.efectos.map(e => `${e.atributo.toUpperCase()}: ${e.modificacion > 0 ? '+' : ''}${e.modificacion}`).join(", ");
            }
            htmlTarjeta += `
                <button type="button" onclick="abrirModalTarjetaPorId('${tarjeta.idTarjeta}')" class="tarjeta-asociada-personaje">
                    <span class="tarjeta-asociada-titulo">🗡️ ${tarjeta.nombre}</span>
                    ${generarEtiquetasTipo(tarjeta.tipo || 'Tarjeta')}
                    <span class="tarjeta-asociada-efectos"><strong>Efectos:</strong> ${efectosTexto}</span>
                </button>
            `;
        });
        htmlTarjeta += `</div>`;
    }

    detalle.innerHTML = `
        <div class="detalle-modal">
            <div class="detalle-visual">
                <img src="${personaje.imagen}" alt="${personaje.nombre}" class="detalle-imagen">
                ${accionesDisponibles}
            </div>
            <div class="detalle-info">
                <h2>${personaje.nombre}</h2>
                <div class="tipo-personaje-modal">
                    ${generarEtiquetasTipo(personaje.tipo)}
                </div>
                <p class="historia-personaje modal-historia">${personaje.historia}</p>
                <div class="atributos-personaje">
                    ${["velocidad", "inteligencia", "fuerza", "defensa", "magia"].map(a => generarBarraAtributo(a, stats[a] ?? 0)).join("")}
                </div>
                ${htmlTarjeta}
               <div class="resumen-personaje">
                    <p><span class="puntos-positivos">+ Puntos Positivos:</span> ${personaje.puntosPositivos ?? 0}</p>
                    <p><span class="puntos-negativos">- Puntos Negativos:</span> ${personaje.puntosNegativos ?? 0}</p>
                    <p><span class="duelos-librados">Duelos Librados:</span> ${personaje.duelos ?? 0}</p>
                </div>
            </div>
        </div>
    `;
    modal.style.display = "block";
}
btnCerrar.onclick = () => {
    modal.style.display = "none";
}
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
cargarPersonajes();
let mazosGuardados = [];
let mazoActual = [];
let indiceMazoEditando = null;
const MAX_CARTAS = 50;

const modalMazo = document.getElementById("modal-nuevo-mazo");
const btnNuevoMazo = document.getElementById("btn-nuevo-mazo");
const btnCerrarMazo = document.querySelector(".cerrar-modal-mazo");
const contenedorDisponibles = document.getElementById("personajes-disponibles");
const contenedorMazo = document.getElementById("personajes-mazo");
const contadorMazo = document.getElementById("contador-mazo");
const btnGuardarMazo = document.getElementById("btn-guardar-mazo");
const listaMazosContenedor = document.getElementById("lista-mazos");

async function cargarMazos() {
    try {
        const respuesta = await fetch("mazos.json");
        if (respuesta.ok) {
            mazosGuardados = await respuesta.json();
            mostrarMazosGuardados();
        }
    } catch (error) {
        console.warn("No hay mazos previos o hubo un error al cargar mazos.json");
    }
}

function obtenerPersonajesDelMazo(mazoIds) {
    return mazoIds.map(id => personajes.find(p => p.id === id)).filter(Boolean);
}

function crearVistaTarjetaMazo(mazoIds, index, opciones = {}) {
    const { permitirAcciones = true, onSeleccionar = null } = opciones;
    const personajesMazo = obtenerPersonajesDelMazo(mazoIds);
    const divMazo = document.createElement("article");
    divMazo.className = "item-mazo tarjeta-mazo";
    divMazo.tabIndex = 0;

    const vistaPrevia = personajesMazo.slice(0, 6).map(personaje => `
        <div class="miniatura-mazo">
            <img src="${personaje.imagen}" alt="${personaje.nombre}">
            <span>${personaje.nombre}</span>
        </div>
    `).join("");

    const faltantes = Math.max(0, mazoIds.length - personajesMazo.length);
    const textoFaltantes = faltantes > 0 ? `<p class="mazo-aviso">${faltantes} carta(s) no encontradas en personajes.json.</p>` : "";

    divMazo.innerHTML = `
        <div class="mazo-cabecera">
            <div>
                <h3>Mazo ${index + 1}</h3>
                <p>${mazoIds.length} carta(s) seleccionadas</p>
            </div>
            <span class="mazo-contador">${mazoIds.length}/${MAX_CARTAS}</span>
        </div>
        <div class="mazo-vista-previa">${vistaPrevia || '<p class="mazo-vacio">Sin cartas visibles</p>'}</div>
        ${textoFaltantes}
        <div class="mazo-detalle" hidden>
            <h4>Cartas del mazo</h4>
            <div class="mazo-cartas-lista"></div>
        </div>
        ${permitirAcciones ? `
            <div class="mazo-acciones">
                <button type="button" class="btn-editar-mazo">Editar</button>
                <button type="button" class="btn-eliminar-mazo">Eliminar</button>
            </div>
        ` : '<p class="ayuda-mazo-batalla">Haz clic de nuevo para usar este mazo en batalla.</p>'}
    `;

    const detalle = divMazo.querySelector(".mazo-detalle");
    const listaDetalle = divMazo.querySelector(".mazo-cartas-lista");
    listaDetalle.append(...personajesMazo.map(crearTarjetaMini));
    detalle.addEventListener("click", event => event.stopPropagation());

    const alternarDetalle = () => {
        const estaAbierto = !detalle.hidden;
        document.querySelectorAll(".mazo-detalle").forEach(panel => panel.hidden = true);
        detalle.hidden = estaAbierto;
    };

    divMazo.addEventListener("click", () => {
        if (!permitirAcciones && !detalle.hidden && typeof onSeleccionar === "function") {
            onSeleccionar(mazoIds);
            return;
        }
        alternarDetalle();
    });
    divMazo.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            divMazo.click();
        }
    });

    if (permitirAcciones) {
        divMazo.querySelector(".btn-editar-mazo").addEventListener("click", (event) => {
            event.stopPropagation();
            editarMazo(index);
        });
        divMazo.querySelector(".btn-eliminar-mazo").addEventListener("click", (event) => {
            event.stopPropagation();
            eliminarMazo(index);
        });
    }

    return divMazo;
}

function mostrarMazosGuardados() {
    listaMazosContenedor.innerHTML = "";
    if (mazosGuardados.length === 0) {
        listaMazosContenedor.innerHTML = '<p class="mazo-vacio">No hay mazos guardados todavía.</p>';
        return;
    }

    mazosGuardados.forEach((mazo, index) => {
        listaMazosContenedor.appendChild(crearVistaTarjetaMazo(mazo, index));
    });
}

btnNuevoMazo.addEventListener("click", () => {
    indiceMazoEditando = null;
    mazoActual = [];
    actualizarInterfazConstructor();
    modalMazo.style.display = "block";
});

btnCerrarMazo.onclick = () => {
    modalMazo.style.display = "none";
}

window.addEventListener("click", (event) => {
    if (event.target == modalMazo) {
        modalMazo.style.display = "none";
    }
});

function actualizarInterfazConstructor() {
    contenedorDisponibles.innerHTML = "";
    contenedorMazo.innerHTML = "";
    contadorMazo.textContent = mazoActual.length;

    const disponibles = personajes.filter(p => !mazoActual.some(m => m.id === p.id));
    
    disponibles.forEach(personaje => {
        const tarjeta = crearTarjetaMini(personaje);
        tarjeta.onclick = () => agregarAlMazo(personaje);
        contenedorDisponibles.appendChild(tarjeta);
    });

    for (let i = 0; i < MAX_CARTAS; i++) {
        if (i < mazoActual.length) {
            const personaje = mazoActual[i];
            const tarjeta = crearTarjetaMini(personaje);
            tarjeta.onclick = () => quitarDelMazo(personaje);
            contenedorMazo.appendChild(tarjeta);
        } else {
            const vacio = document.createElement("div");
            vacio.className = "espacio-vacio";
            contenedorMazo.appendChild(vacio);
        }
    }
}

function crearTarjetaMini(personaje) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-personaje";
    tarjeta.innerHTML = `
        <h3 class="titulo-carta">${personaje.nombre}</h3>
    <img src="${personaje.imagen}" alt="${personaje.nombre}" class="imagen-personaje">
    ${generarEtiquetasTipo(personaje.tipo)}
`;
    return tarjeta;
}

function agregarAlMazo(personaje) {
    if (mazoActual.length < MAX_CARTAS) {
        mazoActual.push(personaje);
        actualizarInterfazConstructor();
    } else {
        alert("El mazo ya tiene 50 cartas.");
    }
}

function quitarDelMazo(personaje) {
    mazoActual = mazoActual.filter(p => p.id !== personaje.id);
    actualizarInterfazConstructor();
}

function descargarMazosActualizados() {
    const blob = new Blob([JSON.stringify(mazosGuardados, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "mazos.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function editarMazo(index) {
    indiceMazoEditando = index;
    mazoActual = obtenerPersonajesDelMazo(mazosGuardados[index]);
    actualizarInterfazConstructor();
    modalMazo.style.display = "block";
}

function eliminarMazo(index) {
    if (!confirm(`¿Eliminar el Mazo ${index + 1}?`)) return;
    mazosGuardados.splice(index, 1);
    descargarMazosActualizados();
    mostrarMazosGuardados();
    mostrarMazosParaBatalla();
}

btnGuardarMazo.addEventListener("click", () => {
    if (mazoActual.length === 0) {
        alert("El mazo está vacío. Agrega personajes antes de guardar.");
        return;
    }
    
    const nuevoMazoIds = mazoActual.map(p => p.id);
    if (indiceMazoEditando === null) {
        mazosGuardados.push(nuevoMazoIds);
    } else {
        mazosGuardados[indiceMazoEditando] = nuevoMazoIds;
    }

    descargarMazosActualizados();
    indiceMazoEditando = null;
    mostrarMazosGuardados();
    mostrarMazosParaBatalla();
    modalMazo.style.display = "none";
});

cargarMazos();
// --- SISTEMA DE BATALLA ---
let mazoBatallaSeleccionado = [];
let personajesPrincipales = [];
let mazoBatallaRival = [];
let mazoRestanteUsuario = [];
let mazoRestanteRival = [];
let manoUsuario = [];
let manoRival = [];
let estadisticasBatallaPrincipales = {};
let tarjetasEntornoUsadas = [];

const pantallaSeleccionMazo = document.getElementById("pantalla-seleccion-mazo");
const pantallaSeleccionPersonajes = document.getElementById("pantalla-seleccion-personajes");
const pantallaBatallaActiva = document.getElementById("pantalla-batalla-activa");
const listaMazosBatalla = document.getElementById("lista-mazos-batalla");
const gridPersonajesBatalla = document.getElementById("grid-personajes-batalla");
const contadorPrincipales = document.getElementById("contador-principales");
const btnAleatorioBatalla = document.getElementById("btn-aleatorio-batalla");
const btnConfirmarPrincipales = document.getElementById("btn-confirmar-principales");
const btnVolverMazos = document.getElementById("btn-volver-mazos");

function prepararBatalla() {
    pantallaSeleccionMazo.style.display = "block";
    pantallaSeleccionPersonajes.style.display = "none";
    pantallaBatallaActiva.style.display = "none";
    personajesPrincipales = [];
    mostrarMazosParaBatalla();
}

function mostrarMazosParaBatalla() {
    listaMazosBatalla.innerHTML = "";
    if (mazosGuardados.length === 0) {
        listaMazosBatalla.innerHTML = "<p>No hay mazos guardados. Crea uno en la pestaña Mazo.</p>";
        return;
    }

    mazosGuardados.forEach((mazoIds, index) => {
        listaMazosBatalla.appendChild(crearVistaTarjetaMazo(mazoIds, index, {
            permitirAcciones: false,
            onSeleccionar: seleccionarMazoBatalla
        }));
    });
}

function seleccionarMazoBatalla(mazoIds) {
    mazoBatallaSeleccionado = mazoIds.map(id => personajes.find(p => p.id === id)).filter(Boolean);
    personajesPrincipales = [];
    
    pantallaSeleccionMazo.style.display = "none";
    pantallaSeleccionPersonajes.style.display = "block";
    actualizarInterfazSeleccionPrincipales();
}

function actualizarInterfazSeleccionPrincipales() {
    gridPersonajesBatalla.innerHTML = "";
    contadorPrincipales.textContent = personajesPrincipales.length;
    btnConfirmarPrincipales.disabled = personajesPrincipales.length !== 3;

    mazoBatallaSeleccionado.forEach(personaje => {
        const tarjeta = crearTarjetaMini(personaje);
        const esSeleccionado = personajesPrincipales.some(p => p.id === personaje.id);
        
        if (esSeleccionado) {
            tarjeta.classList.add("tarjeta-seleccionada-principal");
        }

        tarjeta.onclick = () => toggleSeleccionPrincipal(personaje);
        gridPersonajesBatalla.appendChild(tarjeta);
    });
}

function toggleSeleccionPrincipal(personaje) {
    const index = personajesPrincipales.findIndex(p => p.id === personaje.id);
    if (index !== -1) {
        personajesPrincipales.splice(index, 1);
    } else {
        if (personajesPrincipales.length < 3) {
            personajesPrincipales.push(personaje);
        } else {
            alert("Ya has seleccionado 3 personajes principales.");
        }
    }
    actualizarInterfazSeleccionPrincipales();
}

btnAleatorioBatalla.addEventListener("click", () => {
    if (mazoBatallaSeleccionado.length < 3) {
        alert("El mazo debe tener al menos 3 cartas para elegir aleatoriamente.");
        return;
    }
    const copiaMazo = [...mazoBatallaSeleccionado];
    copiaMazo.sort(() => 0.5 - Math.random());
    personajesPrincipales = copiaMazo.slice(0, 3);
    actualizarInterfazSeleccionPrincipales();
});

btnVolverMazos.addEventListener("click", () => {
    prepararBatalla();
});

btnConfirmarPrincipales.addEventListener("click", () => {
    pantallaSeleccionPersonajes.style.display = "none";
    
    const modalBatalla = document.getElementById("modal-batalla");
    if (modalBatalla) {
        modalBatalla.style.display = "flex";
        iniciarRondaBatalla();
    }
});
let asignacionesUsuario = {};
let asignacionesRival = {};
const ATRIBUTOS = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];
function iniciarRondaBatalla() {
    mazoRestanteUsuario = [...personajesPrincipales];
    mazoRestanteUsuario.sort(() => 0.5 - Math.random());
    
    estadisticasBatallaPrincipales = {};
    personajesPrincipales.forEach(p => {
        estadisticasBatallaPrincipales[p.id] = {
            historialDuelos: [],
            duelos: 0
        };
    });
    
    let mazoRivalIds = [];
    if (mazosGuardados.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * mazosGuardados.length);
        mazoRivalIds = mazosGuardados[indiceAleatorio];
    }
    let mazoRival = mazoRivalIds.map(id => personajes.find(p => p.id === id)).filter(Boolean);
    if (mazoRival.length < 7) {
        mazoRival = [...personajes];
    }
    mazoRestanteRival = [...mazoRival];
    mazoRestanteRival.sort(() => 0.5 - Math.random());

    manoUsuario = [];
    manoRival = [];
    tarjetasEntornoUsadas = [];
    
    repartirCartas();
}
function iniciarRondaBatalla() {
    mazoRestanteUsuario = [...mazoBatallaSeleccionado];
    mazoRestanteUsuario.sort(() => 0.5 - Math.random());
    
    estadisticasBatallaPrincipales = {};
    personajesPrincipales.forEach(p => {
        estadisticasBatallaPrincipales[p.id] = {
            historialDuelos: []
        };
    });

    let mazoRivalIds = [];
    if (mazosGuardados.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * mazosGuardados.length);
        mazoRivalIds = mazosGuardados[indiceAleatorio];
    }
    let mazoRival = mazoRivalIds.map(id => personajes.find(p => p.id === id)).filter(Boolean);
    if (mazoRival.length < 7) {
        mazoRival = [...personajes];
    }
    mazoRestanteRival = [...mazoRival];
    mazoRestanteRival.sort(() => 0.5 - Math.random());

    manoUsuario = [];
    manoRival = [];
    
    repartirCartas();
}const MAPA_EQUIPAMIENTO = {
    "Arma": "fuerza",
    "Armadura": "defensa",
    "Reliquia": "magia",
    "Montura": "velocidad",
    "Conocimiento": "inteligencia"
};

const TIPOS_EQUIPAMIENTO_PERMANENTE = ["Arma", "Armadura", "Reliquia", "Montura", "Conocimiento"];
const TIPOS_EFECTOS_NO_EQUIPAMIENTO = ["Bendición", "Maldición", "Bendicion", "Maldicion"];
const TIPOS_MODIFICADORES_PERMANENTES = [...TIPOS_EQUIPAMIENTO_PERMANENTE, ...TIPOS_EFECTOS_NO_EQUIPAMIENTO];


   function aplicarEquipamientoInicial(personaje) {
    if (typeof tarjetasGuardadas === 'undefined' || !tarjetasGuardadas) return;

    const tarjetasMutacion = tarjetasGuardadas.filter(t => t.propietarioId === personaje.id && (t.tipo === "Mutación" || t.tipo === "Mutacion"));
    if (tarjetasMutacion.length > 0) {
        const ultimaMutacion = tarjetasMutacion[tarjetasMutacion.length - 1];
        if (ultimaMutacion.nuevosAtributosBase) {
            personaje.atributos = { ...ultimaMutacion.nuevosAtributosBase };
        } else if (ultimaMutacion.efectos && ultimaMutacion.efectos.length > 0) {
            ultimaMutacion.efectos.forEach(e => {
                if (e.atributo && personaje.atributos && personaje.atributos[e.atributo.toLowerCase()] !== undefined) {
                    personaje.atributos[e.atributo.toLowerCase()] = parseInt(e.modificacion) || 0;
                }
            });
        }
    }

    if (tarjetasGuardadas.some(t => t.tipo === "Inmunidad" && t.propietarioId === personaje.id)) {
        personaje.consumibles = [];
        return;
    }

    const tarjetasEquip = tarjetasGuardadas.filter(t => t.propietarioId === personaje.id && TIPOS_MODIFICADORES_PERMANENTES.includes(t.tipo));
    tarjetasEquip.forEach(tarjeta => {
        if (tarjeta.efectos && tarjeta.efectos.length > 0) {
            tarjeta.efectos.forEach(efecto => {
                let attr = efecto.atributo ? efecto.atributo.toLowerCase() : null;
                if (!attr || attr === "general") {
                    attr = MAPA_EQUIPAMIENTO[tarjeta.tipo];
                }
                if (attr && personaje.atributos && personaje.atributos[attr] !== undefined) {
                    let valBase = (typeof getStatInfo === 'function') ? getStatInfo(attr, personaje.atributos[attr]).statValue : (parseInt(personaje.atributos[attr]) || 0);
                    personaje.atributos[attr] = Math.max(0, valBase + (parseInt(efecto.modificacion) || 0));
                }
            });
        }
    });

    const tarjetasConsumibles = tarjetasGuardadas.filter(t => t.propietarioId === personaje.id && t.tipo === "Consumible");
    personaje.consumibles = [];
    tarjetasConsumibles.forEach(tarjeta => {
        if (tarjeta.efectos && tarjeta.efectos.length > 0) {
            tarjeta.efectos.forEach(efecto => {
                personaje.consumibles.push({
                    atributo: efecto.atributo.toLowerCase(),
                    valor: parseInt(efecto.modificacion) || 0,
                    turnos: tarjeta.turnos || 1
                });
            });
        }
    });
}
function repartirCartas() {
        while (manoUsuario.length < 7 && mazoRestanteUsuario.length > 0) {
            let p = JSON.parse(JSON.stringify(mazoRestanteUsuario.pop()));
            aplicarEquipamientoInicial(p);
            manoUsuario.push(p);
        }
        while (manoRival.length < 7 && mazoRestanteRival.length > 0) {
            let p = JSON.parse(JSON.stringify(mazoRestanteRival.pop()));
            aplicarEquipamientoInicial(p);
            manoRival.push(p);
        }
       if (manoUsuario.length === 0 || manoRival.length === 0) {
            document.getElementById("casilleros-atributos").style.display = "none";
            document.getElementById("btn-iniciar-duelo").style.display = "none";
            
            const equipoGano = manoRival.length === 0;
            const contenedorRecompensas = document.getElementById("contenedor-recompensas-personajes");
            contenedorRecompensas.innerHTML = "";

            personajesPrincipales.forEach(p => {
                let stats = estadisticasBatallaPrincipales[p.id] || { historialDuelos: [] };
                let pos = 0;
                let neg = 0;

                if (equipoGano) {
                    pos += 3;
                } else {
                    neg += 3;
                }

                const duelos = stats.historialDuelos;
                if (duelos.length === 0) {
                    pos += 1;
                    neg += 1;
                } else if (duelos[0] === false) {
                    neg += 2;
                } else if (duelos[0] === true && duelos[1] === false) {
                    pos += 1;
                    neg += 1;
                } else if (duelos.filter(v => v === true).length >= 2 || (duelos[0] === true && duelos[1] === true)) {
                    pos += 2;
                } else {
                    pos += 1;
                    neg += 1;
                }

                p.puntosPositivos = (p.puntosPositivos || 0) + pos;
                p.puntosNegativos = (p.puntosNegativos || 0) + neg;
                p.duelos = (p.duelos || 0) + (stats.duelos || 0);

                const divPersonaje = document.createElement("div");
                divPersonaje.className = "recompensa-personaje";
                divPersonaje.innerHTML = `
                    <img src="${p.imagen}" alt="${p.nombre}" class="recompensa-imagen">
                    <p class="recompensa-nombre">${p.nombre}</p>
                    <div class="recompensa-puntos">
                        <span class="puntos-positivos">+${pos}</span>
                        <span class="puntos-negativos">-${neg}</span>
                    </div>
                `;
                contenedorRecompensas.appendChild(divPersonaje);
            });

            const btnFinalizar = document.getElementById("btn-finalizar-batalla");
            btnFinalizar.style.display = "block";
            btnFinalizar.onclick = () => {
                document.getElementById("modal-batalla").style.display = "none";
                document.getElementById("casilleros-atributos").style.display = "flex";
                document.getElementById("btn-iniciar-duelo").style.display = "none";
                btnFinalizar.style.display = "none";
                
                document.getElementById("modal-recompensas").style.display = "flex";
                
                document.getElementById("btn-cerrar-recompensas").onclick = () => {
                    document.getElementById("modal-recompensas").style.display = "none";
                    
                    const blob = new Blob([JSON.stringify(personajes, null, 4)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    
                    a.href = url;
                    a.download = "personajes.json";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    const ventanas = document.querySelectorAll(".contenidos section");
                    ventanas.forEach(ventana => {
                        ventana.style.display = "none";
                    });
                    document.getElementById("galeria").style.display = "block";
                    mostrarPersonajes(personajes);
                };
            };
            return;
        }
    asignacionesUsuario = {};
    asignacionesRival = {};
    reiniciarCasilleros();
    
    renderizarCartasBatalla(manoRival, "sector-a1", true);
    renderizarCartasBatalla(manoUsuario, "sector-a3", false);
    
    document.getElementById("sector-b1").innerHTML = `<h3 style="color: #ff8888; text-align: center; width: 100%;">Rival: ${manoRival.length + mazoRestanteRival.length} cartas</h3>`;
    document.getElementById("sector-b3").innerHTML = `<h3 style="color: #88ff88; text-align: center; width: 100%;">Tú: ${manoUsuario.length + mazoRestanteUsuario.length} cartas</h3>`;
}

function reiniciarCasilleros() {
    document.querySelectorAll(".casillero").forEach(cas => {
        cas.classList.remove("brillando");
        cas.textContent = cas.dataset.attr.toUpperCase();
    });
    const btnDuelo = document.getElementById("btn-iniciar-duelo");
    if(btnDuelo) {
        btnDuelo.classList.remove("listo", "brillando");
        btnDuelo.disabled = true;
        btnDuelo.onclick = ejecutarDuelo;
    }
}
function obtenerPuntosConTarjetas(personaje, attr) {
    let valBase = (personaje.atributos && personaje.atributos[attr]) ? getStatInfo(attr, personaje.atributos[attr]).statValue : 0;
    return calcularPuntosBatallaConTarjeta(personaje, null, attr, valBase);
}
function renderizarCartasBatalla(cartas, contenedorId, esRival) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = "";
    const fila = document.createElement("div");
    fila.className = "fila-cartas-batalla";

    cartas.forEach((personaje, index) => {
        const intPuntos = obtenerPuntosConTarjetas(personaje, 'inteligencia');
        const fuePuntos = obtenerPuntosConTarjetas(personaje, 'fuerza');
        const defPuntos = obtenerPuntosConTarjetas(personaje, 'defensa');
        const velPuntos = obtenerPuntosConTarjetas(personaje, 'velocidad');
        const magPuntos = obtenerPuntosConTarjetas(personaje, 'magia');

        const carta = document.createElement("div");
        carta.className = "carta-batalla";
        carta.id = `carta-${esRival ? 'rival' : 'usuario'}-${index}`;
        
        let htmlBotones = '';
        if (!esRival) {
            htmlBotones = `
                <div class="botones-atributos">
                    <button onclick="asignarAtributo('inteligencia', ${index})">Int: ${intPuntos}</button>
                    <button onclick="asignarAtributo('fuerza', ${index})">Fue: ${fuePuntos}</button>
                    <button onclick="asignarAtributo('defensa', ${index})">Def: ${defPuntos}</button>
                    <button onclick="asignarAtributo('velocidad', ${index})">Vel: ${velPuntos}</button>
                    <button onclick="asignarAtributo('magia', ${index})">Mag: ${magPuntos}</button>
                </div>
            `;
        } else {
            htmlBotones = `
                <div class="botones-atributos">
                    <button disabled>Vel: ${velPuntos}</button>
                    <button disabled>Int: ${intPuntos}</button>
                    <button disabled>Fue: ${fuePuntos}</button>
                    <button disabled>Def: ${defPuntos}</button>
                    <button disabled>Mag: ${magPuntos}</button>
                </div>
            `;
        }

        carta.innerHTML = `
            <h4 class="titulo-carta-batalla">${personaje.nombre}</h4>
            <img src="${personaje.imagen}" alt="${personaje.nombre}" class="imagen-carta-batalla">
            ${htmlBotones}
        `;
        fila.appendChild(carta);
    });
    contenedor.appendChild(fila);
}
function asignarAtributo(atributo, indexCarta) {
        if (asignacionesUsuario[atributo] !== undefined) return;
        
        if (manoUsuario.length >= 5) {
            if (Object.values(asignacionesUsuario).includes(indexCarta)) return;
        }

        const personajeA = manoUsuario[indexCarta];

        const odioA = tarjetasGuardadas.find(t => t.tipo === "Odio" && t.propietarioId === personajeA.id);
        if (odioA) {
            let vincIds = Array.isArray(odioA.vinculadosIds) ? odioA.vinculadosIds : [odioA.vinculadosIds];
            const indexB = manoRival.findIndex(p => vincIds.includes(p.id));
            if (indexB !== -1) {
                asignacionesRival[atributo] = indexB;
            }
        }

        manoRival.forEach((rivalA, indexRivalA) => {
            const odioRival = tarjetasGuardadas.find(t => t.tipo === "Odio" && t.propietarioId === rivalA.id);
            if (odioRival) {
                let vincIds = Array.isArray(odioRival.vinculadosIds) ? odioRival.vinculadosIds : [odioRival.vinculadosIds];
                if (vincIds.includes(personajeA.id)) {
                    asignacionesRival[atributo] = indexRivalA;
                }
            }
        });

        asignacionesUsuario[atributo] = indexCarta;
    const casillero = document.querySelector(`.casillero[data-attr="${atributo}"]`);
        if(casillero) {
            casillero.classList.add("brillando");
            casillero.textContent = manoUsuario[indexCarta].nombre.substring(0,8);
        }
        
        if (manoUsuario.length >= 5) {
            document.getElementById(`carta-usuario-${indexCarta}`).classList.add("asignada");
        }

        comprobarListos();
    }

function comprobarListos() {
    if (Object.keys(asignacionesUsuario).length === 5) {
        const btnDuelo = document.getElementById("btn-iniciar-duelo");
        if(btnDuelo) {
            btnDuelo.classList.add("listo");
            btnDuelo.disabled = false;
        }
    }
}

function asignarRivalAleatorio() {
        let indicesDisponibles = manoRival.map((_, i) => i);
        
        if (manoRival.length >= 5) {
            Object.values(asignacionesRival).forEach(asignado => {
                indicesDisponibles = indicesDisponibles.filter(i => i !== asignado);
            });
        }

        indicesDisponibles.sort(() => 0.5 - Math.random());
        
        ATRIBUTOS.forEach((attr) => {
            if (asignacionesRival[attr] === undefined) {
                let nextIndex = indicesDisponibles.pop();
                if (nextIndex === undefined && manoRival.length > 0) {
                    nextIndex = Math.floor(Math.random() * manoRival.length);
                }
                if (nextIndex !== undefined) {
                    asignacionesRival[attr] = nextIndex;
                }
            }
        });
    }
function calcularModificadorEquipamiento(tarjeta, personaje, oponente, attr, totalActual = 0) {
    if (!tarjeta || !TIPOS_EQUIPAMIENTO_PERMANENTE.includes(tarjeta.tipo) || tarjeta.propietarioId !== personaje.id) {
        return 0;
    }

    const efecto = tarjeta.efectos?.find(e => e.atributo && e.atributo.toLowerCase() === attr.toLowerCase());
    if (!efecto || !oponente || !tarjeta.excepciones || tarjeta.excepciones.length === 0) {
        return 0;
    }

    return tarjeta.excepciones.reduce((modificador, exc) => {
        const aplicaPorPersonaje = exc.personajeId && exc.personajeId === oponente.id;
        const aplicaPorTipo = !exc.personajeId && exc.tipo && (oponente.tipo || "").includes(exc.tipo);
        if (!aplicaPorPersonaje && !aplicaPorTipo) {
            return modificador;
        }

        const porcentaje = (parseInt(exc.porcentaje) || 50) / 100;
        const valorEfecto = Math.abs(parseInt(efecto.modificacion) || 0);

        if (exc.condicion === "Aumento") {
            return modificador + (valorEfecto * porcentaje);
        }
        if (exc.condicion === "Debilidad") {
            return modificador - (valorEfecto * porcentaje);
        }
        if (exc.condicion === "Inmune") {
            return modificador + 999;
        }
        if (exc.condicion === "Destino") {
            return modificador + totalActual;
        }
        return modificador;
    }, 0);
}

function calcularPuntosBatallaConTarjeta(personaje, oponente, attr, valBase) {
    let total = valBase;
    if (typeof tarjetasGuardadas === 'undefined') return total;

    if (tarjetasGuardadas.some(ti => ti.tipo === "Inmunidad" && ti.propietarioId === personaje.id)) {
        return total;
    }

    const aplicarCondicionExcepcion = (modificador, exc, porcentajeDefault = 50) => {
        if (exc.condicion === "Inmune") {
            return 0;
        }

        const porcentaje = (exc.porcentaje || porcentajeDefault) / 100;
        if (exc.condicion === "Aumento") {
            return modificador + (modificador * porcentaje);
        } else if (exc.condicion === "Debilidad") {
            return modificador - (modificador * porcentaje);
        } else if (exc.condicion === "Destino") {
            return modificador * 2;
        }

        return modificador - (modificador * 0.5);
    };
    
    let todasLasTarjetasEnJuego = [];
    manoUsuario.forEach(p => {
        const tarjetasP = tarjetasGuardadas.filter(t => t.propietarioId === p.id);
        todasLasTarjetasEnJuego.push(...tarjetasP.map(t => ({...t, bando: 'usuario'})));
    });
    manoRival.forEach(p => {
        const tarjetasP = tarjetasGuardadas.filter(t => t.propietarioId === p.id);
        todasLasTarjetasEnJuego.push(...tarjetasP.map(t => ({...t, bando: 'rival'})));
    });

    const bandoPersonaje = manoUsuario.includes(personaje) ? 'usuario' : 'rival';

    todasLasTarjetasEnJuego.forEach(tarjeta => {
        let modificadorTarjeta = 0;

        if (tarjeta.tipo === "Territorio" || tarjeta.tipo === "Campo De Fuerza") {
            if ((personaje.tipo || "").includes(tarjeta.tipoAfectado)) {
                if (tarjeta.tipo === "Campo De Fuerza" && tarjeta.bando !== bandoPersonaje) {
                    return; 
                }
                if (tarjeta.efectos && tarjeta.efectos.length > 0) {
                    modificadorTarjeta += parseInt(tarjeta.efectos[0].modificacion) || 0;
                }
            }
        }

        total += modificadorTarjeta;
    });

    const tarjetasBenMal = tarjetasGuardadas.filter(t => 
        t.propietarioId === personaje.id && 
        (t.tipo === "Bendición" || t.tipo === "Bendicion" || t.tipo === "Maldición" || t.tipo === "Maldicion")
    );

    tarjetasBenMal.forEach(tarjeta => {
        let pts = parseInt(tarjeta.puntos) || 0;
        if (pts === 0 && tarjeta.efectos && tarjeta.efectos.length > 0) {
            pts = Math.abs(parseInt(tarjeta.efectos[0].modificacion) || 0);
        }
        if (tarjeta.tipo === "Bendición" || tarjeta.tipo === "Bendicion") {
            total += pts;
        } else if (tarjeta.tipo === "Maldición" || tarjeta.tipo === "Maldicion") {
            total -= pts;
        }
    });

    const tarjetas = tarjetasGuardadas.filter(t => {
        if (t.tipo === "Territorio" || t.tipo === "Campo De Fuerza" || TIPOS_EFECTOS_NO_EQUIPAMIENTO.includes(t.tipo)) return false;
        if (t.propietarioId === personaje.id) return true;
        if (["Aliado", "Rival", "Grupo", "Pareja", "Odio"].includes(t.tipo) && t.vinculadosIds && t.vinculadosIds.includes(personaje.id)) {
            const tieneTarjetaPropia = tarjetasGuardadas.some(tp => tp.propietarioId === personaje.id && tp.tipo === t.tipo && tp.vinculadosIds && tp.vinculadosIds.includes(t.propietarioId));
            return !tieneTarjetaPropia;
        }
        return false;
    });

    tarjetas.forEach(tarjeta => {
        let modificadorTarjeta = 0;
        if (TIPOS_EQUIPAMIENTO_PERMANENTE.includes(tarjeta.tipo)) {
            total += calcularModificadorEquipamiento(tarjeta, personaje, oponente, attr, total);
        } else if (tarjeta.efectos && !["Aliado", "Rival", "Grupo", "Pareja", "Amor", "Odio"].includes(tarjeta.tipo)) {
            const efecto = tarjeta.efectos.find(e => e.atributo && e.atributo.toLowerCase() === attr.toLowerCase());
            if (efecto) {
                total += parseInt(efecto.modificacion) || 0;
            }
        }
if (tarjeta.tipo === "Aliado" || tarjeta.tipo === "Rival" || tarjeta.tipo === "Pareja") {
            let esPersonajeA = personaje.id === tarjeta.propietarioId;
            let vinculados = [];
            if (tarjeta.vinculadosIds) {
                vinculados = Array.isArray(tarjeta.vinculadosIds) ? tarjeta.vinculadosIds : [tarjeta.vinculadosIds];
            }
            let esPersonajeB = vinculados.includes(personaje.id);

            if (esPersonajeA || esPersonajeB) {
                let pts = parseInt(tarjeta.puntosVinculo || tarjeta.puntos) || 0;
                if (pts === 0 && tarjeta.efectos && tarjeta.efectos.length > 0) {
                    pts = Math.abs(parseInt(tarjeta.efectos[0].modificacion) || 0);
                }

                let bandoA = null;
                if (manoUsuario.some(p => p.id === tarjeta.propietarioId)) bandoA = 'usuario';
                else if (manoRival.some(p => p.id === tarjeta.propietarioId)) bandoA = 'rival';

                if (bandoA) {
                    let manoA = bandoA === 'usuario' ? manoUsuario : manoRival;
                    let manoContrariaA = bandoA === 'usuario' ? manoRival : manoUsuario;
                    
                    let bEnMismoBandoQueA = 0;
                    let bEnBandoContrarioAA = 0;

                    vinculados.forEach(vid => {
                        if (manoA.some(p => p.id === vid)) bEnMismoBandoQueA++;
                        if (manoContrariaA.some(p => p.id === vid)) bEnBandoContrarioAA++;
                    });

                    if (esPersonajeA) {
                        let modificadorFinal = 0;
                        if (tarjeta.tipo === "Aliado" || tarjeta.tipo === "Pareja") {
                            modificadorFinal += (bEnMismoBandoQueA * pts);
                            modificadorFinal -= (bEnBandoContrarioAA * pts);
                        } else if (tarjeta.tipo === "Rival") {
                            modificadorFinal -= (bEnMismoBandoQueA * pts);
                            modificadorFinal += (bEnBandoContrarioAA * pts);
                        }
                        modificadorTarjeta += modificadorFinal;
                    } else if (esPersonajeB) {
                        let esMismoBando = (bandoPersonaje === bandoA);
                        if (tarjeta.tipo === "Aliado" || tarjeta.tipo === "Pareja") {
                            if (esMismoBando) modificadorTarjeta += pts;
                            else modificadorTarjeta -= pts;
                        } else if (tarjeta.tipo === "Rival") {
                            if (esMismoBando) modificadorTarjeta -= pts;
                            else modificadorTarjeta += pts;
                        }
                    }
                }
            }
        }
        if (tarjeta.tipo === "Grupo") {
            let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
            
            let involucrados = [tarjeta.propietarioId];
            if (tarjeta.vinculadosIds) {
                if (Array.isArray(tarjeta.vinculadosIds)) {
                    involucrados.push(...tarjeta.vinculadosIds);
                } else {
                    involucrados.push(tarjeta.vinculadosIds);
                }
            }

            let personajesEnMismaMano = involucrados.filter(vid => miMano.some(p => p.id === vid)).length;
            let pts = parseInt(tarjeta.puntosVinculo || tarjeta.puntos) || 0;
            
            modificadorTarjeta += (personajesEnMismaMano * pts);
        }
if (tarjeta.tipo === "Amor") {
            if (tarjeta.propietarioId === personaje.id) {
                const tieneInmunidad = tarjetasGuardadas.some(ti => ti.tipo === "Inmunidad" && ti.propietarioId === personaje.id);
                if (!tieneInmunidad) {
                    let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
                    let otraMano = bandoPersonaje === 'usuario' ? manoRival : manoUsuario;
                    let vincIds = Array.isArray(tarjeta.vinculadosIds) ? tarjeta.vinculadosIds : [tarjeta.vinculadosIds];
                    let pts = parseInt(tarjeta.puntosVinculo || tarjeta.puntos) || 25;
                    if (miMano.some(p => vincIds.includes(p.id))) {
                        modificadorTarjeta += Math.abs(pts);
                    } else if (otraMano.some(p => vincIds.includes(p.id))) {
                        modificadorTarjeta -= Math.abs(pts) * 2;
                    }
                }
            }
        }

        if (tarjeta.tipo === "Odio" && tarjeta.propietarioId === personaje.id) {
            const tieneInmunidad = tarjetasGuardadas.some(ti => ti.tipo === "Inmunidad" && ti.propietarioId === personaje.id);
            if (!tieneInmunidad) {
                let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
                let otraMano = bandoPersonaje === 'usuario' ? manoRival : manoUsuario;
                let vincIds = Array.isArray(tarjeta.vinculadosIds) ? tarjeta.vinculadosIds : [tarjeta.vinculadosIds];
                if (miMano.some(p => vincIds.includes(p.id))) {
                    modificadorTarjeta -= 10;
                } else if (otraMano.some(p => vincIds.includes(p.id))) {
                    modificadorTarjeta += 60;
                }
            }
        }

      if ((tarjeta.tipo === "Miedo" || tarjeta.tipo === "Debilidad") && tarjeta.propietarioId === personaje.id) {
            // El efecto de Miedo y Debilidad establece el atributo a 1 de forma absoluta al final
        } else if (!TIPOS_EQUIPAMIENTO_PERMANENTE.includes(tarjeta.tipo) && tarjeta.excepciones && tarjeta.excepciones.length > 0 && oponente) {
            tarjeta.excepciones.forEach(exc => {
                let aplica = false;
                if (exc.personajeId && exc.personajeId === oponente.id) {
                    aplica = true;
                } else if (!exc.personajeId && exc.tipo && (oponente.tipo || "").includes(exc.tipo)) {
                    aplica = true;
                }

                if (aplica) {
                    modificadorTarjeta = aplicarCondicionExcepcion(modificadorTarjeta, exc);
                }
            });
        }

        total += modificadorTarjeta;
    });

    if (personaje.consumibles) {
        personaje.consumibles.forEach(c => {
            if (c.atributo === attr.toLowerCase() && c.turnos > 0) {
                total += c.valor;
            }
        });
    }

    const tieneInmunidad = tarjetasGuardadas.some(ti => ti.tipo === "Inmunidad" && ti.propietarioId === personaje.id);
    if (!tieneInmunidad) {
        let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
        let otraMano = bandoPersonaje === 'usuario' ? manoRival : manoUsuario;
        
        let aplicaMiedo = false;
        let aplicaDebilidad = false;

        tarjetasGuardadas.forEach(t => {
            if (t.propietarioId === personaje.id && t.excepciones && t.excepciones.length > 0) {
                if (t.tipo === "Miedo" || t.tipo === "Debilidad") {
                    let objetivoPresente = false;
                    t.excepciones.forEach(exc => {
                        let enPropia = miMano.some(p => (exc.personajeId && p.id === exc.personajeId) || (!exc.personajeId && exc.tipo && (p.tipo || "").includes(exc.tipo)));
                        let enRival = otraMano.some(p => (exc.personajeId && p.id === exc.personajeId) || (!exc.personajeId && exc.tipo && (p.tipo || "").includes(exc.tipo)));
                        if (enPropia || enRival) objetivoPresente = true;
                    });
                    
                    if (objetivoPresente) {
                        if (t.tipo === "Miedo") aplicaMiedo = true;
                        if (t.tipo === "Debilidad") aplicaDebilidad = true;
                    }
                }
            }
        });

        if (aplicaMiedo && attr.toLowerCase() === "inteligencia") {
            total = 1;
        }
        if (aplicaDebilidad && (attr.toLowerCase() === "fuerza" || attr.toLowerCase() === "magia" || attr.toLowerCase() === "defensa")) {
            total = 1;
        }
    }

    return Math.max(0, Math.round(total));
    }

function generarLeyendaMitica(pGanador, pPerdedor, attr, valGanador, valPerdedor, puntosRestantes, esSacrificio = false, salvador = null) {
    const frasesAttr = {
        fuerza: [
            "desató un golpe devastador que retumbó en los confines del reino",
            "demostró una fuerza titánica aplastando toda resistencia",
            "hizo crujir la tierra con un embate colosal e imparable"
        ],
        inteligencia: [
            "anticipó cada movimiento con una astucia táctica sublime",
            "desplegó una estrategia milimétrica que tejió la ruina de su oponente",
            "desmembró la mente enemiga con una lucidez suprema"
        ],
        magia: [
            "canalizó fuerzas arcanas ancestrales desgarrando el velo de la realidad",
            "desató una tormenta de energía mística infranqueable",
            "invocó el poder del cosmos para envolver a su rival en perdición"
        ],
        velocidad: [
            "se desplazó como un relámpago imperceptible en la penumbra",
            "superó el viento con una agilidad mítica dejando sin respuesta a su rival",
            "asestó un ataque fugaz e implacable antes de que pudiera reaccionar"
        ],
        defensa: [
            "se erigió como un baluarte inquebrantable resistiendo el embate",
            "forjó una barrera impenetrable que devolvió la desesperación",
            "soportó la arremetida rival como una fortaleza legendaria"
        ]
    };

    const listaFrases = frasesAttr[attr.toLowerCase()] || ["se impuso con maestría legendaria en el combate"];
    const accionMitica = listaFrases[Math.floor(Math.random() * listaFrases.length)];

    if (esSacrificio && salvador) {
        return `<div style="margin-bottom: 10px; padding: 10px; border-left: 4px solid #ff88ff; background: rgba(255, 136, 255, 0.08); border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
            <strong style="color: #ff88ff; text-transform: uppercase;">❖ ${attr} - Sacrificio de Amor</strong><br>
            <em>${pPerdedor.nombre}</em> sucumbía ante el dominio de <em>${pGanador.nombre}</em> (${valGanador} vs ${valPerdedor}). Sin embargo, <strong style="color: #ffd700;">${salvador.nombre}</strong> interpuso su cuerpo en un acto heroico, sacrificando su vida y su existencia por su amor y absorber todo el daño. <em>${pPerdedor.nombre}</em> sigue en batalla. 
        </div>`;
    }

    return `<div style="margin-bottom: 10px; padding: 10px; border-left: 4px solid #d4af37; background: rgba(212, 175, 55, 0.08); border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
        <strong style="color: #d4af37; text-transform: uppercase;">⚔ ${attr}</strong><br>
        En un choque de <strong>${attr.toUpperCase()}</strong>, <em>${pGanador.nombre}</em> (${valGanador} pts) ${accionMitica} frente a <em>${pPerdedor.nombre}</em> (${valPerdedor} pts). 
        La victoria fue para <strong style="color: #88ff88;">${pGanador.nombre}</strong> (conserva ${puntosRestantes} pts), expulsando a <strong>${pPerdedor.nombre}</strong> del campo de batalla.
    </div>`;
}

function ejecutarDuelo() {
    const btnDuelo = document.getElementById("btn-iniciar-duelo");
    btnDuelo.classList.add("brillando");
    
    asignarRivalAleatorio();

   if (typeof tarjetasGuardadas !== 'undefined') {
        ATRIBUTOS.forEach(attr => {
            let idxUsuario = asignacionesUsuario[attr];
            if (idxUsuario !== undefined && manoUsuario[idxUsuario] && manoRival) {
                let pUsuario = manoUsuario[idxUsuario];
                if (!pUsuario) return;
                
                let tarjetaOdioUsu = tarjetasGuardadas.find(t => t.tipo === "Odio" && t.propietarioId === pUsuario.id);
                if (tarjetaOdioUsu && tarjetaOdioUsu.vinculadosIds) {
                    let vincs = Array.isArray(tarjetaOdioUsu.vinculadosIds) ? tarjetaOdioUsu.vinculadosIds : [tarjetaOdioUsu.vinculadosIds];
                    if (manoRival.some(r => r && r.id && vincs.includes(r.id))) {
                        let idxRivalCorrecto = manoRival.findIndex(r => r && r.id && vincs.includes(r.id));
                        let attrRival = Object.keys(asignacionesRival).find(k => asignacionesRival[k] === idxRivalCorrecto);
                        if (attrRival && attrRival !== attr) {
                            let temp = asignacionesRival[attr];
                            asignacionesRival[attr] = idxRivalCorrecto;
                            asignacionesRival[attrRival] = temp;
                        }
                    }
                }
                
                let rivalQueOdia = manoRival.find(r => r && r.id && tarjetasGuardadas.some(t => {
                    if (t.tipo !== "Odio" || t.propietarioId !== r.id || !t.vinculadosIds) return false;
                    let vincs = Array.isArray(t.vinculadosIds) ? t.vinculadosIds : [t.vinculadosIds];
                    return vincs.includes(pUsuario.id);
                }));
                if (rivalQueOdia) {
                    let idxRivalCorrecto = manoRival.findIndex(r => r && r.id === rivalQueOdia.id);
                    let attrRival = Object.keys(asignacionesRival).find(k => asignacionesRival[k] === idxRivalCorrecto);
                    if (attrRival && attrRival !== attr) {
                        let temp = asignacionesRival[attr];
                        asignacionesRival[attr] = idxRivalCorrecto;
                        asignacionesRival[attrRival] = temp;
                    }
                }
            }
        });
    }
    setTimeout(() => {
        let cartasAEliminarUsuario = [];
        let cartasAEliminarRival = [];
        let historialRonda = "";

        const calcularYAsignarDaño = (personaje, attr, valTotal, daño) => {
            let yOld = 0;
            let cons = null;
            if (personaje.consumibles) {
                cons = personaje.consumibles.find(c => c.atributo === attr && c.turnos > 0);
                if (cons) yOld = cons.valor;
            }
            
            let yNew = yOld;
            let dañoRestante = daño;
            
            if (dañoRestante <= yOld) {
                yNew = yOld - dañoRestante;
                dañoRestante = 0;
            } else {
                dañoRestante -= yOld;
                yNew = 0;
            }
            
            if (cons) cons.valor = yNew;
            
            let baseOld = (personaje.atributos && personaje.atributos[attr]) ? personaje.atributos[attr] : 0;
            let newBase = baseOld - daño + (yOld - yNew);
            
            personaje.atributos[attr] = Math.max(0, newBase);
            return Math.max(0, valTotal - daño);
        };
        
        ATRIBUTOS.forEach(attr => {
            let idxUsuario = asignacionesUsuario[attr];
            let idxRival = asignacionesRival[attr];
            
            let pUsuario = manoUsuario[idxUsuario];
            let pRival = manoRival[idxRival];
            
            if (!pUsuario || !pRival) return;
            
            if (estadisticasBatallaPrincipales[pUsuario.id]) {
                estadisticasBatallaPrincipales[pUsuario.id].duelos = (estadisticasBatallaPrincipales[pUsuario.id].duelos || 0) + 1;
            }
            
            let valBaseUsuario = (pUsuario.atributos && pUsuario.atributos[attr]) ? getStatInfo(attr, pUsuario.atributos[attr]).statValue : 0;
            let valBaseRival = (pRival.atributos && pRival.atributos[attr]) ? getStatInfo(attr, pRival.atributos[attr]).statValue : 0;
            
            let valUsuario = calcularPuntosBatallaConTarjeta(pUsuario, pRival, attr, valBaseUsuario);
            let valRival = calcularPuntosBatallaConTarjeta(pRival, pUsuario, attr, valBaseRival);
            
            let sonPareja = false;
            if (typeof tarjetasGuardadas !== 'undefined') {
                sonPareja = tarjetasGuardadas.some(t => 
                    t.tipo === "Pareja" && 
                    ((t.propietarioId === pUsuario.id && t.vinculadosIds.includes(pRival.id)) || 
                     (t.propietarioId === pRival.id && t.vinculadosIds.includes(pUsuario.id)))
                );
            }
            
            let ganador, perdedor, puntosRestantes;
            
            if (!sonPareja && valUsuario > valRival) {
                let salvadorIdx = manoRival.findIndex((r, i) => 
                    !cartasAEliminarRival.includes(i) && 
                    r.id !== pRival.id && 
                    tarjetasGuardadas.some(t => 
                        t.tipo === "Amor" && 
                        t.propietarioId === r.id && 
                        ((Array.isArray(t.vinculadosIds) && t.vinculadosIds.includes(pRival.id)) || t.vinculadosIds === pRival.id)
                    )
                );

                puntosRestantes = calcularYAsignarDaño(pUsuario, attr, valUsuario, valRival);
                ganador = pUsuario.nombre;
if (salvadorIdx !== -1) {
                    cartasAEliminarRival.push(salvadorIdx);
                    let salvador = manoRival[salvadorIdx];
                    historialRonda += generarLeyendaMitica(pUsuario, pRival, attr, valUsuario, valRival, puntosRestantes, true, salvador);
                } else {
                    cartasAEliminarRival.push(idxRival);
                    perdedor = pRival.nombre;
                    historialRonda += generarLeyendaMitica(pUsuario, pRival, attr, valUsuario, valRival, puntosRestantes, false, null);
                }

                if (estadisticasBatallaPrincipales[pUsuario.id]) {
                    estadisticasBatallaPrincipales[pUsuario.id].historialDuelos.push(true);
                }
            } else if (!sonPareja && valRival > valUsuario) {
                let salvadorIdx = manoUsuario.findIndex((u, i) => 
                    !cartasAEliminarUsuario.includes(i) && 
                    u.id !== pUsuario.id && 
                    tarjetasGuardadas.some(t => 
                        t.tipo === "Amor" && 
                        t.propietarioId === u.id && 
                        ((Array.isArray(t.vinculadosIds) && t.vinculadosIds.includes(pUsuario.id)) || t.vinculadosIds === pUsuario.id)
                    )
                );

                puntosRestantes = calcularYAsignarDaño(pRival, attr, valRival, valUsuario);
                ganador = pRival.nombre;

                if (salvadorIdx !== -1) {
                    cartasAEliminarUsuario.push(salvadorIdx);
                    let salvador = manoUsuario[salvadorIdx];
                    historialRonda += generarLeyendaMitica(pRival, pUsuario, attr, valRival, valUsuario, puntosRestantes, true, salvador);
                } else {
                    cartasAEliminarUsuario.push(idxUsuario);
                    perdedor = pUsuario.nombre;
                    historialRonda += generarLeyendaMitica(pRival, pUsuario, attr, valRival, valUsuario, puntosRestantes, false, null);
                }

                if (estadisticasBatallaPrincipales[pUsuario.id]) {
                    estadisticasBatallaPrincipales[pUsuario.id].historialDuelos.push(false);
                }
            } else {
                let ptsUsu = calcularYAsignarDaño(pUsuario, attr, valUsuario, Math.round(valUsuario / 2));
                let ptsRiv = calcularYAsignarDaño(pRival, attr, valRival, Math.round(valRival / 2));
                
                if (sonPareja) {
                    historialRonda += `<p style="margin-bottom: 8px; color: #ff88ff;"><strong>${attr.toUpperCase()}:</strong> ${pUsuario.nombre} y ${pRival.nombre} se encontraron en duelo, pero al ser <strong>PAREJA</strong> se niegan a lastimarse mutuamente. ¡El duelo es un EMPATE automático! Ninguno se hace daño fatal y reducen su atributo a la mitad (${ptsUsu} puntos).</p>`;
                } else {
                    historialRonda += `<p style="margin-bottom: 8px;"><strong>${attr.toUpperCase()}:</strong> ${pUsuario.nombre} con ${valUsuario} puntos se enfrentó a ${pRival.nombre} con ${valRival} puntos. ¡Fue un EMPATE! Ambos personajes redujeron su atributo a la mitad (${ptsUsu} puntos) y continúan en la batalla.</p>`;
                }
            }
        });
        
        document.getElementById("sector-b2").innerHTML = `<div style="padding: 15px; overflow-y: auto; height: 100%; box-sizing: border-box; font-size: 13px; text-align: left; width: 100%;">
            <h3 style="margin-bottom: 10px; color: #88c0d0; text-align: center;">Historial de Duelos</h3>
            ${historialRonda}
        </div>`;
        
        cartasAEliminarUsuario = [...new Set(cartasAEliminarUsuario)];
        cartasAEliminarRival = [...new Set(cartasAEliminarRival)];
        
        cartasAEliminarUsuario.sort((a,b)=>b-a).forEach(idx => manoUsuario.splice(idx, 1));
        cartasAEliminarRival.sort((a,b)=>b-a).forEach(idx => manoRival.splice(idx, 1));

        manoUsuario.forEach(p => {
            if (p.consumibles) p.consumibles.forEach(c => { if (c.turnos > 0) c.turnos--; });
        });
        manoRival.forEach(p => {
            if (p.consumibles) p.consumibles.forEach(c => { if (c.turnos > 0) c.turnos--; });
        });
        
        setTimeout(() => {
            btnDuelo.classList.remove("brillando");
            repartirCartas();
        }, 1500);
        
    }, 500);
}
// --- SISTEMA DE EVOLUCIÓN ---
function getStatInfo(nombreAttr, P) {
    P = Math.max(0, P || 0);
    let ciclo = Math.floor(P / 110);
    let offset = P % 110;
    
    if (P > 0 && offset === 0) {
        ciclo -= 1;
        offset = 110;
    }

    let nivel = ciclo + 1;
    let esEv = offset > 100;
    let evValue = esEv ? (offset - 100) : 0;
    let statValue = esEv ? (ciclo * 100 + 100) : (ciclo * 100 + offset);

    let nombreBase = nombreAttr.charAt(0).toUpperCase() + nombreAttr.slice(1);
    let nombreDisplay = esEv ? `${nombreBase} Ev.` : nombreBase;

    return {
        nivel: nivel,
        statValue: statValue,
        evValue: evValue,
        esEv: esEv,
        nombreDisplay: nombreDisplay,
        valorDisplay: esEv ? `${evValue}/10` : statValue
    };
}

function puedeIncrementarAtributo(attr, atributos) {
    const info = getStatInfo(attr, atributos[attr] || 0);
    if (info.esEv || (info.statValue % 100 === 0 && info.statValue > 0)) {
        const N = info.statValue / 100;
        const umbralMinimo = (N - 1) * 100;
        
        const listaAtributos = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];
        for (let clave of listaAtributos) {
            if (clave !== attr) {
                const infoOtro = getStatInfo(clave, atributos[clave] || 0);
                if (infoOtro.statValue < umbralMinimo) {
                    return false;
                }
            }
        }
    }
    return true;
}
let personajeEnEvolucion = null;
let posRestantes = 0;
let negRestantes = 0;
let atributosEvol = {};
let posAsignados = {};
let negAsignados = {};

function abrirModalEvolucion(idPersonaje) {
    document.getElementById("modal-personaje").style.display = "none";
    personajeEnEvolucion = personajes.find(p => p.id === idPersonaje);
    if (!personajeEnEvolucion) return;

    posRestantes = personajeEnEvolucion.puntosPositivos || 0;
    negRestantes = personajeEnEvolucion.puntosNegativos || 0;
    atributosEvol = { ...(personajeEnEvolucion.atributos || { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 }) };
    
    posAsignados = { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };
    negAsignados = { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };

    renderizarEvolucion();
    document.getElementById("modal-evolucion").style.display = "block";
}

function renderizarEvolucion() {
    const contenedor = document.getElementById("contenido-evolucion");
    if (!contenedor) return;

    const listaAtributos = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];

    let html = `
        <h2 style="color: #ffcc00; margin-bottom: 15px; text-align: center;">Evolución de ${personajeEnEvolucion.nombre}</h2>
        <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; margin-bottom: 20px; display: flex; justify-content: space-around;">
            <p><span style="color: #88ff88; font-weight: bold;">Puntos Positivos Restantes:</span> ${posRestantes}</p>
            <p><span style="color: #ff8888; font-weight: bold;">Puntos Negativos a Restar:</span> ${negRestantes}</p>
        </div>
        <div class="contenedor-atributos-evolucion">
    `;

    listaAtributos.forEach(attr => {
        const valActual = atributosEvol[attr] || 0;
        const info = getStatInfo(attr, valActual);
        const pos = posAsignados[attr] || 0;
        const neg = negAsignados[attr] || 0;
        const puedeIncrementar = puedeIncrementarAtributo(attr, atributosEvol);
        const estancado = !puedeIncrementar && (info.esEv || (info.statValue % 100 === 0 && info.statValue > 0));

        html += `
            <div class="fila-atributo-evol">
                <span class="nombre-attr-evol ${info.esEv ? 'texto-dorado' : ''}">
                    ${info.nombreDisplay.toUpperCase()}: ${info.valorDisplay} ${estancado ? '<span style="color:#ff4444; font-size:10px;">(ESTANCADO)</span>' : ''}
                </span>
                <div class="controles-attr-evol">
                    <span style="color: #88ff88; font-size: 12px;">(+${pos})</span>
                    <button class="btn-evol-puntos" onclick="modificarPuntoEvol('${attr}', 'pos', 1)" ${posRestantes <= 0 || !puedeIncrementar ? 'disabled' : ''}>+ Positivo</button>
                    <button class="btn-evol-puntos" onclick="modificarPuntoEvol('${attr}', 'pos', -1)" ${pos <= 0 ? 'disabled' : ''}>- Deshacer</button>
                    
                    <span style="color: #ff8888; font-size: 12px; margin-left: 10px;">(-${neg})</span>
                    <button class="btn-evol-puntos neg" onclick="modificarPuntoEvol('${attr}', 'neg', 1)" ${negRestantes <= 0 || valActual <= 0 ? 'disabled' : ''}>- Restar Atributo</button>
                    <button class="btn-evol-puntos neg" onclick="modificarPuntoEvol('${attr}', 'neg', -1)" ${neg <= 0 ? 'disabled' : ''}>+ Deshacer</button>
                </div>
            </div>
        `;
    });

    const listoParaGuardar = (posRestantes === 0 && negRestantes === 0);

    html += `
        </div>
        <button id="btn-guardar-evolucion" onclick="guardarEvolucion()" ${!listoParaGuardar ? 'disabled' : ''} class="${listoParaGuardar ? 'activo' : ''}">GUARDAR EVOLUCIÓN</button>
    `;

    contenedor.innerHTML = html;
}

function modificarPuntoEvol(attr, tipo, delta) {
    if (tipo === 'pos') {
        if (delta > 0 && posRestantes > 0) {
            if (!puedeIncrementarAtributo(attr, atributosEvol)) return;
            posRestantes--;
            posAsignados[attr]++;
            atributosEvol[attr]++;
        } else if (delta < 0 && posAsignados[attr] > 0) {
            posRestantes++;
            posAsignados[attr]--;
            atributosEvol[attr]--;
        }
    } else if (tipo === 'neg') {
        if (delta > 0 && negRestantes > 0 && atributosEvol[attr] > 0) {
            negRestantes--;
            negAsignados[attr]++;
            atributosEvol[attr]--;
        } else if (delta < 0 && negAsignados[attr] > 0) {
            negRestantes++;
            negAsignados[attr]--;
            atributosEvol[attr]++;
        }
    }
    renderizarEvolucion();
}

function guardarEvolucion() {
    if (posRestantes !== 0 || negRestantes !== 0) return;

    personajeEnEvolucion.atributos = { ...atributosEvol };
    personajeEnEvolucion.puntosPositivos = 0;
    personajeEnEvolucion.puntosNegativos = 0;

    const blob = new Blob([JSON.stringify(personajes, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "personajes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    document.getElementById("modal-evolucion").style.display = "none";

    const ventanas = document.querySelectorAll(".contenidos section");
    ventanas.forEach(v => v.style.display = "none");
    document.getElementById("galeria").style.display = "block";
    mostrarPersonajes(personajes);
}

function cerrarModalEvolucion() {
    document.getElementById("modal-evolucion").style.display = "none";
}
let idPropietarioTarjetaActual = null;

function abrirModalTarjetaHistoria(idPersonaje) {
    idPropietarioTarjetaActual = idPersonaje;
    document.getElementById("modal-personaje").style.display = "none";
    document.getElementById("modal-tarjeta-historia").style.display = "block";
}

function cerrarModalTarjetaHistoria() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
}
function abrirFormularioArma() { abrirFormularioEquipamiento('Arma'); }
function abrirFormularioArmadura() { abrirFormularioEquipamiento('Armadura'); }
function abrirFormularioReliquia() { abrirFormularioEquipamiento('Reliquia'); }
function abrirFormularioMontura() { abrirFormularioEquipamiento('Montura'); }
function abrirFormularioConocimiento() { abrirFormularioEquipamiento('Conocimiento'); }

function abrirFormularioEquipamiento(tipo) {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("titulo-formulario-equipamiento").innerText = `CREAR TARJETA: ${tipo.toUpperCase()}`;
    document.getElementById("tipo-tarjeta-equipamiento").value = tipo;
    document.getElementById("nombre-tarjeta-equipamiento").value = "";
    document.getElementById("descripcion-tarjeta-equipamiento").value = "";
    document.getElementById("puntos-tarjeta-equipamiento").value = 0;
    document.getElementById("modal-formulario-equipamiento").style.display = "block";
}

function cerrarFormularioEquipamiento() {
    document.getElementById("modal-formulario-equipamiento").style.display = "none";
}
function abrirFormularioMutacion() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("nombre-tarjeta-mutacion").value = "Mutación de Atributos";
    document.getElementById("descripcion-tarjeta-mutacion").value = "Establece nuevos valores base de combate para el personaje.";
    
    const personaje = personajes.find(p => p.id === idPropietarioTarjetaActual);
    const stats = personaje ? (personaje.atributos || {}) : { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };
    
    const listaAtributos = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];
    const contenedor = document.getElementById("contenedor-atributos-mutacion");
    
    if (contenedor) {
        contenedor.innerHTML = listaAtributos.map(attr => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #2b2b2b; padding: 8px 12px; border-radius: 4px; border: 1px solid #4a3621;">
                <label style="color: #ffcc00; font-weight: bold; text-transform: uppercase;">${attr}:</label>
                <input type="number" id="mutacion-val-${attr}" value="${stats[attr] ?? 0}" min="0" style="width: 80px; padding: 5px; background: #1a1a1a; color: white; border: 1px solid #4a3621; border-radius: 4px; text-align: center;">
            </div>
        `).join("");
    }

    document.getElementById("modal-formulario-mutacion").style.display = "block";
}

function cerrarFormularioMutacion() {
    document.getElementById("modal-formulario-mutacion").style.display = "none";
}

function guardarTarjetaMutacion() {
    const nombre = document.getElementById("nombre-tarjeta-mutacion").value || "Mutación";
    const descripcion = document.getElementById("descripcion-tarjeta-mutacion").value || "Establece nuevos valores base de combate.";
    
    const nuevosAtributos = {
        fuerza: parseInt(document.getElementById("mutacion-val-fuerza")?.value) || 0,
        inteligencia: parseInt(document.getElementById("mutacion-val-inteligencia")?.value) || 0,
        velocidad: parseInt(document.getElementById("mutacion-val-velocidad")?.value) || 0,
        magia: parseInt(document.getElementById("mutacion-val-magia")?.value) || 0,
        defensa: parseInt(document.getElementById("mutacion-val-defensa")?.value) || 0
    };

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: "Mutación",
        nombre: nombre,
        descripcion: descripcion,
        nuevosAtributosBase: nuevosAtributos,
        efectos: Object.keys(nuevosAtributos).map(attr => ({
            atributo: attr,
            modificacion: nuevosAtributos[attr]
        })),
        excepciones: []
    };

    if (typeof tarjetasGuardadas === 'undefined') {
        window.tarjetasGuardadas = [];
    }
    tarjetasGuardadas.push(nuevaTarjeta);

    const personaje = personajes.find(p => p.id === idPropietarioTarjetaActual);
    if (personaje) {
        personaje.atributos = { ...nuevosAtributos };
    }

    const blob = new Blob([JSON.stringify(tarjetasGuardadas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    cerrarFormularioMutacion();
    mostrarTarjetas(tarjetasGuardadas);

    if (personaje) {
        abrirModal(personaje);
    }
}

function guardarTarjetaEquipamiento() {
    const tipo = document.getElementById("tipo-tarjeta-equipamiento").value;
    const nombre = document.getElementById("nombre-tarjeta-equipamiento").value;
    const descripcion = document.getElementById("descripcion-tarjeta-equipamiento").value;
    const puntos = parseInt(document.getElementById("puntos-tarjeta-equipamiento").value) || 0;

    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: tipo,
        nombre: nombre,
        descripcion: descripcion,
        efectos: [
            {
                atributo: "General", 
                modificacion: puntos
            }
        ],
        excepciones: []
    };

    if (typeof tarjetasGuardadas === 'undefined') {
        window.tarjetasGuardadas = [];
    }
    tarjetasGuardadas.push(nuevaTarjeta);

    const blob = new Blob([JSON.stringify(tarjetasGuardadas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    cerrarFormularioEquipamiento();
    mostrarTarjetas(tarjetasGuardadas);
    
    const personaje = personajes.find(p => p.id === idPropietarioTarjetaActual);
    if (personaje) {
        abrirModal(personaje);
    }
}
function abrirFormularioInmunidad() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("nombre-tarjeta-inmunidad").value = "";
    document.getElementById("descripcion-tarjeta-inmunidad").value = "";
    document.getElementById("modal-formulario-inmunidad").style.display = "block";
}

function cerrarFormularioInmunidad() {
    document.getElementById("modal-formulario-inmunidad").style.display = "none";
}

function guardarTarjetaInmunidad() {
    const nombre = document.getElementById("nombre-tarjeta-inmunidad").value;
    const descripcion = document.getElementById("descripcion-tarjeta-inmunidad").value;

    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: "Inmunidad",
        nombre: nombre,
        descripcion: descripcion,
        efectos: [],
        excepciones: []
    };

    guardarYDescargarTarjeta(nuevaTarjeta);
    cerrarFormularioInmunidad();
}
function abrirFormularioEnfermedad() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("nombre-tarjeta-enfermedad").value = "";
    document.getElementById("descripcion-tarjeta-enfermedad").value = "";
    document.getElementById("modal-formulario-enfermedad").style.display = "block";
}

function cerrarFormularioEnfermedad() {
    document.getElementById("modal-formulario-enfermedad").style.display = "none";
}

function guardarTarjetaEnfermedad() {
    const nombre = document.getElementById("nombre-tarjeta-enfermedad").value;
    const descripcion = document.getElementById("descripcion-tarjeta-enfermedad").value;
    const atributo = document.getElementById("atributo-tarjeta-enfermedad").value;

    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: "Enfermedad",
        nombre: nombre,
        descripcion: descripcion,
        efectos: [{ atributo: atributo, modificacion: 0 }],
        excepciones: []
    };

    guardarYDescargarTarjeta(nuevaTarjeta);
    cerrarFormularioEnfermedad();
}
function abrirFormularioBendicion() { abrirFormularioBenMal('Bendición'); }
function abrirFormularioMaldicion() { abrirFormularioBenMal('Maldición'); }

function abrirFormularioBenMal(tipo) {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("titulo-formulario-ben-mal").innerText = `CREAR TARJETA: ${tipo.toUpperCase()}`;
    document.getElementById("tipo-tarjeta-ben-mal").value = tipo;
    document.getElementById("nombre-tarjeta-ben-mal").value = "";
    document.getElementById("descripcion-tarjeta-ben-mal").value = "";
    document.getElementById("puntos-tarjeta-ben-mal").value = 0;
    document.getElementById("modal-formulario-ben-mal").style.display = "block";
}

function cerrarFormularioBenMal() {
    document.getElementById("modal-formulario-ben-mal").style.display = "none";
}

function guardarTarjetaBenMal() {
    const tipo = document.getElementById("tipo-tarjeta-ben-mal").value;
    const nombre = document.getElementById("nombre-tarjeta-ben-mal").value;
    const descripcion = document.getElementById("descripcion-tarjeta-ben-mal").value;
    const puntos = parseInt(document.getElementById("puntos-tarjeta-ben-mal").value) || 0;

    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: tipo,
        nombre: nombre,
        descripcion: descripcion,
        efectos: [{ atributo: "General", modificacion: puntos }],
        excepciones: []
    };

    guardarYDescargarTarjeta(nuevaTarjeta);
    cerrarFormularioBenMal();
}

function abrirFormularioConsumible() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("nombre-tarjeta-consumible").value = "";
    document.getElementById("descripcion-tarjeta-consumible").value = "";
    document.getElementById("valor-tarjeta-consumible").value = 0;
    document.getElementById("modal-formulario-consumible").style.display = "block";
}

function cerrarFormularioConsumible() {
    document.getElementById("modal-formulario-consumible").style.display = "none";
}

function guardarTarjetaConsumible() {
    const nombre = document.getElementById("nombre-tarjeta-consumible").value;
    const descripcion = document.getElementById("descripcion-tarjeta-consumible").value;
    const atributo = document.getElementById("atributo-tarjeta-consumible").value;
    const puntos = parseInt(document.getElementById("valor-tarjeta-consumible").value) || 0;
    const turnos = parseInt(document.getElementById("turnos-tarjeta-consumible").value) || 1;
    
    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: "Consumible",
        nombre: nombre,
        descripcion: descripcion,
        turnos: turnos,
        efectos: [{ atributo: atributo, modificacion: puntos }],
        excepciones: []
    };

    guardarYDescargarTarjeta(nuevaTarjeta);
    cerrarFormularioConsumible();
}

function abrirFormularioVinculo(tipo) {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("titulo-formulario-vinculo").innerText = `CREAR VÍNCULO: ${tipo.toUpperCase()}`;
    document.getElementById("tipo-tarjeta-vinculo").value = tipo;
    document.getElementById("descripcion-tarjeta-vinculo").value = "";
    document.getElementById("puntos-tarjeta-vinculo").value = 0;
    
    const select = document.getElementById("personaje-tarjeta-vinculo");
    select.innerHTML = "";
    personajes.forEach(p => {
        if(p.id !== idPropietarioTarjetaActual) {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.text = p.nombre;
            select.appendChild(opt);
        }
    });
    
    document.getElementById("modal-formulario-vinculo").style.display = "block";
}

function cerrarFormularioVinculo() {
    document.getElementById("modal-formulario-vinculo").style.display = "none";
}

function guardarTarjetaVinculo() {
    const tipo = document.getElementById("tipo-tarjeta-vinculo").value;
    const personajeSeleccionadoId = document.getElementById("personaje-tarjeta-vinculo").value;
    const descripcion = document.getElementById("descripcion-tarjeta-vinculo").value;
    const puntos = parseInt(document.getElementById("puntos-tarjeta-vinculo").value) || 0;

    const pOrigen = personajes.find(p => p.id === idPropietarioTarjetaActual);
    const pDestino = personajes.find(p => p.id === personajeSeleccionadoId);
    
    if (!pOrigen || !pDestino) return;

    const nombreId1 = `${pOrigen.nombre} - ${pDestino.nombre}`;
    const nombreId2 = `${pDestino.nombre} - ${pOrigen.nombre}`;

    const tarjeta1 = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: tipo,
        nombre: nombreId1,
        descripcion: descripcion,
        puntosVinculo: puntos,
        vinculadosIds: [personajeSeleccionadoId],
        efectos: [],
        excepciones: []
    };

    if (typeof tarjetasGuardadas === 'undefined') { window.tarjetasGuardadas = []; }
    tarjetasGuardadas.push(tarjeta1);

    if (["Aliado", "Rival", "Pareja"].includes(tipo)) {
        const tarjeta2 = {
            idTarjeta: "tarjeta_" + (Date.now() + 1),
            propietarioId: personajeSeleccionadoId,
            tipo: tipo,
            nombre: nombreId2,
            descripcion: descripcion,
            puntosVinculo: puntos,
            vinculadosIds: [idPropietarioTarjetaActual],
            efectos: [],
            excepciones: []
        };
        tarjetasGuardadas.push(tarjeta2);
    }

    actualizarJSON();
    cerrarFormularioVinculo();
}

function abrirFormularioTerritorio() { abrirFormularioEntorno('Territorio'); }
function abrirFormularioCampoFuerza() { abrirFormularioEntorno('Campo De Fuerza'); }

function abrirFormularioEntorno(tipo) {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("titulo-formulario-entorno").innerText = `CREAR ENTORNO: ${tipo.toUpperCase()}`;
    document.getElementById("tipo-tarjeta-entorno").value = tipo;
    document.getElementById("nombre-tarjeta-entorno").value = "";
    document.getElementById("descripcion-tarjeta-entorno").value = "";
    document.getElementById("puntos-tarjeta-entorno").value = 0;
    document.getElementById("modal-formulario-entorno").style.display = "block";
}

function cerrarFormularioEntorno() {
    document.getElementById("modal-formulario-entorno").style.display = "none";
}
let puntosMutacionDisponibles = 0;
let mutacionDiferencias = { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };
let mutacionValoresOriginales = { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };

function abrirFormularioMutacion() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("nombre-tarjeta-mutacion").value = "";
    document.getElementById("descripcion-tarjeta-mutacion").value = "";
    
    const personaje = personajes.find(p => p.id === idPropietarioTarjetaActual);
    if (personaje && personaje.atributos) {
        mutacionValoresOriginales = { ...personaje.atributos };
    } else {
        mutacionValoresOriginales = { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };
    }
    
    const atributos = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];
    atributos.forEach(attr => {
        if (mutacionValoresOriginales[attr] === undefined) {
            mutacionValoresOriginales[attr] = 0;
        }
    });
    
    mutacionDiferencias = { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };
    puntosMutacionDisponibles = 0;
    
    renderizarAtributosMutacion();
    document.getElementById("modal-formulario-mutacion").style.display = "block";
}

function cerrarFormularioMutacion() {
    document.getElementById("modal-formulario-mutacion").style.display = "none";
}

function renderizarAtributosMutacion() {
    document.getElementById("puntos-mutacion-disponibles").innerText = puntosMutacionDisponibles;
    const contenedor = document.getElementById("contenedor-atributos-mutacion");
    contenedor.innerHTML = "";
    
    const atributos = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];
    
    atributos.forEach(attr => {
        const valOriginal = mutacionValoresOriginales[attr];
        const dif = mutacionDiferencias[attr];
        const valFinal = Math.max(0, valOriginal + dif);
        
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.background = "#2b2b2b";
        div.style.padding = "10px";
        div.style.border = "1px solid #4a3621";
        div.style.borderRadius = "4px";
        
        div.innerHTML = `
            <span style="color: #eeeeee; text-transform: uppercase; width: 100px; font-weight: bold; font-size: 12px;">${attr}</span>
            <span style="color: #88c0d0; width: 60px; text-align: left; font-size: 12px;">Base: ${valOriginal}</span>
            <div style="display: flex; align-items: center; gap: 10px; background: #1a1a1a; border-radius: 20px; padding: 3px 8px;">
                <button onclick="modificarPuntoMutacion('${attr}', -1)" style="width: 28px; height: 28px; border-radius: 50%; font-weight: bold; cursor: pointer; background: #ff8888; color: #111; border: none; font-size: 16px; display: flex; align-items: center; justify-content: center;" ${valFinal <= 0 ? 'disabled' : ''}>-</button>
                <span style="width: 35px; text-align: center; font-size: 16px; color: ${dif > 0 ? '#88ff88' : (dif < 0 ? '#ff8888' : '#fff')}; font-weight: bold;">${dif > 0 ? '+' : ''}${dif}</span>
                <button onclick="modificarPuntoMutacion('${attr}', 1)" style="width: 28px; height: 28px; border-radius: 50%; font-weight: bold; cursor: pointer; background: #88ff88; color: #111; border: none; font-size: 16px; display: flex; align-items: center; justify-content: center;" ${puntosMutacionDisponibles <= 0 ? 'disabled' : ''}>+</button>
            </div>
            <span style="color: #ffcc00; width: 70px; text-align: right; font-weight: bold; font-size: 12px;">Final: ${valFinal}</span>
        `;
        contenedor.appendChild(div);
    });
}

function modificarPuntoMutacion(attr, delta) {
    const valOriginal = mutacionValoresOriginales[attr];
    const difActual = mutacionDiferencias[attr];
    
    if (delta < 0) {
        if (valOriginal + difActual > 0) {
            mutacionDiferencias[attr]--;
            puntosMutacionDisponibles++;
        }
    } else if (delta > 0) {
        if (puntosMutacionDisponibles > 0) {
            mutacionDiferencias[attr]++;
            puntosMutacionDisponibles--;
        }
    }
    
    renderizarAtributosMutacion();
}

function guardarTarjetaMutacion() {
    const nombre = document.getElementById("nombre-tarjeta-mutacion").value;
    const descripcion = document.getElementById("descripcion-tarjeta-mutacion").value;
    
    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }
    
    if (puntosMutacionDisponibles > 0) {
        alert("Debes asignar todos los puntos que has restado antes de guardar la mutación.");
        return;
    }

    const efectosMutacion = [];
    for (const [attr, dif] of Object.entries(mutacionDiferencias)) {
        if (dif !== 0) {
            efectosMutacion.push({ atributo: attr, modificacion: dif });
        }
    }

    if (efectosMutacion.length === 0) {
        alert("No has realizado ninguna mutación en los atributos.");
        return;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: "Mutación",
        nombre: nombre,
        descripcion: descripcion,
        efectos: efectosMutacion,
        excepciones: []
    };

    if (typeof guardarYDescargarTarjeta === 'function') {
        guardarYDescargarTarjeta(nuevaTarjeta);
    } else {
        if (typeof tarjetasGuardadas === 'undefined') { window.tarjetasGuardadas = []; }
        tarjetasGuardadas.push(nuevaTarjeta);
        
        const blob = new Blob([JSON.stringify(tarjetasGuardadas, null, 4)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tarjeta.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarTarjetas(tarjetasGuardadas);
        const personaje = personajes.find(p => p.id === idPropietarioTarjetaActual);
        if (personaje) {
            abrirModal(personaje);
        }
    }
    
    cerrarFormularioMutacion();
}
function guardarTarjetaEntorno() {
    const tipo = document.getElementById("tipo-tarjeta-entorno").value;
    const nombre = document.getElementById("nombre-tarjeta-entorno").value;
    const descripcion = document.getElementById("descripcion-tarjeta-entorno").value;
    const puntos = parseInt(document.getElementById("puntos-tarjeta-entorno").value) || 0;
    const tipoAfectado = document.getElementById("tipo-afectado-entorno").value;

    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: tipo,
        nombre: nombre,
        descripcion: descripcion,
        tipoAfectado: tipoAfectado,
        efectos: [{ atributo: "General", modificacion: puntos }],
        excepciones: []
    };

    guardarYDescargarTarjeta(nuevaTarjeta);
    cerrarFormularioEntorno();
}

function guardarYDescargarTarjeta(nuevaTarjeta) {
    if (typeof tarjetasGuardadas === 'undefined') { window.tarjetasGuardadas = []; }
    tarjetasGuardadas.push(nuevaTarjeta);
    actualizarJSON();
}

function actualizarJSON() {
    const blob = new Blob([JSON.stringify(tarjetasGuardadas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarTarjetas(tarjetasGuardadas);
    
    const personaje = personajes.find(p => p.id === idPropietarioTarjetaActual);
    if (personaje) {
        abrirModal(personaje);
    }
}
function abrirFormularioMiedo() {
    abrirFormularioMiedoDebilidad('Miedo');
}

function abrirFormularioDebilidad() {
    abrirFormularioMiedoDebilidad('Debilidad');
}

function abrirFormularioMiedoDebilidad(tipo) {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("titulo-formulario-miedo-debilidad").innerText = `CREAR TARJETA: ${tipo.toUpperCase()}`;
    document.getElementById("tipo-tarjeta-miedo-debilidad").value = tipo;
    document.getElementById("nombre-tarjeta-miedo-debilidad").value = "";
    document.getElementById("descripcion-tarjeta-miedo-debilidad").value = "";
    document.getElementById("tipo-personaje-miedo-debilidad").value = "";
    
    const selectPersonaje = document.getElementById("personaje-especifico-miedo-debilidad");
    selectPersonaje.innerHTML = '<option value="">-- Todo el tipo --</option>';
    document.getElementById("contenedor-selector-personaje-miedo").style.display = "none";
    
    document.getElementById("modal-formulario-miedo-debilidad").style.display = "block";
}

function cerrarFormularioMiedoDebilidad() {
    document.getElementById("modal-formulario-miedo-debilidad").style.display = "none";
}

function actualizarPersonajesPorTipoMiedoDebilidad() {
    const tipoSeleccionado = document.getElementById("tipo-personaje-miedo-debilidad").value;
    const contenedor = document.getElementById("contenedor-selector-personaje-miedo");
    const selectPersonaje = document.getElementById("personaje-especifico-miedo-debilidad");
    
    selectPersonaje.innerHTML = '<option value="">-- Todo el tipo --</option>';
    
    if (!tipoSeleccionado) {
        contenedor.style.display = "none";
        return;
    }
    
    const filtrados = personajes.filter(p => p.tipo && p.tipo.includes(tipoSeleccionado));
    filtrados.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.text = p.nombre;
        selectPersonaje.appendChild(opt);
    });
    
    contenedor.style.display = "block";
}

function guardarTarjetaMiedoDebilidad() {
    const tipoTarjeta = document.getElementById("tipo-tarjeta-miedo-debilidad").value;
    const nombre = document.getElementById("nombre-tarjeta-miedo-debilidad").value;
    const descripcion = document.getElementById("descripcion-tarjeta-miedo-debilidad").value;
    const tipoPersonaje = document.getElementById("tipo-personaje-miedo-debilidad").value;
    const personajeId = document.getElementById("personaje-especifico-miedo-debilidad").value;

    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }

    if (!tipoPersonaje) {
        alert("Debes seleccionar un tipo de personaje.");
        return;
    }

    const excepcion = {
        tipo: tipoPersonaje,
        condicion: "Debilidad"
    };

    if (personajeId) {
        excepcion.personajeId = personajeId;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: tipoTarjeta,
        nombre: nombre,
        descripcion: descripcion,
        efectos: [],
        excepciones: [excepcion]
    };

    guardarYDescargarTarjeta(nuevaTarjeta);
    cerrarFormularioMiedoDebilidad();
}
function abrirFormularioDestino(tipo) {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("titulo-formulario-destino").innerText = `CREAR TARJETA: ${tipo.toUpperCase()}`;
    document.getElementById("tipo-tarjeta-destino").value = tipo;
    document.getElementById("nombre-tarjeta-destino").value = "";
    document.getElementById("descripcion-tarjeta-destino").value = "";
    document.getElementById("tipo-personaje-destino").value = "";
    
    const selectPersonaje = document.getElementById("personaje-especifico-destino");
    selectPersonaje.innerHTML = '<option value="">-- Todo el tipo --</option>';
    document.getElementById("contenedor-selector-personaje-destino").style.display = "none";

    const contenedorDuelos = document.getElementById("contenedor-duelos-destino");
    if (tipo === "Venganza") {
        contenedorDuelos.style.display = "none";
    } else {
        contenedorDuelos.style.display = "block";
        document.getElementById("duelos-tarjeta-destino").value = "1";
    }
    
    document.getElementById("modal-formulario-destino").style.display = "block";
}

function cerrarFormularioDestino() {
    document.getElementById("modal-formulario-destino").style.display = "none";
}

function actualizarPersonajesPorTipoDestino() {
    const tipoSeleccionado = document.getElementById("tipo-personaje-destino").value;
    const contenedor = document.getElementById("contenedor-selector-personaje-destino");
    const selectPersonaje = document.getElementById("personaje-especifico-destino");
    
    selectPersonaje.innerHTML = '<option value="">-- Todo el tipo --</option>';
    
    if (!tipoSeleccionado) {
        contenedor.style.display = "none";
        return;
    }
    
    const filtrados = personajes.filter(p => p.tipo && p.tipo.includes(tipoSeleccionado));
    filtrados.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.text = p.nombre;
        selectPersonaje.appendChild(opt);
    });
    
    contenedor.style.display = "block";
}

function guardarTarjetaDestino() {
    const tipoTarjeta = document.getElementById("tipo-tarjeta-destino").value;
    const nombre = document.getElementById("nombre-tarjeta-destino").value;
    const descripcion = document.getElementById("descripcion-tarjeta-destino").value;
    const tipoPersonaje = document.getElementById("tipo-personaje-destino").value;
    const personajeId = document.getElementById("personaje-especifico-destino").value;
    const duelos = document.getElementById("duelos-tarjeta-destino").value;

    if (!nombre.trim()) {
        alert("El nombre es obligatorio.");
        return;
    }

    if (!tipoPersonaje) {
        alert("Debes seleccionar un tipo de personaje.");
        return;
    }

    const excepcion = {
        tipo: tipoPersonaje,
        condicion: "Destino"
    };

    if (personajeId) {
        excepcion.personajeId = personajeId;
    }

    const nuevaTarjeta = {
        idTarjeta: "tarjeta_" + Date.now(),
        propietarioId: idPropietarioTarjetaActual,
        tipo: tipoTarjeta,
        nombre: nombre,
        descripcion: descripcion,
        efectos: [],
        excepciones: [excepcion]
    };

    if (tipoTarjeta !== "Venganza") {
        nuevaTarjeta.duelos = parseInt(duelos) || 1;
    }

    guardarYDescargarTarjeta(nuevaTarjeta);
    cerrarFormularioDestino();
}