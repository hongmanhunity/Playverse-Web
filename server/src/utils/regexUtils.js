/**
 * Escape các ký tự đặc biệt của RegExp để tránh ReDoS khi tìm kiếm bằng $regex
 */
const escapeRegex = (str = '') => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { escapeRegex };
