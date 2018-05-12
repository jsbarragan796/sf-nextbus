import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { HTTP } from "meteor/http";
export const Collection = new Mongo.Collection("collection");


if (Meteor.isServer) {
  // This code only runs on the server

  let hola = true;

  Meteor.publish("collection", function tasksPublication () {
    return Collection.find();
  });

  // This method will trigger the streamer
  Meteor.methods({
    "bus.query" (query) {
      check(query, String);
      check(query !== "", true);
      console.log("Query search: " + query);
    },
    "bus.update" () {
      console.log("Query search: ");
      try {
        var all = Collection.find({}).fetch();
        if (all.length > 0) {
          var time = all[0].lastTime.time;
          var milliseconds = (new Date()).getTime();
          console.log(milliseconds - time);
          if (milliseconds - time > 10000) {
            Collection.remove({});
            const result = HTTP.call("GET",
              "http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=sf-muni&t=1525923010278"
            );
            const result2 = HTTP.call("GET",
              "http://localhost:3000/data.json"
            );
            if (hola) {
              Collection.insert(result.data);
              hola = !hola;
            } else {
              Collection.insert(result2.data);
              hola = !hola;
            }
          }
        }
      } catch (e) {
      // Got a network error, timeout, or HTTP error in the 400 or 500 range.
        throw e;
      }
    }
  }); //Meteor.methods
}
