// script.js

// Variable global para mantener la instancia del gráfico y poder destruirla
let myChartInstance = null;

function generarTabla() {
  // ... (código existente de generarTabla sin cambios) ...
  const numVariables = parseInt(document.getElementById('variables').value);
  const numRestricciones = parseInt(document.getElementById('restricciones').value);
  const tablaContainer = document.getElementById('tablaContainer');
  tablaContainer.innerHTML = ''; // Limpiar contenido previo

  if (isNaN(numVariables) || isNaN(numRestricciones) || numVariables <= 0 || numRestricciones <= 0) {
    tablaContainer.innerHTML = '<p style="color:red;">Por favor, ingrese un número válido de variables y restricciones.</p>';
    return;
  }

  let tabla = '<table><thead><tr><th></th>';
  for (let i = 1; i <= numVariables; i++) {
    tabla += `<th>X<sub>${i}</sub></th>`;
  }
  tabla += `<th style="min-width: 100px;">Relación</th><th>Resultado</th><th style="min-width: 180px;">Ecuación</th></tr></thead><tbody>`;

  // Fila Z (Función Objetivo)
  tabla += `<tr id="filaZ"><td id="tipoZLabel" style="min-width: 90px;">Maximizar</td>`;
  for (let i = 0; i < numVariables; i++) {
    tabla += `<td><input type="number" name="z[${i}]" class="zcoef" data-col="${i}" value="0" style="width: 50px;"></td>`;
  }
  tabla += `<td colspan="2"></td><td><output id="eqZ" class="eq-output">Z = 0</output></td></tr>`;

  // Restricciones
  for (let r = 0; r < numRestricciones; r++) {
    tabla += `<tr data-row="${r}"><td>R${r + 1}</td>`;
    for (let v = 0; v < numVariables; v++) {
      tabla += `<td><input type="number" name="a[${r}][${v}]" class="coef" data-row="${r}" data-col="${v}" value="0" style="width: 50px;"></td>`; 
    }

    tabla += `
      <td>
        <select name="rel[${r}]" class="rel" data-row="${r}">
          <option value="<=">&le;</option>
          <option value="=">=</option>
          <option value=">=">&ge;</option>
        </select>
      </td>
      <td><input type="number" name="b[${r}]" class="res" data-row="${r}" value="0" style="width: 50px;"></td>
      <td><output id="eq${r}" class="eq-output">0</output></td>
    </tr>`;
  }

  tabla += '</tbody></table>';
  tablaContainer.innerHTML = tabla;

  document.querySelectorAll('.zcoef, input[name="tipoZ"]').forEach(input => {
    input.addEventListener('input', actualizarZ);
    input.addEventListener('change', actualizarZ); 
  });

  tablaContainer.querySelectorAll('input.coef, select.rel, input.res').forEach(input => {
    input.addEventListener('input', actualizarEcuaciones);
  });

  actualizarZ(); 
  actualizarEcuaciones(); 
}

function actualizarZ() {
  // ... (código existente de actualizarZ sin cambios) ...
  const zInputs = document.querySelectorAll('.zcoef');
  const tipo = document.querySelector('input[name="tipoZ"]:checked').value;
  document.getElementById('tipoZLabel').textContent = tipo === 'max' ? 'Maximizar' : 'Minimizar';

  let eqZ = '';
  zInputs.forEach((input, i) => {
    const val = parseFloat(input.value) || 0;
    if (val !== 0) {
      let sign = (val > 0) ? (eqZ === '' ? '' : '+') : '-';
      let coefAbs = Math.abs(val);
      let coefDisplay = (coefAbs === 1) ? '' : coefAbs;
      let term = `${coefDisplay}X<sub>${i + 1}</sub>`;
      eqZ += `${sign}${term}`;
    }
  });

  if (eqZ === '' || (eqZ.startsWith('+') && eqZ.length === 1)) eqZ = '0';
  if (eqZ.startsWith('+')) eqZ = eqZ.substring(1); 
  document.getElementById('eqZ').innerHTML = `Z = ${eqZ}`;
}

function actualizarEcuaciones() {
  // ... (código existente de actualizarEcuaciones sin cambios) ...
  const numRestricciones = parseInt(document.getElementById('restricciones').value) || 0;
  for (let r = 0; r < numRestricciones; r++) {
    const row = document.querySelector(`#tablaContainer tr[data-row="${r}"]`);
    if (!row) continue;

    const coefInputs = row.querySelectorAll(`input[name^="a[${r}]"]`); 
    const relSelect = row.querySelector(`select[name="rel[${r}]"]`);
    const resultadoInput = row.querySelector(`input[name="b[${r}]"]`);
    const eqOutput = document.getElementById(`eq${r}`);

    if (!coefInputs.length || !relSelect || !resultadoInput || !eqOutput) continue;

    const rel = relSelect.value.replace('<=', '&le;').replace('>=', '&ge;');
    const resultado = resultadoInput.value || 0;

    let eq = '';
    coefInputs.forEach((input, index) => {
      const val = parseFloat(input.value) || 0;
      if (val !== 0) {
        let sign = (val > 0) ? (eq === '' ? '' : '+') : '-';
        let coefAbs = Math.abs(val);
        let coefDisplay = (coefAbs === 1) ? '' : coefAbs;
        let term = `${coefDisplay}X<sub>${index + 1}</sub>`;
        eq += `${sign}${term}`;
      }
    });

    if (eq === '' || (eq.startsWith('+') && eq.length === 1)) eq = '0';
    if (eq.startsWith('+')) eq = eq.substring(1); 
    eqOutput.innerHTML = `${eq} ${rel} ${resultado}`;
  }
}

function resolverGrafico() {
  // ... (código existente de resolverGrafico para cálculos) ...
  // Copia todo el código de resolverGrafico que te di antes aquí,
  // y AL FINAL de esa función, ANTES del último '}', añade la llamada a mostrarGrafico:

  const numVariables = parseInt(document.getElementById('variables').value);
  if (numVariables !== 2) {
    alert("El método gráfico solo está disponible para problemas con exactamente 2 variables.");
    document.getElementById('graficoResultados').innerHTML = '<p style="color:red;">El método gráfico solo está disponible para problemas con exactamente 2 variables.</p>';
    if (myChartInstance) {
        myChartInstance.destroy(); // Destruir gráfico si existe
    }
    document.getElementById('graficoCanvas').style.display = 'none'; // Ocultar canvas
    return;
  }
  document.getElementById('graficoResultados').innerHTML = ''; 
  document.getElementById('graficoCanvas').style.display = 'block'; // Mostrar canvas

  const zInputs = document.querySelectorAll('.zcoef');
  const objCoeffs = [parseFloat(zInputs[0].value) || 0, parseFloat(zInputs[1].value) || 0];
  const tipoZ = document.querySelector('input[name="tipoZ"]:checked').value;

  const numRestricciones = parseInt(document.getElementById('restricciones').value);
  const constraintsData = []; // Cambiado el nombre para claridad

  for (let r = 0; r < numRestricciones; r++) {
    const coefInputs = document.querySelectorAll(`input[name^="a[${r}]"]`); 
    const a = parseFloat(coefInputs[0].value) || 0; 
    const b = parseFloat(coefInputs[1].value) || 0; 
    const rel = document.querySelector(`select[name="rel[${r}]"]`).value;
    const val = parseFloat(document.querySelector(`input[name="b[${r}]"]`).value) || 0;
    constraintsData.push({ a, b, rel, val, id: `R${r + 1}` });
  }

  const lines = [];
  constraintsData.forEach(c => {
    lines.push({ a: c.a, b: c.b, val: c.val, id: c.id, originalConstraint: true });
  });
  lines.push({ a: 1, b: 0, val: 0, id: 'X1=0 (Eje X2)', originalConstraint: false }); 
  lines.push({ a: 0, b: 1, val: 0, id: 'X2=0 (Eje X1)', originalConstraint: false }); 

  const intersectionPoints = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const l1 = lines[i];
      const l2 = lines[j];
      const determinant = l1.a * l2.b - l2.a * l1.b;

      if (Math.abs(determinant) > 1e-9) { 
        const x1 = (l1.val * l2.b - l2.val * l1.b) / determinant;
        const x2 = (l1.a * l2.val - l2.a * l1.val) / determinant;
        const roundedX1 = parseFloat(x1.toFixed(5));
        const roundedX2 = parseFloat(x2.toFixed(5));
        intersectionPoints.push({ x1: roundedX1, x2: roundedX2, fromLines: [l1.id, l2.id] });
      }
    }
  }

  const feasibleVertices = [];
  const tolerance = 1e-9; 

  intersectionPoints.forEach(pt => {
    if (pt.x1 < -tolerance || pt.x2 < -tolerance) {
      return; 
    }

    let isFeasibleForAll = true;
    for (const constraint of constraintsData) { // Usar constraintsData
      const sum = constraint.a * pt.x1 + constraint.b * pt.x2;
      let constraintSatisfied = false;
      if (constraint.rel === '<=') { 
        constraintSatisfied = sum <= constraint.val + tolerance;
      } else if (constraint.rel === '>=') { 
        constraintSatisfied = sum >= constraint.val - tolerance;
      } else if (constraint.rel === '=') { 
        constraintSatisfied = Math.abs(sum - constraint.val) < tolerance;
      }
      
      if (!constraintSatisfied) {
        isFeasibleForAll = false;
        break;
      }
    }

    if (isFeasibleForAll) {
      if (!feasibleVertices.some(v => Math.abs(v.x1 - pt.x1) < 1e-5 && Math.abs(v.x2 - pt.x2) < 1e-5)) {
        feasibleVertices.push({ x1: pt.x1, x2: pt.x2 });
      }
    }
  });
  
  let originFeasible = true;
  for (const constraint of constraintsData) { // Usar constraintsData
      const sum = 0; 
      let constraintSatisfied = false;
      if (constraint.rel === '<=') { constraintSatisfied = sum <= constraint.val + tolerance; }
      else if (constraint.rel === '>=') { constraintSatisfied = sum >= constraint.val - tolerance; }
      else if (constraint.rel === '=') { constraintSatisfied = Math.abs(sum - constraint.val) < tolerance; }
      if (!constraintSatisfied) {
          originFeasible = false;
          break;
      }
  }
  if (originFeasible) {
      if (!feasibleVertices.some(v => Math.abs(v.x1 - 0) < 1e-5 && Math.abs(v.x2 - 0) < 1e-5)) {
          feasibleVertices.push({ x1: 0, x2: 0 });
      }
  }
    
  // Ordenar vértices factibles para dibujar la región factible correctamente
  if (feasibleVertices.length >= 3) {
    // Calcular centroide
    let centerX = 0;
    let centerY = 0;
    feasibleVertices.forEach(v => {
      centerX += v.x1;
      centerY += v.x2;
    });
    centerX /= feasibleVertices.length;
    centerY /= feasibleVertices.length;

    // Ordenar por ángulo con respecto al centroide
    feasibleVertices.sort((a, b) => {
      const angleA = Math.atan2(a.x2 - centerY, a.x1 - centerX);
      const angleB = Math.atan2(b.x2 - centerY, b.x1 - centerX);
      return angleA - angleB;
    });
  }


  if (feasibleVertices.length === 0 && !originFeasible) { // Modificada la condición
    const resultContainer = document.getElementById('graficoResultados');
    const message = "<p>No se encontraron vértices factibles. El problema puede no tener solución (región factible vacía) o ser no acotado de una manera que no produce vértices evaluables con este método.</p>";
    resultContainer.innerHTML = message;
     if (myChartInstance) {
        myChartInstance.destroy();
    }
    document.getElementById('graficoCanvas').style.display = 'none';
    return;
  }

  let optimalSolution = null;
  let optimalZ = (tipoZ === 'max') ? -Infinity : Infinity;

  // Si solo el origen es factible, es la solución óptima
  if (feasibleVertices.length === 0 && originFeasible) {
      feasibleVertices.push({x1:0, x2:0}); // Asegurar que (0,0) esté en la lista para evaluar
  }


  feasibleVertices.forEach(vertex => {
    const zValue = objCoeffs[0] * vertex.x1 + objCoeffs[1] * vertex.x2;
    const currentOptimalZRounded = parseFloat(optimalZ.toFixed(5));
    const currentZValueRounded = parseFloat(zValue.toFixed(5));

    if (tipoZ === 'max') {
      if (currentZValueRounded > currentOptimalZRounded) {
        optimalZ = zValue; 
        optimalSolution = vertex;
      } else if (currentZValueRounded === currentOptimalZRounded) { // Múltiples soluciones
          if (!optimalSolution) optimalSolution = vertex; // Tomar la primera si no hay ninguna aún
      }
    } else { // min
      if (currentZValueRounded < currentOptimalZRounded) {
        optimalZ = zValue; 
        optimalSolution = vertex;
      } else if (currentZValueRounded === currentOptimalZRounded) { // Múltiples soluciones
          if (!optimalSolution) optimalSolution = vertex;
      }
    }
  });
  
  // Si no se encontró solución óptima pero hay vértices factibles (ej. todos dan Z=0 y se buscaba min -Infinity)
  if (!optimalSolution && feasibleVertices.length > 0) {
      optimalSolution = feasibleVertices[0]; // Tomar el primer vértice factible como referencia
      optimalZ = objCoeffs[0] * optimalSolution.x1 + objCoeffs[1] * optimalSolution.x2;
  }


  let resultHTML = '';
  if (optimalSolution) {
    resultHTML = `<h3>Solución Óptima (Método Gráfico)</h3>`;
    resultHTML += `<p>X<sub>1</sub> = ${optimalSolution.x1.toFixed(3)}</p>`;
    resultHTML += `<p>X<sub>2</sub> = ${optimalSolution.x2.toFixed(3)}</p>`;
    resultHTML += `<p><b>Valor Óptimo de Z = ${optimalZ.toFixed(3)}</b></p>`;
    
    resultHTML += `<h4>Vértices Factibles Evaluados:</h4>`;
    resultHTML += `<table border='1' cellpadding='5' cellspacing='0' style='margin-top:10px;'><tr><th>X<sub>1</sub></th><th>X<sub>2</sub></th><th>Valor de Z</th></tr>`;
    feasibleVertices.forEach(v => {
      resultHTML += `<tr><td>${v.x1.toFixed(3)}</td><td>${v.x2.toFixed(3)}</td><td>${(objCoeffs[0] * v.x1 + objCoeffs[1] * v.x2).toFixed(3)}</td></tr>`;
    });
    resultHTML += `</table>`;
  } else {
     resultHTML = "<p>No se pudo determinar una solución óptima finita. La región factible podría ser vacía o no acotada.</p>";
     if (feasibleVertices.length > 0 && (optimalZ === Infinity || optimalZ === -Infinity)) {
         resultHTML += "<p>La función objetivo parece ser no acotada en la región factible.</p>";
     }
  }

  document.getElementById('graficoResultados').innerHTML = resultHTML;

  // Llamada a la función para mostrar el gráfico
  if (optimalSolution) { // Solo graficar si hay una solución que mostrar
    mostrarGrafico(constraintsData, feasibleVertices, optimalSolution);
  } else if (feasibleVertices.length > 0) { // Si hay región factible pero Z es no acotado
    mostrarGrafico(constraintsData, feasibleVertices, null); // Graficar región sin punto óptimo resaltado
  }
   else {
      if (myChartInstance) {
          myChartInstance.destroy();
      }
      document.getElementById('graficoCanvas').style.display = 'none';
  }
}


function mostrarGrafico(constraints, feasiblePoints, optimalPoint) {
  const ctx = document.getElementById('graficoCanvas').getContext('2d');

  if (myChartInstance) {
    myChartInstance.destroy();
  }

  const datasets = [];
  let maxCoordX = 10; // Default max X
  let maxCoordY = 10; // Default max Y

  // Calcular maxCoord basado en los puntos factibles y la solución óptima
  const allPointsForScale = [...feasiblePoints];
  if (optimalPoint) {
    allPointsForScale.push(optimalPoint);
  }
  if (allPointsForScale.length > 0) {
    maxCoordX = Math.max(...allPointsForScale.map(p => Math.abs(p.x1)), 10) * 1.2;
    maxCoordY = Math.max(...allPointsForScale.map(p => Math.abs(p.x2)), 10) * 1.2;
  }
  
  // Si alguna restricción es de la forma x1=c o x2=c, usar esos valores para escalar también
  constraints.forEach(c => {
    if (c.b === 0 && c.a !== 0) { // Linea vertical x1 = val/a
        maxCoordX = Math.max(maxCoordX, Math.abs(c.val / c.a) * 1.2);
    }
    if (c.a === 0 && c.b !== 0) { // Linea horizontal x2 = val/b
        maxCoordY = Math.max(maxCoordY, Math.abs(c.val / c.b) * 1.2);
    }
    // Interceptos con los ejes
    if (c.a !== 0) maxCoordX = Math.max(maxCoordX, Math.abs(c.val / c.a) * 1.2);
    if (c.b !== 0) maxCoordY = Math.max(maxCoordY, Math.abs(c.val / c.b) * 1.2);
  });
  maxCoordX = Math.max(maxCoordX, 1); // Evitar maxCoordX = 0
  maxCoordY = Math.max(maxCoordY, 1); // Evitar maxCoordY = 0


  // 1. Líneas de Restricción
  constraints.forEach((constraint, index) => {
    const { a, b, val } = constraint;
    const lineData = [];
    if (Math.abs(b) > 1e-9) { // No es una línea vertical (b != 0)
      // x2 = (val - a*x1) / b
      lineData.push({ x: 0, y: val / b });
      lineData.push({ x: maxCoordX, y: (val - a * maxCoordX) / b });
    } else if (Math.abs(a) > 1e-9) { // Línea vertical (b = 0, a != 0)
      // x1 = val / a
      const xVal = val / a;
      lineData.push({ x: xVal, y: 0 });
      lineData.push({ x: xVal, y: maxCoordY });
    } else { // a=0, b=0. No es una línea válida si val != 0.
        return; 
    }
    
    // Filtrar puntos con coordenadas no finitas o muy grandes para evitar errores de Chart.js
    const filteredLineData = lineData.filter(p => isFinite(p.x) && isFinite(p.y) && Math.abs(p.x) < maxCoordX*5 && Math.abs(p.y) < maxCoordY*5);

    if(filteredLineData.length >= 2){
        datasets.push({
          label: `Restricción ${index + 1}: ${constraint.id}`,
          data: filteredLineData,
          borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`, // Colores diferentes
          borderWidth: 2,
          type: 'line',
          fill: false,
          tension: 0, // Líneas rectas
          pointRadius: 0 // No mostrar puntos en las líneas de restricción
        });
    }
  });

  // 2. Región Factible (si hay suficientes puntos ordenados)
  if (feasiblePoints && feasiblePoints.length >= 3) {
    datasets.push({
      label: 'Región Factible',
      data: feasiblePoints.map(p => ({ x: p.x1, y: p.x2 })).concat([{x: feasiblePoints[0].x1, y: feasiblePoints[0].x2}]), // Cerrar el polígono
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
      type: 'line', // o 'scatter' con showLine: true y fill:true
      fill: true,
      tension: 0,
      pointRadius: 0, // No mostrar puntos individuales para el área
      order: 10 // Dibujar encima de las líneas pero debajo de los puntos
    });
  }


  // 3. Puntos Factibles (vértices)
  if (feasiblePoints && feasiblePoints.length > 0) {
    datasets.push({
      label: 'Vértices Factibles',
      data: feasiblePoints.map(p => ({ x: p.x1, y: p.x2 })),
      backgroundColor: 'rgb(54, 162, 235)', // Azul
      type: 'scatter',
      pointRadius: 5,
      order: 1 // Dibujar encima de las líneas y región
    });
  }

  // 4. Punto Óptimo
  if (optimalPoint) {
    datasets.push({
      label: 'Solución Óptima',
      data: [{ x: optimalPoint.x1, y: optimalPoint.x2 }],
      backgroundColor: 'rgb(255, 99, 132)', // Rojo
      type: 'scatter',
      pointRadius: 8,
      pointStyle: 'rectRot', // Estilo diferente para el óptimo
      order: 0 // Dibujar encima de todo
    });
  }

  myChartInstance = new Chart(ctx, {
    type: 'scatter', // El tipo base puede ser scatter y luego cada dataset especifica el suyo
    data: {
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'X1'
          },
          min: 0, // Empezar ejes en 0
          max: maxCoordX 
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: 'X2'
          },
          min: 0, // Empezar ejes en 0
          max: maxCoordY
        }
      },
      plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += `(X1: ${context.parsed.x.toFixed(2)}, X2: ${context.parsed.y.toFixed(2)})`;
                    }
                    return label;
                }
            }
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
    // Ocultar el canvas inicialmente si no hay datos para graficar
    const canvas = document.getElementById('graficoCanvas');
    if (canvas) {
        canvas.style.display = 'none';
    }
});