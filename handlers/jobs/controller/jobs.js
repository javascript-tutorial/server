const Job = require('../models/job');

function *list() {
    const jobsList = yield Job.find({}).exec();

    this.body = this.render('list', { jobsList });}

function *show(next) {
    const job = yield Job.findOne({ _id: this.params.id  }).exec();

    if (!job) {
      this.throw(404);
    }

    this.body = this.render('show', { job });
}

function *create() {
    this.body = yield new Job(this.request.body).save();
    this.status = 200;
}

function *form() {
    this.status = 200;
    this.body = this.render('form', {});
}

module.exports = {
    list,
    show,
    create,
    form
};
