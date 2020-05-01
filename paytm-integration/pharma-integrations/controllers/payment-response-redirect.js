const mobRedirect = (req, res, next) => {
    if (req.query.status) {
        res.status(200).send({ status: req.query.status });
    } else {
        res.status(401).send({
            status: 'failed',
            reason: 'Unauthorized',
            code: '800',
        });
    }


};

module.exports = {
    mobRedirect
}