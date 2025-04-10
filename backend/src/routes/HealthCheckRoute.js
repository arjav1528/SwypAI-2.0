const healthCheckController = require('../controllers/healthcheck.controller');

const HealthCheckRoute = require('express').Router();

HealthCheckRoute.get('/',healthCheckController);

module.exports = HealthCheckRoute;