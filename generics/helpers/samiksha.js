/**
 * name : samiksha.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All samiksha related api call.
 */

var request = require('request');

var pendingAssessments = function () {

    const samikshaServiceUrl = process.env.APPLICATION_BASE_HOST + process.env.SAMIKSHA_BASE_URL + "api/v1/entityAssessors/pendingAssessments"

    return new Promise((resolve, reject) => {
        try {
            console.log(samikshaServiceUrl)

            const samikshaCallBack = function (err, response) {
                if (err) {
                    throw "Failed to connect to samiksha service."
                    // Throw error to Slack. -> Dirty FIx 
                } else {
                    let pendingAssessments = JSON.parse(response.body);
                    return resolve(pendingAssessments)

                }
            }

            request.get(samikshaServiceUrl, {
                headers: {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                }
            }, samikshaCallBack)
        } catch (error) {
            return reject(error)
        }
    })

}

var pendingObservations = function () {

    const samikshaServiceUrl = process.env.APPLICATION_BASE_HOST + process.env.SAMIKSHA_BASE_URL + "api/v1/entityAssessors/pendingObservations"

    return new Promise((resolve, reject) => {
        try {
            const samikshaCallBack = function (err, response) {
                if (err) {
                    throw "Failed to connect to samiksha service."
                    // Throw error to Slack. -> Dirty FIx 
                } else {
                    let pendingObservations = JSON.parse(response.body);
                    return resolve(pendingObservations)

                }
            }

            request.get(samikshaServiceUrl, {
                headers: {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                }
            }, samikshaCallBack)
        } catch (error) {
            return reject(error)
        }
    })

}

var completedAssessments = function () {

    const samikshaServiceUrl = process.env.APPLICATION_BASE_HOST + process.env.SAMIKSHA_BASE_URL + "api/v1/entityAssessors/completedAssessments"

    return new Promise((resolve, reject) => {
        try {
            const samikshaCallBack = function (err, response) {
                if (err) {
                    throw "Failed to connect to samiksha service."
                    // Throw error to Slack. -> Dirty FIx 
                } else {
                    let completedAssessments = JSON.parse(response.body);
                    return resolve(completedAssessments)

                }
            }

            request.get(samikshaServiceUrl, {
                headers: {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                }
            }, samikshaCallBack)
        } catch (error) {
            return reject(error)
        }
    })

}

var completedObservations = function () {

    const samikshaServiceUrl = process.env.APPLICATION_BASE_HOST + process.env.SAMIKSHA_BASE_URL + "api/v1/entityAssessors/completedObservations"

    return new Promise((resolve, reject) => {
        try {
            const samikshaCallBack = function (err, response) {
                if (err) {
                    throw "Failed to connect to samiksha service."
                    // Throw error to Slack. -> Dirty FIx 
                } else {
                    let completedObservations = JSON.parse(response.body);
                    return resolve(completedObservations)

                }
            }

            request.get(samikshaServiceUrl, {
                headers: {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                }
            }, samikshaCallBack)
        } catch (error) {
            return reject(error)
        }
    })

}

module.exports = {
    pendingAssessments: pendingAssessments,
    completedAssessments: completedAssessments,
    pendingObservations: pendingObservations,
    completedObservations: completedObservations
};
