import React, { Component } from "react";
import PropTypes from "prop-types";
import AccountsUIWrapper from "./AccountsUIWrapper.js";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Collection } from "../api/collection.js";
import { Comentarios } from "../api/comentarios.js";
import Visualizacion from "./Visualizacion.js";
import Comments from "./comments.js";
import { Jumbotron,
  Container,
  Row,
  Col,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  NavbarToggler,
  Collapse
} from "reactstrap";

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {
      queryInput: "",
      isOpen: false,
      rutas: []
    };
    this.handleChangeQuery = this.handleChangeQuery.bind(this);
    this.makeQuery = this.makeQuery.bind(this);
    this.update = this.update.bind(this);
    this.toggle = this.toggle.bind(this);
    this.setRutasList = this.setRutasList.bind(this);
  }

  setRutasList (list) {
    this.setState({
      rutas: list
    });
  }

  toggle () {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleChangeQuery (event) {
    this.setState({ queryInput: event.target.value });
  }
  makeQuery (event) {
    event.preventDefault();
    const query = this.state.queryInput;
    if (query !== "") {
      Meteor.call("bus.query", query);
    }
  }
  update () {
    setInterval(() => {
      Meteor.call("bus.update");
    }, 10000);
  }


  render () {
    console.log("render!");
    const usuario = this.props.usuario ? "Hi, " : "";

    const cometarios2 = this.props.usuario ? (
      <Comments comentarios={this.props.comentarios} collection={this.props.collection} usuario={this.props.usuario}/>
    ) : (<div>{ }</div>);

    this.update();
    return (
      <div>
        <Navbar color="faded" light expand="md">
          <NavbarBrand role="listitem">
            <img src="/logo.png" height="50" alt="Logo NextBus"/>
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink >
                  {usuario}
                  <AccountsUIWrapper />
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <Jumbotron fluid>
          <Container fluid>
            <Row>
              <Col sm="4" className="centered">
                <img className="logo" src="/logo.png" alt="logo NextBus"/>
              </Col>
              <Col sm="8">
                <h1 className="display-3">NextBus</h1>
                <p className="lead">Wondering how far buses of a route in San fransisco are apart from each  other? </p>
                <p className="lead">Wonder no more also you can read an make comments of a route.</p>
              </Col>
            </Row>

          </Container>
        </Jumbotron>
        <div className="contenido">
          <Visualizacion collection={this.props.collection} />
          {cometarios2}
        </div>
      </div>
    );
  }
}
//prop types for App
App.propTypes = {
  collection: PropTypes.array.isRequired,
  comentarios: PropTypes.array.isRequired,
  usuario: PropTypes.object
};
export default withTracker(() => {
  Meteor.subscribe("collection");
  Meteor.subscribe("comentarios");
  let user = Meteor.user();
  if ((user !== null && typeof user !== "undefined") &&
  (user.profile !== null && typeof user.profile !== "undefined")) {
    user.username = user.profile.name;
  }
  return {
    usuario: user,
    collection: Collection.find({}).fetch(),
    comentarios: Comentarios.find({}).fetch()
  };
})(App);
