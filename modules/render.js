let Renderer = require('engine/koa/renderer');

// (!) this.render does not assign this.body to the result
// that's because render can be used for different purposes, e.g to send emails
exports.init = function(app) {
  app.use(async function(ctx, next) {

    let renderer = new Renderer(ctx);
    /**
     * Render template
     * Find the file:
     *   if locals.useAbsoluteTemplatePath => use templatePath
     *   else if templatePath starts with /   => lookup in locals.basedir
     *   otherwise => lookup in ctx.templateDir (MW should set it)
     * @param templatePath file to find (see the logic above)
     * @param locals
     * @returns {String}
     */
    ctx.render = (templatePath, locals) => renderer.render(templatePath, locals);

    await next();
  });

};
