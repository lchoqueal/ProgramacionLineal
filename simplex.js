/**
 * Solves a linear programming problem using the Simplex algorithm.
 * Handles both maximization and minimization problems.
 */
function resolverSimplex() {
    const tipoZ = document.querySelector('input[name="tipoZ"]:checked').value;
    const objectiveFunction = actualizarZ(); // Assumes this function exists and returns the objective function coefficients
    const constraints = actualizarEcuaciones(); // Assumes this function exists and returns the constraint data
    const problemType = document.getElementById('tipoZ').value; // Assumes an element with id 'problemType' exists to specify max/min

    // Convert minimization problem to maximization
    if (problemType === 'minimizar') {
        for (let i = 0; i < objectiveFunction.length; i++) {
            objectiveFunction[i] = -objectiveFunction[i];
        }
    }

    // Build the initial tableau
    const numVariables = parseInt(document.getElementById('variables').value); // Excludes the constant term
    const numConstraints = parseInt(document.getElementById('restricciones').value);
    const tableau = document.getElementById('tablaContainer');

    // Add objective function row
    const zRow = [...objectiveFunction.slice(0, numVariables), 0, ...Array(numConstraints).fill(0), 1, 0];
    tableau.push(zRow);

    // Add constraint rows
    for (let i = 0; i < numConstraints; i++) {
        const constraintRow = [...constraints[i].slice(0, numVariables)];
        // Add slack variables
        for (let j = 0; j < numConstraints; j++) {
            constraintRow.push(i === j ? 1 : 0);
        }
        constraintRow.push(0); // Z coefficient
        constraintRow.push(constraints[i][numVariables]); // RHS
        tableau.push(constraintRow);
    }

    // Add an extra row for slack variables in the header
    const header = ['Z'];
    for (let i = 0; i < numVariables; i++) {
        header.push(`x${i + 1}`);
    }
    for (let i = 0; i < numConstraints; i++) {
        header.push(`s${i + 1}`);
    }
    header.push('Sol');
    tableau.unshift(header); // Add header to the beginning

    let iteration = 0;
    let resultHtml = `<h2>Iteración ${iteration}</h2>`;
    resultHtml += generateTableHTML(tableau); // Assumes generateTableHTML function exists to display tableau

    while (true) {
        iteration++;
        // Find pivot column (most negative value in the objective function row, excluding the last element)
        let pivotCol = -1;
        let minZ = 0;
        for (let j = 1; j <= numVariables; j++) { // Start from 1 to exclude Z
            if (tableau[1][j] < minZ) {
                minZ = tableau[1][j];
                pivotCol = j;
            }
        }

        // If no negative values in objective function, optimal solution is found
        if (pivotCol === -1) {
            break;
        }

        // Find pivot row (smallest non-negative ratio of RHS to pivot column element)
        let pivotRow = -1;
        let minRatio = Infinity;
        for (let i = 2; i < tableau.length; i++) { // Start from 2 to exclude header and Z row
            const ratio = tableau[i][tableau[0].indexOf('Sol')] / tableau[i][pivotCol];
            if (ratio >= 0 && ratio < minRatio) {
                minRatio = ratio;
                pivotRow = i;
            }
        }

        // If no positive values in the pivot column, unbounded solution
        if (pivotRow === -1) {
            resultHtml += "<h2>Solución Ilimitada</h2>";
            document.getElementById('resultsContainer').innerHTML = resultHtml;
            return;
        }

        // Perform pivot operation
        const pivotElement = tableau[pivotRow][pivotCol];

        // Divide pivot row by pivot element
        for (let j = 0; j < tableau[pivotRow].length; j++) {
            tableau[pivotRow][j] /= pivotElement;
        }

        // Eliminate pivot column in other rows
        for (let i = 1; i < tableau.length; i++) { // Start from 1 to exclude header
            if (i !== pivotRow) {
                const factor = tableau[i][pivotCol];
                for (let j = 0; j < tableau[i].length; j++) {
                    tableau[i][j] -= factor * tableau[pivotRow][j];
                }
            }
        }

        // Update basic variable in the header
        tableau[pivotRow][0] = tableau[0][pivotCol];

        resultHtml += `<h2>Iteración ${iteration}</h2>`;
        resultHtml += generateTableHTML(tableau);
    }

    // Display final solution
    resultHtml += "<h2>Solución Óptima</h2>";
    const finalSolution = {};
    for (let i = 1; i <= numVariables; i++) {
        const variableName = `x${i}`;
        let value = 0;
        // Find the row where the variable is basic
        for (let j = 1; j < tableau.length; j++) {
            if (tableau[j][0] === variableName) {
                value = tableau[j][tableau[0].indexOf('Sol')];
                break;
            }
        }
        finalSolution[variableName] = value;
        resultHtml += `<p>${variableName} = ${value.toFixed(2)}</p>`;
    }

    let optimalValue = tableau[1][tableau[0].indexOf('Sol')];
    if (problemType === 'minimizar') {
        optimalValue = -optimalValue; // Convert back for minimization
    }
    resultHtml += `<p>Valor Óptimo de Z = ${optimalValue.toFixed(2)}</p>`;


    document.getElementById('resultsContainer').innerHTML = resultHtml;
}

// Helper function to generate HTML table from a 2D array (Assumes this function exists)
// function generateTableHTML(data) {
//     let html = '<table>';
//     for (let i = 0; i < data.length; i++) {
//         html += '<tr>';
//         for (let j = 0; j < data[i].length; j++) {
//             html += `<td>${typeof data[i][j] === 'number' ? data[i][j].toFixed(2) : data[i][j]}</td>`;
//         }
//         html += '</tr>';
//     }
//     html += '</table>';
//     return html;
// }