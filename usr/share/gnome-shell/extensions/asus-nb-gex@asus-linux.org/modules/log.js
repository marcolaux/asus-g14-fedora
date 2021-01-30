var log_level = 4;
function raw(text) {
    log(`asus-nb-gex: ${text}`);
}
function info(text) {
    if (log_level > 0)
        raw(`[INFO] ${text}`);
}
function error(text) {
    if (log_level > 1)
        raw(`[ERROR] ${text}`);
}
function warn(text) {
    if (log_level > 2)
        raw(`[WARN] ${text}`);
}
function debug(text) {
    if (log_level > 3)
        raw(`[DEBUG] ${text}`);
}
//# sourceMappingURL=log.js.map