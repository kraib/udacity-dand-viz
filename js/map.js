var margin = 75;
    width = 1800 - margin,
    height = 800 - margin;

var svg = d3.select("#map")
    .append("svg")
    .attr("width", width + margin)
    .attr("height", height + margin)

var map = svg.append('g');

var projection = d3.geo.mercator()
                  .scale(260)
                  .translate([width/2, height/1.7]);

var path = d3.geo.path().projection(projection);

// 'updateSelection' argument variables need to be global for MULTIPLE button selection
var comparison;

// load data and callback
queue()
.defer(d3.json, "data/world_countries.json")
// remote "https://raw.githubusercontent.com/winkelman/udacity-dand-viz-project/master/data/world_countries.json"
.defer(d3.csv, "data/mobile-world-data.csv")
// remote "https://raw.githubusercontent.com/winkelman/udacity-dand-viz-project/master/data/mobile-world-data.csv"
.await(callback);



function callback(error, worldData, mobileData) {

  // make 'countryData' object
  var countryData = {};

  mobileData.forEach(function(d) {
    // construct object for each country within 'countryData' object
    countryCode = d['country.code']
    countryData[countryCode] = {'costusdgb': '', "gnimonthly": '', "percentgni": '', 'costbucket': '', 'percentbucket': ''};

    d['cost.usd.per.gb'] = +d['cost.usd.per.gb'];
    d['gni.month'] = +d['gni.month'];
    d['percent.income'] = +d['percent.income'];

    countryData[d['country.code']]["costusdgb"] = d['cost.usd.per.gb'];
    countryData[d['country.code']]["gnimonthly"] = d['gni.month'];
    countryData[d['country.code']]["percentgni"] = d['percent.income'];
    countryData[d['country.code']]["costbucket"] = d['cost.usd.per.gb.bucket'];
    countryData[d['country.code']]["percentbucket"] = d['percent.income.bucket'];
    }); // 'mobileData' iteration closure


  // bind 'countryData' to 'worldData'
  for(index in worldData.features){
    countryCode = worldData.features[index].id;

    if(countryCode in countryData){
      worldData.features[index]['mobile'] = {};
      worldData.features[index]['monthlyIncome'] = countryData[countryCode]["gnimonthly"];
      worldData.features[index]['mobile']['costUSDGB'] = countryData[countryCode]["costusdgb"];
      worldData.features[index]['mobile']['costRelative'] = countryData[countryCode]["percentgni"];
      worldData.features[index]['mobile']['costBucket'] = countryData[countryCode]["costbucket"];
      worldData.features[index]['mobile']['relativeBucket'] = countryData[countryCode]["percentbucket"];
    
    } // debug for missing country matches!!
    else {console.log(countryCode + " " + worldData.features[index].properties.name)}

  }; // worldData.features for loop closure


  tip = d3.tip().attr('class', 'd3-tip')
                .html(function(d) {
                  var content = '<p>' + d.properties.name + '</p>';
                  //debugger;
                  if(d.mobile != undefined){ // make sure we have mobile data

                    if(comparison != undefined) { // make sure a comparison has been specified, no comparison from the get-go
                      
                      if(comparison[1] == 'costUSDGB'){
                        content += '<p>$' + d.mobile[comparison[1]] + ' (USD)</p>';
                      }
                      if(comparison[1] == 'costRelative'){
                        
                        content += '<p>' + d.mobile[comparison[1]] + '%</p>';
                        content += '<p>Monthly Income: $' + d.monthlyIncome + ' (USD)</p>';
                      }
                    }
                  } else {
                    content += " (no data)";
                    }
                  return content;
                })
                .offset(function() {
                  return [0,0];
                });

  map.call(tip);
  tip.direction('s');


  // create map
  map.selectAll('path') // creating paths
               .data(worldData.features) // coordinate data in '.features array'
               .enter()
               .append('path')
               .attr('d', path)
               .style('fill', 'gray')
               .attr("class", "country")
               .on('mouseover', tip.show)
               .on('mouseout', tip.hide);



  // apply/update choropleth
  function updateSelection(comparison) {


    // CREATE COLOR SCALE

    /*
    // NO NEED TO DO THIS NOW THAT WE HAVE BUCKETS
    // first get values of interest across all countries for the particular duration and metric
    var targets = d3.selectAll("path")[0];
    var values = [];

    for(var index = 0; index < targets.length; index++){

      //debugger;
      var hasMobile = ('mobile' in targets[index].__data__)
      if(hasMobile){
        //debugger;
        var data = targets[index].__data__.mobile[scheme];
        values.push(data);
      }
    }
    */


    // get sorted domain of buckets for the comparison specified
    var domain;
    var domainValues = [];
    var scheme = comparison[2]

    for(index in worldData.features) {
      var hasMobile = worldData.features[index]['mobile'];

      if(hasMobile != undefined) {
    
        var domainVal = worldData.features[index]['mobile'][scheme];

        if(domainValues.indexOf(domainVal) == -1){
          domainValues.push(domainVal);
        }
      }
    }

    // sort by lower bound of bucket's numerical value in increasing order
    domain = domainValues.sort(function(a, b){return +a.split("-")[0] - +b.split("-")[0]});

    // color scale
    var color = d3.scale.ordinal()
                .domain(domain)
                .range(colorbrewer['Blues']['9'].slice(2));

    // fill in paths with color
    map.selectAll('path')
             .transition()
             .duration(800)
             .style('fill', function(d){
              //debugger;
              var hasMobile = ('mobile' in d);
              if(hasMobile){
                  return color(d.mobile[scheme]);
                } else{return "DimGray"}
             });



    // create legend for the selection

    // get rid of previous legend if exists, none on button
    if(d3.select(".legend")[0][0] != null) {
      d3.select(".legend")[0][0].remove();
    }

    // domain is numerical value of lower bound for each bucket w/o lowest (threshold scale)
    threshDomain = domain.map(function(d){return +d.split("-")[0]}).slice(1);

    // inverse threshold maps range value to array of 2 values in the domain corresponding to upper and lower bounds.
    // lowest and highest limits -Inf, +Inf (=== 'undefined')
    var threshold = d3.scale.threshold()
                            .domain(threshDomain)
                            .range(color.range());

    var x = d3.scale.linear()
                    .domain([0, 100])
                    .range([0, 600]);

    var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("bottom")
                      .tickSize(15)
                      .tickValues(threshold.domain())
                      .tickPadding(15);
                      // percent symbol doesn't fit well with axis
                      /*.tickFormat(function(d) {
                        if(scheme == 'relativeBucket') {
                          return d + "%";
                        } else {
                          return "$" + d;}
                      });*/

    var legend = d3.select("#map")
                    .append("svg")
                    .attr("class", "legend")
                    .attr("width", width + margin)
                    .attr("height", 75)
                    .append("g")
                    .attr("transform", "translate(" + (-200 + width/2) + "," + 25 + ")");

    /*var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", "translate(" + (-200 + width/2) + "," + height + ")");*/

    legend.selectAll("rect")
          .data(threshold.range().map(function(color) {
            // inverting range to get array of pairs for bounds
            var d = threshold.invertExtent(color);
            // if we are at the lowest boundary color then d[0] == undefined so set to '0'
            if (d[0] == null) d[0] = x.domain()[0];
            // if we are at the highest bound color then d[1] == undefined so set to '100'
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
          }))
          .enter()
          .append("rect")
          .attr("x", function(d) {
            return x(d[0]);
          })
          .attr("height", 20)
          .attr("width", function(d) {
            return x(d[1]) - x(d[0]);
          })
          .transition()
          .duration(600)
          .style("fill", function(d) {
            return threshold(d[0]);
          });

    legend.call(xAxis).append("text")
                 .attr("class", "caption")
                 .attr("y", -5)
                 .text(comparison[0]);


  } // updateSelection closure


  // for debugging...
  //comparison = 'costUSDGB';
  //updateSelection(comparison);

  
  // looking at the valid arguments for updateSelection we can see what data we want in the buttons
  var buttonData = [['Average Cost Per Gigabyte', 'costUSDGB', 'costBucket'],
  ['Percent of Monthly Income (2GB)', 'costRelative', 'relativeBucket']];

  var buttons = d3.select("body")
                    .append("div")
                    .attr("class", "buttons")
                    .selectAll("div")
                    .data(buttonData)
                    .enter()
                    .append("div")
                    .text(function(d) {
                        return d[0];
                    });

  buttons.on("click", function(d) {

    // reset all buttons first
    d3.select(".buttons")
                  .selectAll("div")
                  .transition()
                  .duration(600)
                  .style("background", "LightGray")
                  .style("color", "black");

    d3.select(this)
                  .transition()
                  .duration(600)
                  .style("background", 'Maroon')
                  .style("color", "white");
  
    comparison = d;
    //debugger;
    updateSelection(comparison);
    });



} // callback closure