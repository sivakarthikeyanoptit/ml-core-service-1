/**
 * name : v1.js
 * author : Aman Jung Karki
 * created-date : 09-Sep-2020
 * Description : User roles validation.
 */

module.exports = (req) => {
    
    let userRolesValidator = {
        listByEntityType : function () {
            req.checkParams('_id').exists().withMessage("Entity type is required");
        }
    }

    if ( userRolesValidator[req.params.method] ) {
        userRolesValidator[req.params.method]()
    }
}