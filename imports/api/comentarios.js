import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
export const Comentarios = new Mongo.Collection("comentarios");


if (Meteor.isServer) {
  // This code only runs on the server

  Meteor.publish("comentarios", function tasksPublication () {
    return Comentarios.find();
  });

  // This method will trigger the streamer
  Meteor.methods({
    "comentario.insert" (comentario, ruta) {
      check(comentario, String);
      check(ruta, String);
      if (!this.userId) {
        throw new Meteor.Error("not-authorized");
      }
      let user = Meteor.user();
      Comentarios.insert({
        userId: this.userId,
        username: user.profile.name,
        comentario: comentario,
        ruta: ruta
      });
    }

  });
}
