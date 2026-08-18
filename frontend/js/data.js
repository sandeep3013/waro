/**
 * WARO - SEED DATA & MOCK REPOSITORY
 * Realistic warehouse data with 35+ products, 50+ orders, workers, picking tasks, exceptions & logs.
 */

const SEED_DATA = {
  // 35+ Realistic Warehouse SKUs
  inventory: [
    {
      sku: 'SKU-WM-101',
      name: 'Wireless Mouse Pro',
      category: 'Peripherals',
      location: 'A-03-14',
      totalStock: 10,
      reservedStock: 3,
      damagedStock: 0,
      reorderLevel: 15,
      unitPrice: 29.99,
      unitWeight: 0.12, // kg
      status: 'Low Stock' // Available: 7 <= Reorder: 15
    },
    {
      sku: 'SKU-UH-204',
      name: 'USB 3.1 Multi-Port Hub',
      category: 'Accessories',
      location: 'A-03-18',
      totalStock: 25,
      reservedStock: 4,
      damagedStock: 1,
      reorderLevel: 10,
      unitPrice: 34.99,
      unitWeight: 0.18,
      status: 'Healthy'
    },
    {
      sku: 'SKU-KB-301',
      name: 'Mechanical Gaming Keyboard RGB',
      category: 'Peripherals',
      location: 'B-01-05',
      totalStock: 42,
      reservedStock: 8,
      damagedStock: 0,
      reorderLevel: 12,
      unitPrice: 89.99,
      unitWeight: 0.95,
      status: 'Healthy'
    },
    {
      sku: 'SKU-LS-405',
      name: 'Ergonomic Aluminum Laptop Stand',
      category: 'Accessories',
      location: 'B-01-07',
      totalStock: 18,
      reservedStock: 2,
      damagedStock: 0,
      reorderLevel: 10,
      unitPrice: 45.00,
      unitWeight: 0.75,
      status: 'Healthy'
    },
    {
      sku: 'SKU-WC-502',
      name: '4K Ultra HD Pro Streaming Webcam',
      category: 'Electronics',
      location: 'A-02-11',
      totalStock: 0,
      reservedStock: 0,
      damagedStock: 0,
      reorderLevel: 8,
      unitPrice: 119.99,
      unitWeight: 0.28,
      status: 'Out of Stock'
    },
    {
      sku: 'SKU-HP-603',
      name: 'ANC Studio Wireless Headphones',
      category: 'Audio',
      location: 'C-04-02',
      totalStock: 30,
      reservedStock: 6,
      damagedStock: 0,
      reorderLevel: 10,
      unitPrice: 149.99,
      unitWeight: 0.32,
      status: 'Healthy'
    },
    {
      sku: 'SKU-HD-701',
      name: 'Braided 8K HDMI 2.1 Cable (2m)',
      category: 'Cables',
      location: 'A-01-04',
      totalStock: 85,
      reservedStock: 15,
      damagedStock: 0,
      reorderLevel: 25,
      unitPrice: 15.99,
      unitWeight: 0.15,
      status: 'Healthy'
    },
    {
      sku: 'SKU-PA-808',
      name: '65W GaN Fast Dual Power Adapter',
      category: 'Power',
      location: 'A-04-20',
      totalStock: 14,
      reservedStock: 5,
      damagedStock: 0,
      reorderLevel: 20,
      unitPrice: 39.99,
      unitWeight: 0.20,
      status: 'Low Stock'
    },
    {
      sku: 'SKU-LB-909',
      name: 'Waterproof Commuter Laptop Bag 15"',
      category: 'Bags',
      location: 'D-02-08',
      totalStock: 22,
      reservedStock: 4,
      damagedStock: 0,
      reorderLevel: 10,
      unitPrice: 59.99,
      unitWeight: 0.85,
      status: 'Healthy'
    },
    {
      sku: 'SKU-WK-102',
      name: 'Slim Wireless Bluetooth Keyboard',
      category: 'Peripherals',
      location: 'B-02-12',
      totalStock: 35,
      reservedStock: 7,
      damagedStock: 0,
      reorderLevel: 12,
      unitPrice: 49.99,
      unitWeight: 0.55,
      status: 'Healthy'
    },
    {
      sku: 'SKU-MP-110',
      name: 'Extended Anti-Fray Gaming Mousepad',
      category: 'Accessories',
      location: 'B-03-01',
      totalStock: 60,
      reservedStock: 10,
      damagedStock: 0,
      reorderLevel: 20,
      unitPrice: 19.99,
      unitWeight: 0.40,
      status: 'Healthy'
    },
    {
      sku: 'SKU-DK-215',
      name: '12-in-1 Dual 4K Display Docking Station',
      category: 'Electronics',
      location: 'A-02-09',
      totalStock: 12,
      reservedStock: 2,
      damagedStock: 1,
      reorderLevel: 10,
      unitPrice: 179.99,
      unitWeight: 0.65,
      status: 'Healthy'
    },
    {
      sku: 'SKU-SS-320',
      name: 'Portable NVMe Rugged SSD 1TB',
      category: 'Storage',
      location: 'C-01-15',
      totalStock: 28,
      reservedStock: 6,
      damagedStock: 0,
      reorderLevel: 10,
      unitPrice: 109.99,
      unitWeight: 0.10,
      status: 'Healthy'
    },
    {
      sku: 'SKU-DL-412',
      name: 'Smart LED Dimmable Desk Lamp',
      category: 'Accessories',
      location: 'D-01-03',
      totalStock: 16,
      reservedStock: 3,
      damagedStock: 0,
      reorderLevel: 8,
      unitPrice: 36.50,
      unitWeight: 0.90,
      status: 'Healthy'
    },
    {
      sku: 'SKU-EB-518',
      name: 'True Wireless Earbuds with Mic',
      category: 'Audio',
      location: 'C-04-09',
      totalStock: 45,
      reservedStock: 12,
      damagedStock: 0,
      reorderLevel: 15,
      unitPrice: 79.99,
      unitWeight: 0.08,
      status: 'Healthy'
    },
    {
      sku: 'SKU-MA-621',
      name: 'Heavy Duty Dual Monitor Desk Mount',
      category: 'Accessories',
      location: 'D-03-10',
      totalStock: 9,
      reservedStock: 4,
      damagedStock: 0,
      reorderLevel: 8,
      unitPrice: 89.00,
      unitWeight: 3.80,
      status: 'Low Stock' // 9 - 4 = 5 <= 8
    },
    {
      sku: 'SKU-BS-725',
      name: 'Industrial Bluetooth 2D Barcode Scanner',
      category: 'Warehouse Gear',
      location: 'E-01-02',
      totalStock: 15,
      reservedStock: 1,
      damagedStock: 0,
      reorderLevel: 5,
      unitPrice: 125.00,
      unitWeight: 0.35,
      status: 'Healthy'
    },
    {
      sku: 'SKU-TP-830',
      name: 'High-Speed Thermal Shipping Label Printer',
      category: 'Warehouse Gear',
      location: 'E-01-06',
      totalStock: 8,
      reservedStock: 3,
      damagedStock: 0,
      reorderLevel: 5,
      unitPrice: 199.99,
      unitWeight: 1.50,
      status: 'Healthy'
    },
    {
      sku: 'SKU-EC-935',
      name: 'Cat6 Snagless Ethernet Cable 15m',
      category: 'Cables',
      location: 'A-01-12',
      totalStock: 90,
      reservedStock: 20,
      damagedStock: 0,
      reorderLevel: 30,
      unitPrice: 12.49,
      unitWeight: 0.38,
      status: 'Healthy'
    },
    {
      sku: 'SKU-TC-140',
      name: 'Thunderbolt 4 Braided Cable (1m)',
      category: 'Cables',
      location: 'A-01-18',
      totalStock: 32,
      reservedStock: 5,
      damagedStock: 0,
      reorderLevel: 15,
      unitPrice: 28.00,
      unitWeight: 0.09,
      status: 'Healthy'
    },
    {
      sku: 'SKU-PB-245',
      name: '20,000mAh 65W Laptop Power Bank',
      category: 'Power',
      location: 'A-04-14',
      totalStock: 19,
      reservedStock: 4,
      damagedStock: 0,
      reorderLevel: 10,
      unitPrice: 69.99,
      unitWeight: 0.45,
      status: 'Healthy'
    },
    {
      sku: 'SKU-SP-350',
      name: 'Desktop Stereo Soundbar Speakers',
      category: 'Audio',
      location: 'C-03-05',
      totalStock: 24,
      reservedStock: 3,
      damagedStock: 0,
      reorderLevel: 8,
      unitPrice: 54.99,
      unitWeight: 1.10,
      status: 'Healthy'
    },
    {
      sku: 'SKU-GP-455',
      name: 'Wireless Controller Gamepad',
      category: 'Peripherals',
      location: 'B-02-18',
      totalStock: 26,
      reservedStock: 5,
      damagedStock: 0,
      reorderLevel: 10,
      unitPrice: 49.99,
      unitWeight: 0.28,
      status: 'Healthy'
    },
    {
      sku: 'SKU-WR-560',
      name: 'WiFi 6 Dual-Band Gigabit Mesh Router',
      category: 'Networking',
      location: 'C-02-04',
      totalStock: 14,
      reservedStock: 2,
      damagedStock: 0,
      reorderLevel: 8,
      unitPrice: 129.99,
      unitWeight: 0.72,
      status: 'Healthy'
    },
    {
      sku: 'SKU-CP-665',
      name: 'Magnetic Wireless Car Mount Charger',
      category: 'Power',
      location: 'A-04-05',
      totalStock: 38,
      reservedStock: 6,
      damagedStock: 0,
      reorderLevel: 12,
      unitPrice: 32.50,
      unitWeight: 0.22,
      status: 'Healthy'
    },
    {
      sku: 'SKU-FD-770',
      name: 'Ultra Speed USB 3.2 Flash Drive 256GB',
      category: 'Storage',
      location: 'C-01-08',
      totalStock: 55,
      reservedStock: 10,
      damagedStock: 0,
      reorderLevel: 20,
      unitPrice: 24.99,
      unitWeight: 0.03,
      status: 'Healthy'
    },
    {
      sku: 'SKU-MC-875',
      name: 'Condenser USB Podcast Microphone',
      category: 'Audio',
      location: 'C-03-12',
      totalStock: 17,
      reservedStock: 3,
      damagedStock: 0,
      reorderLevel: 8,
      unitPrice: 84.99,
      unitWeight: 0.82,
      status: 'Healthy'
    },
    {
      sku: 'SKU-LP-980',
      name: 'Ultra-Thin Laptop Cooling Pad with Fans',
      category: 'Accessories',
      location: 'B-03-15',
      totalStock: 21,
      reservedStock: 4,
      damagedStock: 0,
      reorderLevel: 10,
      unitPrice: 27.99,
      unitWeight: 0.68,
      status: 'Healthy'
    },
    {
      sku: 'SKU-SW-185',
      name: 'Smart Fitness Tracker Watch Band',
      category: 'Electronics',
      location: 'C-04-18',
      totalStock: 2,
      reservedStock: 1,
      damagedStock: 0,
      reorderLevel: 10,
      unitPrice: 42.00,
      unitWeight: 0.05,
      status: 'Critical' // Available: 1
    },
    {
      sku: 'SKU-HS-290',
      name: 'Adjustable Under-Desk Footrest',
      category: 'Accessories',
      location: 'D-04-02',
      totalStock: 11,
      reservedStock: 2,
      damagedStock: 0,
      reorderLevel: 6,
      unitPrice: 38.00,
      unitWeight: 1.85,
      status: 'Healthy'
    },
    {
      sku: 'SKU-DP-395',
      name: 'DisplayPort 1.4 Cable 4K 144Hz (1.8m)',
      category: 'Cables',
      location: 'A-01-22',
      totalStock: 40,
      reservedStock: 5,
      damagedStock: 0,
      reorderLevel: 15,
      unitPrice: 18.50,
      unitWeight: 0.16,
      status: 'Healthy'
    },
    {
      sku: 'SKU-CL-400',
      name: 'Anti-Static Screen Cleaning Kit',
      category: 'Accessories',
      location: 'B-04-01',
      totalStock: 75,
      reservedStock: 8,
      damagedStock: 0,
      reorderLevel: 20,
      unitPrice: 9.99,
      unitWeight: 0.25,
      status: 'Healthy'
    }
  ],

  // 10 Warehouse Workers
  workers: [
    { id: 'W-101', name: 'Marcus Vance', role: 'Picker', shift: 'Morning', status: 'Active', currentTask: 'PK-203', completedToday: 24, efficiency: '96%' },
    { id: 'W-102', name: 'Elena Rostova', role: 'Packer', shift: 'Morning', status: 'Active', currentTask: 'PC-114', completedToday: 28, efficiency: '98%' },
    { id: 'W-103', name: 'David Chen', role: 'Inspector / QC', shift: 'Morning', status: 'Active', currentTask: 'QC-088', completedToday: 32, efficiency: '99%' },
    { id: 'W-104', name: 'Sarah Jenkins', role: 'Dispatcher', shift: 'Morning', status: 'Active', currentTask: 'DS-052', completedToday: 41, efficiency: '94%' },
    { id: 'W-105', name: 'Tariq Al-Mansoor', role: 'Picker', shift: 'Morning', status: 'Active', currentTask: 'PK-205', completedToday: 19, efficiency: '91%' },
    { id: 'W-106', name: 'Hannah Schmidt', role: 'Packer', shift: 'Morning', status: 'Active', currentTask: 'PC-118', completedToday: 22, efficiency: '95%' },
    { id: 'W-107', name: 'Carlos Mendez', role: 'Picker', shift: 'Afternoon', status: 'Break', currentTask: null, completedToday: 15, efficiency: '89%' },
    { id: 'W-108', name: 'Aisha Patel', role: 'Supervisor', shift: 'Morning', status: 'Active', currentTask: 'Resolution-EX109', completedToday: 45, efficiency: '97%' },
    { id: 'W-109', name: 'Liam O\'Connor', role: 'Picker', shift: 'Morning', status: 'Active', currentTask: 'PK-207', completedToday: 21, efficiency: '92%' },
    { id: 'W-110', name: 'Zoe Nakamura', role: 'Inventory Tech', shift: 'Morning', status: 'Active', currentTask: 'Audit-Aisle-A', completedToday: 18, efficiency: '95%' }
  ],

  // 50+ Comprehensive Orders (With Key Demo Cases & Edge Cases)
  orders: [
    // CRITICAL DEMO CASE 1: ORD-1042 (Urgent Order with stock shortage conflict)
    {
      id: 'ORD-1042',
      customer: 'Apex Global Technologies',
      customerTier: 'VIP / Tier 1',
      items: [
        { sku: 'SKU-WM-101', name: 'Wireless Mouse Pro', qty: 10, price: 29.99, location: 'A-03-14' },
        { sku: 'SKU-UH-204', name: 'USB 3.1 Multi-Port Hub', qty: 2, price: 34.99, location: 'A-03-18' }
      ],
      totalValue: 369.88,
      created: '2026-08-17T09:15:00',
      deadline: '2026-08-17T18:00:00', // Today
      priorityScore: 94,
      priority: 'Critical',
      status: 'Inventory Checking', // Pending Allocation approval
      risk: 'High Shortage Risk',
      carrier: 'FedEx Express Next-Day',
      assignedWorker: 'Marcus Vance',
      timeline: [
        { stage: 'Order Created', time: '09:15', status: 'completed' },
        { stage: 'Priority Engine', time: '09:16', status: 'completed' },
        { stage: 'Inventory Checking', time: '09:16', status: 'active' },
        { stage: 'Smart Allocation', time: null, status: 'pending' },
        { stage: 'Picking', time: null, status: 'pending' },
        { stage: 'Packing', time: null, status: 'pending' },
        { stage: 'Quality Check', time: null, status: 'pending' },
        { stage: 'Dispatch', time: null, status: 'pending' }
      ],
      notes: 'Customer has express SLA guarantee. Requires 10 Wireless Mice but only 7 are available.'
    },

    // COMPETING NORMAL ORDER: ORD-1048
    {
      id: 'ORD-1048',
      customer: 'Metro Retail Outlets',
      customerTier: 'Standard',
      items: [
        { sku: 'SKU-WM-101', name: 'Wireless Mouse Pro', qty: 5, price: 29.99, location: 'A-03-14' }
      ],
      totalValue: 149.95,
      created: '2026-08-17T10:30:00',
      deadline: '2026-08-20T17:00:00',
      priorityScore: 58,
      priority: 'Medium',
      status: 'New',
      risk: 'None',
      carrier: 'UPS Ground',
      assignedWorker: null,
      timeline: [
        { stage: 'Order Created', time: '10:30', status: 'completed' },
        { stage: 'Priority Engine', time: '10:31', status: 'completed' },
        { stage: 'Inventory Checking', time: '10:31', status: 'active' },
        { stage: 'Smart Allocation', time: null, status: 'pending' },
        { stage: 'Picking', time: null, status: 'pending' },
        { stage: 'Packing', time: null, status: 'pending' },
        { stage: 'Quality Check', time: null, status: 'pending' },
        { stage: 'Dispatch', time: null, status: 'pending' }
      ],
      notes: 'Standard batch replenishment order.'
    },

    // ORDER IN PICKING (Route Optimization Demo: PK-203)
    {
      id: 'ORD-1039',
      customer: 'CloudScale Systems Inc.',
      customerTier: 'Enterprise',
      items: [
        { sku: 'SKU-WM-101', name: 'Wireless Mouse Pro', qty: 2, price: 29.99, location: 'A-03-14' },
        { sku: 'SKU-LS-405', name: 'Ergonomic Aluminum Laptop Stand', qty: 1, price: 45.00, location: 'B-01-07' },
        { sku: 'SKU-UH-204', name: 'USB 3.1 Multi-Port Hub', qty: 1, price: 34.99, location: 'A-03-18' },
        { sku: 'SKU-KB-301', name: 'Mechanical Gaming Keyboard RGB', qty: 1, price: 89.99, location: 'B-01-05' }
      ],
      totalValue: 229.97,
      created: '2026-08-17T08:40:00',
      deadline: '2026-08-17T17:00:00',
      priorityScore: 88,
      priority: 'High',
      status: 'Picking',
      risk: 'Normal',
      carrier: 'DHL Express',
      assignedWorker: 'Marcus Vance',
      taskId: 'PK-203',
      timeline: [
        { stage: 'Order Created', time: '08:40', status: 'completed' },
        { stage: 'Priority Engine', time: '08:41', status: 'completed' },
        { stage: 'Inventory Checking', time: '08:42', status: 'completed' },
        { stage: 'Smart Allocation', time: '08:45', status: 'completed' },
        { stage: 'Picking', time: '08:50', status: 'active' },
        { stage: 'Packing', time: null, status: 'pending' },
        { stage: 'Quality Check', time: null, status: 'pending' },
        { stage: 'Dispatch', time: null, status: 'pending' }
      ],
      notes: 'Active in wave picking batch #W-44.'
    },

    // ORDER IN QUALITY CHECK / EXCEPTION DEMO (EX-109 Damaged USB Hub)
    {
      id: 'ORD-1035',
      customer: 'Nexus Media Labs',
      customerTier: 'VIP / Tier 1',
      items: [
        { sku: 'SKU-UH-204', name: 'USB 3.1 Multi-Port Hub', qty: 1, price: 34.99, location: 'A-03-18', status: 'Damaged' },
        { sku: 'SKU-KB-301', name: 'Mechanical Gaming Keyboard RGB', qty: 1, price: 89.99, location: 'B-01-05', status: 'Passed' },
        { sku: 'SKU-HD-701', name: 'Braided 8K HDMI 2.1 Cable (2m)', qty: 2, price: 15.99, location: 'A-01-04', status: 'Passed' }
      ],
      totalValue: 156.96,
      created: '2026-08-17T08:00:00',
      deadline: '2026-08-17T16:00:00',
      priorityScore: 91,
      priority: 'Critical',
      status: 'Quality Check',
      risk: 'Quality Exception Pending',
      carrier: 'FedEx Priority',
      assignedWorker: 'David Chen',
      exceptionId: 'EX-109',
      timeline: [
        { stage: 'Order Created', time: '08:00', status: 'completed' },
        { stage: 'Priority Engine', time: '08:02', status: 'completed' },
        { stage: 'Inventory Checking', time: '08:05', status: 'completed' },
        { stage: 'Smart Allocation', time: '08:10', status: 'completed' },
        { stage: 'Picking', time: '08:25', status: 'completed' },
        { stage: 'Packing', time: '08:40', status: 'completed' },
        { stage: 'Quality Check', time: '08:55', status: 'problem' },
        { stage: 'Dispatch', time: null, status: 'pending' }
      ],
      notes: 'QC inspection flagged damaged connector on USB Hub.'
    },

    // ORDER READY TO DISPATCH
    {
      id: 'ORD-1031',
      customer: 'Vanguard Dynamics',
      customerTier: 'Enterprise',
      items: [
        { sku: 'SKU-HP-603', name: 'ANC Studio Wireless Headphones', qty: 2, price: 149.99, location: 'C-04-02' },
        { sku: 'SKU-PA-808', name: '65W GaN Fast Dual Power Adapter', qty: 2, price: 39.99, location: 'A-04-20' }
      ],
      totalValue: 379.96,
      created: '2026-08-17T07:30:00',
      deadline: '2026-08-17T15:00:00',
      priorityScore: 84,
      priority: 'High',
      status: 'Ready to Dispatch',
      risk: 'None',
      packageSize: 'Medium Box (12x9x6 in)',
      totalWeight: 1.04,
      carrier: 'FedEx Express',
      trackingNumber: 'FDX-9982410-US',
      assignedWorker: 'Sarah Jenkins',
      timeline: [
        { stage: 'Order Created', time: '07:30', status: 'completed' },
        { stage: 'Priority Engine', time: '07:31', status: 'completed' },
        { stage: 'Inventory Checking', time: '07:35', status: 'completed' },
        { stage: 'Smart Allocation', time: '07:40', status: 'completed' },
        { stage: 'Picking', time: '08:00', status: 'completed' },
        { stage: 'Packing', time: '08:20', status: 'completed' },
        { stage: 'Quality Check', time: '08:35', status: 'completed' },
        { stage: 'Dispatch', time: '08:45', status: 'active' }
      ],
      notes: 'Ready on Bay Dock 3 for 14:00 courier pickup.'
    },

    // DISPATCHED ORDERS
    {
      id: 'ORD-1028',
      customer: 'Quantum Logistics Corp',
      customerTier: 'VIP / Tier 1',
      items: [
        { sku: 'SKU-SS-320', name: 'Portable NVMe Rugged SSD 1TB', qty: 4, price: 109.99, location: 'C-01-15' }
      ],
      totalValue: 439.96,
      created: '2026-08-17T06:45:00',
      deadline: '2026-08-17T14:00:00',
      priorityScore: 92,
      priority: 'Critical',
      status: 'Dispatched',
      risk: 'None',
      packageSize: 'Small Padded Envelope',
      totalWeight: 0.40,
      carrier: 'DHL Express',
      trackingNumber: 'DHL-8849102-EU',
      assignedWorker: 'Sarah Jenkins',
      timeline: [
        { stage: 'Order Created', time: '06:45', status: 'completed' },
        { stage: 'Priority Engine', time: '06:46', status: 'completed' },
        { stage: 'Inventory Checking', time: '06:50', status: 'completed' },
        { stage: 'Smart Allocation', time: '06:55', status: 'completed' },
        { stage: 'Picking', time: '07:15', status: 'completed' },
        { stage: 'Packing', time: '07:30', status: 'completed' },
        { stage: 'Quality Check', time: '07:45', status: 'completed' },
        { stage: 'Dispatch', time: '08:15', status: 'completed' }
      ],
      notes: 'Handed over to carrier.'
    },

    // ADDITIONAL 45 DIVERSE REALISTIC ORDERS
    ...Array.from({ length: 45 }, (_, i) => {
      const num = 1050 + i;
      const statuses = ['New', 'Allocated', 'Picking', 'Packing', 'Ready to Dispatch', 'Dispatched', 'On Hold'];
      const status = statuses[i % statuses.length];
      const priorities = ['Critical', 'High', 'Medium', 'Low'];
      const prio = priorities[i % priorities.length];
      const customers = [
        'AeroTech Instruments', 'OmniGlobal Retail', 'Pacific Digital Co.', 'BlueSky Innovations',
        'Starlight Solutions', 'Hyperion Dynamics', 'Synapse Labs', 'Vertex Hardware',
        'Solaria Energy Systems', 'Zenith Logistics', 'CoreTech Distribution', 'Titan Industrial'
      ];
      const cust = customers[i % customers.length];
      const carriers = ['FedEx Express', 'UPS Ground', 'DHL Express', 'USPS Priority'];
      const carrier = carriers[i % carriers.length];
      const pScore = prio === 'Critical' ? 90 + (i % 8) : prio === 'High' ? 76 + (i % 12) : prio === 'Medium' ? 52 + (i % 20) : 35 + (i % 14);

      return {
        id: `ORD-${num}`,
        customer: cust,
        customerTier: prio === 'Critical' ? 'VIP / Tier 1' : prio === 'High' ? 'Enterprise' : 'Standard',
        items: [
          { sku: 'SKU-HD-701', name: 'Braided 8K HDMI 2.1 Cable (2m)', qty: 1 + (i % 4), price: 15.99, location: 'A-01-04' },
          { sku: 'SKU-LB-909', name: 'Waterproof Commuter Laptop Bag 15"', qty: 1, price: 59.99, location: 'D-02-08' }
        ],
        totalValue: +(75.98 + (i * 14.5)).toFixed(2),
        created: `2026-08-${16 - (i % 3)}T${(8 + (i % 8)).toString().padStart(2, '0')}:${(10 + (i * 3) % 50).toString().padStart(2, '0')}:00`,
        deadline: `2026-08-${17 + (i % 4)}T18:00:00`,
        priorityScore: pScore,
        priority: prio,
        status: status,
        risk: prio === 'Critical' ? 'SLA Risk' : 'Low',
        carrier: carrier,
        assignedWorker: ['Marcus Vance', 'David Chen', 'Elena Rostova', 'Tariq Al-Mansoor', 'Hannah Schmidt'][i % 5],
        timeline: [
          { stage: 'Order Created', time: '08:00', status: 'completed' },
          { stage: 'Priority Engine', time: '08:05', status: 'completed' },
          { stage: 'Inventory Checking', time: '08:10', status: status === 'New' ? 'active' : 'completed' },
          { stage: 'Smart Allocation', time: status !== 'New' ? '08:20' : null, status: status === 'Allocated' ? 'active' : status === 'New' ? 'pending' : 'completed' },
          { stage: 'Picking', time: ['Picking', 'Packing', 'Ready to Dispatch', 'Dispatched'].includes(status) ? '08:40' : null, status: status === 'Picking' ? 'active' : ['Packing', 'Ready to Dispatch', 'Dispatched'].includes(status) ? 'completed' : 'pending' },
          { stage: 'Packing', time: ['Packing', 'Ready to Dispatch', 'Dispatched'].includes(status) ? '09:00' : null, status: status === 'Packing' ? 'active' : ['Ready to Dispatch', 'Dispatched'].includes(status) ? 'completed' : 'pending' },
          { stage: 'Quality Check', time: ['Ready to Dispatch', 'Dispatched'].includes(status) ? '09:15' : null, status: ['Ready to Dispatch', 'Dispatched'].includes(status) ? 'completed' : 'pending' },
          { stage: 'Dispatch', time: status === 'Dispatched' ? '09:45' : null, status: status === 'Dispatched' ? 'completed' : status === 'Ready to Dispatch' ? 'active' : 'pending' }
        ],
        notes: `Standard fulfillment order batch #${100 + (i % 10)}.`
      };
    })
  ],

  // 20 Picking Tasks
  pickingTasks: [
    {
      taskId: 'PK-203',
      orderId: 'ORD-1039',
      worker: 'Marcus Vance',
      priority: 'High',
      itemsCount: 4,
      totalQty: 5,
      // Original Unordered Route Demo
      locations: [
        { loc: 'A-03-14', sku: 'SKU-WM-101', name: 'Wireless Mouse Pro', qty: 2, picked: true },
        { loc: 'B-01-07', sku: 'SKU-LS-405', name: 'Laptop Stand', qty: 1, picked: false },
        { loc: 'A-03-18', sku: 'SKU-UH-204', name: 'USB Hub', qty: 1, picked: false },
        { loc: 'B-01-05', sku: 'SKU-KB-301', name: 'Mechanical Keyboard', qty: 1, picked: false }
      ],
      estimatedTime: '12 mins',
      optimizedTime: '7 mins',
      status: 'In Progress'
    },
    {
      taskId: 'PK-204',
      orderId: 'ORD-1042',
      worker: 'Marcus Vance',
      priority: 'Critical',
      itemsCount: 2,
      totalQty: 9,
      locations: [
        { loc: 'A-03-14', sku: 'SKU-WM-101', name: 'Wireless Mouse Pro', qty: 7, picked: false },
        { loc: 'A-03-18', sku: 'SKU-UH-204', name: 'USB Hub', qty: 2, picked: false }
      ],
      estimatedTime: '8 mins',
      optimizedTime: '5 mins',
      status: 'Ready'
    },
    {
      taskId: 'PK-205',
      orderId: 'ORD-1051',
      worker: 'Tariq Al-Mansoor',
      priority: 'Medium',
      itemsCount: 2,
      totalQty: 3,
      locations: [
        { loc: 'A-01-04', sku: 'SKU-HD-701', name: 'HDMI Cable', qty: 2, picked: true },
        { loc: 'D-02-08', sku: 'SKU-LB-909', name: 'Laptop Bag', qty: 1, picked: false }
      ],
      estimatedTime: '10 mins',
      optimizedTime: '8 mins',
      status: 'In Progress'
    },
    {
      taskId: 'PK-206',
      orderId: 'ORD-1053',
      worker: 'Liam O\'Connor',
      priority: 'Low',
      itemsCount: 1,
      totalQty: 2,
      locations: [
        { loc: 'C-04-02', sku: 'SKU-HP-603', name: 'Wireless Headphones', qty: 2, picked: false }
      ],
      estimatedTime: '6 mins',
      optimizedTime: '4 mins',
      status: 'Assigned'
    },
    ...Array.from({ length: 16 }, (_, i) => ({
      taskId: `PK-${207 + i}`,
      orderId: `ORD-${1055 + i}`,
      worker: ['Marcus Vance', 'Tariq Al-Mansoor', 'Carlos Mendez', 'Liam O\'Connor'][i % 4],
      priority: ['Critical', 'High', 'Medium', 'Low'][i % 4],
      itemsCount: 2 + (i % 3),
      totalQty: 3 + (i % 4),
      locations: [
        { loc: `A-0${1 + (i % 4)}-${10 + i}`, sku: 'SKU-HD-701', name: 'Cable', qty: 2, picked: i % 2 === 0 },
        { loc: `B-0${1 + (i % 3)}-${15 + i}`, sku: 'SKU-KB-301', name: 'Keyboard', qty: 1, picked: false }
      ],
      estimatedTime: `${10 + (i % 5)} mins`,
      optimizedTime: `${6 + (i % 4)} mins`,
      status: ['Assigned', 'In Progress', 'Completed'][i % 3]
    }))
  ],

  // 10 Warehouse Exceptions
  exceptions: [
    {
      id: 'EX-109',
      type: 'Damaged Item',
      severity: 'Critical',
      orderId: 'ORD-1035',
      sku: 'SKU-UH-204',
      productName: 'USB 3.1 Multi-Port Hub',
      description: 'Physical port damage detected during Quality Check station inspection.',
      recommendedAction: 'Replacement stock is available in A-03-18 (20 units available). Allocate one replacement unit immediately and write off damaged item.',
      status: 'Action Required',
      created: '2026-08-17T08:58:00',
      actionType: 'allocate_replacement'
    },
    {
      id: 'EX-102',
      type: 'Inventory Conflict',
      severity: 'Critical',
      orderId: 'ORD-1042',
      sku: 'SKU-WM-101',
      productName: 'Wireless Mouse Pro',
      description: 'Urgent Order ORD-1042 requested 10 units, but only 7 units are available. Competing Order ORD-1048 requesting 5 units.',
      recommendedAction: 'Allocate all 7 available units to urgent VIP order ORD-1042, hold lower-priority ORD-1048, and trigger automated replenishment.',
      status: 'Action Required',
      created: '2026-08-17T09:16:00',
      actionType: 'approve_conflict'
    },
    {
      id: 'EX-104',
      type: 'Out of Stock',
      severity: 'Critical',
      orderId: 'ORD-1060',
      sku: 'SKU-WC-502',
      productName: '4K Ultra HD Pro Streaming Webcam',
      description: 'Zero stock available in warehouse. Order is currently blocked from picking.',
      recommendedAction: 'Place order on backorder status and notify supplier for emergency replenishment of 30 units.',
      status: 'Open',
      created: '2026-08-17T07:45:00',
      actionType: 'backorder'
    },
    {
      id: 'EX-108',
      type: 'Picking Delay',
      severity: 'Warning',
      orderId: 'ORD-1039',
      sku: null,
      productName: 'Multiple SKUs',
      description: 'Picking task PK-203 has exceeded standard cycle threshold by 8 minutes.',
      recommendedAction: 'Enable smart route optimization and notify picker Marcus Vance.',
      status: 'Investigating',
      created: '2026-08-17T08:52:00',
      actionType: 'optimize_route'
    },
    {
      id: 'EX-105',
      type: 'Low Stock Alert',
      severity: 'Warning',
      orderId: null,
      sku: 'SKU-MA-621',
      productName: 'Heavy Duty Dual Monitor Desk Mount',
      description: 'Available stock (5 units) has dropped below minimum safety threshold (8 units).',
      recommendedAction: 'Trigger Purchase Requisition PO-884 for 25 units from primary vendor.',
      status: 'Open',
      created: '2026-08-17T06:30:00',
      actionType: 'reorder'
    },
    {
      id: 'EX-106',
      type: 'Missing Item',
      severity: 'Warning',
      orderId: 'ORD-1068',
      sku: 'SKU-SW-185',
      productName: 'Smart Fitness Tracker Watch Band',
      description: 'Bin C-04-18 had 1 item missing during count cycle.',
      recommendedAction: 'Perform cycle count on aisle C and adjust inventory discrepancy.',
      status: 'Investigating',
      created: '2026-08-17T06:15:00',
      actionType: 'adjust_stock'
    },
    {
      id: 'EX-107',
      type: 'Dispatch Delay',
      severity: 'Warning',
      orderId: 'ORD-1031',
      sku: null,
      productName: 'Ready Shipment',
      description: 'Courier carrier pickup window closing in 45 minutes.',
      recommendedAction: 'Fast-track staging to Dock 2 for immediate courier scan.',
      status: 'Resolved',
      created: '2026-08-17T07:10:00',
      actionType: 'resolved'
    },
    {
      id: 'EX-110',
      type: 'Packing Error',
      severity: 'Warning',
      orderId: 'ORD-1072',
      sku: 'SKU-PA-808',
      productName: '65W GaN Fast Dual Power Adapter',
      description: 'Wrong carton size assigned for dimensional weight billing.',
      recommendedAction: 'Repack into Size Medium (12x9x6) to eliminate shipping surcharge.',
      status: 'Resolved',
      created: '2026-08-16T17:30:00',
      actionType: 'resolved'
    },
    {
      id: 'EX-111',
      type: 'Inventory Conflict',
      severity: 'Info',
      orderId: 'ORD-1075',
      sku: 'SKU-EB-518',
      productName: 'True Wireless Earbuds with Mic',
      description: 'Batch allocation balanced between 3 enterprise orders.',
      recommendedAction: 'Smart Balanced allocation completed successfully.',
      status: 'Resolved',
      created: '2026-08-16T15:20:00',
      actionType: 'resolved'
    },
    {
      id: 'EX-112',
      type: 'Damaged Item',
      severity: 'Info',
      orderId: 'ORD-1080',
      sku: 'SKU-DK-215',
      productName: '12-in-1 Dual 4K Display Docking Station',
      description: 'Cracked casing returned to QA Quarantine.',
      recommendedAction: 'Replacement issued from reserve stock.',
      status: 'Resolved',
      created: '2026-08-16T11:00:00',
      actionType: 'resolved'
    }
  ],

  // Activity Logs
  activityLogs: [
    { id: 'LOG-501', time: '17:02', user: 'Alex Morgan (Manager)', title: 'Allocation Approved', desc: 'Approved smart allocation for Urgent Order ORD-1042 (7 units allocated, 3 backordered).', type: 'success' },
    { id: 'LOG-502', time: '16:58', user: 'David Chen (QC)', title: 'Quality Check Damaged Item', desc: 'Flagged 1x USB Hub damaged on ORD-1035. Generated exception EX-109.', type: 'danger' },
    { id: 'LOG-503', time: '16:54', user: 'System Decision Engine', title: 'Bottleneck Detected', desc: 'Picking stage duration 18m vs target 10m. Recommendation: Reassign 2 staff to Zone A.', type: 'warning' },
    { id: 'LOG-504', time: '16:30', user: 'Sarah Jenkins (Dispatch)', title: 'Order Dispatched', desc: 'ORD-1028 handed over to DHL Express with Tracking #DHL-8849102-EU.', type: 'info' },
    { id: 'LOG-505', time: '16:15', user: 'Marcus Vance (Picker)', title: 'Route Optimization Used', desc: 'Applied route optimization on Task PK-203. Walking time reduced by 5.2 minutes.', type: 'success' },
    { id: 'LOG-506', time: '15:45', user: 'System Decision Engine', title: 'Low Stock Auto-Alert', desc: 'Wireless Mouse Pro available quantity dropped below reorder safety margin (15).', type: 'warning' }
  ],

  // System Notifications
  notifications: [
    { id: 'NOTIF-1', title: 'Inventory Shortage Conflict', desc: 'Urgent order #ORD-1042 requires 10 Wireless Mice (only 7 available).', time: '5 mins ago', type: 'critical', unread: true },
    { id: 'NOTIF-2', title: 'Damaged Item Flagged', desc: 'QC Inspector David Chen flagged USB Hub on ORD-1035 as damaged.', time: '12 mins ago', type: 'critical', unread: true },
    { id: 'NOTIF-3', title: 'Picking Bottleneck', desc: 'Picking stage average time is 80% slower than SLA target.', time: '25 mins ago', type: 'warning', unread: true },
    { id: 'NOTIF-4', title: 'Reorder Level Breach', desc: 'Wireless Mouse stock (8 units) is below reorder threshold (15).', time: '1 hour ago', type: 'warning', unread: false },
    { id: 'NOTIF-5', title: 'Dispatch Completed', desc: 'Order ORD-1028 successfully dispatched via DHL Express.', time: '2 hours ago', type: 'info', unread: false }
  ],

  // System Settings / Configs
  settings: {
    warehouseName: 'Waro Central Fulfillment Hub - Zone Alpha',
    location: 'Metro Distribution Center 4B',
    managerName: 'Alex Morgan',
    targetPickingMinutes: 10,
    targetPackingMinutes: 5,
    targetDispatchMinutes: 15,
    autoAllocationStrategy: 'Smart Balanced',
    autoReorderSafetyMargin: 20, // %
    enableAiDecisions: true,
    enableRouteOptimization: true
  }
};
