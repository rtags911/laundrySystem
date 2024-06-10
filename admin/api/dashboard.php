<?php
include_once 'function/conn.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Function to get statistics
function getStatistics($db)
{
    // Total customers count
    $sqlTotalCustomers = "SELECT COUNT(DISTINCT customer_id) as total_customers FROM books";
    $stmtTotalCustomers = $db->prepare($sqlTotalCustomers);
    $stmtTotalCustomers->execute();
    $totalCustomers = $stmtTotalCustomers->fetch(PDO::FETCH_ASSOC)['total_customers'];

    // Status counts
    $sqlStatusCounts = "SELECT status, COUNT(*) as count FROM books GROUP BY status";
    $stmtStatusCounts = $db->prepare($sqlStatusCounts);
    $stmtStatusCounts->execute();
    $statusCounts = $stmtStatusCounts->fetchAll(PDO::FETCH_ASSOC);

    // Format the status counts into a more usable format
    $formattedStatusCounts = [
        'pending' => 0,
        'processing' => 0,
        'folding' => 0,
        'ready_for_pickup' => 0,
        'claimed' => 0
    ];

    foreach ($statusCounts as $statusCount) {
        switch ($statusCount['status']) {
            case 0:
                $formattedStatusCounts['pending'] = $statusCount['count'];
                break;
            case 1:
                $formattedStatusCounts['processing'] = $statusCount['count'];
                break;
            case 2:
                $formattedStatusCounts['folding'] = $statusCount['count'];
                break;
            case 3:
                $formattedStatusCounts['ready_for_pickup'] = $statusCount['count'];
                break;
            case 4:
                $formattedStatusCounts['claimed'] = $statusCount['count'];
                break;
        }
    }

    return [
        'total_customers' => $totalCustomers,
        'status_counts' => $formattedStatusCounts
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statistics = getStatistics($db);

    // Return statistics as JSON response
    echo json_encode(['statistics' => $statistics]);
}
?>