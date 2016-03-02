var margin = 75;
    width = 1500 - margin,
    height = 700 - margin;

var svg = d3.select("#map")
    .insert("svg", ":first-child")
    .attr("width", width + margin)
    .attr("height", height + margin)

var map = svg.append('g');

var projection = d3.geo.mercator()
                  .scale(240)
                  .translate([width/2, height/1.6]);

var path = d3.geo.path().projection(projection);

// 'updateSelection' argument variables need to be global for MULTIPLE button selection
var unitArray;
var comparisonArray;

// load data and callback
queue()
.defer(d3.json, "data/world_countries.json")
// remote "https://raw.githubusercontent.com/winkelman/udacity-dand-viz-project/master/data/world_countries.json"
.defer(d3.csv, "data/mobile-world-data.csv")
// remote "https://raw.githubusercontent.com/winkelman/udacity-dand-viz-project/master/data/mobile-world-data.csv"
.await(callback);



function callback(error, worldData, mobileData) {


  var countryData = {}; // make 'countryData' object

  mobileData.forEach(function(d) {  // add data from mobileData for each country

    // construct object for each country within 'countryData' object
    countryCode = d['country.code'];
    countryData[countryCode] = {'mb': {}, 'gb': {}}; // separate by unit type

    // NOT NECESSARY!!! FIX LATER
    // cast relevant data as numerical, keep buckets as strings
    d['gni.month'] = +d['gni.month'];
    d['gb.cost.gb'] = +d['gb.cost.gb'];
    d['gb.cost.mb'] = +d['gb.cost.mb'];
    d['percent.income.gb'] = +d['percent.income.gb'];
    d['percent.income.mb'] = +d['percent.income.mb'];

    // add fields

    // too simple, need to create 'gb' and 'mb' objects for button selection
    /*for(index in d) {
      if(index != "country.code" & index != "country.name" ) {
        countryData[countryCode][index] = d[index];
      }
    }*/
    countryData[countryCode]['gni.month'] =d['gni.month'];

    countryData[countryCode]['gb']['cost'] = d['gb.cost.gb'];
    countryData[countryCode]['gb']['cost.bucket'] = d['gb.cost.gb.bucket'];
    countryData[countryCode]['gb']['percent.income'] = d['percent.income.gb'];
    countryData[countryCode]['gb']['percent.income.bucket'] = d['percent.income.gb.bucket'];

    countryData[countryCode]['mb']['cost'] = d['gb.cost.mb'];
    countryData[countryCode]['mb']['cost.bucket'] = d['gb.cost.mb.bucket'];
    countryData[countryCode]['mb']['percent.income'] = d['percent.income.mb'];
    countryData[countryCode]['mb']['percent.income.bucket'] = d['percent.income.mb.bucket'];

  }); // 'mobileData' iteration closure



  for(index in worldData.features){  // bind 'countryData' to 'worldData'
    countryCode = worldData.features[index].id;

    if(countryCode in countryData){

      // setup first 2 fields
      worldData.features[index]['mobile'] = {'gb': {},'mb': {}};
      worldData.features[index]['monthlyIncome'] = countryData[countryCode]["gni.month"];

      // loop through the 'mb' and 'gb' fields and assign
      for(unitType in countryData[countryCode]) {
        if(unitType != "gni.month" ) {

          for(field in countryData[countryCode][unitType]) {
            worldData.features[index]['mobile'][unitType][field] = countryData[countryCode][unitType][field];
          }
        }
      }
    }
    // debug for unmatched geojson countries
    //else {console.log(countryCode + " " + worldData.features[index].properties.name)}

  }; // worldData.features iteration closure



  // debug for unmatched mobileData countries
  /*var geocountries = worldData.features.map(function(d) {return d.id;});
  for(index in countryData) {
    if(geocountries.indexOf(index) == -1) {
      //debugger;
      console.log(index);
    }
  }*/


  // create tooltip
  tip = d3.tip().attr('class', 'd3-tip')
                .html(function(d) {
                  var content = '<p>' + d.properties.name + '</p>';
                  if(d.mobile != undefined){ // make sure we have mobile data

                    // remove monthly income per feedback here
                    //content += '<p>Monthly Income: $' + d.monthlyIncome + ' (USD)</p>';

                    if(comparisonArray != undefined && unitArray != undefined) { // make sure a comparison and unit has been specified, nothing from the get-go
                      unit = unitArray[1];
                      comparison = comparisonArray[1];

                      if(isNaN(d.mobile[unit][comparison])) {
                        content += "(no plans quoted in " + unit.toUpperCase()+ ")";
                      } else{

                        // per feedback include both cost and % in tooltip
                        content += '<p>Average Cost Per Gigabyte: $' + d.mobile[unit]['cost'] + ' (USD)</p>';
                        content += '<p>Cost as Percent of Income: ' + d.mobile[unit]['percent.income'] + '% (2GB/Month)</p>';
                        /*if(comparison == 'cost') {
                          content += '<p>' + comparisonArray[0] + ': $' + d.mobile[unit]['cost'] + ' (USD)</p>';
                        }
                        if(comparison == 'percent.income'){
                          content += '<p>' + comparisonArray[0] + ': ' + d.mobile[unit]['percent.income'] + '%</p>';
                        }*/

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
  tip.direction(function(d) {
    west = ["CHL", "ARG"];
    east = ["FJI"];
    if(west.indexOf(d.id) != -1){
      return "w";
    } else{
      if(east.indexOf(d.id) != -1){
      return "e";
      } else{return "s";}
    }
  });


  // create map
  map.selectAll('path') // creating paths
               .data(worldData.features) // coordinate data in '.features' array
               .enter()
               .append('path')
               .attr('d', path)
               .style('fill', 'gray')
               .style('stroke', 'white') // per feedback make individual countries more visible
               .style('stroke-width', 0.5)
               .attr("class", "country")
               .on('mouseover', tip.show)
               .on('mouseout', tip.hide);



  // apply/update choropleth
  function updateSelection(specsArray) {

    // CREATE COLOR SCALE

    // get sorted domain of buckets for the comparison specified
    var domain;
    var domainValues = [];
    var unitArr = specsArray[0];
    var unit = unitArr[1];
    var comparisonArr = specsArray[1];
    var comparisonBucket = comparisonArr[2];

    for(index in worldData.features) {
      var hasMobile = worldData.features[index]['mobile'];

      if(hasMobile != undefined) { // make sure country has mobile data

        if(unitArr != undefined && comparisonArr != undefined) { // make sure a comparison and unit has been specified, nothing from the get-go
          var domainVal = worldData.features[index]['mobile'][unit][comparisonBucket];

          if(domainValues.indexOf(domainVal) == -1 && domainVal != "NA"){ // only add new values
          domainValues.push(domainVal);
          }
        }
      }
    }

    // sort by lower bound of bucket's numerical value in increasing order
    domain = domainValues.sort(function(a, b){return +a.split("-")[0] - +b.split("-")[0]});

    // color scale
    var color = d3.scale.ordinal()
                .domain(domain)
                .range(colorbrewer['YlGnBu']['9'].slice(3));

    // fill in paths with color
    map.selectAll('path')
             .transition()
             .duration(800)
             .style('fill', function(d){
              var hasMobile = ('mobile' in d);
              // check if mobile data and data for unit and comparison
              //debugger;
              if(hasMobile && (d.mobile[unit][comparisonBucket] != "NA")) {
                return color(d.mobile[unit][comparisonBucket]);
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

    var legend = d3.select("#control-panel")
                    .append("svg") // separate svg for the legend
                    .attr("class", "legend")
                    .attr("width", width/2)
                    .attr("height", 75)
                    .append("g")
                    .attr("transform", "translate(0, " + 33 + ")");

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
                 .text(function(d){
                  if(comparisonArr[1] == 'cost'){
                    return "USD";
                  } else {return "%";}
                 });


  } // updateSelection closure


  
  // looking at the valid arguments for updateSelection we can see what data we want in the buttons
  var unitData = [['Small Plans (less than 1GB)', 'mb'], ['Large Plans (1GB or more)', 'gb']];
  var comparisonData = [['Average Cost per Gigabyte', 'cost', 'cost.bucket'],
  ['Cost as Percent of Income', 'percent.income', 'percent.income.bucket']];
  
  // unit buttons
  var unitTitle = d3.select("#control-panel")
                    .append("div")
                    .attr("class", "unitTitle")
                    .text("Size:");

  var unitButtons = d3.select("#control-panel")
                    .append("div")
                    .attr("class", "unitButtons")
                    .selectAll("button")
                    .data(unitData)
                    .enter()
                    .append("button")
                    .text(function(d) {
                        return d[0];
                    })
                    // side-by-side buttons
                    .attr("style", function(d) {
                      if(d[1] == "mb"){
                        return "float: left;";
                      } else {return "float: right;";}
                    })
                    .attr("class", "buttons")
                    .classed("button-default", true);

  unitButtons.on("click", function(d) {
    // reset all buttons first
    d3.select(".unitButtons")
                  .selectAll("button")
                  .classed("button-select", false)
                  .classed("button-default", true)
                  .transition()
                  .duration(600);
    d3.select(this)
                  .classed("button-select", true)
                  .transition()
                  .duration(600);
    unitArray = d;
    updateSelection([unitArray, comparisonArray]);
    });


  // comparison buttons
  var comparisonTitle = d3.select("#control-panel")
                    .append("div")
                    .attr("class", "comparisonTitle")
                    .text("Cost:");

  var comparisonButtons = d3.select("#control-panel")
                    .append("div")
                    .attr("class", "comparisonButtons")
                    .selectAll("button")
                    .data(comparisonData)
                    .enter()
                    .append("button")
                    .text(function(d) {
                        return d[0];
                    })
                    .attr("style", function(d) {
                      if(d[1] == "cost"){
                        return "float: left;";
                      } else {return "float: right;";}
                    })
                    .attr("class", "buttons")
                    .classed("button-default", true);;

  comparisonButtons.on("click", function(d) {
    // reset all buttons first
    d3.select(".comparisonButtons")
                  .selectAll("button")
                  .classed("button-select", false)
                  .classed("button-default", true)
                  .transition()
                  .duration(600);
    d3.select(this)
                  .classed("button-select", true)
                  .transition()
                  .duration(600);
    comparisonArray = d;
    updateSelection([unitArray, comparisonArray]);
    });


  // initiate the map on startup to MB and USD/GB
  var delay=1500; //1.5 seconds
  setTimeout(function(){
    d3.selectAll(".buttons")[0][0].click();
    d3.selectAll(".buttons")[0][2].click();
  }, delay);


} // callback closure