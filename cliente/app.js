const API = 'http://52.3.229.13:8089';
const resultado = document.getElementById('resultado');

onload = () => {
  obtenerDatos();
}

async function obtenerDatos() {
  try {
    const res = await fetch(`${API}/people`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const nombres = data.data.map(persona => ({ name: persona.name }));
    fillTable(nombres);
  } catch (err) {
    resultado.textContent = "Error: " + err.message;
  }
}

function fillTable(personas) {
  const lista = document.getElementById('lista');
  lista.innerHTML = '<tr><th>Nombre</th></tr>';
  personas.forEach(element => {
    const nuevaFila = document.createElement('tr');
    const celda = document.createElement('td');
    celda.textContent = element.name;
    nuevaFila.appendChild(celda);
    lista.appendChild(nuevaFila);
  });
}

document.getElementById("miForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const datos = { name: nombre };

  try {
    const res = await fetch(`${API}/people`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    e.target.reset();
    obtenerDatos();
  } catch (err) {
    resultado.textContent = "Error: " + err.message;
  }
});
