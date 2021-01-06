/**
 * name : v1.js
 * author : Priyanka Pradeep
 * created-date : 06-Jan-2021
 * Description : Solution validation.
 */

module.exports = (req) => {
    
    let solutionValidator = {
        update: function () {
            req.checkQuery('solutionExternalId').exists().withMessage("required solution externalId");
        },
    }

    if ( solutionValidator[req.params.method] ) {
        solutionValidator[req.params.method]()
    }
}