// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2013-2014 MIT, All rights reserved
// Released under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0
/**
 * @license
 * @fileoverview Dictionaries blocks for Blockly, modified for MIT App Inventor.
 * @author data1013@mit.edu (Danny Tang)
 */

'use strict';

//goog.provide('Blockly.Blocks.dictionaries');

//goog.require('Blockly.Blocks.Utilities');

Blockly.Blocks['dictionaries_create_with'] = {
  // Create a dictionary with any number of pairs of any type.
  category: 'Dictionaries',
  helpUrl: function() {
    if (this.itemCount_ > 0) {
      return "/reference/blocks/dictionaries.html#create-empty-dictionary";
    } else {
      return "/reference/blocks/dictionaries.html#make-a-dictionary";
    }
  },
  init: function() {
    this.setColour('#2D1799');
    this.appendValueInput('ADD0')
        .appendField("make a dictionary")
        .setCheck(['Pair']);
    this.appendValueInput('ADD1')
        .setCheck(['Pair']);
    this.setOutput(true, ['Dictionary', 'String', 'Array']);
    this.setMutator(new Blockly.Mutator(['dictionaries_mutator_pair']));
    this.setTooltip("Create a dictionary.");
    this.itemCount_ = 2;
    this.emptyInputName = 'EMPTY';
    this.repeatingInputName = 'ADD';
  },
  mutationToDom: Blockly.mutationToDom,
  domToMutation: Blockly.domToMutation,
  decompose: function(workspace){
    return Blockly.decompose(workspace,'dictionaries_mutator_pair',this);
  },
  compose: function(containerBlock) {
    var oldValues = {};
    for (var i = 0; i < this.itemCount_; i++) {
      var name = this.repeatingInputName + i,
        block = this.getInputTargetBlock(name);
      if (block) {
        oldValues[block.id] = block;
      }
    }

    // Disconnect all input blocks and destroy all inputs.
    if (this.itemCount_ === 0) {
      if(this.emptyInputName != null) {
        this.removeInput(this.emptyInputName);
      }
    } else {
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput(this.repeatingInputName + x);
      }
    }
    this.itemCount_ = 0;
    // Rebuild the block's inputs.
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var input = this.addInput(this.itemCount_);

      // Reconnect any child blocks.
      if (itemBlock.valueConnection_ && itemBlock.valueConnection_.getSourceBlock() &&
          // empty key-value pairs get deleted and so won't have a workspace
          itemBlock.valueConnection_.getSourceBlock().workspace != null) {
        input.connection.connect(itemBlock.valueConnection_);
        // Remove this block from the set of old blocks
        delete oldValues[itemBlock.valueConnection_.sourceBlock_.id];
      } else if (Blockly.Events.isEnabled()) {  // false if we are loading a project
        // auto-fill the empty socket with a pair block
        var pairBlock = Blockly.mainWorkspace.newBlock('pair');
        pairBlock.initSvg();
        input.connection.connect(pairBlock.outputConnection);
      }

      this.itemCount_++;
      itemBlock = itemBlock.nextConnection &&
        itemBlock.nextConnection.targetBlock();
    }
    if (this.itemCount_ === 0) {
      this.addEmptyInput();
    }
    // Clean up any disconnected old pairs with empty key and value sockets
    for (var key in oldValues) {
      if (oldValues.hasOwnProperty(key)) {
        var oldBlock = oldValues[key];
        if (!oldBlock.getInputTargetBlock('KEY') && !oldBlock.getInputTargetBlock('VALUE')) {
          oldBlock.dispose(false, false);
        }
      }
    }
  },
  saveConnections: Blockly.saveConnections,
  addEmptyInput: function(){
    this.appendDummyInput(this.emptyInputName)
      .appendField("create empty dictionary");
  },
  addInput: function(inputNum){
    var input = this.appendValueInput(this.repeatingInputName + inputNum)
        .setCheck(['Pair']);
    if(inputNum === 0){
      input.appendField("make a dictionary");
    }
    return input;
  },
  updateContainerBlock: function(containerBlock) {
    containerBlock.setFieldValue(Blockly.Msg.LANG_DICTIONARIES_CREATE_WITH_CONTAINER_TITLE_ADD,"CONTAINER_TEXT");
    containerBlock.setTooltip("Add, remove, or reorder sections to reconfigure this dictionary block.");
  },
  /**
   * Create a human-readable text representation of this block and any children.
   * @param {number=} opt_maxLength Truncate the string to this length.
   * @param {string=} opt_emptyToken The placeholder string used to denote an
   *     empty field. If not specified, '?' is used.
   * @return {string} Text of block.
   */
  toString: function(opt_maxLength, opt_emptyToken) {
    var buffer = '{';
    var checkLen = true;
    opt_emptyToken = opt_emptyToken || '?';
    if (!opt_maxLength || opt_maxLength === 0) {
      checkLen = false;
    }
    var sep = '';
    for (var i = 0, input; (input = this.getInput('ADD' + i)) && (!checkLen || buffer.length < opt_maxLength); i++) {
      var target = input.connection.targetBlock();
      if (target) {
        var keyblock = target.getInput('KEY').connection.targetBlock();
        var valueblock = target.getInput('VALUE').connection.targetBlock();
        if (keyblock || valueblock) {
          buffer += sep;
          buffer += keyblock ? keyblock.toString(opt_maxLength, opt_emptyToken) : opt_emptyToken;
          buffer += ':';
          buffer += valueblock ? valueblock.toString(opt_maxLength, opt_emptyToken) : opt_emptyToken;
          sep = ',';
        }
      }
    }
    if (checkLen && buffer.length >= opt_maxLength) {
      buffer = buffer.substring(0, opt_maxLength - 2);
      buffer += '…'
    }
    buffer += '}';
    return buffer;
  },
  // create type blocks for both make a dictionary (two pairs) and create empty dictionary
  typeblock: [
      { translatedName: "make a dictionary",
        mutatorAttributes: { items: 2 } },
      { translatedName: "create empty dictionary",
        mutatorAttributes: { items: 0 } }]
};

Blockly.Blocks['dictionaries_mutator_pair'] = {
  // Add pairs.
  init: function() {
    this.setColour('#2D1799');
    this.appendDummyInput()
        .appendField("pair");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Add a pair to the dictionary.");
  },
  contextMenu: false
};

Blockly.Blocks['pair'] = {
  category: 'Dictionaries',
  helpUrl: "/reference/blocks/dictionaries.html#pair",
  init: function() {
    this.setColour('#2D1799');
    this.setOutput(true, ['Pair', 'String', 'Array']);
    var checkTypeAny = null;
    var checkTypeKey = ['Key'];
    this.interpolateMsg("key %1 value %2",
            ['KEY', checkTypeKey, Blockly.ALIGN_RIGHT],
            ['VALUE', checkTypeAny, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
    this.setTooltip("Add a pair to the dictionary.");
    this.setInputsInline(true);
  },
  typeblock: [{ translatedName: "make a pair" }]
};

Blockly.Blocks['dictionaries_lookup'] = {
  // Look up in a dictionary.
  category: 'Dictionaries',
  helpUrl : "/reference/blocks/dictionaries.html#get-value-for-key",
  init: function() {
    this.setColour('#2D1799');
    this.setOutput(true, null);
    var checkTypeDict = ['Dictionary'];
    var checkTypeAny = null;
    var checkTypeKey = ['Key'];
    this.interpolateMsg("get value for key %1 in dictionary %2 or if not found %3",
      ['KEY', checkTypeKey, Blockly.ALIGN_RIGHT],
      ['DICT', checkTypeDict, Blockly.ALIGN_RIGHT],
      ['NOTFOUND', checkTypeAny, Blockly.ALIGN_RIGHT],
      Blockly.ALIGN_RIGHT);
    this.setTooltip("Returns the value in the dictionary associated with the key.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "get value for key in dictionary" }]
};

Blockly.Blocks['dictionaries_set_pair'] = {
  category: 'Dictionaries',
  helpUrl: "/reference/blocks/dictionaries.html#set-value-for-key",
  init: function() {
    this.setColour('#2D1799');
    var checkTypeDict = ['Dictionary'];
    var checkTypeKey = ['Key'];
    this.interpolateMsg("set value for key %1 in dictionary %2 to %3",
            ['KEY', checkTypeKey, Blockly.ALIGN_RIGHT],
            ['DICT', checkTypeDict, Blockly.ALIGN_RIGHT],
            ['VALUE', null, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Set a pair in a dictionary.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "set value for key in dictionary to" }]
};

Blockly.Blocks['dictionaries_delete_pair'] = {
  category: 'Dictionaries',
  helpUrl: "/reference/blocks/dictionaries.html#delete-entry-for-key",
  init: function() {
    this.setColour('#2D1799');
    var checkTypeDict = ['Dictionary'];
    var checkTypeKey = ['Key'];
    this.interpolateMsg("remove entry for key %2 from dictionary %1",
            ['DICT', checkTypeDict, Blockly.ALIGN_RIGHT],
            ['KEY', checkTypeKey, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Delete a pair in a dictionary given its key.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "remove entry for key from dictionary" }]
};

Blockly.Blocks['dictionaries_recursive_lookup'] = {
  // Look up in a dictionary.
  category: 'Dictionaries',
  helpUrl : "/reference/blocks/dictionaries.html#get-value-at-key-path",
  init: function() {
    this.setColour('#2D1799');
    this.setOutput(true, null);
    var checkTypeDict = ['Dictionary'];
    var checkTypeAny = null;
    var checkTypeList = ['Array'];
    this.interpolateMsg("get value at key path %1 in dictionary %2 or if not found %3",
            ['KEYS', checkTypeList, Blockly.ALIGN_RIGHT],
            ['DICT', checkTypeDict, Blockly.ALIGN_RIGHT],
            ['NOTFOUND', checkTypeAny, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
    this.setTooltip("Returns the value in the nested dictionary.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "get value for key path in dictionary" }]
};

Blockly.Blocks['dictionaries_recursive_set'] = {
  category: 'Dictionaries',
  helpUrl: "/reference/blocks/dictionaries.html#set-value-for-key-path",
  init: function() {
    this.setColour('#2D1799');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    var checkTypeDict = ['Dictionary'];
    var checkTypeAny = null;
    var checkTypeList = ['Array'];
    this.interpolateMsg("set value for key path %1 in dictionary %2 to %3",
      ['KEYS', checkTypeList, Blockly.ALIGN_RIGHT],
      ['DICT', checkTypeDict, Blockly.ALIGN_RIGHT],
      ['VALUE', checkTypeAny, Blockly.ALIGN_RIGHT],
      Blockly.ALIGN_RIGHT);
    this.setTooltip("Sets the value at a path in a tree starting from the given dictionary.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "set value for key path in dictionary to" }]
};

Blockly.Blocks['dictionaries_getters'] = {
  category: 'Dictionaries',
  helpUrl: function () {
    var mode = this.getFieldValue('OP');
    return Blockly.Blocks['dictionaries_getters'].HELPURLS()[mode];
  },
  init: function () {
    this.setColour('#2D1799');
    this.setOutput(true, ['Array', 'String']);
    this.appendValueInput('DICT')
        .setCheck(['Dictionary'])
        .appendField("get")
        .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP');
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function () {
      var mode = thisBlock.getFieldValue('OP');
      return Blockly.Blocks['dictionaries_getters'].TOOLTIPS()[mode];
    });
  },
  typeblock: [{
    translatedName: "get dictionary keys",
    dropDown: {
      titleName: 'OP',
      value: 'KEYS'
    }
  }, {
    translatedName: "get dictionary values",
    dropDown: {
      titleName: 'OP',
      value: 'VALUES'
    }
  }]
};

Blockly.Blocks['dictionaries_getters'].OPERATORS = function () {
  return [[Blockly.Msg.LANG_DICTIONARIES_GET_KEYS_TITLE, 'KEYS'],
    [Blockly.Msg.LANG_DICTIONARIES_GET_VALUES_TITLE, 'VALUES']];
};

Blockly.Blocks['dictionaries_getters'].TOOLTIPS = function () {
  return {
    'KEYS': "Returns a list of all of the keys in the dictionary.",
    'VALUES': "Returns a list of all of the values in the dictionary."
  }
};

Blockly.Blocks['dictionaries_getters'].HELPURLS = function() {
  return {
    'KEYS': "/reference/blocks/dictionaries.html#get-keys",
    'VALUES': "/reference/blocks/dictionaries.html#get-values"
  }
};

Blockly.Blocks['dictionaries_get_values'] = {
  category: 'Dictionaries',
  helpUrl: function () {
    var mode = this.getFieldValue('OP');
    return Blockly.Blocks['dictionaries_getters'].HELPURLS()[mode];
  },
  init: function () {
    this.setColour('#2D1799');
    this.setOutput(true, ['Array', 'String']);
    this.appendValueInput('DICT')
        .setCheck(['Dictionary'])
        .appendField("get")
        .appendField(new Blockly.FieldDropdown(Blockly.Blocks.dictionaries_getters.OPERATORS), 'OP');
    this.setFieldValue('VALUES', "OP");
    // Assign 'this' to a variable for use in the closures below.
    var thisBlock = this;
    this.setTooltip(function () {
      var mode = thisBlock.getFieldValue('OP');
      return Blockly.Blocks.dictionaries_getters.TOOLTIPS()[mode];
    });  }
};

Blockly.Blocks['dictionaries_is_key_in'] = {
   // Checks if a key is in a dictionary
  category : 'Dictionaries',
  // helpUrl : "/reference/blocks/lists.html#inlist",
  init : function() {
    this.setColour('#2D1799');
    var checkTypeDict = ['Dictionary'];
    var checkTypeKey = ['Key'];
    this.interpolateMsg("is key in dictionary? key %1 dictionary %2",
            ['KEY', checkTypeKey, Blockly.ALIGN_RIGHT],
            ['DICT', checkTypeDict, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
    this.setOutput(true, ['Boolean', 'String']);
    this.setTooltip("Check if a key is in a dictionary.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "is key in dict?" }]
};

Blockly.Blocks['dictionaries_length'] = {
   // Gets all the values in a dictionary
  category : 'Dictionaries',
  //helpUrl : "/reference/blocks/lists.html#lengthoflist",
  init : function() {
    this.setColour('#2D1799');
    this.setOutput(true, ['Number', 'String', 'Key']);
    this.appendValueInput('DICT')
      .setCheck(['Dictionary'])
      .appendField("size of dictionary")
      .appendField("dictionary");
    this.setTooltip("Returns the number of key-value pairs in the dictionary.");
  },
  typeblock: [{ translatedName: "size of dictionary" }]
};

Blockly.Blocks['dictionaries_alist_to_dict'] = {
   // Gets all the values in a dictionary
  category : 'Dictionaries',
  //helpUrl : "/reference/blocks/lists.html#lengthoflist",
  init : function() {
    this.setColour('#2D1799');
    this.setOutput(true, ['Dictionary', 'String', 'Array']);
    this.appendValueInput('PAIRS')
      .setCheck(['Array'])
      .appendField("list of pairs to dictionary")
      .appendField("pairs");
    this.setTooltip("Converts a list of pairs to a dictionary.");
  },
  typeblock: [{ translatedName: "list of pairs to dictionary" }]
};

Blockly.Blocks['dictionaries_dict_to_alist'] = {
   // Gets all the values in a dictionary
  category : 'Dictionaries',
  //helpUrl : "/reference/blocks/lists.html#lengthoflist",
  init : function() {
    this.setColour('#2D1799');
    this.setOutput(true, ['Array', 'String']);
    this.appendValueInput('DICT')
      .setCheck(['Dictionary'])
      .appendField("dictionary to list of pairs")
      .appendField("dictionary");
    this.setTooltip("Converts a dictionary to a list of pairs.");
  },
  typeblock: [{ translatedName: "dictionary to list of pairs" }]
};

Blockly.Blocks['dictionaries_copy'] = {
   // Gets all the values in a dictionary
  category : 'Dictionaries',
  //helpUrl : "/reference/blocks/lists.html#lengthoflist",
  init : function() {
    this.setColour('#2D1799');
    this.setOutput(true, ['Dictionary', 'String', 'Array']);
    this.appendValueInput('DICT')
      .setCheck(['Dictionary'])
      .appendField("copy dictionary")
      .appendField("dictionary");
    this.setTooltip("Returns a shallow copy of the dictionary");
  },
  typeblock: [{ translatedName: "copy dictionary" }]
};

Blockly.Blocks['dictionaries_combine_dicts'] = {
   // Checks if a key is in a dictionary
  category : 'Dictionaries',
  // helpUrl : "/reference/blocks/lists.html#inlist",
  init : function() {
    this.setColour('#2D1799');
    var checkTypeDict = ['Dictionary'];
    this.interpolateMsg("merge into dictionary %1 from dictionary %2",
            ['DICT1', checkTypeDict, Blockly.ALIGN_RIGHT],
            ['DICT2', checkTypeDict, Blockly.ALIGN_RIGHT],
            Blockly.ALIGN_RIGHT);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Copies the pairs of the 'From' dictionary into the 'To' dictionary.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "combine dictionaries" }]
};

Blockly.Blocks['dictionaries_walk_tree'] = {
  category: 'Dictionaries',
  helpUrl: "/reference/blocks/dictionaries.html#list-by-walking-key-path",
  init: function() {
    this.setColour('#2D1799');
    var checkTypeDict = ['Dictionary'];
    var checkTypeList = ['Array'];
    this.interpolateMsg("list by walking key path %1 in dictionary or list %2",
      ['PATH', checkTypeList, Blockly.ALIGN_RIGHT],
      ['DICT', checkTypeDict, Blockly.ALIGN_RIGHT],
      Blockly.ALIGN_RIGHT);
    this.setOutput(true, ['Array', 'String']);
    this.setTooltip("Starts from the given dictionary and follows it and its children's keys based on the given path, returning a list of nodes found at the end of the walk.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "list by walking key path %1 in dictionary or list %2" }]
};

Blockly.Blocks['dictionaries_walk_all'] = {
  category: 'Dictionaries',
  helpUrl: "/reference/blocks/dictionaries.html#walk-all-at-level",
  init: function() {
    this.setColour('#2D1799');
    this.interpolateMsg("walk all at level",
      Blockly.ALIGN_LEFT);
    this.setOutput(true, 'ALL_OPERATOR');
    this.setTooltip("Used in the list by walking key path block, explores every node at a given level on the walk.");
    this.setInputsInline(false);
  },
  typeblock: [{ translatedName: "walk all at level" }]
};

Blockly.Blocks['dictionaries_is_dict'] = {
   // Gets all the values in a dictionary
  category : 'Dictionaries',
  //helpUrl : "/reference/blocks/lists.html#lengthoflist",
  init : function() {
    this.setColour('#2D1799');
    this.setOutput(true, ['Boolean', 'String']);
    this.interpolateMsg("is a dictionary? %1",
      ['THING', null, Blockly.ALIGN_RIGHT], Blockly.ALIGN_RIGHT);
    this.setTooltip("Tests if something is a dictionary.");
  },
  typeblock: [{ translatedName: "is a dictionary? %1" }]
};
