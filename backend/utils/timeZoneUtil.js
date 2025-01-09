require('dotenv').config();

// Get current timestamp in UTC+8
const getCurrentTimestamp = () => {
    const date = new Date();
    // Add UTC+8 offset (8 hours in milliseconds)
    date.setTime(date.getTime() + (8 * 60 * 60 * 1000));
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Format MySQL timestamp to UTC+8
const formatToLocalTime = (mysqlTimestamp) => {
    if (!mysqlTimestamp) return null;
    
    const date = new Date(mysqlTimestamp);
    date.setTime(date.getTime() + (8 * 60 * 60 * 1000));
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Get MySQL timezone offset from environment variable
const getMySQLTimezoneOffset = () => {
    return process.env.TIMEZONE_OFFSET || '+08:00';
};

// Function to generate MySQL CONVERT_TZ function string
const getConvertTZString = (columnName) => {
    return `CONVERT_TZ(${columnName}, '+00:00', '${getMySQLTimezoneOffset()}')`;
};

// Function to generate MySQL timestamp with timezone
const getMySQLTimestamp = () => {
    return `CONVERT_TZ(NOW(), '+00:00', '${getMySQLTimezoneOffset()}')`;
};

module.exports = {
    getCurrentTimestamp,
    formatToLocalTime,
    getMySQLTimezoneOffset,
    getConvertTZString,
    getMySQLTimestamp
}; 