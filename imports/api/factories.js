import { faker } from '@faker-js/faker'
import { Factory } from 'meteor/dburles:factory'

import { Topograms } from './topograms/Topograms.js'
import { Nodes } from './nodes/Nodes.js'
import { Edges } from './edges/Edges.js'

Factory.define('topogram', Topograms, {
  createdAt: () => new Date(),
  title: () => 'New Topogram',
  slug : () => faker.helpers.slugify('New Topogram'),
  description : () => faker.lorem.paragraph()
})

Factory.define('node', Nodes, {
  createdAt: () => new Date(),
  topogramId: Factory.get('topogram'),
  data : {
  id : () => faker.string.uuid(),
    name: () => faker.lorem.sentence(),
  lat : () => faker.location.latitude(),
  lon : () => faker.location.longitude(),
    start : () => faker.date.past(),
    end : () => faker.date.future(),
  group : () => faker.hacker.noun(),
  weight : () => faker.number.int({ min: 1, max: 100 })
  }
})

Factory.define('edge', Edges, {
  createdAt: () => new Date(),
  topogramId: Factory.get('topogram'),
  data : {
  id : () => faker.string.uuid(),
    source : Factory.get('node'),
    target : Factory.get('node'),
    name: () => faker.lorem.sentence(),
  lat : () => faker.location.latitude(),
  lon : () => faker.location.longitude(),
    start : () => faker.date.past(),
    end : () => faker.date.future(),
  group : () => faker.hacker.noun(),
  weight : () => faker.number.int({ min: 1, max: 100 })
  }
})
