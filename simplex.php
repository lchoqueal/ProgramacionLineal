<?php
  function metodoSimplex($tabla, $variablesBasicas) {
    $filas = count($tabla);
    $columnas = count($tabla[0]);

    while (true) {
        // Paso 1: Buscar la columna pivote (la más negativa en la última fila)
        $columnaPivote = -1;
        $valorMinimo = 0;

        for ($j = 0; $j < $columnas - 1; $j++) {
            if ($tabla[$filas - 1][$j] < $valorMinimo) {
                $valorMinimo = $tabla[$filas - 1][$j];
                $columnaPivote = $j;
            }
        }

        // Si no hay negativos, la solución es óptima
        if ($columnaPivote == -1) break;

        // Paso 2: Buscar la fila pivote (mínimo cociente positivo)
        $filaPivote = -1;
        $minCociente = PHP_INT_MAX;
        for ($i = 0; $i < $filas - 1; $i++) {
            $elemento = $tabla[$i][$columnaPivote];
            if ($elemento > 0) {
                $cociente = $tabla[$i][$columnas - 1] / $elemento;
                if ($cociente < $minCociente) {
                    $minCociente = $cociente;
                    $filaPivote = $i;
                }
            }
        }

        if ($filaPivote == -1) {
            echo "Solución no acotada.\n";
            return;
        }

        // Paso 3: Hacer la fila pivote igual a 1
        $pivote = $tabla[$filaPivote][$columnaPivote];
        for ($j = 0; $j < $columnas; $j++) {
            $tabla[$filaPivote][$j] /= $pivote;
        }

        // Paso 4: Hacer ceros en la columna pivote (menos la fila pivote)
        for ($i = 0; $i < $filas; $i++) {
            if ($i != $filaPivote) {
                $factor = $tabla[$i][$columnaPivote];
                for ($j = 0; $j < $columnas; $j++) {
                    $tabla[$i][$j] -= $factor * $tabla[$filaPivote][$j];
                }
            }
        }

        // Actualizar variable básica
        $variablesBasicas[$filaPivote] = "x" . ($columnaPivote + 1);
    }

    // Mostrar solución final
    echo "Solución óptima encontrada:\n";
    for ($i = 0; $i < $filas - 1; $i++) {
        echo $variablesBasicas[$i] . " = " . $tabla[$i][$columnas - 1] . "\n";
    }
    echo "Valor óptimo Z = " . $tabla[$filas - 1][$columnas - 1] . "\n";
    }

    // Ejemplo de uso:
    // Maximizar Z = 3x + 5y
    // Sujeto a:
    // x + 2y <= 6
    // 3x + 2y <= 12
    // x, y >= 0

    $tabla = [
        [1, 2, 1, 0, 6],
        [3, 2, 0, 1, 12],
        [-3, -5, 0, 0, 0] // función objetivo (negada para maximizar)
    ];

    $variablesBasicas = ["s1", "s2"]; // Variables básicas iniciales

    metodoSimplex($tabla, $variablesBasicas);  
?>