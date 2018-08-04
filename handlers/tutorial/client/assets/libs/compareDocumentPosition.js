
// полифилл для compareDocumentPosition в ie8

!function(){
  var el = document.documentElement;
  if( !el.compareDocumentPosition && el.sourceIndex !== undefined ){
      
    /* ??
    Node = Element;
        Node.DOCUMENT_POSITION_DISCONNECTED = 1;
        Node.DOCUMENT_POSITION_PRECEDING = 2
        Node.DOCUMENT_POSITION_FOLLOWING = 4;
        Node.DOCUMENT_POSITION_CONTAINS = 8;
        Node.DOCUMENT_POSITION_CONTAINED_BY = 16;
        Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;
    */

    Element.prototype.compareDocumentPosition = function(other){
      return (this != other && this.contains(other) && 16) +
                 (this != other && other.contains(this) && 8) +
                 (this.sourceIndex >= 0 && other.sourceIndex >= 0 ?
                   (this.sourceIndex < other.sourceIndex && 4) +
                   (this.sourceIndex > other.sourceIndex && 2) 
                   : 1
                 ) + 0;
    }
  } 
}();
