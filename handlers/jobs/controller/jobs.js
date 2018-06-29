const Job = require('../models/job');

const JOBS_PER_PAGE = 2;

function *list() {
    const totalCount = yield Job.count().exec();
    const totalPages = Math.ceil(totalCount / JOBS_PER_PAGE);
    const currentPage = Number(this.query.p || 1);
    const jobsList = yield Job.find({}).sort({ created: -1 })
      .skip((currentPage - 1) * JOBS_PER_PAGE).limit(JOBS_PER_PAGE).exec();

    this.body = this.render('list', { jobsList, totalCount, totalPages, currentPage });
}

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

function *terms() {
    this.status = 200;
    this.body = this.render('terms', {});
}

module.exports = {
    list,
    show,
    create,
    form,
    terms
};
