﻿((OJ) ->
  nodeName = 'x-easypie'
  className = 'easypie'
  
  OJ.components.members[nodeName] = className
  OJ.components.register className, (options, owner) ->
    defaults = 
      config:
        barColor: '#efefef'
        percent: '50'
        size: '95'
        lineWidth: ''
        trackColor: '#efefef'
        scaleColor: 'false'
      data: []
      props: 
        class: 'chart easy-pie inline-block primary'
    
    OJ.extend defaults, options
    cmpnt = OJ.component defaults, owner, nodeName 
    defaults.props['data-percent'] = defaults.config.percent
    
    ret = cmpnt.div defaults
    
    ret.$.easyPieChart defaults.config
    
    ret

  return
) ((if typeof global isnt 'undefined' and global then global else ((if typeof window isnt 'undefined' then window else this)))).OJ