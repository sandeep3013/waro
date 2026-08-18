const decisionEngine = require('../services/decisionEngineService');
const dataStore = require('../services/dataStore');

exports.getHealthScore = (req, res) => {
  try {
    const health = decisionEngine.calculateHealthScore();
    res.json({ success: true, data: health });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getRecommendations = (req, res) => {
  try {
    const conflicts = decisionEngine.detectConflicts();
    const inventory = dataStore.getInventory();
    const exceptions = dataStore.getExceptions();

    const recs = [];

    // 1. Conflict rec
    if (conflicts.length > 0) {
      recs.push({
        id: 'REC-101',
        type: 'Inventory Conflict',
        priority: 'Critical',
        title: 'Auto-Resolve VIP Stock Shortage',
        summary: `Prioritize VIP order with ${conflicts[0].availableStock} available units; backorder remaining.`,
        actionLabel: '1-Click Approve',
        actionUrl: 'allocation.html'
      });
    }

    // 2. Route rec
    const unoptimizedTask = dataStore.getPickingTasks().find(t => !t.optimizedRouteApplied);
    if (unoptimizedTask) {
      recs.push({
        id: 'REC-102',
        type: 'Route Optimization',
        priority: 'High',
        title: 'Optimize S-Shape Picking Route',
        summary: `Apply aisle sequencing to Task ${unoptimizedTask.taskId} to save ~5.2 mins of walking time.`,
        actionLabel: 'Apply Route',
        actionUrl: 'picking.html'
      });
    }

    // 3. Exception rec
    const openEx = exceptions.find(e => e.status === 'Action Required');
    if (openEx) {
      recs.push({
        id: 'REC-103',
        type: 'Exception Clearance',
        priority: 'Critical',
        title: `Resolve ${openEx.type}: ${openEx.id}`,
        summary: openEx.recommendedAction,
        actionLabel: 'Review Exception',
        actionUrl: 'exceptions.html'
      });
    }

    res.json({ success: true, count: recs.length, data: recs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.simulateWhatIf = (req, res) => {
  try {
    const { strategy, extraWorkers, orderSurgePct } = req.body;

    const baseCycle = 14.8;
    const workerGain = (extraWorkers || 0) * 1.6;
    const surgeLoad = ((orderSurgePct || 0) / 100) * 4.2;
    const projectedCycle = Math.max(7.5, +(baseCycle - workerGain + surgeLoad).toFixed(1));

    const projectedThroughput = Math.round(52 + (extraWorkers || 0) * 8 - ((orderSurgePct || 0) > 30 ? 6 : 0));
    const projectedHealthScore = Math.min(99, Math.max(60, 88 + (strategy === 'Smart Balanced' ? 6 : 2) + (extraWorkers || 0) * 2 - ((orderSurgePct || 0) / 10)));

    res.json({
      success: true,
      simulation: {
        strategy: strategy || 'Smart Balanced',
        extraWorkers: extraWorkers || 0,
        orderSurgePct: orderSurgePct || 0,
        projectedCycleTimeMin: projectedCycle,
        projectedHourlyThroughput: projectedThroughput,
        projectedHealthScore: Math.round(projectedHealthScore),
        slaConfidence: projectedHealthScore > 85 ? '99.4% (High)' : '93.1% (Moderate)'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
