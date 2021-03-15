const { expect } = require("chai");
let appPath = require("../../app");
let mockServer;

let solutions = function () {
    describe('Solution Targeted entity Api', () => {

        beforeEach(() => {
            mockServer = chai.request(appPath);
        });

        it('Test 400 error for targeted entity', function (done) {
            mockServer.post('/kendra/api/v1/solutions/targetedEntity').then((res)=>{
                expect(res.status).to.equal(400);
                done();
            })
        });

        it('Test for request body in targeted entity api',function (done) {
            mockServer.post('/kendra/api/v1/solutions/targetedEntity/600ac0d1c7de076e6f9943b9')
            .end((err,res)=>{
                expect(res.status).to.equal(400);
                done();
            })  
        });

        it('Success targeted entity api',function (done) {
            mockServer.post('/kendra/api/v1/solutions/targetedEntity/600ac0d1c7de076e6f9943b9')
            .send({
                "state" : "bc75cc99-9205-463e-a722-5326857838f8",
                "district" : "b54a5c6d-98be-4313-af1c-33040b1703aa",
                "school" : "2a128c91-a5a2-4e25-aa21-3d9196ad8203"
            })
            .end((err,res) => {
                let response = res.body;
                expect(response.status).to.equal(200);
                expect(response.result).to.have.property("_id");
                expect(response.result).to.have.property("entityType");
                expect(response.result).to.have.property("entityName");
                done();
            })
        });
    });
}

module.exports = solutions; 