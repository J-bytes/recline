/*jshint multistr:true */

// Field Info
//
// For each field
//
// Id / Label / type / format

// Editor -- to change type (and possibly format)
// Editor for show/hide ...

// Summaries of fields
//
// Top values / number empty
// If number: max, min average ...

// Box to boot transform editor ...

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function($, my) {
  "use strict";
  
my.Fields = Backbone.View.extend({
  className: 'recline-fields-view', 
  template: ' \
    <div class="panel-group fields-list well"> \
    <h3>{{t.Fields}} <a href="#" class="js-show-hide" title="{{t.Show_field}}"><span class="wcag_hide">{{t.Show_field}}</span><span aria-hidden="true">+</span></a></h3> \
    {{#fields}} \
      <div class="panel panel-default field"> \
        <div class="panel-heading"> \
          <i class="glyphicon glyphicon-file"></i> \
          <h4> \
            {{label}} \
            <small> \
              {{type}} \
              <a class="accordion-toggle" data-toggle="collapse" href="#collapse{{id}}" title="{{t.Expand_and_collapse}}"> <span class="wcag_hide">{{t.Expand_and_collapse}}</span><span aria-hidden="true">&raquo;</span> </a> \
            </small> \
          </h4> \
        </div> \
        <div id="collapse{{id}}" class="panel-collapse collapse"> \
          <div class="panel-body"> \
            {{#facets}} \
            <div class="facet-summary" data-facet="{{id}}"> \
              <ul class="facet-items"> \
              {{#terms}} \
                <li class="facet-item"><span class="term">{{term}}</span> <span class="count">[{{count}}]</span></li> \
              {{/terms}} \
              </ul> \
            </div> \
            {{/facets}} \
            <div class="clear"></div> \
          </div> \
        </div> \
      </div> \
    {{/fields}} \
    </div> \
  ',

  initialize: function(model) {
    var self = this;
    _.bindAll(this, 'render');

    // TODO: this is quite restrictive in terms of when it is re-run
    // e.g. a change in type will not trigger a re-run atm.
    // being more liberal (e.g. binding to all) can lead to being called a lot (e.g. for change:width)
    this.listenTo(this.model.fields, 'reset', function(action) {
      self.model.fields.each(function(field) {
        field.facets.unbind('all', self.render);
        field.facets.bind('all', self.render);
      });
      // fields can get reset or changed in which case we need to recalculate
      self.model.getFieldsSummary();
      self.render();
    });
    this.$el.find('.collapse').collapse();
    this.render();
  },
  render: function() {
    var self = this;
    var tmplData = {
      fields: []
    };
    this.model.fields.each(function(field) {
      var out = field.toJSON();
      out.facets = field.facets.toJSON();
      tmplData.fields.push(out);
    });
    var tmplData = I18nMessages('recline', recline.View.translations).injectMustache(tmplData);
    var templated = Mustache.render(this.template, tmplData);
    this.$el.html(templated);
  }
});

})(jQuery, recline.View);
