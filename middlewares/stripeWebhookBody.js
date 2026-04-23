const stripeWebhookBody = (req, res, buf) => {
  if (req.originalUrl === '/api/v1/orders/webhook-checkout') {
    req.rawBody = buf;
  }
};

module.exports = stripeWebhookBody;
