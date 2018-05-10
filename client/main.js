/* global $ */
import React from "react";
import App from "../imports/ui/App.js";
import { Meteor } from "meteor/meteor";
import { render } from "react-dom";

import "bootstrap/dist/css/bootstrap.min.css";


Meteor.startup(() => {
  $("html").attr("lang", "es");
  render(<App />, document.getElementById("render-target"));
});
