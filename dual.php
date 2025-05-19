<?php
function imprimirTabla($tabla, $variables, $restricciones, $etiquetasBase) {
    echo "<table border='1' cellpadding='5' cellspacing='0'>";
    echo "<tr><th>Base</th>";
    for ($j = 0; $j < $variables + $restricciones; $j++) {
        echo "<th>X" . ($j + 1) . "</th>";
    }
    echo "<th>Solución</th></tr>";

    foreach ($tabla as $i => $fila) {
        if ($i == count($tabla) - 1) {
            echo "<tr style='background:#ddd'><td>Zj - Cj</td>";
        } else {
            echo "<tr><td>{$etiquetasBase[$i]}</td>";
        }
        foreach ($fila as $valor) {
            echo "<td>" . ($valor) ."</td>";
        }
        echo "</tr>";
    }
    echo "</table><br>";
}

function simplexDual($z, $a, $b, $rel, $variables, $restricciones, $tipoZ) {
    $tabla = [];
    $etiquetasBase = [];

    if ($tipoZ == 'max') {
        foreach ($z as &$coef) $coef = -$coef;
        $tipoZ = 'min';
    }
    
    $tabla = array_fill(0, $restricciones + 1, array_fill(0, $variables + $restricciones + 1, 0));
    for ($i = 0; $i < $restricciones; $i++) {
        for ($j = 0; $j < $variables; $j++) {
            $tabla[$i][$j] = $a[$i][$j];
        }
    }
    for ($i = 0; $i < $restricciones; $i++) {
        for ($j = 0; $j < $restricciones; $j++) {
            $tabla[$i][$variables + $j] = ($i == $j) ? 1 : 0;
        }
    }
    for ($i = 0; $i < $restricciones; $i++) {
        $tabla[$i][$variables + $restricciones] = $b[$i];
    }
    for ($j = 0; $j < $variables; $j++) {
        $tabla[$restricciones][$j] = -$z[$j];
    }
    for ($i = 0; $i < $restricciones; $i++) {
        $etiquetasBase[$i] = "X" . ($variables + $i + 1);
    }
    
    $etiquetasBase[$restricciones] = "Z";

    echo "<h3>Tabla Inicial</h3>";
    imprimirTabla($tabla, $variables, $restricciones, $etiquetasBase);

    $iteracion = 1;
    while (true) {
        $columnaEntrante = -1;
        $valorMin = 0;
        for ($j = 0; $j < $variables + $restricciones; $j++) {
            if ($tabla[$restricciones][$j] < $valorMin) {
                $valorMin = $tabla[$restricciones][$j];
                $columnaEntrante = $j;
            }
        }
        if ($columnaEntrante == -1) {
            echo "<h3>Solución Óptima Encontrada</h3>";
            break;
        }

        $filaSalida = -1;
        $minCociente = PHP_INT_MAX;
        for ($i = 0; $i < $restricciones; $i++) {
            if ($tabla[$i][$columnaEntrante] > 0) {
                $cociente = $tabla[$i][$variables + $restricciones] / $tabla[$i][$columnaEntrante];
                if ($cociente < $minCociente) {
                    $minCociente = $cociente;
                    $filaSalida = $i;
                }
            }
        }

        if ($filaSalida == -1) {
            echo "<h3>Problema ilimitado</h3>";
            return;
        }

        echo "<h3>Iteración $iteracion</h3>";
        echo "<p>Variable entrante: X" . ($columnaEntrante + 1) . "</p>";
        echo "<p>Variable saliente: {$etiquetasBase[$filaSalida]}</p>";

        $etiquetasBase[$filaSalida] = "X" . ($columnaEntrante + 1);

        $pivote = $tabla[$filaSalida][$columnaEntrante];
        for ($j = 0; $j <= $variables + $restricciones; $j++) {
            $tabla[$filaSalida][$j] /= $pivote;
        }

        for ($i = 0; $i <= $restricciones; $i++) {
            if ($i != $filaSalida) {
                $factor = $tabla[$i][$columnaEntrante];
                for ($j = 0; $j <= $variables + $restricciones; $j++) {
                    $tabla[$i][$j] -= $factor * $tabla[$filaSalida][$j];
                }
            }
        }

        imprimirTabla($tabla, $variables, $restricciones, $etiquetasBase);
        $iteracion++;
    }

    $solucion = array_fill(0, $variables + $restricciones, 0);
    for ($i = 0; $i < $restricciones; $i++) {
        $indice = intval(substr($etiquetasBase[$i], 1)) - 1;
        if ($indice < count($solucion)) {
            $solucion[$indice] = $tabla[$i][$variables + $restricciones];
        }
    }

    echo "<h3>Valores de las variables óptimas</h3>";
    for ($i = 0; $i < $variables; $i++) {
        echo "X" . ($i + 1) . " = " . ($solucion[$i]) . "<br>";
    }

    $valorZ = 0;
    for ($i = 0; $i < $variables; $i++) {
        $coef = $z[$i];
        if ($tipoZ == 'min') {
            $coef = -$coef;
        }
        $valorZ += $coef * $solucion[$i];
    }
    echo "<h3>Valor óptimo de Z = ". (-1 * $valorZ) . "</h3>";
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $tipoZ = $_POST['tipoZ'];
    $variables = intval($_POST['variables']);
    $restricciones = intval($_POST['restricciones']);
    $z = $_POST['z'];
    $a = $_POST['a'];
    $rel = $_POST['rel'];
    $b = $_POST['b'];

    simplexDual($z, $a, $b, $rel, $variables, $restricciones, $tipoZ);
}
?>

