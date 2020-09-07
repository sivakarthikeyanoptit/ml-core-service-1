
module.exports = class FormHelper {

    /**
     * Form list.
     * @method
     * @name formsDocument
     * @param {Object} [queryParameter = "all"] - Filtered query data.
     * @param {Object} [projection = "all"] - Projected data.
     * @param {Object} [skipFields = "none"] - Field not to include.      
     * @returns {Object} returns a form data.
    */

   static formsDocument(filterQuery = "all", fieldsArray = "all", skipFields = "none") {
       return new Promise(async (resolve, reject) => {
           try {
               
                let queryObject = (filterQuery != "all") ? filterQuery : {};
                
                let projection = {}
                
                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                    });
                }
                
                if( skipFields !== "none" ) {
                    skipFields.forEach(field=>{
                        projection[field] = 0;
                    })
                }

               let formData = 
               await database.models.forms.find(queryObject, projection).lean();

               return resolve(formData);

           } catch (error) {
               return reject(error);
           }
       })

   }

   /**
   * List of user forms.
   * @method
   * @name list
   * @param bodyData - Body data.
   * @returns {Array} List of user forms data.
   */
  
  static list( bodyData ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const forms = await this.formsDocument(
                bodyData.query,
                bodyData.projection,
                bodyData.skipFields
            );

            return resolve({
                message : constants.apiResponses.FORMS_FETCHED,
                result : forms
            });
            
        } catch (error) {
            return reject(error);
        }
    });
  }
  
}