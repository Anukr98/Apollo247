const mob = (req, res, next) => {
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

const mobError = (req, res, next) => {
    res.send({
        status: 'failed',
    });

};

module.exports = {
    mob,
    mobError
}