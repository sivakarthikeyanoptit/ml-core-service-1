/**
 * name : appication-config/helper.js
 * author : Rakesh Kumar
 * created-date : 12-Dec-2019
 * Description : All application related helper functions.
 */


/**
 * load modules.
 */


const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications")
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const csv = require("csvtojson");
const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");



const upload_type = 
gen.utils.checkIfEnvDataExistsOrNot("APPLICATION_CONFIG_UPLOAD_TYPE");
/**
    * appicationConfigHelper
    * @class
*/

module.exports = class appicationConfigHelper {


    /**
      * upload all the application configaration.
      * @method
      * @name upload
      * @param {Object[]} files consists array of languages to upload. 
      * @returns {Promise} returns a promise.
     */

    static upload(req) {
        return new Promise(async function(resolve, reject) {
            try {

                let configData = await csv().fromString(req.files.configFile.data.toString());
                let type = req.query['config-type'];
                let uploadType = upload_type;

              
                // console.log("req.headers",req.headers.uploadType);
                if(req.headers.uploadType){
                    uploadType = req.headers.uploadType;
                }
                    await Promise.all(configData.map( async function(ele,index){
                    
                        let keys = Object.keys(ele);
                        if(keys.includes('key') && keys.includes('value') && keys.includes('isActive')){
                            ele.id= ele.value;

                            if(ele.is_active){
                                ele.is_active = ( ele.is_active == 'true' || ele.is_active == 'TRUE' );
                            }else{
                                ele.is_active =true;
                            }
                            
                            ele.created_at=Date.now();

                            ele.updateType = uploadType;
                            // console.log("uploadType",uploadType);
                            // ele.isActive = Boolean.parse(ele.isActive)
                            //  ele.value;
                            await kafkaCommunication.pushApplicationConfigToKafka(ele);

                        }else{
                            reject({error:"failed",message:"Invalid csv please check the headers"})
                        }
                    }));
                return resolve(configData)
            } catch (error) {
                return reject(error);
            }
        })
    }

         /**
      * List all application Configrations.
      * @method
      * @name listAll
      * @returns {Promise} returns a promise.
     */


    static listAll() {

        return new Promise(async (resolve, reject) => {
            try {
                let document = 
                await elasticSearchHelper.getAllApplicationConfig()

               let group = document.reduce((p,c) => (p[c.type] ? p[c.type].push(c) : p[c.type] = [c],p) ,{}),
                newData = Object.keys(group).map(k => ({info: k, obj: group[k]}));

                return resolve({
                    message: `config list fetched successfully`,
                    result: group
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

}