//// cuts a piece from text of given length or shorter
//// preferrable at paragraph
//// ported from Drupal8 text_summary
//module.exports = function(text, maxLength) {
//
//  if (text.length <= maxLength) return text;
//
//  // The summary may not be longer than maximum length specified. Initial slice.
//  var summary = text.slice(0, maxLength);
//
//  // Store the actual length of the UTF8 string -- which might not be the same
//  // as $size.
//  var maxRpos = summary.length;
//
//  // How much to cut off the end of the summary so that it doesn't end in the
//  // middle of a paragraph, sentence, or word.
//  // Initialize it to maximum in order to find the minimum.
//  var minRpos = maxRpos;
//
//  // Build an array of arrays of break points grouped by preference.
//  var breakPoints = ["\n", '. ', '! ',  '? ', ', ', ')', ']'];
//  // Iterate over the groups of break points until a break point is found.
//  foreach ($break_points as $points) {
//    // Look for each break point, starting at the end of the summary.
//    foreach ($points as $point => $offset) {
//      // The summary is already reversed, but the break point isn't.
//      $rpos = strpos($reversed, strrev($point));
//      if ($rpos !== FALSE) {
//        $min_rpos = min($rpos + $offset, $min_rpos);
//      }
//    }
//
//    // If a break point was found in this group, slice and stop searching.
//    if ($min_rpos !== $max_rpos) {
//      // Don't slice with length 0. Length must be <0 to slice from RHS.
//      $summary = ($min_rpos === 0) ? $summary : substr($summary, 0, 0 - $min_rpos);
//      break;
//    }
//  }
//
//  // If the htmlcorrector filter is present, apply it to the generated summary.
//  if (isset($format) && $filters->has('filter_htmlcorrector') && $filters->get('filter_htmlcorrector')->status) {
//    $summary = Html::normalize($summary);
//  }
//
//  return $summary;
//}
