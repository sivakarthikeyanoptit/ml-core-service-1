/**
 * name : languages.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : Test languages apis
 */

//dependencies

/**
  * Test languages apis.
  * @function
  * @name testLanguages
*/

let testLanguages = function(){
    describe('Language Apis', function () {

      it('List language based on id', function (done) {
        chai.request(testUrl).get('/kendra/api/v1/languages/list/en').end(function (err, res) {
            expect(res).to.have.status(200);
            done();
        })
      });

      it('List all available languages', function (done) {
        chai.request(testUrl).get('/kendra/api/v1/languages/listAll').end(function (err, res) {
            expect(res).to.have.status(200);
            done();
        })
      });
    });
}

module.exports = testLanguages;