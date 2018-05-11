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
    this.height = 600;
    this.width = 1500;
    this.margin = { top: 20, right: 50, bottom: 30, left: 40 };
    this.maxNumBuses = 23;
    this.getDistance = this.getDistance.bind(this);
  }

  componentWillUpdate () {
    this.vgg();
  }

  vgg () {
    var collection = this.props.collection;
    var data = [];
    if (collection.length > 0) {
      data = collection[0].vehicle;
      var nestedBuses = d3.nest().key((d) => d.routeTag).entries(data);
      var keys = [];
      for (const [key, values] of Object.entries(nestedBuses)) {
        keys[key] = key;
        var arrayLength = values.values.length;
        if (arrayLength === 1) {
          var objt = values.values[0];
          objt["distance"] = 0;
        }
        for (var i = 1; i < arrayLength; i++) {
          var obj = values.values[i - 1];
          var obj2 = values.values[i];
          obj["distance"] = this.getDistance(obj.lat, obj.lon, obj2.lat, obj2.lon);
        }
      }
      // console.log(keys);

      var stackedBuses = d3.stack()
        .keys(keys)
        .value((d, key) => {
          return key < d.values.length ? d.values[key].distance : 0;
        })(nestedBuses);

      console.log(stackedBuses);
      var getSVG = this.getSVG(nestedBuses, stackedBuses, keys);
    }
  }

  getSVG (nestedBuses, stackedBuses, keys) {
    const svg = d3.select(this.svg);
    this.g = svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.x = d3.scaleBand()
      .rangeRound([0, this.width - this.margin.left - this.margin.right])
      .paddingInner(8)
      .align(0.1);

    this.y = d3.scaleLinear()
      .rangeRound([this.height - this.margin.top - this.margin.bottom, 0]);

    this.z = d3.scaleSequential(d3Chromatic.interpolateBlues);

    this.x.domain(nestedBuses.map((d) => { return d.key; }));
    this.y.domain([0, d3.max(nestedBuses, (d) => { return d.total; })]).nice();
    this.z.domain([0, this.maxNumBuses]);

    this.g.append("g")
      .selectAll("g")
      .data(stackedBuses)
      .enter().append("g")
      .attr("fill", (d) => { return this.z(d.key); })
      .attr("stroke", "white")
      .selectAll("rect")
      .data((d) => { return d; })
      .enter().append("rect")
      .attr("x", (d) => { return this.x(d.data.key); })
      .attr("y", (d) => {
        // console.log(d);
        return 5;
      })
      .attr("height", (d) => {
        // console.log(d);
        return 90;
      })
      .attr("width", this.x.bandwidth());

    this.g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (this.height - this.margin.top - this.margin.bottom) + ")")
      .call(d3.axisBottom(this.x));

    this.g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(this.y).ticks(null, "s"))
      .append("text")
      .attr("x", 2)
      .attr("y", 3)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Added distance");
    // this.y(this.y.ticks().pop()) + 0.5
    this.legend = this.g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", (d, i) => { return "translate(-50," + i * 20 + ")"; });

    this.legend.append("rect")
      .attr("x", this.width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", this.z);

    this.legend.append("text")
      .attr("x", this.width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text((d) => { return d; });

    return svg.node();
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
              width={this.width}
              height={this.height}
              ref = {(svg) => {this.svg = svg; return this.svg; }}>
              vizualizacion distances of  buses
            </svg>
            {this.vgg()}
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
