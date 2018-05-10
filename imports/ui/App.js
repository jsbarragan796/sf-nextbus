import React, { Component } from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Collection } from "../api/collection.js";
import Visualizacion from "./Visualizacion.js";
import { Jumbotron,
  Container,
  Form,
  FormGroup,
  InputGroup,
  Input,
  Label,
  InputGroupAddon,
  Button,
  Row,
  Col
} from "reactstrap";

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      queryInput: ""
    };
    this.handleChangeQuery = this.handleChangeQuery.bind(this);
    this.makeQuery = this.makeQuery.bind(this);
    this.update = this.update.bind(this);
  }

  handleChangeQuery (event) {
    this.setState({ queryInput: event.target.value });
  }
  makeQuery (event) {
    event.preventDefault();
    const query = this.state.queryInput;
    if (query !== "") {
      console.log("Query: " + query);
      Meteor.call("bus.query", query);
    }
  }
  update () {
    Meteor.call("bus.update");
  }

  searchBar () {
    return (
      <Form className="new-task" onSubmit={this.makeQuery} >
        <FormGroup>
          <Label for="query">Mensaje a enviar: </Label>
          <InputGroup>
            <Input
              id="query"
              type="text"
              value = {this.state.queryInput}
              onChange={this.handleChangeQuery}
              placeholder="insert query"
            />
            <InputGroupAddon addonType="append">
              <Button color="secondary">Enviar</Button>
              <Button onClick={this.update} color="danger">Update</Button>
            </InputGroupAddon>
          </InputGroup>
        </FormGroup>
      </Form>);
  }

  render () {
    console.log("render!");
    return (
      <div>
        <Jumbotron fluid>
          <Container fluid>
            <Row>
              <Col sm="4" className="centered">
                <img className="logo" src="/logo.png" alt="logo NextBus"/>
              </Col>
              <Col sm="8">
                <h1 className="display-3">NextBus</h1>
                <p className="lead">This is a modified jumbotron that occupies the
                entire horizontal space of its parent.</p>
              </Col>
            </Row>

          </Container>
        </Jumbotron>
        <div className="contenido">
          {this.searchBar()}
          <Visualizacion collection={this.props.collection} />
        </div>
      </div>
    );
  }
}
//prop types for App
App.propTypes = {
  collection: PropTypes.array.isRequired
};
export default withTracker(() => {
  Meteor.subscribe("collection");
  return {
    collection: Collection.find({}).fetch()
  };
})(App);
