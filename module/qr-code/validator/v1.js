module.exports = (req) => {
    let qrCodeValidator = {
        generate : function () {
            req.checkBody('qrCodeData').exists().withMessage("required qr code data")
        },
        image : function () {
            req.checkParams('_id').exists().withMessage("Unique Code is required")
        },
        pdf : function () {
            req.checkBody('codes').exists().withMessage("required qr code data array")
        }
    }

    if (qrCodeValidator[req.params.method]) {
        qrCodeValidator[req.params.method]()
    }
}