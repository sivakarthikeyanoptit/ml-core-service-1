
module.exports = class FormHelper {

    /**
     * Form list.
     * @method
     * @name list
     * @param {Object} [queryParameter = "all"] - Filtered query data.
     * @param {Object} [projection = {}] - Projected data.   
     * @returns {Object} returns a form data.
    */

   static list(queryParameter = "all", projection = {}) {
       return new Promise(async (resolve, reject) => {
           try {

               if( queryParameter === "all" ) {
                   queryParameter = {};
               };

               let formData = 
               await database.models.forms.find(queryParameter, projection).lean();

               return resolve(formData);

           } catch (error) {
               return reject(error);
           }
       })

   }
}