/**
 * name : helper.js
 * author : Aman Jung Karki
 * Date : 09-Sep-2020
 * Description : User roles related information.
 */

module.exports = class UserRolesHelper {

     /**
     * Lists of roles.
     * @method
     * @name roleDocuments
     * @param {Array} [filterData = "all"] - template filter query.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [skipFields = "none"] - field not to include
     * @returns {Array} Lists of roles. 
     */
    
    static roleDocuments(
        filterData = "all", 
        fieldsArray = "all",
        skipFields = "none"
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let queryObject = (filterData != "all") ? filterData : {};
                let projection = {}
           
                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                   });
               }
               
               if( skipFields !== "none" ) {
                   skipFields.forEach(field=>{
                       projection[field] = 0;
                   });
               }
               
               let userRoles = await database.models.userRoles.find(
                   queryObject, 
                   projection
               ).lean();
           
               return resolve(userRoles);
           
           } catch (error) {
               return reject(error);
           }
       });
   }

};