/**
 * name : sessions.js
 * author : Aman
 * created-date : 04-03-2020
 * Description : Session set and get data.
 */

 /**
  * Get app version.
  * @method
  * @name get - Get specific session data
  * @returns {Object} returns specific session data.
*/

function get(sessionPath){
    return global.sessions[sessionPath]
}

 /**
  * Set new session data
  * @method
  * @name set
  * @params session - session Data. 
  * @returns {Object} return version data.
*/

function set(sessionPath,data) {
    return global.sessions[sessionPath] = data;
}

module.exports = {
    get : get,
    set : set
}