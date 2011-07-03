var app = {
	baseURL: util.getBaseURL(document.location.pathname),
	container: 'main_content'
};

app.handler = function(route) {
  if (route.params && route.params.route) {
    var path = route.params.route;
    app.routes[path](route.params.id);
  } else {
    app.routes['home']();
  }  
};

app.routes = {
  home: function() {
    removalist.bootstrap();
  },
  page: function(id) {
    removalist.getPageSize();
  }
}

app.after = {
  tableContainer: function() {
    removalist.activateControls();
  },
  dataTable: function() {
    $('.column-header-menu').click(function(e) { 
      app.currentColumn = $(e.target).siblings().text();
      util.position('menu', e);
      util.render('columnActions', 'menu');
    });
  },
  actions: function() {
    $('.button').click(function(e) { 
      util.position('menu', e, {left: -60});
      util.render('exportActions', 'menu');
    });
  },
  exportActions: removalist.handleMenuClick,
  columnActions: removalist.handleMenuClick,
  bulkEdit: function() {
    var editor = $('.expression-preview-code');
    editor.val("function(doc) {\n  doc['"+ app.currentColumn+"'] = doc['"+ app.currentColumn+"'];\n  return doc;\n}");
    editor.focus().get(0).setSelectionRange(18, 18); 
    editor.keydown(function(e) {
      // if you don't setTimeout it won't grab the latest character if you call e.target.value
      window.setTimeout(function(){costco.handleEditorChange(e)}, 1, true);
    });
  }
}

app.sammy = $.sammy(function () {
  this.get('', app.handler);
  this.get("#/", app.handler);
  this.get("#:route", app.handler);
  this.get("#:route/:id", app.handler);
});

$(function() {
  app.sammy.run();  
})