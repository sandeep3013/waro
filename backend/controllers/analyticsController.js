const dataStore = require('../services/dataStore');

exports.getAnalytics = (req, res) => {
  try {
    const orders = dataStore.getOrders();
    const inventory = dataStore.getInventory();
    const exceptions = dataStore.getExceptions();
    const pickingTasks = dataStore.getPickingTasks();

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered').length;
    const inProgressOrders = orders.filter(o => ['Picking', 'Packing', 'Quality Check', 'Ready to Dispatch'].includes(o.status)).length;
    const newOrders = orders.filter(o => ['New', 'Inventory Checking', 'Allocated'].includes(o.status)).length;

    let totalValue = orders.reduce((sum, o) => sum + (o.totalValue || 0), 0);

    const openExceptions = exceptions.filter(e => e.status !== 'Resolved').length;

    // Stage metrics
    const stageBreakdown = {
      orderIntake: newOrders,
      smartAllocation: orders.filter(o => o.status === 'Allocated').length,
      picking: orders.filter(o => o.status === 'Picking').length,
      packing: orders.filter(o => o.status === 'Packing').length,
      qualityCheck: orders.filter(o => o.status === 'Quality Check').length,
      readyToDispatch: orders.filter(o => o.status === 'Ready to Dispatch').length,
      dispatched: completedOrders
    };

    // Cycle Time Benchmarks
    const cycleTimes = {
      intakeToAllocMin: 2.1,
      pickingAvgMin: 14.8,
      packingAvgMin: 4.8,
      qcAvgMin: 3.2,
      dispatchAvgMin: 8.5,
      totalOrderToShipHours: 1.85
    };

    // Bottlenecks
    const bottlenecks = [
      {
        stage: 'Picking (Zone A)',
        severity: 'High',
        impact: '+4.8m Cycle Delay',
        recommendation: 'Reassign 2 afternoon pickers from Zone C to Zone A.'
      },
      {
        stage: 'QC Inspection Station 2',
        severity: 'Medium',
        impact: '10 min Queue Buffer',
        recommendation: 'Fast-track low-risk standard parcels.'
      }
    ];

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        inProgressOrders,
        newOrders,
        totalValue: +totalValue.toFixed(2),
        openExceptions,
        stageBreakdown,
        cycleTimes,
        bottlenecks,
        slaComplianceRate: 98.4,
        onTimeDispatchRate: 97.2,
        pickAccuracyRate: 99.1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
