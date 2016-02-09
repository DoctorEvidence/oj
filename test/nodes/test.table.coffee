qunit = require 'qunit'

qunit.module 'table', setup: ->
  OJ['GENERATE_UNIQUE_IDS'] = true
    
  
test 'Test the Table node', ->
  expect 25
  node = OJ.body.make 'table'
    
  # Test 1: tagName is table
  deepEqual node.tagName is 'table', true, 'Node is a table'
    
  nodeId = node.getId() 
  dNode = document.getElementById nodeId
  # Test 2: node is in the DOM
  ok dNode, 'Node is in the DOM' 
    
  # Test 3: IDs are equal
  deepEqual nodeId, dNode.id, 'Element IDs are equal'
    
  # Test 4*10: chaining works
  i = 0
  while i < 10
    child = node.cell Math.floor((Math.random() * 100) + 1), Math.floor((Math.random() * 100) + 1)
    childId = child.getId()
    deepEqual child.tagName is "td", true, "Node is a td"
    # Test 5*10: chained node is in the DOM
    cNode = document.getElementById childId
    deepEqual cNode.id, childId, 'Element IDs are equal'
    i += 1
    
  node.remove()
  equal `undefined`, document.getElementById(nodeId), 'Node has been removed'
  equal `undefined`, document.getElementById(childId), 'Child has been removed'