/**
 * Function to put a delay in the code execution since colyseus doesn't stand well with asynchronous javascript functionality
 * @param {*} time delay in ms
 * @returns 
 */
const sleep = time => new Promise(resolve => setTimeout(resolve, time))

module.exports = {
    sleep
}
