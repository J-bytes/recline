/*jshint multistr:true */

this.recline = this.recline || {};
this.recline.View = this.recline.View || {};

(function($, my) {
  "use strict";

my.FilterEditor = Backbone.View.extend({
  className: 'recline-filter-editor well',
  template: ' \
    <div class="filters"> \
      <h3>{{t.Filters}}</h3> \
      <a href="#" class="js-add-filter">{{t.Add_filter}}</a> \
      <form class="form-stacked js-add" style="display: none;"> \
        <div class="form-group"> \
          <label for="form-field-add-field">{{t.Field}}</label> \
          <select id="form-field-add-field" class="fields form-control"> \
            {{#fields}} \
            <option value="{{id}}">{{label}}</option> \
            {{/fields}} \
          </select> \
        </div> \
        <div class="form-group"> \
          <label for="form-field-filter-type">{{t.Filter_type}}</label> \
          <select id="form-field-filter-type" class="filterType form-control"> \
            <option value="term">{{t.Value}}</option> \
            <option value="range">{{t.Range}}</option> \
            <option value="geo_distance">{{t.Geo_distance}}</option> \
          </select> \
        </div> \
        <button type="submit" class="btn btn-default">{{t.Add}}</button> \
      </form> \
      <form class="form-stacked js-edit"> \
        {{#filters}} \
          {{{filterRender}}} \
        {{/filters}} \
        {{#filters.length}} \
        <button type="submit" class="btn btn-default">{{t.Update}}</button> \
        {{/filters.length}} \
      </form> \
    </div> \
  ',
  filterTemplates: {
    term: ' \
      <div class="filter-{{type}} filter"> \
        <fieldset> \
          <legend> \
            {{field}} <small>{{type}}</small> \
            <a class="js-remove-filter" href="#" title="{{t.Remove_this_filter}}" data-filter-id="{{id}}"><span class="wcag_hide">{{t.Remove_this_filter}}</span><span aria-hidden="true">&times;</span></a> \
          </legend> \
          <input class="input-sm" type="text" value="{{term}}" name="term" data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" /> \
        </fieldset> \
      </div> \
    ',
    range: ' \
      <div class="filter-{{type}} filter"> \
        <fieldset> \
          <legend> \
            {{field}} <small>{{type}}</small> \
            <a class="js-remove-filter" href="#" title="{{t.Remove_this_filter}}" data-filter-id="{{id}}"><span class="wcag_hide">{{t.Remove_this_filter}}</span><span aria-hidden="true">&times;</span></a> \
          </legend> \
          <div class="form-group"> \
            <label class="control-label" for="">{{t.From}}</label> \
            <input class="input-sm" type="text" value="{{from}}" name="from" data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" /> \
          </div> \
          <div class="form-group"> \
            <label class="control-label" for="">{{t.To}}</label> \
            <input class="input-sm" type="text" value="{{to}}" name="to" data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" /> \
          </div> \
        </fieldset> \
      </div> \
    ',
    geo_distance: ' \
      <div class="filter-{{type}} filter"> \
        <fieldset> \
          <legend> \
            {{field}} <small>{{type}}</small> \
            <a class="js-remove-filter" href="#" title="{{t.Remove_this_filter}}" data-filter-id="{{id}}"><span class="wcag_hide">{{t.Remove_this_filter}}</span><span aria-hidden="true">&times;</span></a> \
          </legend> \
          <div class="form-group"> \
            <label class="control-label" for="">{{t.Longitude}}</label> \
            <input class="input-sm" type="text" value="{{point.lon}}" name="lon" data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" /> \
          </div> \
          <div class="form-group"> \
            <label class="control-label" for="">{{t.Latitude}}</label> \
            <input class="input-sm" type="text" value="{{point.lat}}" name="lat" data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" /> \
          </div> \
          <div class="form-group"> \
            <label class="control-label" for="">{{t.Distance_km}}</label> \
            <input class="input-sm" type="text" value="{{distance}}" name="distance" data-filter-field="{{field}}" data-filter-id="{{id}}" data-filter-type="{{type}}" /> \
          </div> \
        </fieldset> \
      </div> \
    '
  },
  events: {
    'click .js-remove-filter': 'onRemoveFilter',
    'click .js-add-filter': 'onAddFilterShow',
    'submit form.js-edit': 'onTermFiltersUpdate',
    'submit form.js-add': 'onAddFilter'
  },
  initialize: function() {
    _.bindAll(this, 'render');
    this.listenTo(this.model.fields, 'all', this.render);
    this.listenTo(this.model.queryState, 'change change:filters:new-blank', this.render);
    this.render();
  },
  render: function() {
    var self = this;
    var tmplData = $.extend(true, {}, this.model.queryState.toJSON());
    // we will use idx in list as there id ...
    tmplData.filters = _.map(tmplData.filters, function(filter, idx) {
      filter.id = idx;
      return filter;
    });
    tmplData.fields = this.model.fields.toJSON();
    tmplData.filterRender = function() {
      var filterData = I18nMessages('recline', recline.View.translations).injectMustache(this);
      return Mustache.render(self.filterTemplates[this.type], filterData);
    };
    tmplData = I18nMessages('recline', recline.View.translations).injectMustache(tmplData);
    var out = Mustache.render(this.template, tmplData);
    this.$el.html(out);
  },
  onAddFilterShow: function(e) {
    e.preventDefault();
    var $target = $(e.target);
    $target.hide();
    this.$el.find('form.js-add').show();
  },
  onAddFilter: function(e) {
    e.preventDefault();
    var $target = $(e.target);
    $target.hide();
    var filterType = $target.find('select.filterType').val();
    var field      = $target.find('select.fields').val();
    this.model.queryState.addFilter({type: filterType, field: field});
  },
  onRemoveFilter: function(e) {
    e.preventDefault();
    var $target = $(e.target);
    var filterId = $target.attr('data-filter-id');
    this.model.queryState.removeFilter(filterId);
  },
  onTermFiltersUpdate: function(e) {
   var self = this;
    e.preventDefault();
    var filters = self.model.queryState.get('filters');
    var $form = $(e.target);
    _.each($form.find('input'), function(input) {
      var $input = $(input);
      var filterType  = $input.attr('data-filter-type');
      var fieldId     = $input.attr('data-filter-field');
      var filterIndex = parseInt($input.attr('data-filter-id'), 10);
      var name        = $input.attr('name');
      var value       = $input.val();

      switch (filterType) {
        case 'term':
          filters[filterIndex].term = value;
          break;
        case 'range':
          filters[filterIndex][name] = value;
          break;
        case 'geo_distance':
          if(name === 'distance') {
            filters[filterIndex].distance = parseFloat(value);
          }
          else {
            filters[filterIndex].point[name] = parseFloat(value);
          }
          break;
      }
    });
    self.model.queryState.set({filters: filters, from: 0});
    self.model.queryState.trigger('change');
  }
});


})(jQuery, recline.View);
