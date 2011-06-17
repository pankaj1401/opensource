/*
* PAutosuggest
* Copyright (c) 2011 Pankaj Meena | hi.amigo@gmail.com
* Free as HELL :)
* This script is a combination of the functionality provided by the below references.
* 1) Drop down suggestions
* 2) Inline suggestion while typing
*
* Date: Jun, 15 2011
  References:
  1) http://www.webreference.com/programming/javascript/ncz/
  2) http://www.javascriptsearch.com/tutorials/Advanced/tutorials/AUTOSUGGEST4.html
*/

var PAutoSuggest = function() {
  /*
    @config
  */
  this.showInlineSuggestions = false; // Whether to show inline suggestions or not
  this.showDropDownSuggestions = true; // Whether to show drop down suggestions or not
  this.suggestionOutputContainerId = 'output_container'; // Output container where the suggestion will get displayed
  
  this.documentElement = undefined; 
  this.suggestionOutputContainer = undefined;
  this.activeChildNo = -1; 
  this.suggestions = ''; // contains the suggestions that are coming at any point of time
  /*
   @constant 
  */
  var BACKSPACE_KEY_CODE = 8;
  var DOWN_ARROW_KEY_CODE = 40;
  var UP_ARROW_KEY_CODE = 38;
  var ESCAPE_KEY_CODE = 27;
  
  var SUGGESTION_BACKGROUND_COLOR_ON_SELECT = '#FF8040';
  var SUGGESTION_FOREGROUND_COLOR_ON_SELECT = '#FFFFFF';
  var SUGGESTION_BACKGROUND_COLOR_ON_DESELECT = '#FFFFFF';
  var SUGGESTION_FOREGROUND_COLOR_ON_DESELECT = '#000000';
  var userSuppliedSuggestions = [];
  
  /*
    @function: __initializeAutosuggest
    @scope: private
    @param {string} paramElementId: It should be the element id of the text box or input box
    @param {string} paramSuggestionOutputId: container where the suggestion will come
    @param {boolean} paramShowInlineSuggestions: True, if inlinas_search_output_parente suggestion is enabled. False, otherwise
    @description: Initialize the shiksha autosuggest mechanism like initializing the params, binding the key events etc
  */
  var __initializeAutosuggest = function(paramElementId, paramSuggestionOutputId, paramShowInlineSuggestions, paramSuggestions){
    if(paramShowInlineSuggestions != undefined){
      this.showInlineSuggestions = paramShowInlineSuggestions;
    }
    if(document.getElementById(paramElementId) != undefined){
      this.documentElement = document.getElementById(paramElementId);
    }
    
    if(paramSuggestionOutputId != undefined){
      this.suggestionOutputContainerId = paramSuggestionOutputId;
    } 
    if(document.getElementById(this.suggestionOutputContainerId) != undefined){
      this.suggestionOutputContainer = document.getElementById(this.suggestionOutputContainerId);
    }
    
    if(paramSuggestions != undefined){
      userSuppliedSuggestions = paramSuggestions;
    }
    __initializeOutputContainer();
    this.documentElement.onkeyup = function(event) {
      if (!event) {
          event = window.event;
      }
      __handleKeyUp(event); 
    };
  }
  
  /*
    @function: __initializeOutputContainer
    @scope: private
    @description: handles the initialization of output container, positioning etc
  */
  var __initializeOutputContainer = function() {
      __showOutputContainer("hidden");
  }
  
  /*
    @function: __showOutputContainer
    @scope: private
    @description: displayes the output container content and sets the X,Y position of the output container
  */
  var __showOutputContainer = function(visibility){
      this.suggestionOutputContainer.style.position = 'absolute';
      this.suggestionOutputContainer.style.top =  (__findPosY(this.documentElement)+3)+"px";
      this.suggestionOutputContainer.style.left = (__findPosX(this.documentElement)+2)+"px";
      this.suggestionOutputContainer.style.visibility = visibility;
  }
  
  /*
    @function: __handleKeyUp
    @scope: private
    @param {KeyBoard Event} event: Keyboard event
    @description: Handles the keyboard events like keyPress, KeyUp etc
  */
  var __handleKeyUp = function(event){
    var __keyCode = event.keyCode;
    if ( __keyCode < 32 || (__keyCode >= 33 && __keyCode <= 46) || (__keyCode >= 112 && __keyCode <= 123)) {
        if(__keyCode == BACKSPACE_KEY_CODE){
          __processBackSpaceKeyPressed();
        }
        if(__keyCode == DOWN_ARROW_KEY_CODE) {
          __processDownArrowKeyPressed();
        }
        if(__keyCode == UP_ARROW_KEY_CODE) {
          __processUpArrowKeyPressed();
        }
        if(__keyCode == ESCAPE_KEY_CODE){
          __processEscapeArrowKeyPressed();
        }
    } else {
        var __suggestions = __getSuggestions(); // getting all the suggestions
        if (__suggestions.length > 0){
          if(this.showDropDownSuggestions){
            __showDropDownSuggestions(__suggestions); // show drop down suggestions
          }
          if(this.showInlineSuggestions){
            __showInlineSuggestions(__suggestions[0]); // show the topmost suggestion as inline suggestion
          }
        } else if(this.showDropDownSuggestions && __suggestions.length <= 0){
            __showOutputContainer("hidden");
        }
        this.activeChildNo = -1;
    }
  }
  
  /*
    @function: __handleMouseEvent
    @scope: private
    @description: Handles the click event on the drop down suggestions
  */
  var __handleMouseEvent = function(eve) {
    // for handling clikcing events  
  }
  
  /*
    @function: __processBackSpaceKeyPressed
    @scope: private
    @description: Handles the drop down display when user press backspace key
  */
  var __processBackSpaceKeyPressed = function(){
    var __suggestions = __getSuggestions();
    if(this.showDropDownSuggestions && __suggestions.length > 0){
      __showDropDownSuggestions(__suggestions);
    } else {
        __showOutputContainer("hidden");
    }
    this.activeChildNo = -1;
  }
  
  /*
    @function: __processDownArrowKeyPressed
    @scope: private
    @description: Handles the drop down display when user presses Down arrow key
  */
  var __processDownArrowKeyPressed = function(){
    if(this.suggestions.length > 0 && this.activeChildNo < this.suggestions.length - 1){
        if (this.activeChildNo >= 0) {
          __setDropDownStyle(this.activeChildNo, SUGGESTION_BACKGROUND_COLOR_ON_DESELECT, SUGGESTION_FOREGROUND_COLOR_ON_DESELECT);
        }
        __setDropDownStyle(++this.activeChildNo, SUGGESTION_BACKGROUND_COLOR_ON_SELECT, SUGGESTION_FOREGROUND_COLOR_ON_SELECT);
        this.documentElement.value = this.suggestionOutputContainer.childNodes[this.activeChildNo].firstChild.nodeValue;
      }
  }
  
  /*
    @function: __processUpArrowKeyPressed
    @scope: private
    @description: Handles the drop down display when user presses UP arrow key
  */
  var __processUpArrowKeyPressed = function(){
    if(this.suggestions.length > 0 && this.activeChildNo > 0){
        if (this.activeChildNo >= 1) {
          __setDropDownStyle(this.activeChildNo, SUGGESTION_BACKGROUND_COLOR_ON_DESELECT, SUGGESTION_FOREGROUND_COLOR_ON_DESELECT);
          __setDropDownStyle(--this.activeChildNo, SUGGESTION_BACKGROUND_COLOR_ON_SELECT, SUGGESTION_FOREGROUND_COLOR_ON_SELECT);
          this.documentElement.value = this.suggestionOutputContainer.childNodes[this.activeChildNo].firstChild.nodeValue;
        } else {
          __setDropDownStyle(this.activeChildNo, SUGGESTION_BACKGROUND_COLOR_ON_DESELECT, SUGGESTION_FOREGROUND_COLOR_ON_DESELECT);
          this.documentElement.focus();
          this.activeChildNo--;
        }
    }
  }
  
  /*
    @function: __processEscapeArrowKeyPressed
    @scope: private
    @description: Handles the drop down display when user presses escape key
  */
  var __processEscapeArrowKeyPressed = function(){
    this.suggestions = '';
    this.activeChildNo = -1;
    __clearAllSuggestions();
  }
  
  /*
    @function: __setDropDownStyle
    @scope: private
    @param {Int} childNo, current child element
    @param {String} bgColor, background color for the current element
    @param {String} fgcolor, color for the current element
    @description: for updating the css properties of the current row
  */
  var __setDropDownStyle = function(childNo, bgColor, fgColor){
    this.suggestionOutputContainer.childNodes[childNo].style.background = bgColor;
    this.suggestionOutputContainer.childNodes[childNo].style.color = fgColor;
  }
  
  /*
    @function: __createSuggestionRow
    @scope: private
    @description: Creates the drop down suggestion row one by one and add the event listener to each row
  */
  var __createSuggestionRow = function(content){
      var __row = document.createElement("a");
      __row.appendChild(document.createTextNode(content));
      __row.onclick = __handleMouseClick;
      this.suggestionOutputContainer.appendChild(__row);
  }
  
  /*
    @function: __handleMouseClick
    @scope: private
    @description: handling the clicking mechanism on suggestion
  */
  var __handleMouseClick = function(event) {
    console.log(this);
  }
  
  /*
   @function: __clearAllSuggestions
   @scope: private
   @description: This function clears all the dropdown suggestions from DOM
  */
  var __clearAllSuggestions = function(){
      while(this.suggestionOutputContainer.hasChildNodes()){
        var __node = this.suggestionOutputContainer.firstChild;
        this.suggestionOutputContainer.removeChild(__node);
      }
  }
  
  /*
    @function: __getSuggestions
    @scope: private
    @param {KeyBoard Event} event: Keyboard event
    @description: Handles the keyboard events like typing etc
    @returns: return all the matched suggestions in array
  */
  var __getSuggestions = function(){
    var __suggestions = [];
    var __inputValue = this.documentElement.value;
    if (__inputValue.length > 0){
      for(var i=0; i < userSuppliedSuggestions.length; i++) {
          if (userSuppliedSuggestions[i].indexOf(__inputValue) == 0) {
              __suggestions.push(userSuppliedSuggestions[i]);
          } 
      }
    }
    this.suggestions = __suggestions;
    return __suggestions;
  }
  
  /*
    @function: __showInlineSuggestions
    @scope: private
    @param {String} paramTopSuggestion: topmost suggestions among various suggestions
    @description: Displays the topmost suggestion as inline
  */
  var __showInlineSuggestions = function(paramTopSuggestion){
    if (this.showInlineSuggestions && (this.documentElement.createTextRange || this.documentElement.setSelectionRange) ){
        var __length = this.documentElement.value.length;
        this.documentElement.value = paramTopSuggestion;
        __selectRange(__length, paramTopSuggestion.length);
    }
  }
  
  /*
    @function: __showDropDownSuggestions
    @scope: private
    @description: Displays the dropdown list of suggestions
  */
  var __showDropDownSuggestions = function(paramSuggestions){
    if(this.showDropDownSuggestions){
      __clearAllSuggestions();
      for (var count=0;count < paramSuggestions.length; ++count) {
        __createSuggestionRow(paramSuggestions[count]);
      }
      __showOutputContainer("visible");
    }
  }
  
  /*
    @function: __selectRange
    @scope: private
    @param {int} paramStart: starting point
    @param {int} paramLength: total length of the suggestion
    @description: shows the non typed character as a suggestion in the textfield
  */
  var __selectRange = function (paramStart, paramLength) {
    if (this.documentElement.createTextRange) { //use text ranges for Internet Explorer
        var __range = this.documentElement.createTextRange();
        __range.moveStart("character", paramStart);
        __range.moveEnd("character", paramLength - this.documentElement.value.length);
        __range.select();
    } else if (this.documentElement.setSelectionRange) {  //use setSelectionRange() for Mozilla
        this.documentElement.setSelectionRange(paramStart, paramLength);
    }     
    this.documentElement.focus();
  };
  
  /*
    @function: __findPosX
    @scope: private
    @param {obj} obj
    @description: find out the position x of DOM element
    @returns: the X position
  */
  var __findPosX = function(obj) {
      var curleft = 0;
      if (obj.offsetParent){
          while (obj.offsetParent){
              curleft += obj.offsetLeft;
              obj = obj.offsetParent;
          }
      }
      else if (obj.x)
          curleft += obj.x;
      return curleft;
  }
  
  /*
    @function: __findPosY
    @scope: private
    @param {obj} obj
    @description: find out the position y of DOM element
    @returns: the Y position(top)
  */
  var __findPosY = function(obj) {
      var curtop = 0;
      if (obj.offsetParent){
          curtop += obj.offsetHeight;
          while (obj.offsetParent){
              curtop += obj.offsetTop;
              obj = obj.offsetParent;
          }
      }
      else if (obj.y){
          curtop += obj.y;
          curtop += obj.height;
      }
      return curtop;
  }

  /*
    @scope : public
    @description: Methods specified below are the only public method from this namespace
  */
  return {
    init : function(paramElementId, paramSuggestionOutputId, paramShowInlineSuggestions, paramSuggestions){
      __initializeAutosuggest(paramElementId, paramSuggestionOutputId, paramShowInlineSuggestions, paramSuggestions);
    }  
  };

}();
