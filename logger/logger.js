/**
 * Here you produce the log in sisal format
 * @param {*} message log message
 * @param {*} logger 
 * @param {*} stacktrace 
 * @param {*} level
 * @param {*} processId a unique Id for every user's process
 */
exports.log = (message, logger, stacktrace, level, processId) => {
    const log = JSON.stringify({
        "@timestamp": new Date().toISOString(),
        "message": JSON.stringify(message),
        "logger_name": logger,
        "thread_name": "NFT Envisioning Days",
        "stacktrace": stacktrace,
        "level": level,
        "traceId": processId
    })
    console.log(log);
}