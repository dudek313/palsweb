/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/*
import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import 'meteor/meteor';
import { sinon } from 'meteor/practicalmeteor:sinon';


import { withRenderedTemplate } from './helpers.app-test.js';
import '../../both/collections.js';
import './datasets.js';

describe('Data set tests', function(done) {

  before(function(done) {
    Meteor.loginWithPassword('gabsun@gmail.com', 'password', function(err) {
      try {
        chai.assert.isUndefined(err);
        var user = Meteor.user();
        chai.assert.equal(user.emails[0].address, 'gabsun@gmail.com');
      } catch(error) {
        done(error);
      }
    });

    Meteor.call('test.resetDatabase', done);

  });

  after(function(done) {
    Meteor.logout(function(err) {
      try {
        chai.assert.isUndefined(err);
        var user = Meteor.user();
        chai.assert.isNull(user);
      } catch(error) {
        done(error);
      }
      done();
    });
  });

  describe('Create a new data set', function() {
    before(function() {
      var screenMode = { params: { screenMode: 'create' }};
      sinon.stub(Router, 'current', () => screenMode);
    });

    after(function() {
      Router.current.restore();
    })

    it('allows creation of a data set', function(done) {
      withRenderedTemplate('dataSet', {}, el => {
        $(el).find('input[name="name"]').val("Data Set X");
        chai.assert.equal($(el).find('input[name="name"]').val(), "Data Set X");
        $(el).find('select[name="type"]').val("flux tower");
        chai.assert.equal($(el).find('select[name="type"]').val(), "flux tower");
        $(el).find('select[name="spatialLevel"]').val("SingleSite");
        chai.assert.equal($(el).find('select[name="spatialLevel"]').val(), "SingleSite");
        $(el).find('button.upload-btn').click();
        setTimeout(null, 300);
//        $(el).find('input[type="file"]').val("C:\\Users\\Danny\\Downloads\\pals-nci\\webappdata\\axel\\mo24829.nc");
        var createBtn = $(el).find('button.create-btn');
        chai.assert.notEqual(createBtn, [], 'Save button is not appearing');
        $(el).find('button.create-btn').click();
        setTimeout(function() {
          var newDataSet = DataSets.findOne({name: 'Data Set X'});
          chai.assert.isDefined(newDataSet);
          done();
        }, 1000);

      });
    });

  });
*/
/*  describe('Data set display list page', function(done) {
    before(function(done) {
      var newDataSet = makeDataSet("Data Set 2");
      Meteor.call('insertDataSet', newDataSet, function(err, dsId) {
        try {
          chai.assert.isUndefined(err);
          var insertedDataSet = DataSets.findOne({_id: dsId});
          chai.assert.equal(insertedDataSet.length, 1);
        } catch(error) {
          done(error);
        }
      });
      var resolution = { params: {resolution: 'All', source: 'anywhere' }};
      sinon.stub(Router, 'current', () => resolution);
      done();
    });

    after(function(done) {
      Router.current.restore();
      done();
    })

    it('displays a data set', function(done) {
      Router.go('/dataSets/anywhere/All');

      withRenderedTemplate('dataSets', {}, el => {
        console.log($(el).find('tr'));
        chai.assert.equal($(el).find('tr').length, 2, 'wrong number of rows in table');
        chai.assert.equal($(el).find('td')[0].textContent, "Data Set 2");
        done();
      });
    });

  });



});
*/



function makeModel(modelName) {
  var model = {
    name: modelName
  };

  return model;
}

function makeDataSet(dataSetName) {
  var dataSet = {
    name: dataSetName,
    type: 'flux tower',
    spatialLevel: 'SingleSite'
  };

  return dataSet;
}
