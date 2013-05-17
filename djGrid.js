/*
 * djGrid
 * 
 * https://github.com/Mystist/djGrid
 *
 * Copyright (c) 2013 Foundation and other contributors
 *
 * License: https://github.com/Mystist/djGrid/blob/master/MIT-LICENSE.txt
 *
 */

(function($) {

  var methods = {

    init: function(options) {
      var defaults = {
        "theadFixer": true,
        "bindResize": true,
        "overflow_x": "auto",
        "floatMode": false,
        "renderbetter":"auto",
        "tdWider": true,
        "applyToAnotherTable": false
      };
      var settings = $.extend(defaults, options);
      
      var djGrid = new DjGrid();
      djGrid.$this = this;
      djGrid.initialize(settings);
      return djGrid;
    }

  };
  
  function DjGrid() {
    this.$this = null;
    this.theadFixer = null;
    this.tdWider = null;
  }
  
  DjGrid.prototype = {

    constructor: DjGrid,

    initialize: function(st) {
      if(st.tdWider&&!st.theadFixer) {
        this.tdWider = this.$this.tdWider(st);
      } else if(st.theadFixer&&!st.tdWider) {
        this.theadFixer = this.$this.theadFixer(st);
      } else if(st.tdWider&&st.theadFixer) {
        this.theadFixer = this.$this.theadFixer({
          "bindResize": st.bindResize,
          "overflow_x": st.overflow_x,
		  "renderbetter":st.renderbetter,
          "floatMode": true
        });
        this.tdWider = this.$this.tdWider({"applyToAnotherTable": true,"renderbetter":st.renderbetter});
      }
    },
    
    revert: function() {
      this.tdWider.revert();
      this.theadFixer.revert();
    }
    
  }

  $.fn.djGrid = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('No ' + method + ' method.');
    }
  };

})(jQuery);

/*
 * theadFixer
 * 
 * https://github.com/Mystist/theadFixer
 *
 * Copyright (c) 2013 Foundation and other contributors
 *
 * License: https://github.com/Mystist/theadFixer/blob/master/MIT-LICENSE.txt
 *
 */

(function($) {

  var methods = {

    init: function(options) {
      var defaults = {
        "bindResize": true,
        "overflow_x": "auto",
        "floatMode": false,
		"renderbetter":"auto"
      };
      var settings = $.extend(defaults, options);
      var theadFixer = new TheadFixer();
      theadFixer.$this = this;
      theadFixer.initialize(settings);
      return theadFixer;
    }

  };

  function TheadFixer() {
    this.$this = null;
    this.resizeTimer = null;
    this.overflow_x = null;
    this.floatMode = null;
    this.winWidth = $(window).width();
    this.winHeight = $(window).height();
    this.t1 = null;
    this.t2 = null;
    this.t3 = null;
    this.t4 = null;
    this.hasUsed = false;
  }

  TheadFixer.prototype = {

    constructor: TheadFixer,

    initialize: function(st) {
      this.overflow_x = st.overflow_x;
      this.floatMode = st.floatMode;
      //根据参数不同,判断渲染优化是否启用
      if(st.renderbetter == "auto" || st.renderbetter.toLowerCase() == "theadfixer")
	  {
    	  //如果渲染优化参数传递的是auto(自动启用)或者TheadFixer,那么此时启用渲染优化
      	  $(this.$this[0]).find("table,thead,tbody").hide();
      }
  	  this.built();
      if (st.bindResize) {
        this.bindResize();
      }
      $(this.$this[0]).find("table,thead,tbody").show();
    },

    built: function() {
      this.setTdWidth();
      this.builtHtml();
      this.setWidth();
      if(this.floatMode) {
        this.appendTheadAndSetPosition();
      }
      this.syncScrollBar();
      this.hasUsed = true;
    },

    setTdWidth: function() {

      var tThis = this;
      
      var tableWidth = 0;

      tThis.$this.find("thead tr").children().each(function(i) {

        var tWidth = "";
        if ($(this).attr("width")) {
          tWidth = $(this).attr("width");
          $(this).attr("thewidth", tWidth);
        } else {
          tWidth = $(this).width() + "px";
          $(this).attr("thewidth", "none").attr("width", tWidth);
        }
        tThis.$this.find("tbody tr:first td").eq(i).attr("width", tWidth);
        tableWidth += tWidth;
      });

      this.t3 = tThis.$this.find("table").css("table-layout");
      tThis.$this.find("table").css({
        "table-layout": "fixed",
        "width": tableWidth
      });

    },

    builtHtml: function() {

      var tThis = this;

      this.t1 = tThis.$this.find("table").attr("style");
      this.t2 = tThis.$this.find("table").attr("class");
      this.t4 = tThis.$this.find("table").css("border-top");

      tThis.$this.find("table").wrap('<div class="m_innerwrapper"></div>');

      tThis.$this.find("thead").unwrap().wrap('<table></table>');
      tThis.$this.find("tbody").wrap('<table></table>');
      
      tThis.$this.find("table:first").attr("style", this.t1).attr("class", this.t2).css("table-layout", "fixed");
      tThis.$this.find("table:last").attr("style", this.t1).attr("class", this.t2).css({
        "table-layout": "fixed",
        "border-top": "none"
       });

      tThis.$this.find("thead").parent().wrap('<div class="m_wrap" style="overflow:hidden;"></div>');

      var height = tThis.$this.children().height() - tThis.$this.find("table:first").outerHeight(true);
      tThis.$this.find("tbody").parent().wrap('<div class="m_wrapper" style="height:' + height + 'px; width: 100%; overflow-y:auto; overflow-x:' + tThis.overflow_x + '">');

    },
    
    setWidth: function() {

      var tThis = this;
      
      var fixNumber = 0;
      if (tThis.$this.find(".m_wrapper").height() < tThis.$this.find("table:last").outerHeight(true)) {
        fixNumber = 17;
      }
      tThis.$this.find("table:first").css("width", tThis.$this.find("table:first").width() - fixNumber + "px");
      tThis.$this.find("table:last").css("width", tThis.$this.find("table:last").width() + "px");

      var fixNumber2 = 0;
      if (tThis.$this.find(".m_wrapper").width() < tThis.$this.find("table:last").outerWidth(true) && fixNumber!=0) {
        fixNumber2 = 17;
      }
      tThis.$this.find(".m_wrap").css("width", tThis.$this.find(".m_wrapper").width() - fixNumber2 + "px");

    },
    
    appendTheadAndSetPosition: function() {
    
      var tThis = this;
      
      tThis.$this.find(".m_innerwrapper")
        .width(tThis.$this.find(".m_innerwrapper").width())
        .height(tThis.$this.find(".m_innerwrapper").height());
      
      tThis.$this.find(".m_wrapper").height(tThis.$this.children().height());
      
      tThis.$this.find(".m_wrap").css({
        "position": "absolute",
        "z-index": 1
      });
      
      tThis.$this.find(".m_wrapper").css({
        "position": "absolute",
        "z-index": 0
      });
      
      tThis.$this.find("table:last").css("border-top", tThis.t4);
      
      var el = tThis.$this.find("table:first thead")[0].outerHTML;
      
      tThis.$this.find("table:last").prepend(el);
    
    },
    
    removeTheadAndRevertPosition: function() {
    
      var tThis = this;

      tThis.$this.find("table:last").find("thead").remove();
      
      tThis.$this.find(".m_wrap").css({
        "position": ""
      });
      
      tThis.$this.find(".m_wrapper").css({
        "position": ""
      });
      
    },
    
    revertHtml: function() {

      var tThis = this;

      tThis.$this.find("tbody").parent().unwrap();
      tThis.$this.find("tbody").unwrap();
      tThis.$this.find("thead").parent().unwrap();
      tThis.$this.find("thead").unwrap();
      tThis.$this.find(".m_innerwrapper").wrapInner('<table style="' + this.t1 + '" class="' + this.t2 + '"></table>');
      tThis.$this.find("table").unwrap();

    },

    revertTdWidth: function() {

      var tThis = this;

      tThis.$this.find("thead tr").children().each(function(i) {
        if ($(this).attr("thewidth") == "none") {
          $(this).removeAttr("thewidth").removeAttr("width");
        } else {
          $(this).attr("width", $(this).attr("thewidth")).removeAttr("thewidth");
        }
        tThis.$this.find("tbody tr:first td").eq(i).removeAttr("width");
      });

      tThis.$this.find("table").css({
        "table-layout": this.t3,
        "width": ""
      });

    },

    syncScrollBar: function() {

      var tThis = this;

      tThis.$this.find(".m_wrapper").bind("scroll", function() {
        var first = tThis.$this.find(".m_wrap");
        var last = tThis.$this.find(".m_wrapper");
        if (first.scrollLeft() != last.scrollLeft()) {
          first.scrollLeft(last.scrollLeft());
        }
      });

    },

    bindResize: function() {

      var tThis = this;

      $(window).unbind("resize").resize(function() {

        var winNewWidth = $(window).width(),
          winNewHeight = $(window).height();

        if(Math.abs(tThis.winWidth-winNewWidth)>20 || Math.abs(tThis.winHeight-winNewHeight)>20) {
          clearTimeout(tThis.resizeTimer);
          tThis.resizeTimer = setTimeout(function() {
            tThis.revert();
            tThis.built();
          },
          200);
        }

        tThis.winWidth = winNewWidth;
        tThis.winHeight = winNewHeight;

      });

    },

    revert: function() {

      if(this.hasUsed) {
      
        if(this.floatMode) {
          this.removeTheadAndRevertPosition();
        }
        this.revertHtml();
        this.revertTdWidth();
        this.hasUsed = false;

      }

    }

  };

  $.fn.theadFixer = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('No ' + method + ' method.');
    }
  };

})(jQuery);

/*
 * tdWider
 * 
 * https://github.com/Mystist/tdWider
 *
 * Copyright (c) 2013 Foundation and other contributors
 *
 * License: https://github.com/Mystist/tdWider/blob/master/MIT-LICENSE.txt
 *
 */

(function($) {

  var methods = {

    init: function(options) {
      var defaults = {
        "applyToAnotherTable": false,
		"renderbetter":"auto"
      };
      var settings = $.extend(defaults, options);
      var tdWider = new TdWider();
      tdWider.$this = this;
      tdWider.initialize(settings);
      return tdWider;
    }

  };
  
  function TdWider() {
    this.$this = null;
    this.currentMoveLength = 0;
    this.applyToAnotherTable = null;
    this.hasUsed = false;
  }
  
  TdWider.prototype = {
  
    constructor: TdWider,
    
    initialize: function(st) {

      this.applyToAnotherTable = st.applyToAnotherTable==true?"table:last":st.applyToAnotherTable;
	  //根据参数不同,判断渲染优化是否启用
      if(st.renderbetter == "auto" || st.renderbetter.toLowerCase() == "tdwider")
	  {
    	  //如果渲染优化参数传递的是auto(自动启用)或者TdWider,那么此时启用渲染优化
		  $(this.$this[0]).find("table,thead,tbody").hide();
      }
      
      this.setElements("first");
      this.bindDrag();
      if(this.applyToAnotherTable) {
        this.setElements("last");
      }
	  //插件加载完成后,不管怎样,默认都显示出来	
      $(this.$this[0]).find("table,thead,tbody").show();
      this.hasUsed = true;
    
    },
    
    setElements: function(sel) {
    
      var tThis = this;
      
      this.$this.delegate(".m_inner", "mouseover", function() {
        $(this).css("background-color", "#E1E1E1");
      });
      
      this.$this.delegate(".m_inner", "mouseout", function() {
        $(this).css("background-color", "");
      });
      
      this.$this.find("thead tr:"+sel+"").children().each(function() {
        $(this).css("white-space", "nowrap");
      });
      
      var theHeight = this.$this.find("thead tr:"+sel+"").children().first().height();
      
      this.$this.find("thead tr:"+sel+"").children().each(function(i) {
      
        $(this).attr("thewidth", $(this).attr("width"));
      
        if($(this).text()=="") {
          return true;
        }
      
        $(this).css({
          "height": theHeight,
          "line-height": theHeight+"px"
        });
      
        var $span = $('<span class="m_outer"></span>').css({
          "position": "relative",
          "top": -1 * parseInt($(this).css("padding-top"), 10),
          "left": $(this).css("padding-left"),
          "float": "right"
        });
        $(this).prepend($span[0].outerHTML);
        
        if(!this.applyToAnotherTable) {
        
          var $span1 = $('<span index="'+i+'" class="m_inner">&nbsp;</span>').css({
            "line-height": "100%",
            "position": "absolute",
            "height": $(this).outerHeight(true),
            "width": 6,
            "top": 0,
            "left": -6,
            "cursor": "e-resize"
          });
          $(this).find(".m_outer").append($span1[0].outerHTML);
          
        }

      });
      
    },
    
    drawLine: function(target) {
    
      var $span = $('<span class="m_inside">&nbsp;</span>').css({
        "line-height": "100%",
        "position": "absolute",
        "height": target.parents("table").outerHeight(true),
        "width": 1,
        "top": 0,
        "right": -1,
        "background-color": "#777"
      });
      
      target.append($span[0].outerHTML);
    
    },
    
    removeLine: function(target) {
    
      target.find(".m_inside").remove();
    
    },
    
    bindDrag: function() {
    
      var tThis = this;
    
      this.$this.find(".m_inner").draggable({
        "axis": "x",
        "start": function(e) {
          tThis.drawLine($(e.target));
          if(tThis.applyToAnotherTable) {
            tThis.drawLine(tThis.$this.find("span[index='"+$(e.target).attr("index")+"']:last"));
          }
        },
        "drag": function(e, ui) {
          if(tThis.applyToAnotherTable) {
            var fixNumber = 0;
            if(ui.position.left - ui.originalPosition.left < 0) {
              fixNumber = -1;
            } else {
              fixNumber = 1;
            }
            tThis.$this.find("span[index='"+$(e.target).attr("index")+"']:last").css("left", parseInt($(e.target).css("left"), 10) + fixNumber);
          }
        },
        "stop": function(e, ui) {
          tThis.currentMoveLength = ui.position.left - ui.originalPosition.left;
          tThis.changeTdWidth(e);
          $(e.target).css("left", ui.originalPosition.left);
          tThis.removeLine($(e.target));
          if(tThis.applyToAnotherTable) {
            tThis.removeLine(tThis.$this.find("span[index='"+$(e.target).attr("index")+"']:last"));
          }
        }
      });
    
    },
    
    changeTdWidth: function(e) {
    
      var $target = $(e.target).parent().parent();
      
      $target.attr("width", $target.width() + this.currentMoveLength + "px");
      
      this.$this.find("table:first").css({
        "min-width": this.$this.find("table:first").width() + this.currentMoveLength
      });
      
      if(this.applyToAnotherTable) {
        this.changeAnotherTdWidth(parseInt($(e.target).attr("index"), 10));
      }
    
    },
    
    changeAnotherTdWidth: function(index) {
    
      var $target = this.$this.find(this.applyToAnotherTable).find("tr:first").children().eq(index);
      
      $target.attr("width", $target.width() + this.currentMoveLength + "px");
      
      var $table = this.$this.find(this.applyToAnotherTable);
      
      $table.css({
        "min-width": $table.width() + this.currentMoveLength
      });
      
      if($table.outerWidth(true) > $table.parent().width() && $table.outerHeight(true) > $table.parent().height()) {
        this.$this.find("table:first").parent().width($table.parent().width() - 17);
      }
    
    },
    
    reverTdWidth: function() {
    
      this.$this.find("table").each(function() {
      
        $(this).find("tr:first").children().each(function() {
      
          $(this).attr("width", $(this).attr("thewidth")==undefined?"":$(this).attr("thewidth")).removeAttr("thewidth");
        
        });
      
      });
    
      this.$this.find("table").css({
        "min-width": ""
      });
    
    },
    
    revertElements: function(sel) {
    
      var tThis = this;
      
      this.$this.undelegate(".m_inner", "mouseover");
      
      this.$this.undelegate(".m_inner", "mouseout");
      
      this.$this.find("thead tr:"+sel+"").children().each(function() {
        $(this).css("white-space", "");
      });
      
      this.$this.find("thead tr:"+sel+"").children().each(function(i) {

        $(this).css({
          "height": "",
          "line-height": ""
        });
        
        $(this).find(".m_outer").remove();

      });
      
    },
    
    revert: function() {
    
      if(this.hasUsed) {
    
        this.reverTdWidth();
      
        if(this.applyToAnotherTable) {
          this.revertElements("last");
        }
      
        this.$this.find(".m_inner").draggable("destroy");
        
        this.revertElements("first");
        
        this.hasUsed = false;
        
      }
    
    }
  
  };

  $.fn.tdWider = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('No ' + method + ' method.');
    }
  };

})(jQuery);