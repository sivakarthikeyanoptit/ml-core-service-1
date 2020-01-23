/**
 * name : slack.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : Test slack apis
 */

//dependencies

/**
  * Test slack apis.
  * @function
  * @name testSlack
*/

let testSlack = function(){
    describe('slack', function () {
        it('send error messages to slack', function (done) {
            chai.request(testUrl).post('/kendra/api/v1/slack/error').type('json').send({
                "slackErrorName":"Samiksha-Error",
                "AppName":"samiksha",
                "Environment":"Testing",
                "Method":"POST",
                "Url":"/assessment-designer-service/api/v1/draftQuestions/create",
                "loggedInUserId" :"e97b5582-471c-4649-8401-3cc4249359bb",
                "error":"name is undefined",
                "color":"#fa3e3e"
            }).end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            })
        });
    });
}

module.exports = testSlack;