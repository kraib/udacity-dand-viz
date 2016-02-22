
# Data Visualization

This is the fifth project for the Data Analyst Nanodegree and accompanies the [Data Visualization and D3.js](https://www.udacity.com/course/data-visualization-and-d3js--ud507) course from Udacity.  In this project we use d3.js and design principles to communicate a story the audience...

The interactive graphic can be viewed here:
http://winkelman.github.io/udacity-dand-viz-project/

#### Summary

This visualization is a choropleth map on a mercator projection of the globe.  There are buttons on the bottom left that enable you to color the choropleth by plan size.  Additional buttons allow you to see the average cost in per gigabyte in USD or relative cost of typical mobile usage as a percent of the average income for that country.  Typical mobile usage is assumed to be approximately 2GB per month based on anecdotal information from undocumented sources on the internet.

#### Design

I decided to keep this choropleth map as simple as possible without compromising the overall message.  The hue of the fill is based upon 1 of 6 discrete buckets for the combined selection.  The dynamic legend that pops-up below the map (once a combination is selected) allows you to see the values for these discrete buckets.  If you want to know the exact amount in USD or percent, hovering over a country will give that information in a tooltip.

#### Feedback

After some initial feedback, I elected to lump data for all expiry together.  Originally there were buttons to facet the map by expiry type but because not all countries have plans with similar expiry this left parts of the map bare with no color (essentially no data).  Also, I limited the information in the tooltip to the buttons selected.  At first the tooltip included all of the information but it was large and visually overwhelming.  Color was changed to represent buckets instead of numerical values which improved color distribution.

From secondary feedback, I increased the size of the stoke on the map.  This helped to make each country more visible.  Also, I excluded monthly income information but included both cost per gigabyte and cost as percent of income for the plan size selected.  This helped to cut down on the amount of back and forth between button clicking and seeing relevant information in the tooltip.
    
#### Resources

* [D3 API](https://github.com/mbostock/d3/wiki/API-Reference)
* [D3-tip by Caged](http://labratrevenge.com/d3-tip/)
* [Threshold Key by Mike Bostock](http://bl.ocks.org/mbostock/4573883)
* [Jerome Cukier's D3 Articles](http://www.jeromecukier.net/blog/2011/08/11/d3-scales-and-color/)
* [Udacity's Data Visualization and D3.js course](https://www.udacity.com/courses/ud507/)