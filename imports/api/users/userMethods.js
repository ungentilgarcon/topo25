import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from '/imports/schemas/SimpleSchema'

export const updateUserName = new ValidatedMethod({
  name: 'user.updateUserName',
  validate: new SimpleSchema({ 'userName': { type: String } }).validator(),
  run({ userName, userId=this.userId }) {

    if(!userId) return

    return Meteor.users.update(
      userId,
      {$set: {"username": userName}}
    );
  }
})
