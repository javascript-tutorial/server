module.exports = function() {

  let figurePngs = document.querySelectorAll('figure img[src$=".png"]');

  for (let i = 0; i < figurePngs.length; i++) {
    let png = figurePngs[i];

    // load @2x version (must exist)
    png.onload = function() {
      this.onload = null;
      if (this.src.match(/@2x.png$/)) return;

      let png2x = new Image();
      png2x.onload = function() {
        //console.log(this.src);
        if (this.width && this.height) {
          png.src = this.src;
        }
      };
      png2x.src = this.src.replace('.png', '@2x.png');
    };
    if (png.complete) png.onload();

  }

};
