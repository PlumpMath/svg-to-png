var app = angular.module('task', []);

app.controller('mainCtrl', ["$scope", function($scope) {

  $scope.data = []

  for (var i=0; i<22; i++) {
    $scope.data.push({ key: i, values: Math.round(Math.random()*100) })
  }

  // Declare height and width variables(pixels)
  var height = 500;
  var width = 1000;

	// Declare Scales + axes (don't forget to invert Y range)
  var y = d3.scale.linear()
    .domain([0, 100])
    .range([height,0]);

  var x = d3.scale.linear()
    .domain([0,21])
    .range([0,width]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(25)
    .orient("bottom")

  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(10)
    .orient("left");

  var svg = d3.select('span').append("svg")
    .attr("width", "100%")
    .attr("height", height + 100)
    .attr("style", "background: #f4f4f4")



  d3.select("svg").append("defs").append("style")
    .attr('type', "text/css")
    .text("@import url('http://fonts.googleapis.com/css?family=Spicy+Rice'); text { font: 28px 'Spicy Rice'; }")


  // Declare margin object (adds buffer)
  var margin = {left:80,right:50,top:40,bottom:0};

  // Add all elements into group
  var chartGroup = svg.append("g")
    .attr("transform", "translate("+margin.left+","+margin.top+")");

  var line = d3.svg.line()
    .x(function(d){ return x(d.key); })
    .y(function(d){ return y(d.values); })
    .interpolate("cardinal");


  // Add line; Append the path to group; run line generator on data
  var path = chartGroup.append("path").attr("d",line($scope.data))
    .attr("class", "sales")
    .style("stroke", "blue")
    .style("fill", "none")
    .style("stroke-width", "1.5px");

  // Add axes to group (shift x-axis down)
  chartGroup.append("g").attr("class", "x axis")
  .attr("transform", "translate(0, "+height+")").call(xAxis)

  chartGroup.append("g").attr("class", "y axis").call(yAxis);

  // circles + tooltips
  chartGroup.selectAll("circle")
    .data($scope.data)
    .enter().append("circle")
      .attr("class",function(d,i){ return "grp"+i; })
      .attr("cx",function(d,i){ return x(d.key); })
      .attr("cy",function(d,i){ return y(d.values); })
      .attr("r","2.5")












  $scope.saveSvgToPng = function () {
    var svgString = getSVGString(svg.node());
    svgString2Image(svgString, 2*width, 2*height, 'png', save ); // passes Blob and filesize String to the callback

    function save (dataBlob, filesize) {
      saveAs(dataBlob,'D3 exported as PNG.png'); // FileSaver.js function
    }
  }

  // Below are the function that handle actual exporting:
  // getSVGString (svgNode ) and svgString2Image( svgString, width, height, format, callback )
  function getSVGString( svgNode ) {
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    var cssStyleText = getCSSStyles( svgNode );
    appendCSS (cssStyleText, svgNode)

    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=') // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href') // Safari NS namespace fix

    return svgString;

    function getCSSStyles( parentElement ) {
      var selectorTextArr = [];

      // Add Parent element Id and Classes to the list
      selectorTextArr.push( '#'+parentElement.id );
      for (var c = 0; c < parentElement.classList.length; c++) {
        if ( !contains('.'+parentElement.classList[c], selectorTextArr) ) {
        selectorTextArr.push( '.'+parentElement.classList[c] )
        }
      }

      // Add Children element Ids and Classes to the list
      var nodes = parentElement.getElementsByTagName("*");
      for (var i = 0; i < nodes.length; i++) {
        var id = nodes[i].id;
        if ( !contains('#'+id, selectorTextArr) ) {
          selectorTextArr.push( '#'+id )
        }
        var classes = nodes[i].classList;
      }

      for (var c = 0; c < classes.length; c++) {
        if ( !contains('.'+classes[c], selectorTextArr) ) {
          selectorTextArr.push( '.'+classes[c] );
        }
      }

      // Extract CSS Rules
      var extractedCSSText = "";
      for (var i = 0; i < document.styleSheets.length; i++) {
        var s = document.styleSheets[i];

        try {
          if(!s.cssRules) continue;
        } catch( e ) {
          if(e.name !== 'SecurityError') throw e; // for Firefox
          continue;
        }

        var cssRules = s.cssRules;
        for (var r = 0; r < cssRules.length; r++) {
          if ( contains( cssRules[r].selectorText, selectorTextArr ) || i===2 )
            extractedCSSText += cssRules[r].cssText;
        }
      }

      return extractedCSSText

      function contains(str,arr) {
        return arr.indexOf( str ) === -1 ? false : true;
      }

    }

    function appendCSS( cssText, element ) {
      var styleElement = document.createElement("style");
      styleElement.setAttribute("type","text/css");
      styleElement.innerHTML = cssText;
      var refNode = element.hasChildNodes() ? element.children[0] : null;
      element.insertBefore( styleElement, refNode );
    }

  }

  function svgString2Image( svgString, width, height, format, callback ) {
    var format = format ? format : 'png';
    var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to dataurl

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");


    canvas.width = width;
    canvas.height = height;

    var image = new Image;
    image.onload = function() {
      context.clearRect ( 0, 0, width, height );
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob( function(blob) {
        var filesize = Math.round( blob.length/1024 ) + ' KB';
        if ( callback ) callback( blob, filesize );
      });

    };

    image.src = imgsrc;

  }


}]);