<?php
$command = 'cmd /c "C:\\Program Files\\nodejs\\node.exe -v" 2>&1';
exec($command, $output, $return_var);

echo "<pre>📂 **Verificando si PHP puede ejecutar Node.js (con cmd.exe)**\n";
echo "Código de salida: $return_var\n";
echo "Salida:\n" . implode("\n", $output) . "\n";
echo "</pre>";
?>



<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estado de Tóner de Impresoras</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 20px;
            text-align: center;
        }

        h1 {
            color: #0e3f89;
        }

        .printer-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
        }

        .printer-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            width: 300px;
        }

        .progress-bar {
            height: 20px;
            border-radius: 5px;
            overflow: hidden;
            background-color: #ddd;
            position: relative;
        }

        .progress {
            height: 100%;
            text-align: right;
            line-height: 20px;
            color: white;
            font-weight: bold;
            padding-right: 5px;
            transition: width 1s ease-in-out;
        }

        .yellow {
            background-color: #FFD700;
        }

        .magenta {
            background-color: #FF1493;
        }

        .cyan {
            background-color: #00BFFF;
        }

        .black {
            background-color: #333;
        }
    </style>
</head>

<body>

    <h1>Estado de Tóner de Impresoras</h1>

    <div id="printerContainer" class="printer-container">
        <?php if (!empty($data)): ?>
            <?php foreach ($data as $printer): ?>
                <div class="printer-card">
                    <h2><?php echo $printer['name']; ?> (<?php echo $printer['ip']; ?>)</h2>
                    <?php
                    $tonerTypes = [
                        "YellowToner" => "yellow",
                        "Magentatoner" => "magenta",
                        "Cyantoner" => "cyan",
                        "Blacktoner" => "black"
                    ];
                    foreach ($tonerTypes as $key => $color):
                        if (isset($printer[$key])):
                            $percentage = intval(str_replace('%', '', $printer[$key]));
                    ?>
                            <div class="progress-bar">
                                <div class="progress <?php echo $color; ?>" style="width: <?php echo $percentage; ?>%;">
                                    <?php echo $printer[$key]; ?>
                                </div>
                            </div>
                    <?php endif;
                    endforeach; ?>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <script>
        fetch("data.json")
            .then(response => response.json())
            .then(data => console.log("📊 Datos en data.json:", data))
            .catch(error => console.error("❌ Error al obtener data.json:", error));
    </script>

</body>

</html>