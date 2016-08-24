import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from '../both/collections.js'

import './main.html';
 
/*var gab = Meteor.users.findOne({'emails.address':'gabsun@gmail.com'});
if (gab)
    gabId = gab._id;
Roles.addUsersToRoles(gabId, 'edit', Roles.GLOBAL_GROUP);
Roles.addUsersToRoles(gabId, 'access', 'all workspaces');

var dannyId = Meteor.users.findOne({'emails.address':'ravdanny@gmail.com'})._id;
Roles.addUsersToRoles(dannyId, 'edit', 'datasets');
Roles.addUsersToRoles(dannyId, 'edit', 'models');
Roles.addUsersToRoles(dannyId, 'edit', 'experiments');
*/
