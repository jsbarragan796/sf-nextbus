import React, { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import * as d3Chromatic from "d3-scale-chromatic";
import { Row, Col } from "reactstrap";

export default class Visualizacion extends Component {
  constructor (props) {
    super(props);
    this.state = {
    };

    this.margin = { top: 20, right: 50, bottom: 30, left: 40 };
    this.maxNumBuses = 23;
    this.getDistance = this.getDistance.bind(this);
  }

  componentDidMount () {
    this.vgg();
  }

  componentWillUpdate (newProps) {
    this.svgUpdate(newProps);
  }

  vgg () {
    const svg = d3.select(this.svg);
    this.height = svg.attr("height") - this.margin.top - this.margin.bottom;
    this.width = svg.attr("width") - this.margin.left - this.margin.right;
    this.g = svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.x = d3.scaleBand()
      .rangeRound([0, this.width - this.margin.left - this.margin.right])
      .paddingInner(0.05)
      .align(0.01);

    this.y = d3.scaleLinear()
      .rangeRound([this.height - this.margin.top - this.margin.bottom, 0]);

    this.z = d3.scaleSequential(d3Chromatic.interpolateBlues);

    this.g.append("g")
      .attr("class", "axis-x")
      .attr("transform", "translate(0," + (this.height - this.margin.top - this.margin.bottom) + ")");

    this.g.append("g")
      .attr("class", "axis-y")
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Added distance");


    this.legend = this.g.append("g")
      .attr("class", "axis-z")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end");


    this.svgUpdate(this.props);
  }

  svgUpdate (props) {
    var data = [];

    if (props.collection && props.collection.length > 0) {
      var collection = props.collection;
      data = collection[0].vehicle;
      var nestedBuses = d3.nest().key((d) => d.routeTag).entries(data);

      var keys = d3.range(this.maxNumBuses);

      for (let route of nestedBuses) {
        route.total = 0;
        route.values[0].distance = 0;
        for (let i = 1; i < route.values.length; i++) {
          route.values[i].distance = this.getDistance(+route.values[i - 1].lat, +route.values[i - 1].lon,
            +route.values[i].lat, +route.values[i].lon);
          route.total += route.values[i].distance;
        }
      }

      nestedBuses.sort(function (a, b) { return b.total - a.total; });


      var stackedBuses = d3.stack()
        .keys(keys)
        .value((d, key) => {
          return key < d.values.length ? d.values[key].distance : 0;
        })(nestedBuses);

      this.x.domain(nestedBuses.map((d) => { return d.key; }));
      this.y.domain([0, d3.max(nestedBuses, (d) => { return d.total; })]).nice();
      this.z.domain([0, this.maxNumBuses]);
      var list = stackedBuses.map((d) => { return d.key; });
      console.log(list);

      this.g.select(".bars").remove();

      this.g.append("g")
        .attr("class", "bars");

      const bars = this.g.select(".bars")
        .selectAll("g")
        .data(stackedBuses);


      bars.enter().append("g")
        .attr("fill", (d) => { return this.z(d.key); })
        .attr("stroke", "white")
        .selectAll("rect")
        .data((d) => { return d; })
        .enter().append("rect")
        .attr("x", (d) => { return this.x(d.data.key); })
        .attr("y", (d) => { return this.y(d[1]); })
        .attr("height", (d) => { return this.y(d[0]) - this.y(d[1]); })
        .attr("width", this.x.bandwidth());


      const xUpdate = this.g.select(".axis-x");

      xUpdate.transition()
        .duration(900)
        .call(d3.axisBottom(this.x));

      xUpdate.exit()
        .remove();

      const yUpdate = this.g.select(".axis-y");

      yUpdate.call(d3.axisLeft(this.y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", this.y(this.y.ticks().pop()) + 0.5)
        .text("Added distance");


      yUpdate.exit()
        .remove();


      const z = this.g.select(".axis-z")
        .selectAll("g")
        .data(keys.slice().reverse());

      const EnterZ = z.enter().append("g")
        .attr("transform", (d, i) => { return "translate(-50," + i * 20 + ")"; });

      EnterZ.append("rect")
        .attr("x", this.width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", this.z);

      EnterZ.append("text")
        .attr("x", this.width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text((d) => { return d; });

      z.select("rect")
        .attr("x", this.width - 19)
        .attr("fill", this.z);

      z.select("text")
        .text((d) => { return d; });
    }
  }

  getDistance (lat1, lon1, lat2, lon2) {
    function deg2rad (deg) {
      return deg * (Math.PI / 180);
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  render () {
    return (
      <div className="visualizacion">
        <Row>
          <Col sm="12" className="centered">
            <svg
              width="1200"
              height="600"
              ref = {(svg) => {this.svg = svg; return this.svg; }}>
              vizualizacion distances of  buses
            </svg>
          </Col>
        </Row>

      </div>
    );
  }
}


//Props del Home
Visualizacion.propTypes = {
  collection: PropTypes.array.isRequired
};
