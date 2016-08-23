/* eslint-env mocha */

import { Template } from 'meteor/templating';
import { chai } from 'meteor/practicalmeteor:chai';
import { $ } from 'meteor/jquery';


import '../../both/collections.js'
import '../controller/models.js';
import '../controller/workspaces.js';
import '../../both/global.js';

var gab = Meteor.users.find({'emails.address':'gabsun@gmail.com'});
if (gab) gabId = gab._id;

describe('login', function() {
    it('allows a normal user to login', function(done) {
        Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
            chai.assert.isUndefined(err);
            done();
        });
    });
/*
    describe('create workspace', function() {
      it('creates a new workspace', function(done) {
        Router.go('/workspaces');

        var wsDiv = document.createElement("DIV");
        Blaze.render(Template.workspaces, wsDiv);
        var wsName = $(wsDiv).find('#workspace.name')
        wsName.text() = "trial";
        console.log($(wsDiv).find('#workspace.name').text());

        var addWS = $(wsDiv).find(".btn");
        console.log('enabled');console.log(addWS.is(':enabled'));
        addWS.click();
        console.log(Workspaces.find().fetch().length);
        done();

      });
    });
*/
    describe('models', function() {
        it('creates a new workspace')

        it('creates a new model')

        it('displays my models when My Models is selected', function () {
            Router.go('/models/mine');

            var div = document.createElement("DIV");
            Blaze.render(Template.models, div);

            var myModelNum = 0;
            var myModelNum = Models.find({owner: gabId}).count();
            modelsDisplayedNum = $(div).find('tr').length - 1;
            chai.assert.equal(myModelNum, modelsDisplayedNum);
        });

        it('displays models in current workspace when Models In Current Workspace is selected');

        it('navigates to listed model when the model details are clicked');

        it('deletes model from list when the delete button of that model is clicked');
    });


    it('allows logged in user to log out', function(done) {
        Meteor.logout(function (err) {
            chai.assert.isUndefined(err);
            done();
        });
    });


    it('does not allow unregistered user to login', function(done) {
        Meteor.loginWithPassword('nobody@nobody', 'stam', function(err) {
            chai.assert.isDefined(err);
            done();
        });
    });

});

describe('uploadDataSet', function() {
    it('')
});
