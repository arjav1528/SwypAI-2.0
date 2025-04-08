const HealthCheckRoute = require('express').Router();

HealthCheckRoute.get('/healthcheck', (req, res) => {
  res.status(200).json({
    message: 'Health check successful',
  });
});