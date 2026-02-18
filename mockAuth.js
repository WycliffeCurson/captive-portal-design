/**
 * Mock Backend simulating RADIUS/API responses
 * Safe for demos, pilots, and UI validation
 */

const MockBackend = (() => {
  const simulateDelay = (ms = 1000) =>
    new Promise(resolve => setTimeout(resolve, ms));

  const success = (data) => ({ ok: true, data });
  const failure = (message) => ({ ok: false, message });

  return {
    async authenticate(payload) {
      await simulateDelay(1200);

      // LOGIN
      if (payload.method === "login") {
        if (
          payload.username === "demo" &&
          payload.password === "demo"
        ) {
          return success({
            sessionTime: "24h",
            userType: "account"
          });
        }
        return failure("Invalid username or password");
      }

      // VOUCHER
      if (payload.method === "voucher") {
        if (payload.code === "1234") {
          return success({
            sessionTime: "12h",
            userType: "voucher"
          });
        }
        return failure("Invalid or expired voucher");
      }

      // RECEIPT
      if (payload.method === "receipt") {
        if (payload.receiptId === "ABC123") {
          return success({
            sessionTime: "Remaining 2h",
            userType: "receipt"
          });
        }
        return failure("Receipt not found");
      }

      return failure("Unsupported authentication method");
    },

    async fetchPlans() {
      await simulateDelay(600);
      return success([
        { id: 1, name: "1 Hour", price: 20 },
        { id: 2, name: "12 Hours", price: 50 },
        { id: 3, name: "24 Hours", price: 80 }
      ]);
    },

    async initiatePayment(planId) {
      await simulateDelay(1500);

      if (!planId) {
        return failure("Invalid plan selected");
      }

      return success({
        paymentRef: "PAY-" + Math.floor(Math.random() * 10000),
        status: "pending"
      });
    }
  };
})();
