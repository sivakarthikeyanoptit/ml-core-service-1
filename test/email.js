/**
 * name : email.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : Test email apis
 */

//dependencies

/**
  * Test email apis.
  * @function
  * @name testEmail
*/

let testEmail = function(){
    describe('Email', function () {

        it('send email status', function (done) {
            chai.request(testUrl).post('/kendra/api/v1/email/send').type('json').send({
                "from": "aman@tunerlabs.com",
                "to": "amankarki87@gmail.com",
                "cc": ["amankarki76399@gmail.com"],
                "bcc": ["aman@tunerlabs.com"],
                "subject": "Message from nodemailer",
                "html": "<p><b>Hello</b> from Angel Drome!</p>"
            }).end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            })
        });
    
    });
}

module.exports = testEmail;
