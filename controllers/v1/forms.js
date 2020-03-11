/**
 * name : forms.js
 * author : Rakesh Kumar
 * created-date : 03-March-2020
 * Description : Forms information. 
 */

 
  /**
     * EntityTypes
     * @class
 */
 module.exports = class Forms extends Abstract {
   constructor() {
     super(schemas["forms"]);
   }
 
   static get name() {
     return "forms";
   }
 
 };
 