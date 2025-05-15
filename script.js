function generarTabla() {
  const numVariables = parseInt(document.getElementById('variables').value);
  const numRestricciones = parseInt(document.getElementById('restricciones').value);
  const tablaContainer = document.getElementById('tablaContainer');
  tablaContainer.innerHTML = '';

  let tabla = '<table><thead><tr><th></th>';
  for (let i = 1; i <= numVariables; i++) {
    tabla += `<th>X<sub>${i}</sub></th>`;
  }
  tabla += `<th style="min-width: 100px;">Relación</th><th>Resultado</th><th style="min-width: 180px;">Ecuación</th></tr></thead><tbody>`;

  // Fila Z
  tabla += `<tr id="filaZ"><td id="tipoZLabel" style="min-width: 90px;">Maximizar</td>`;
  for (let i = 0; i < numVariables; i++) {
    tabla += `<td><input type="number" name="z[${i}]" class="zcoef" data-col="${i}" value="0"></td>`;
  }
  tabla += `<td colspan="2"></td><td><output id="eqZ" class="eq-output">Z = 0</output></td></tr>`;

  // Restricciones
  for (let r = 0; r < numRestricciones; r++) {
    tabla += `<tr data-row="${r}"><td>R${r + 1}</td>`;
    for (let v = 0; v < numVariables; v++) {
      tabla += `<td><input type="number" name="a[${r}][]" class="coef" data-row="${r}" data-col="${v}" value="0"></td>`;
    }

    tabla += `
      <td>
        <select name="rel[${r}]" class="rel" data-row="${r}">
          <option value="<=">&le;</option>
          <option value="=">=</option>
          <option value=">=">&ge;</option>
        </select>
      </td>
      <td><input type="number" name="b[${r}]" class="res" data-row="${r}" value="0"></td>
      <td><output id="eq${r}" class="eq-output">0</output></td>
    </tr>`;
  }

  tabla += '</tbody></table>';
  tablaContainer.innerHTML = tabla;

  document.querySelectorAll('.zcoef, input[name="tipoZ"]').forEach(input => {
    input.addEventListener('input', actualizarZ);
    input.addEventListener('change', actualizarZ);
  });

  tablaContainer.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', actualizarEcuaciones);
  });

  actualizarEcuaciones();
  actualizarZ();
}

function actualizarZ() {
  const zInputs = document.querySelectorAll('.zcoef');
  const tipo = document.querySelector('input[name="tipoZ"]:checked').value;
  document.getElementById('tipoZLabel').textContent = tipo === 'max' ? 'Maximizar' : 'Minimizar';

  let eqZ = '';
  zInputs.forEach((input, i) => {
    const val = parseFloat(input.value) || 0;
    if (val !== 0) {
      let sign = eqZ !== '' && val > 0 ? '+' : '';
      let coef = Math.abs(val) === 1 ? '' : Math.abs(val);
      let term = `${coef}x<sub>${i + 1}</sub>`;
      eqZ += `${sign}${val < 0 ? '-' : ''}${term}`;
    }
  });

  if (eqZ === '') eqZ = '0';
  document.getElementById('eqZ').innerHTML = `Z = ${eqZ}`;
}

function actualizarEcuaciones() {
  const rows = document.querySelectorAll('#tablaContainer tbody tr');

  rows.forEach(row => {
    const r = row.getAttribute('data-row');
    if (r === null) return;

    const coefInputs = row.querySelectorAll(`input[name="a[${r}][]"]`);
    const rel = row.querySelector(`select[name="rel[${r}]"]`).value;
    const resultado = row.querySelector(`input[name="b[${r}]"]`).value || 0;

    let eq = '';
    coefInputs.forEach((input, index) => {
      const val = parseFloat(input.value) || 0;
      if (val !== 0) {
        let sign = eq !== '' && val > 0 ? '+' : '';
        let coef = Math.abs(val) === 1 ? '' : Math.abs(val);
        let term = `${coef}x<sub>${index + 1}</sub>`;
        eq += `${sign}${val < 0 ? '-' : ''}${term}`;
      }
    });

    if (eq === '') eq = '0';
    document.getElementById(`eq${r}`).innerHTML = `${eq}${rel}${resultado}`;
  });
}

function resolverGrafico() {
  const numVariables = parseInt(document.getElementById('variables').value);
  if (numVariables !== 2) {
    alert("El método gráfico solo está disponible para problemas con exactamente 2 variables.");
    return;
  }

  alert("Método gráfico ejecutado (a desarrollar).");
}
