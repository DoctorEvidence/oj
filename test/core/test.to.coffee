((OJ) ->
  module OJ.name + ".to.string"
  test OJ.name + ".to.string(null)", ->
    expect 16
    deepEqual OJ.to.string(null) is "", true, OJ.name + ".to.string converts null to string empty."
    deepEqual OJ.to.string(null, "a") is "a", true, OJ.name + ".to.string converts null to 'a'."
    deepEqual OJ.to.string(`undefined`) is "", true, OJ.name + ".to.string converts undefined to string empty."
    deepEqual OJ.to.string(`undefined`, "a") is "a", true, OJ.name + ".to.string converts undefined to 'a'."
    deepEqual OJ.to.string(NaN) is "", true, OJ.name + ".to.string converts NaN to ''."
    deepEqual OJ.to.string(Infinity) is "", true, OJ.name + ".to.string converts Infinity to ''."
    deepEqual OJ.to.string({}) is "", true, OJ.name + ".to.string converts {} to string empty."
    deepEqual OJ.to.string(
      a: "a"
      1: "1"
      x: false
      y: []
    ) is "", true, OJ.name + ".to.string converts {a: 'a', 1: '1', x: false, y: []} to string empty."
    deepEqual OJ.to.string({}, "a") is "a", true, OJ.name + ".to.string converts {} to 'a'."
    deepEqual OJ.to.string([]) is "", true, OJ.name + ".to.string converts [] to string empty."
    deepEqual OJ.to.string([
      1
      "1"
      false
      {}
      []
    ]) is "", true, OJ.name + ".to.string converts [1, '1', false, {}, []] to string empty."
    deepEqual OJ.to.string([], "a") is "a", true, OJ.name + ".to.string converts [] to 'a'."
    deepEqual OJ.to.string(1, "a") is "1", true, OJ.name + ".to.string converts 1 to '1'."
    deepEqual OJ.to.string(0, "a") is "0", true, OJ.name + ".to.string converts 0 to '0'."
    deepEqual OJ.to.string(true, "a") is "true", true, OJ.name + ".to.string converts true to 'true'."
    deepEqual OJ.to.string(false, "a") is "false", true, OJ.name + ".to.string converts false to 'false'."
    return

  module OJ.name + ".to.bool"
  test OJ.name + ".to.bool(null)", ->
    expect 17
    deepEqual OJ.to.bool(null), false, OJ.name + ".to.bool converts null to false."
    deepEqual OJ.to.bool(`undefined`), false, OJ.name + ".to.bool converts undefined to false."
    deepEqual OJ.to.bool(NaN), false, OJ.name + ".to.bool converts NaN to false."
    deepEqual OJ.to.bool(Infinity), false, OJ.name + ".to.bool converts Infinity to false."
    deepEqual OJ.to.bool(-Infinity), false, OJ.name + ".to.bool converts -Infinity to false."
    deepEqual OJ.to.bool({}), false, OJ.name + ".to.bool converts {} to false."
    deepEqual OJ.to.bool([]), false, OJ.name + ".to.bool converts [] to false."
    deepEqual OJ.to.bool(new Date()), false, OJ.name + ".to.bool converts new Date() to false."
    deepEqual OJ.to.bool(5), false, OJ.name + ".to.bool converts 5 to false."
    deepEqual OJ.to.bool(0), false, OJ.name + ".to.bool converts 0 to false."
    deepEqual OJ.to.bool("0"), false, OJ.name + ".to.bool converts '0' to false."
    deepEqual OJ.to.bool("false"), false, OJ.name + ".to.bool converts 'false' to false."
    deepEqual OJ.to.bool(false), false, OJ.name + ".to.bool converts false to false."
    deepEqual OJ.to.bool(1), true, OJ.name + ".to.bool converts 1 to true."
    deepEqual OJ.to.bool("1"), true, OJ.name + ".to.bool converts '1' to true."
    deepEqual OJ.to.bool("true"), true, OJ.name + ".to.bool converts 'true' to true."
    deepEqual OJ.to.bool(true), true, OJ.name + ".to.bool converts true to true."
    return

  module OJ.name + ".number.isNaN"
  test OJ.name + ".number.isNaN", ->
    expect 8
    deepEqual OJ.number.isNaN(OJ.to.number(null)), true, OJ.name + ".to.number converts null to NaN."
    deepEqual OJ.number.isNaN(OJ.to.number(`undefined`)), true, OJ.name + ".to.number converts undefined to NaN."
    deepEqual OJ.number.isNaN(OJ.to.number(NaN)), true, OJ.name + ".to.number converts NaN to NaN."
    deepEqual OJ.number.isNaN(OJ.to.number(Infinity)), true, OJ.name + ".to.number converts Infinity to NaN."
    deepEqual OJ.number.isNaN(OJ.to.number(-Infinity)), true, OJ.name + ".to.number converts -Infinity to NaN."
    deepEqual OJ.number.isNaN(OJ.to.number({})), true, OJ.name + ".to.number converts {} to NaN."
    deepEqual OJ.number.isNaN(OJ.to.number([])), true, OJ.name + ".to.number converts [] to NaN."
    deepEqual OJ.number.isNaN(OJ.to.number(new Date())), true, OJ.name + ".to.number converts new Date() to NaN."
    return

  module OJ.name + ".to.number"
  test OJ.name + ".to.number(null)", ->
    expect 10
    deepEqual OJ.to.number(0) is 0, true, OJ.name + ".to.number converts 0 to 0."
    deepEqual OJ.to.number("0") is 0, true, OJ.name + ".to.number converts '0' to 0."
    deepEqual OJ.to.number("false") is 0, true, OJ.name + ".to.number converts 'false' to 0."
    deepEqual OJ.to.number(false) is 0, true, OJ.name + ".to.number converts false to 0."
    deepEqual OJ.to.number(1) is 1, true, OJ.name + ".to.number converts 1 to 1."
    deepEqual OJ.to.number("1") is 1, true, OJ.name + ".to.number converts '1' to 1."
    deepEqual OJ.to.number("true") is 1, true, OJ.name + ".to.number converts 'true' to 1."
    deepEqual OJ.to.number(true) is 1, true, OJ.name + ".to.bool converts true to 1."
    deepEqual OJ.to.number("42") is 42, true, OJ.name + ".to.number converts '42' to 42."
    deepEqual OJ.to.number("-42") is -42, true, OJ.name + ".to.number converts '-42' to -42."
    return

  return
) ((if typeof global isnt 'undefined' and global then global else (if typeof window isnt 'undefined' then window else this))).OJ