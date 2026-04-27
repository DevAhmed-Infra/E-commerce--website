const calculateCartTotal = require('../../utils/calculateCartTotal.js');

describe('calculateCartTotal Utility', () => {
  describe('calculateCartTotal', () => {
    it('should calculate total price for single item', () => {
      const cart = {
        cartItems: [{ price: 100, quantity: 1 }]
      };

      const total = calculateCartTotal(cart);

      expect(total).toBe(100);
    });

    it('should calculate total price for multiple items', () => {
      const cart = {
        cartItems: [
          { price: 100, quantity: 2 },
          { price: 50, quantity: 3 }
        ]
      };

      const total = calculateCartTotal(cart);

      expect(total).toBe(350); // (100*2) + (50*3) = 200 + 150 = 350
    });

    it('should return 0 for empty cart', () => {
      const cart = { cartItems: [] };

      const total = calculateCartTotal(cart);

      expect(total).toBe(0);
    });

    it('should handle decimal prices', () => {
      const cart = {
        cartItems: [
          { price: 19.99, quantity: 2 },
          { price: 29.99, quantity: 1 }
        ]
      };

      const total = calculateCartTotal(cart);

      expect(total).toBeCloseTo(69.97);
    });

    it('should handle zero quantity items', () => {
      const cart = {
        cartItems: [
          { price: 100, quantity: 0 },
          { price: 50, quantity: 2 }
        ]
      };

      const total = calculateCartTotal(cart);

      expect(total).toBe(100);
    });

    it('should handle large quantities', () => {
      const cart = {
        cartItems: [{ price: 1, quantity: 1000000 }]
      };

      const total = calculateCartTotal(cart);

      expect(total).toBe(1000000);
    });
  });
});
