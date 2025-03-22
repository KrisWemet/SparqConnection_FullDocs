"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const expertAdvice_1 = __importDefault(require("./routes/expertAdvice"));
const health_1 = __importDefault(require("./routes/health"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logger_1.requestLogger);
// Routes
app.use('/api/expert-advice', expertAdvice_1.default);
app.use('/api/health', health_1.default);
// Error handling
app.use(logger_1.errorLogger);
app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json(Object.assign({ success: false, message }, (process.env.NODE_ENV !== 'production' && { stack: err.stack })));
});
exports.default = app;
