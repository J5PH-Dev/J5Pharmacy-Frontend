const jwt = require('jsonwebtoken');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Check if user is Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Requires admin privileges' });
    }
    next();
};

// Check if user is Manager
const isManager = (req, res, next) => {
    if (req.user.role !== 'MANAGER') {
        return res.status(403).json({ message: 'Requires manager privileges' });
    }
    next();
};

// Check if user is Admin or Manager
const isPMSUser = (req, res, next) => {
    if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Requires PMS access privileges' });
    }
    next();
};

// Check if user is Pharmacist
const isPharmacist = (req, res, next) => {
    if (!req.user.staffId) {
        return res.status(403).json({ message: 'Requires pharmacist privileges' });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isManager,
    isPMSUser,
    isPharmacist
}; 