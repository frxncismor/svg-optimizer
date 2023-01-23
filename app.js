function captureInput() {
  let input = document.getElementById("myTextarea").value;
  optimizeSVG(input);
}

function unifyPaths() {
  let input = document.getElementById("myTextarea").value;
  let parser = new DOMParser();
  let svgDoc = parser.parseFromString(input, "image/svg+xml");
  let copyButton = document.getElementById('copyButton');

  copyButton.innerText = 'Copy';

  let gElements = svgDoc.querySelectorAll("g");
  for (let i = 0; i < gElements.length; i++) {
    let fillColors = new Set();
    let paths = gElements[i].querySelectorAll("path");
    for (let j = 0; j < paths.length; j++) {
    fillColors.add(paths[j].getAttribute("fill"));
    }
    for (let fillColor of fillColors) {
      let sameColorPaths = gElements[i].querySelectorAll('path[fill="' + fillColor + '"]');
      if(sameColorPaths.length > 1){
        let combinedPath = sameColorPaths[0];
        for (let k = 1; k < sameColorPaths.length; k++) {
          combinedPath.setAttribute("d", combinedPath.getAttribute("d") + " " + sameColorPaths[k].getAttribute("d"));
          sameColorPaths[k].parentNode.removeChild(sameColorPaths[k]);
        }
      }
    }
  }
  let result = new XMLSerializer().serializeToString(svgDoc);
  let resultTextArea = document.querySelector('.language-css');
  let resultWithoutLineJumps = result.split("\n").join("")
  let resultWithoutSpaces = resultWithoutLineJumps.split("\t").join("");
  resultTextArea.innerText = resultWithoutSpaces;
}

// Optimize SVG code
async function optimizeSVG(svgString) {
  let parser = new DOMParser();
  let svgDoc = parser.parseFromString(svgString, "image/svg+xml");
  let svg = svgDoc.querySelector("svg");
  let copyButton = document.getElementById('copyButton');

  copyButton.innerText = 'Copy';

  // Step 1: Add preserveAspectRatio="xMinYMid meet" to <svg> tag
  svg.setAttribute("preserveAspectRatio", "xMinYMid meet");

  // Step 2: Replace classes on each <path>, <rect>, <polygon> with their respective fill color which are on <style> tag
  let styleTag = svgDoc.querySelector("style");
  let styleTagContent = styleTag.textContent;
  let pathTags = svgDoc.querySelectorAll("path,rect,polygon");
  for (let i = 0; i < pathTags.length; i++) {
    let pathTag = pathTags[i],
        className = pathTag.getAttribute("class"),
        colorCode;
    if (styleTagContent.match(new RegExp("\\." + className + "\\{fill:(.*?);"))) {
      colorCode = styleTagContent.match(new RegExp("\\." + className + "\\{fill:(.*?);"))[1];
    }
    if (styleTagContent.match(new RegExp("\\." + className + "\\{opacity:(.*?);fill:(.*?);"))) {
      colorCode = styleTagContent.match(new RegExp("\\." + className + "\\{opacity:(.*?);fill:(.*?);"))[2];
      let inlineStyles = styleTagContent.match(new RegExp("\\." + className + "\\{opacity:(.*?);fill:(.*?);"))[1];
      pathTag.setAttribute("style", 'opacity:' + inlineStyles);
    }
    pathTag.setAttribute("fill", colorCode);
    pathTag.removeAttribute("class");
  }

  // Step 3: Remove <style>, <?xml>, and Adobe generator comments
  let styleTags = svgDoc.querySelectorAll("style");
  for (let i = 0; i < styleTags.length; i++) {
    styleTags[i].parentNode.removeChild(styleTags[i]);
  }
  let Adobecomment = svg.parentNode;
  Adobecomment.removeChild(Adobecomment.childNodes[0]);

  // Step 4: Remove 'x', 'y', 'style', 'id', and 'version' attributes from <svg> tag
  svg.removeAttribute("x");
  svg.removeAttribute("y");
  svg.removeAttribute("style");
  svg.removeAttribute("id");
  svg.removeAttribute("version");
  svg.removeAttribute("xml:space");
  svg.removeAttribute("xmlns:xlink");

// Step 5: Combine 'd' properties of <path> tags with the same 'fill' color if they are inside the same <g> tag
// let gElements = svgDoc.querySelectorAll("g");
// for (let i = 0; i < gElements.length; i++) {
//   let fillColors = new Set();
//   let paths = gElements[i].querySelectorAll("path");
//   for (let j = 0; j < paths.length; j++) {
//   fillColors.add(paths[j].getAttribute("fill"));
//   }
//   for (let fillColor of fillColors) {
//     let sameColorPaths = gElements[i].querySelectorAll('path[fill="' + fillColor + '"]');
//     if(sameColorPaths.length > 1){
//       let combinedPath = sameColorPaths[0];
//       for (let k = 1; k < sameColorPaths.length; k++) {
//         combinedPath.setAttribute("d", combinedPath.getAttribute("d") + " " + sameColorPaths[k].getAttribute("d"));
//         sameColorPaths[k].parentNode.removeChild(sameColorPaths[k]);
//       }
//     }
//   }
// }

  // Return the optimized SVG code
  let result = new XMLSerializer().serializeToString(svgDoc);
  let resultVisualizeContainer = document.querySelector('.result');
  let originalVisualizeContainer = document.querySelector('.original');
  let resultTextArea = document.querySelector('.language-css');
  originalVisualizeContainer.innerHTML = new XMLSerializer().serializeToString(svgDoc);;
  let resultWithoutLineJumps = result.split("\n").join("")
  let resultWithoutSpaces = resultWithoutLineJumps.split("\t").join("");
  console.log(resultWithoutSpaces);
  resultVisualizeContainer.innerHTML = resultWithoutSpaces;
  let resultOnDOM = document.getElementsByTagName('svg')[0];
  resultTextArea.innerText = new XMLSerializer().serializeToString(resultOnDOM);
}

function copyCode() {
  let copyText = document.getElementsByTagName('code')[0];
  let copyButton = document.getElementById('copyButton');
  navigator.clipboard.writeText(copyText.innerText);
  copyButton.innerText = 'Copied!';
}