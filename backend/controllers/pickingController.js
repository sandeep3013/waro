const dataStore = require('../services/dataStore');
const decisionEngine = require('../services/decisionEngineService');

exports.getAllPickingTasks = (req, res) => {
  try {
    const tasks = dataStore.getPickingTasks();
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPickingTask = (req, res) => {
  try {
    const task = dataStore.getPickingTask(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, error: 'Picking task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePickingTask = (req, res) => {
  try {
    const updated = dataStore.updatePickingTask(req.params.taskId, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Picking task not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.optimizeRoute = (req, res) => {
  try {
    const optimized = decisionEngine.optimizePickingRoute(req.params.taskId);
    if (!optimized) return res.status(404).json({ success: false, error: 'Picking task not found' });
    res.json({ success: true, data: optimized, message: 'Route optimized via S-Shape Aisle Sequencing' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.completePickingTask = (req, res) => {
  try {
    const { taskId } = req.params;
    const task = dataStore.getPickingTask(taskId);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    task.status = 'Completed';
    if (task.locations) {
      task.locations.forEach(l => { l.picked = true; });
    }
    dataStore.updatePickingTask(taskId, task);

    const order = dataStore.getOrder(task.orderId);
    if (order) {
      order.status = 'Packing';
      const pickStage = order.timeline.find(t => t.stage === 'Picking');
      if (pickStage) pickStage.status = 'completed';
      const packStage = order.timeline.find(t => t.stage === 'Packing');
      if (packStage) {
        packStage.status = 'active';
        packStage.time = new Date().toLocaleTimeString().slice(0, 5);
      }
      dataStore.updateOrder(order.id, order);
    }

    dataStore.addActivityLog(
      task.worker || 'Marcus Vance',
      `Completed picking task ${taskId} for Order ${task.orderId}. Advanced to Packing.`,
      'success',
      'Picking Completed'
    );

    res.json({ success: true, data: task, message: 'Picking completed. Order moved to packing station.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
