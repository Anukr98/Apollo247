const consultsPgRedirect = (req, res) => {
    const orderAppId = req.query.tk;
    if (orderAppId) {
        res.statusCode = 200;
        res.send({
            status: req.query.status,
            orderId: orderAppId,
        });
    } else {
        res.statusCode = 401;
        res.send({
            status: 'failed',
            reason: 'Unauthorized',
            code: '800',
        });
    }
}

module.exports = {
    consultsPgRedirect
}