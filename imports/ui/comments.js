import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import * as d3 from "d3";
import { Row, Col, ListGroup, ListGroupItem,
  ListGroupItemHeading, ListGroupItemText,
  InputGroup, InputGroupAddon, Button, Input, Label } from "reactstrap";

export default class Comments extends Component {
  constructor (props) {
    super(props);
    this.state = {
      comentarioInput: "",
      rutaInput: ""
    };

    this.handleChangecomentario = this.handleChangecomentario.bind(this);
    this.handleChangeRuta = this.handleChangeRuta.bind(this);
    this.makecomentario = this.makecomentario.bind(this);
  }

  componentDidMount () {

  }

  componentWillUpdate (newProps) {
    this.getComentarios(newProps);
  }

  handleChangecomentario (event) {
    this.setState({ comentarioInput: event.target.value });
  }
  handleChangeRuta (event) {
    this.setState({ rutaInput: event.target.value });
  }


  makecomentario (event) {
    event.preventDefault();
    const comentario = this.state.comentarioInput;
    const ruta = this.state.rutaInput;
    const nombre = this.props.usuario.username;
    if (comentario !== "" && ruta !== "") {
      Meteor.call("comentario.insert", comentario, ruta, nombre);
      this.setState({ comentarioInput: "" });
      this.setState({ rutaInput: "" });
    }
  }

  getComentarios (props) {
    this.imputRuta = "";
    if (props.collection && props.collection.length > 0) {
      var collection = props.collection;
      var data = collection[0].vehicle;
      var nestedBuses = d3.nest().key((d) => d.routeTag).entries(data);

      var keys = d3.range(this.maxNumBuses);

      nestedBuses.sort(function (a, b) { return b.total - a.total; });

      d3.stack()
        .keys(keys)
        .value((d, key) => {
          return key < d.values.length ? d.values[key].distance : 0;
        })(nestedBuses);

      this.list = nestedBuses.map((d) => { return d.key; });
      this.imputRuta = this.list.map((d, i) => {
        return (
          <option key={i}>{d}</option>
        );
      });
    }
    if (props.comentarios && props.comentarios.length > 0 && this.state.rutaInput !== "") {
      var comentarios = props.comentarios;
      var filtered = comentarios.filter((c) => {
        return c.ruta === this.state.rutaInput;
      });

      var resp = filtered.map((n, i) => {
        return (
          <ListGroupItem key={i}>
            <ListGroupItemHeading>n.username</ListGroupItemHeading>
            <ListGroupItemText>
             n.comentario
            </ListGroupItemText>
          </ListGroupItem>);
      });
      return resp;
    } else {
      return (
        <ListGroupItem>
          <ListGroupItemHeading>No comments yet</ListGroupItemHeading>
          <ListGroupItemText>
         Be the first to leave a comment
          </ListGroupItemText>
        </ListGroupItem>
      );
    }
  }

  render () {
    return (
      <div className="visualizacion">
        <Row>
          <Col sm="3">
            { }
          </Col>
          <Col sm="6">
            <div className="">
              <InputGroup>
                <Label for="exampleSelect">Select a route to comment</Label>
                <Input
                  type="select"
                  name="select"
                  id="exampleSelect"
                  value = {this.state.rutaInput}
                  onChange={this.handleChangeRuta}
                >
                  {this.imputRuta}
                </Input>
              </InputGroup>

              <ListGroup>
                {this.getComentarios(this.props)}
              </ListGroup>
            </div>
            <InputGroup>
              <Input
                id="comentario"
                type="text"
                value = {this.state.comentarioInput}
                onChange={this.handleChangecomentario}
                placeholder="insert comentario"/>
              <InputGroupAddon addonType="append">
                <Button onClick={this.makecomentario} color="success">Comment</Button>
              </InputGroupAddon>
            </InputGroup>
          </Col>
        </Row>

      </div>
    );
  }
}
//Props del Home
Comments.propTypes = {
  comentarios: PropTypes.array.isRequired,
  collection: PropTypes.array.isRequired,
  usuario: PropTypes.object
};
