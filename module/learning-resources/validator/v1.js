/**
 * name : v1.js
 * author : Rakesh
 * created-date : 28-Nov-2020
 * Description : Learning Resources.
 */
module.exports = (req) => {

    let laearningResourcesValidator = {

        list: function () {
        }
    }

    if (laearningResourcesValidator[req.params.method]) {
        laearningResourcesValidator[req.params.method]();
    } 

};