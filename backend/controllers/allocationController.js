const dataStore = require('../services/dataStore');
const decisionEngine = require('../services/decisionEngineService');

exports.getConflicts = (req, res) => {
  try {
    const conflicts = decisionEngine.detectConflicts();
    res.json({ success: true, count: conflicts.length, data: conflicts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.resolveConflict = (req, res) => {
  try {
    const { strategy, urgentOrderId, competingOrderId, allocatedQty, backorderedQty } = req.body;

    const urgentOrder = dataStore.getOrder(urgentOrderId || 'ORD-1042');
    if (urgentOrder) {
      urgentOrder.status = 'Allocated';
      urgentOrder.risk = 'Resolved (Shortage Split)';
      const allocStage = urgentOrder.timeline.find(t => t.stage === 'Smart Allocation');
      if (allocStage) {
        allocStage.status = 'completed';
        allocStage.time = new Date().toLocaleTimeString().slice(0, 5);
      }
      const pickStage = urgentOrder.timeline.find(t => t.stage === 'Picking');
      if (pickStage) pickStage.status = 'active';
      dataStore.updateOrder(urgentOrder.id, urgentOrder);
    }

    const competingOrder = dataStore.getOrder(competingOrderId || 'ORD-1048');
    if (competingOrder) {
      competingOrder.status = 'On Hold';
      competingOrder.risk = 'Awaiting PO-884 Replenishment';
      dataStore.updateOrder(competingOrder.id, competingOrder);
    }

    // Resolve exception EX-102
    dataStore.resolveException('EX-102', `Strategy "${strategy || 'Smart Balanced'}" applied. Allocated ${allocatedQty || 7} units to VIP order ${urgentOrderId || 'ORD-1042'}. Triggered PO-884 for ${backorderedQty || 3} units.`);

    dataStore.addActivityLog(
      'Alex Morgan (Manager)',
      `Approved ${strategy || 'Smart Balanced'} allocation: VIP Order ${urgentOrderId || 'ORD-1042'} advanced to picking with ${allocatedQty || 7} units.`,
      'success',
      'Smart Allocation Approved'
    );

    res.json({
      success: true,
      message: 'Allocation conflict resolved successfully.',
      urgentOrder,
      competingOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
