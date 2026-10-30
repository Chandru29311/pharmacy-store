/**
 * Orders Management for Pharmacy Store
 * Pure Frontend LocalStorage Management
 */

const DEFAULT_ORDERS = [
  {
    orderId: "ORD-1024",
    productName: "Vitamin C 500mg Zinc Complex",
    productId: "med-01",
    customerName: "Aravind Kumar",
    customerEmail: "aravind@example.com",
    price: 499,
    quantity: 1,
    status: "Out for Delivery",
    adminStatus: "Processing",
    date: "2026-10-24",
    expectedDelivery: "Oct 27, 2026",
    trackingSteps: [
      { name: "Order Confirmed", done: true, time: "Oct 24, 09:15 AM" },
      { name: "Packed", done: true, time: "Oct 24, 02:40 PM" },
      { name: "Shipped", done: true, time: "Oct 25, 08:30 AM" },
      { name: "Out for Delivery", done: true, active: true, time: "Oct 26, 07:15 AM" },
      { name: "Delivered", done: false, time: "Estimated Today" }
    ],
    image: "assets/vitamins-01.webp",
    shippingAddress: "Suite 4B, Greenwood Healthcare Park, Chennai, India"
  },
  {
    orderId: "ORD-1023",
    productName: "Wellness Essentials Kit",
    productId: "med-07",
    customerName: "Priya Sharma",
    customerEmail: "priya.s@example.com",
    price: 1299,
    quantity: 1,
    status: "Shipped",
    adminStatus: "Shipped",
    date: "2026-10-21",
    expectedDelivery: "Oct 28, 2026",
    trackingSteps: [
      { name: "Order Confirmed", done: true, time: "Oct 21, 11:20 AM" },
      { name: "Packed", done: true, time: "Oct 22, 10:15 AM" },
      { name: "Shipped", done: true, active: true, time: "Oct 23, 04:00 PM" },
      { name: "Out for Delivery", done: false, time: "Pending transit" },
      { name: "Delivered", done: false, time: "Oct 28" }
    ],
    image: "assets/wellness-01.webp",
    shippingAddress: "42 Richmond Road, Bangalore, India"
  },
  {
    orderId: "ORD-1022",
    productName: "Omega-3 Wild Fish Oil 1000mg",
    productId: "med-02",
    customerName: "Arun Verma",
    customerEmail: "arun.v@example.com",
    price: 899,
    quantity: 1,
    status: "Delivered",
    adminStatus: "Delivered",
    date: "2026-10-18",
    expectedDelivery: "Oct 20, 2026",
    trackingSteps: [
      { name: "Order Confirmed", done: true, time: "Oct 18, 08:00 AM" },
      { name: "Packed", done: true, time: "Oct 18, 01:30 PM" },
      { name: "Shipped", done: true, time: "Oct 19, 09:00 AM" },
      { name: "Out for Delivery", done: true, time: "Oct 20, 10:00 AM" },
      { name: "Delivered", done: true, active: true, time: "Oct 20, 02:45 PM" }
    ],
    image: "assets/medicine-02.webp",
    shippingAddress: "15 Marine Drive, Mumbai, India"
  },
  {
    orderId: "ORD-1018",
    productName: "Wellness Essentials Kit",
    productId: "med-07",
    customerName: "Aravind Kumar",
    customerEmail: "aravind@example.com",
    price: 1299,
    quantity: 1,
    status: "Delivered",
    adminStatus: "Delivered",
    date: "2026-09-28",
    expectedDelivery: "Oct 01, 2026",
    trackingSteps: [
      { name: "Order Confirmed", done: true, time: "Sep 28, 10:00 AM" },
      { name: "Packed", done: true, time: "Sep 28, 03:00 PM" },
      { name: "Shipped", done: true, time: "Sep 29, 09:00 AM" },
      { name: "Out for Delivery", done: true, time: "Oct 01, 08:30 AM" },
      { name: "Delivered", done: true, active: true, time: "Oct 01, 01:20 PM" }
    ],
    image: "assets/wellness-01.webp",
    shippingAddress: "Suite 4B, Greenwood Healthcare Park, Chennai, India"
  }
];

const OrdersManager = {
  STORAGE_KEY: "pharmacy_store_orders",

  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
    }
  },

  getAll() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || DEFAULT_ORDERS;
    } catch (e) {
      return DEFAULT_ORDERS;
    }
  },

  getByCustomer(emailOrName) {
    const orders = this.getAll();
    if (!emailOrName) return orders;
    return orders.filter(o => 
      o.customerEmail?.toLowerCase() === emailOrName.toLowerCase() || 
      o.customerName?.toLowerCase() === emailOrName.toLowerCase()
    );
  },

  getById(id) {
    const orders = this.getAll();
    return orders.find(o => o.orderId === id || o.orderId === `ORD-${id}`);
  },

  createOrder(orderData) {
    const orders = this.getAll();
    const newId = "ORD-" + (1025 + orders.length);
    const newOrder = {
      orderId: newId,
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      adminStatus: "Pending",
      expectedDelivery: "3-5 Business Days",
      trackingSteps: [
        { name: "Order Confirmed", done: true, active: true, time: "Just now" },
        { name: "Packed", done: false, time: "In preparation" },
        { name: "Shipped", done: false, time: "Pending" },
        { name: "Out for Delivery", done: false, time: "Pending" },
        { name: "Delivered", done: false, time: "Pending" }
      ],
      ...orderData
    };
    orders.unshift(newOrder);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    return newOrder;
  },

  updateStatus(orderId, newStatus) {
    const orders = this.getAll();
    const target = orders.find(o => o.orderId === orderId);
    if (target) {
      target.status = newStatus;
      target.adminStatus = newStatus;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    }
    return target;
  }
};

OrdersManager.init();
window.OrdersManager = OrdersManager;
