import React, { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import { Row, Col } from "reactstrap";

export default class Visualizacion extends Component {
  constructor (props) {
    super(props);
    this.state = {
    };
    this.getDistance = this.getDistance.bind(this);
  }

  componentWillUpdate () {
    this.vgg();
  }

  vgg () {
    // var data = [
    //   { month: "Q1-2016", apples: 3840 },
    //   { month: "Q2-2016", apples: 1600 },
    //   { month: "Q3-2016", apples: 640 },
    //   { month: "Q4-2016", apples: 320 }
    // ];
    var collection = this.props.collection;
    if (collection.length > 0) {
      var data = collection[0].vehicle;
      var nestedBuses = d3.nest().key((d) => d.routeTag).entries(data);
      // console.log(nestedBuses);
      var keys = [];
      for (const [key, value] of Object.entries(nestedBuses)) {
        keys.push(key);
        var arrayLength = value.values.length;
        if (arrayLength === 1) {
          var objt = value.values[0];
          obj["distance"] = 0;
        }
        for (var i = 1; i < arrayLength; i++) {
          var obj = value.values[i - 1];
          var obj2 = value.values[i];
          obj["distance"] = this.getDistance(obj.lat, obj.lon, obj2.lat, obj2.lon);
        }
      }
      console.log(nestedBuses);

      // var stackedBuses = d3.stack()
      //   .keys(keys)
      //   .value((d, key) => {
      //     return key < d.values.length ? d.values[key].distance : 0;
      //   })(stackedBuses);
    }


    var d = 1;
    if (d === 3) {
      var data = collection[0].vehicle;
      var series = d3.stack()
        .keys(["speedKmHr"])
        .offset(d3.stackOffsetDiverging)(data);

      var svg = d3.select(this.svg);
      var margin = { top: 20, right: 30, bottom: 30, left: 60 };
      var width = +svg.attr("width");
      var height = +svg.attr("height");

      var x = d3.scaleBand()
        .domain(data.map(function (d) { return d.id; }))
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1);

      var y = d3.scaleLinear()
        .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
        .rangeRound([height - margin.bottom, margin.top]);

      var z = d3.scaleOrdinal(d3.schemeCategory10);

      svg.append("g")
        .selectAll("g")
        .data(series)
        .attr("fill", function (d) { return z(d.key); })
        .enter().append("g")
        .attr("fill", function (d) { return z(d.key); })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("width", x.bandwidth)
        .attr("x", function (d) { return x(d.data.id); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); });


      svg.append("g")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x));

      svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));

      svg.exit().remove();
    }

    function stackMin (serie) {
      return d3.min(serie, function (d) { return d[0]; });
    }

    function stackMax (serie) {
      return d3.max(serie, function (d) { return d[1]; });
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
          <Col sm="8" className="centered">
            <svg
              width="600"
              height="400"
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
