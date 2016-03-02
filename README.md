
# Data Visualization

This is the fifth project for the Data Analyst Nanodegree and accompanies the [Data Visualization and D3.js](https://www.udacity.com/course/data-visualization-and-d3js--ud507) course from Udacity.  In this project we use d3.js and design principles to create a data visualization that tells a story an audience.  The visualization is iterated on a few times which allows us to incorporate feedback from peers in the course.

The interactive visualization can be viewed here:
http://bl.ocks.org/winkelman/raw/b5932f21378f1459657b/

#### Summary

This visualization is a choropleth map on a mercator projection of the globe.  There are buttons on the bottom left that enable you to color the choropleth by plan size.  Additional buttons allow you to see the average cost in per gigabyte in USD or relative cost of typical mobile usage as a percent of the average income for that country.  Typical mobile usage is assumed to be approximately 2GB per month based on anecdotal information from undocumented sources on the internet.

#### Design

I decided to keep this choropleth map as simple as possible without compromising the overall message.  The hue of the fill is based upon 1 of 6 discrete buckets for the combined selection.  The dynamic legend that pops-up below the map (once a combination is selected) allows you to see the values for these discrete buckets.  If you want to know the exact amount in USD or percent, hovering over a country will give that information in a tooltip.

#### Feedback

[First Iteration](http://bl.ocks.org/winkelman/raw/1bde4378489da1118e7b/)

After some initial feedback, I chose to lump data for all plan expirations together.  Originally there were buttons to facet the map by expiry/duration but because not all countries have plans with similar expiry, this left parts of the map bare with no color (essentially no data).  Also, I limited the information in the tooltip to the buttons selected.  At first the tooltip included all of the information but it was large and visually overwhelming.  Color was changed to represent buckets instead of numerical values which improved color distribution.  I also added a legend for reference.

[Second Iteration](http://bl.ocks.org/winkelman/raw/ac17f67a45ee4eeee707/)

I realized that there were some errors in currency codes for the 2015 mobile dataset.  Seeing that 2014 data was more polished without these problems, I switched to the 2014 dataset from here on out.  Based upon feedback from the second iteration, I increased the size of the stroke on the map.  This helped to make each country more visible.  Also, I dropped monthly income information but included both cost per gigabyte and cost as percent of income in the tooltip (the tooltip updates for plan size only).  This helped to cut down on the amount of back and forth between getting relevant information and button clicking.  For those countries with no plans for a particular plan size or type, I added that info to the tooltip as well.

[Third Iteration](http://bl.ocks.org/winkelman/raw/4f5e6fd91bd71c2e90e9/)

The buttons needed to be more visible.  Text was moved to the left of the page so that the buttons could be seen without scrolling.  Because the map was originally bare, it wasn't apparent that it could be colored.  I initiated the map comparing small plans and cost per gigabyte after a brief delay.

#### Methods

In order to get all the information needed I combined 2 different datasets.  One with mobile data and the other with income information. Average cost per GB was calculated based upon the plans offered in that country.  The mobile dataset did not include the number of subscribers for each plan, so my average cost is not what people are paying but what is offered.  Giving equal weight to each plan does have it's limitations.  Not all plans will have a similar number of subscribers, but if a provider has a plan that is so expensive that nobody uses it, my method will still factor it into the average cost per GB for that country.  I think it's safe to assume that this won't happen as providers typically do a fair amount of homework and offer plans based upon existing demand.

Relative cost is based upon a usage of 2GB per month which I found to be more or less an average for people in the US.  I decided to extend this benchmark to people in all countries based upon the assumption that most people in the US use data without thinking about usage limits, and if people in the rest of the world didn't have to, they would use a similar amount.

To compensate for any errors in calculating precise costs or percentages, I decided to use buckets.  This also helped to distribute color across the map.  The first three buckets more or less correspond to the first 3 quartiles, with the last three buckets accounting for the final quartile and extreme outliers.

While exploring the data, it became obvious that the price for 1GB of usage was dramatically different if a person was to consume this incrementally with plans quoted in MB (meaning they have less than 1GB of allowance) versus plans quoted in GB (having at least 1GB of allowance).  Because of this, I separated cost by a plan's unit type (MB or GB).  This gives the viewer the opportunity to see how difficult it might be to afford 'normal usage' for somebody who can't afford to buy a bulk plan.

In a few cases I used 2013 or 2012 GNI where 2014 wasn't available.  GNI didn't seem to fluctuate too much over the course of a year or two.  Unlimited plans were not included since there was no easy way to get a cost per GB.  This left a few countries with sparse data, especially Finland who had all but one unlimited plan.  No distinction was made between pre and post paid plans as the difference in price was negligible.  Plans including voice and sms were lumped together with pure data plans for the same reason.  Although price across plan expiration did vary somewhat, it did not as dramatically as price across unit type/plan size so these were also combined.  Another thing that was difficult to account for, but worth mentioning, is the network type of the plan.  Most networks in 3rd world countries are not as developed as in the 1st world which can affect price.  Finally, the costs do not include connection charges or tax (VAT).
    
#### Resources

* [D3 API](https://github.com/mbostock/d3/wiki/API-Reference)
* [D3-tip by Caged](http://labratrevenge.com/d3-tip/)
* [Threshold Key by Mike Bostock](http://bl.ocks.org/mbostock/4573883)
* [Udacity's Data Visualization and D3.js course](https://www.udacity.com/courses/ud507/)