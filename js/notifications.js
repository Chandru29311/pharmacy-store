/**
 * Notifications & Alert Center for Pharmacy Store
 */

const DEFAULT_ADMIN_NOTIFICATIONS = [
  {
    id: "notif-01",
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-1024 confirmed for Aravind Kumar (₹499)",
    time: "10 mins ago",
    badge: "Order"
  },
  {
    id: "notif-02",
    type: "alert",
    title: "Low Stock Alert",
    message: "Vitamin C 500mg Zinc Complex — Only 3 units remaining in warehouse",
    time: "25 mins ago",
    badge: "Inventory"
  },
  {
    id: "notif-03",
    type: "review",
    title: "New Product Review",
    message: "5-star review received for Omega-3 Wild Fish Oil: 'Exceptional purity and no fishy aftertaste!'",
    time: "1 hour ago",
    badge: "Feedback"
  },
  {
    id: "notif-04",
    type: "return",
    title: "Return Request",
    message: "Exchange inquiry for Order #ORD-1018 (Verified pharmacy safety check passed)",
    time: "3 hours ago",
    badge: "Support"
  }
];

const DEFAULT_CLIENT_MESSAGES = [
  {
    id: "msg-01",
    title: "Order #ORD-1024 Update",
    preview: "Your order is out for delivery with courier tracking.",
    time: "Today, 07:15 AM",
    unread: true
  },
  {
    id: "msg-02",
    title: "New Wellness Collection Available",
    preview: "Explore certified botanicals and seasonal immune defenses.",
    time: "Yesterday, 04:30 PM",
    unread: false
  },
  {
    id: "msg-03",
    title: "Prescription Review Request",
    preview: "How was your recent purchase of the Wellness Essentials Kit?",
    time: "3 days ago",
    unread: false
  }
];

const NotificationManager = {
  getAdminNotifications() {
    return DEFAULT_ADMIN_NOTIFICATIONS;
  },

  getClientMessages() {
    return DEFAULT_CLIENT_MESSAGES;
  },

  showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const isError = type === "error";
    const isSuccess = type === "success";
    const iconClass = isSuccess ? "fa-circle-check" : (isError ? "fa-circle-exclamation" : "fa-circle-info");
    
    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid ${iconClass}"></i>
      </div>
      <div class="toast-body">
        <p class="toast-text">${message}</p>
      </div>
    `;

    container.appendChild(toast);

    if (window.gsap) {
      gsap.fromTo(toast, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 });
      setTimeout(() => {
        gsap.to(toast, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          onComplete: () => toast.remove()
        });
      }, 3500);
    } else {
      setTimeout(() => toast.remove(), 3500);
    }
  }
};

NotificationManager.show = NotificationManager.showToast;

window.NotificationManager = NotificationManager;
