var margin = 75;
    width = 1800 - margin,
    height = 800 - margin;

var svg = d3.select("#map")
    .append("svg")
    .attr("width", width + margin)
    .attr("height", height + margin)
    .append('g'); // container element within svg
    

var projection = d3.geo.mercator()
                  .scale(260)
                  .translate([width/2, height/1.7]);

var path = d3.geo.path().projection(projection);

// update selection argument variables need to be global for MULTIPLE button selection
var comparison;

// load data and callback
queue()
.defer(d3.json, "data/world_countries.json")
// remote "https://raw.githubusercontent.com/winkelman/udacity-dand-viz-project/master/data/world_countries.json"
.defer(d3.csv, "data/mobile-world-data.csv")
// remote "https://raw.githubusercontent.com/winkelman/udacity-dand-viz-project/master/data/mobile-world-data.csv"
.await(callback);



function callback(error, worldData, mobileData) {

  // get list of country codes from mobile data (list is redundant, make unique later?)
  var countries = mobileData.map(
    function(d) {return d['country.code'];}
    );

  // make country data object by country codes, 
  // empty cost per gb and cost as percent gni...
  var countryData = {};
  countries.forEach(function(d) {
    countryData[d] = {'costusdgb': '', "gnimonthly": '', "percentgni": '', 'costbucket': '', 'percentbucket': ''};
  });

  // construct country data object
  mobileData.forEach(function(d) {

    d['cost.usd.per.gb'] = +d['cost.usd.per.gb'];
    d['gni.month'] = +d['gni.month'];
    d['percent.income'] = +d['percent.income'];

    //debugger;

    countryData[d['country.code']]["costusdgb"] = d['cost.usd.per.gb'];
    countryData[d['country.code']]["gnimonthly"] = d['gni.month'];
    countryData[d['country.code']]["percentgni"] = d['percent.income'];
    countryData[d['country.code']]["costbucket"] = d['cost.usd.per.gb.bucket'];
    countryData[d['country.code']]["percentbucket"] = d['percent.income.bucket'];
    
    }); // mobileData iteration closure




  // bind mobile data in 'countryData' to world map data
  for(index in worldData.features){
    //debugger;
    countryCode = worldData.features[index].id;

    if(countryCode in countryData){
      worldData.features[index]['mobile'] = {};
      worldData.features[index]['monthlyIncome'] = countryData[countryCode]["gnimonthly"];
      worldData.features[index]['mobile']['costUSDGB'] = countryData[countryCode]["costusdgb"];
      worldData.features[index]['mobile']['costRelative'] = countryData[countryCode]["percentgni"];
      worldData.features[index]['mobile']['costBucket'] = countryData[countryCode]["costbucket"];
      worldData.features[index]['mobile']['relativeBucket'] = countryData[countryCode]["percentbucket"];
    }
  }; // worldData.features for loop closure


  tip = d3.tip().attr('class', 'd3-tip')
                .html(function(d) {
                  var content = '<p>' + d.properties.name + '</p>';
                  //debugger;
                  if(d.mobile != undefined){
                    if(comparison == 'costUSDGB'){
                      content += '<p>$' + d.mobile[comparison] + ' (USD)</p>';
                    }
                    if(comparison == 'costRelative'){
                      
                      content += '<p>' + d.mobile[comparison] + '%</p>';
                      content += '<p>Monthly Income: $' + d.monthlyIncome + ' (USD)</p>';
                    }
                  } else {
                    content += " (no data)";
                    }
                  return content;
                })
                .offset(function() {
                  return [0,0];
                });


  svg.call(tip);
  tip.direction('s');

  // create map
  var map = svg.selectAll('path') // creating paths
               .data(worldData.features) // data in '.features array'
               .enter()
               .append('path')
               .attr('d', path)
               .style('fill', 'gray')
               .attr("class", "country")
               .on('mouseover', tip.show)
               .on('mouseout', tip.hide);



  // apply choropleth
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

    // get domain of values and bucket variable for the comparison specified
    var domain;
    var scheme;
    if(comparison == 'costUSDGB') {
      domain = ['(0,2]', '(2,5]', '(5,10]', '(10,20]', '(20,30]', '(30,50]', '(50,Inf]'];
      scheme = 'costBucket';
    }
    if(comparison == 'costRelative') {
      domain = ['(0,1]', '(1,3]', '(3,5]', '(5,10]', '(10,20]', '(20,40]', '(40,Inf]'];
      scheme = 'relativeBucket';
    }

    // color scale
    var color = d3.scale.ordinal()
                .domain(domain)
                .range(colorbrewer['Blues']['9'].slice(2));


    // fill in paths with color
    svg.selectAll('path')
             .transition()
             .duration(800)
             .style('fill', function(d){
              //debugger;
              var hasMobile = ('mobile' in d);
              if(hasMobile){
                  return color(d.mobile[scheme]);
                } else{return "DimGray"}
             });


  } // updateSelection closure


  // for debugging...
  //comparison = 'costUSDGB';
  //updateSelection(comparison);

  

  // looking at the valid arguments for updateSelection we can see what data we want in the buttons
  
  var buttonData = [['Average Cost Per Gigabyte', 'costUSDGB'],
  ['Percent of Monthly Income (2GB)', 'costRelative']];

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
  
    comparison = d[1];
    //debugger;
    updateSelection(comparison);
    });





} // callback closure