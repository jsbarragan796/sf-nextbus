import React, { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import { Row, Col } from "reactstrap";

export default class Visualizacion extends Component {
  constructor (props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount () {
    console.log("entrooooo");
    const graph = {
      nodes: [
        { name: "hola", age: 35 },
        { name: "hola1", age: 35 },
        { name: "hola2", age: 33 },
        { name: "hola3", age: 2 },
        { name: "hola4", age: 25 },
        { name: "hola5", age: 85 }
      ],
      links: [
        { source: "hola", target: "hola1" },
        { source: "hola", target: "hola2" },
        { source: "hola", target: "hola3" },
        { source: "hola", target: "hola4" },
        { source: "hola", target: "hola5" },
        { source: "hola5", target: "hola2" }
      ]
    };
    var canvas = d3.select(this.canvas);
    var width = canvas.attr("width");
    var height = canvas.attr("height");
    var ctx = canvas.node().getContext("2d");
    var r = 10;
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    var simulation = d3.forceSimulation()
      .force("x", d3.forceX(width / 2))
      .force("y", d3.forceY(width / 2))
      .force("collide", d3.forceCollide(r + 1))
      .force("charge", d3.forceManyBody(r + 1).strength(-200))
      .on("tick", update)
      .force("link", d3.forceLink().id((d) => {return d.name;}));

    // graph.nodes.forEach((d) => {
    //   d.x = Math.random() * width;
    //   d.y = Math.random() * height;
    // });
    simulation.nodes(graph.nodes);
    simulation.force("link")
      .links(graph.links);

    canvas.call(d3.drag()
      .container(canvas.node())
      .subject(dragsubject)
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    function dragsubject () {
      return simulation.find(d3.event.x, d3.event.y);
    }

    function update () {
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.globalAlpha = 3;
      ctx.strokeStyle = "#aaa";
      graph.links.forEach(drawLink);
      ctx.stroke();


      ctx.globalAlpha = 1;
      graph.nodes.forEach(drawNode);
    }

    function drawNode (d) {
      ctx.beginPath();
      ctx.fillStyle = color(d.party);
      ctx.moveTo(d.x, d.y);
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    function drawLink (d) {
      ctx.moveTo(d.source.x, d.source.y);
      ctx.lineTo(d.target.x, d.target.y);
    }

    function dragstarted () {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d3.event.subject.fx = d3.event.subject.x;
      d3.event.subject.fy = d3.event.subject.y;
    }

    function dragged () {
      d3.event.subject.fx = d3.event.x;
      d3.event.subject.fy = d3.event.y;
    }

    function dragended () {
      if (!d3.event.active) simulation.alphaTarget(0);
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }
    update();
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


  render () {
    return (
      <div className="visualizacion">
        <Row>
          <Col sm="4" className="centered">
            <canvas
              width="400"
              height="400"
              ref = {(canvas) => {this.canvas = canvas; return this.canvas; }}>
              vizualizacion de force
            </canvas>
          </Col>
          <Col sm="8" className="centered">
            <svg
              width="600"
              height="400"
              ref = {(svg) => {this.svg = svg; return this.svg; }}>
              vizualizacion de force
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
