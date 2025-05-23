// simplex.js

function obtenerRestricciones() {
  const numVariables = parseInt(document.getElementById('variables').value);
  const numRestricciones = parseInt(document.getElementById('restricciones').value);
  const restricciones = [];

  for (let r = 0; r < numRestricciones; r++) {
    const fila = [];
    for (let v = 0; v < numVariables; v++) {
      const input = document.querySelector(`input[name="a[${r}][${v}]"]`);
      fila.push(parseFloat(input.value) || 0);
    }
    const resultadoInput = document.querySelector(`input[name="b[${r}]"]`);
    fila.push(parseFloat(resultadoInput.value) || 0);
    restricciones.push(fila);
  }

  return restricciones;
}

function generateTableHTML(data) {
  let html = '<table class ="simplex" border="1" cellpadding="5">';
  for (let i = 0; i < data.length; i++) {
    html += '<tr>';
    for (let j = 0; j < data[i].length; j++) {
      html += `<td>${typeof data[i][j] === 'number' ? data[i][j].toFixed(2) : data[i][j]}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

function resolverSimplex() {
  const tipoZ = document.querySelector('input[name="tipoZ"]:checked').value;
  const objectiveFunction = Array.from(document.querySelectorAll('.zcoef')).map(input => parseFloat(input.value) || 0);
  const restricciones = obtenerRestricciones();

  const numVariables = parseInt(document.getElementById('variables').value);
  const numRestricciones = parseInt(document.getElementById('restricciones').value);

  const tableau = [];

  const header = ['Base'];
  for (let i = 0; i < numVariables; i++) header.push(`x${i + 1}`);
  for (let i = 0; i < numRestricciones; i++) header.push(`s${i + 1}`);
  header.push('Sol');
  tableau.push(header);

  for (let i = 0; i < numRestricciones; i++) {
    const fila = [`s${i + 1}`];
    for (let j = 0; j < numVariables; j++) fila.push(restricciones[i][j]);
    for (let j = 0; j < numRestricciones; j++) fila.push(i === j ? 1 : 0);
    fila.push(restricciones[i][numVariables]);
    tableau.push(fila);
  }

  const zRow = ['Z'];
  for (let i = 0; i < numVariables; i++) zRow.push(tipoZ === 'min' ? objectiveFunction[i] : -objectiveFunction[i]);
  for (let i = 0; i < numRestricciones; i++) zRow.push(0);
  zRow.push(0);
  tableau.push(zRow);

  let iteration = 1;
  let resultHtml = `<h2>Iteración ${iteration}</h2>` + generateTableHTML(tableau);

  while (true) {
    iteration++;
    const zData = tableau[tableau.length - 1].slice(1, -1);
    const pivotCol = zData.reduce((minIdx, val, idx) => val < zData[minIdx] ? idx : minIdx, 0);

    if (zData[pivotCol] >= 0) break;

    let pivotRow = -1;
    let minRatio = Infinity;
    for (let i = 1; i < tableau.length - 1; i++) {
      const row = tableau[i];
      const rhs = row[row.length - 1];
      const pivotVal = row[pivotCol + 1];
      if (pivotVal > 0) {
        const ratio = rhs / pivotVal;
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = i;
        }
      }
    }

    if (pivotRow === -1) {
      document.getElementById('resultadosSimplex').innerHTML = resultHtml + '<p>Solución ilimitada</p>';
      return;
    }

    const pivotElement = tableau[pivotRow][pivotCol + 1];
    for (let j = 1; j < tableau[0].length; j++) tableau[pivotRow][j] /= pivotElement;

    for (let i = 1; i < tableau.length; i++) {
      if (i === pivotRow) continue;
      const factor = tableau[i][pivotCol + 1];
      for (let j = 1; j < tableau[0].length; j++) {
        tableau[i][j] -= factor * tableau[pivotRow][j];
      }
    }

    tableau[pivotRow][0] = tableau[0][pivotCol + 1];
    resultHtml += `<h2>Iteración ${iteration}</h2>` + generateTableHTML(tableau);
  }

  const resultadoFinal = tableau[tableau.length - 1][tableau[0].length - 1];
  resultHtml += `<h2>Solución Óptima</h2><p>Z = ${resultadoFinal.toFixed(2)}</p>`;

  document.getElementById('resultadosSimplex').innerHTML = resultHtml;
}
