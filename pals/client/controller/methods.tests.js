/* eslint-env mocha */

import 'meteor/meteor';
import { chai } from 'meteor/practicalmeteor:chai';

import '../../both/collections.js';

/*describe('insertModel', function() {
  it('allows a registered user to insert a model', function(done) {
    var newModel = makeModel("Model 1");
    Meteor.call('insertModel', newModel, function(err, ok) {
      chai.assert.isUndefined(err);
      done();
    });
  });
});*/

function makeModel(modelName) {
  var model = {
    name: modelName
  };

  return model;
}

/*describe('login', function() {
    it('allows a normal user to login', function(done) {
        Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
            chai.assert.isUndefined(err);
            done();
        });
    });
});*/
