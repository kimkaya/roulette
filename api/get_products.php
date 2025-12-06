<?php
header('Content-Type: application/json');

$dataFile = __DIR__ . '/../data/products.json';

if (file_exists($dataFile)) {
    $data = file_get_contents($dataFile);
    echo $data;
} else {
    echo json_encode([]);
}
?>
