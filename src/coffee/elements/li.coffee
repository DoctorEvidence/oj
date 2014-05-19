((OJ)->
  'use strict'
  
  nodeName = 'li'
  
  OJ.nodes.register nodeName, (options, owner = OJ.body, calledFromFactory = false) ->
    
    defaults =
      props: {}
      styles: {}
      events:
        click: _.noop
    
    OJ.extend defaults, options, true
    ret = OJ.element nodeName, defaults.props, defaults.styles, defaults.events, defaults.text
    
    
    if false is calledFromFactory then OJ.nodes.factory ret, owner

    ret

  return

) ((if typeof global isnt 'undefined' and global then global else ((if typeof window isnt 'undefined' then window else this)))).OJ