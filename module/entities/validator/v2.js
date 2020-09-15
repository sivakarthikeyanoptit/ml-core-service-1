/**
 * name : validator.js
 * author : Aman Jung Karki
 * created-date : 09-sep-2020
 * Description : All entities v2 related validator.
 */

module.exports = (req) => {
    let entityValidator = {
        listByEntityType : function () {
            req.checkParams('_id').exists().withMessage("required Entity type");
        }
    }

    if (entityValidator[req.params.method]) {
        entityValidator[req.params.method]()
    }
}