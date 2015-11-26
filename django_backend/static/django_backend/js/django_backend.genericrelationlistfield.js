define(
    'django_backend.genericrelationlistfield',
    [
      'jquery',
      'stapes',
      'django_backend.ajaxdialog'
    ],
    function ($, Stapes, AjaxDialog, undefined) {

  "use strict";

  var GenericRelationListField = Stapes.subclass({
    defaults: {},

    constructor: function (element, options) {
      this.$element = $(element);
      this.options = $.extend({}, this.defaults, options);
    },

    /* Setup DOM handlers.
     *
     * The init* methods should only be called once per DOM element. We do not check
     * if it's called multiple times.
     */ 
    init: function () {
      this.initElementHandlers();
    },

    /**
     * Initialize click handlers for "add new item" and "update item".
     * The "delete item" links is handled by the "formset" plugin.
     */
    initElementHandlers: function () {
      var self = this;

      var openDialog = function ($relationItem, dialogOptions) {
        dialogOptions = $.extend({
          // Don't update preview if data-dialog-update-preview="no" is set.
          updatePreview: $(this).attr('data-dialog-update-preview') == 'no' ? false : true
        }, dialogOptions);

        var dialog = new AjaxDialog(this, {
          url: $(this).attr('href'),
          width: 880,  // dialog width should be similar to normal content width content area
          height: Math.min(800, $(window).height() - 150),
          parentPageContext: self.options.pageContext
        });

        dialog.on('load', function (data) {
          if (data.action === 'select') {
            if ($relationItem === undefined) {
              self.addItem(data);
            } else {
              if (dialogOptions.updatePreview) {
                self.updateItem($relationItem, data);
              }
            }
            dialog.close();
          }
          if (data.action === 'dismiss') {
            dialog.close();
          }
        });

        // Close dropdown if dialog was triggered from with-in a dropdown
        // menu.
        $(this).closest('.btn-group.open').removeClass('open');

        dialog.open();
      };

      /*
       * Handler for add item button.
       */
      this.$element.on('click', '[data-dialog=add-relation]', function (event) {
        openDialog.call(this);
        return false;
      });

      /*
       * Handler for edit item icon.
       */
      this.$element.on('click', '[data-dialog=update-relation]', function (event) {
        var $relationItem = $(this).parents('.generic-relation-list-field__item');
        openDialog.call(this, $relationItem);
        return false;
      });
    },

    _getTotalFormsInput: function () {
      var formsetPrefix = this.$element.attr('data-formset-prefix');
      return this.$element.find('[name=' + formsetPrefix + '-TOTAL_FORMS]');
    },

    /**
     * Set the fields of a item form.
     */
    _updateFields: function ($itemFields, data) {
      var fieldData = {
          object_id: data.object_id,
          content_type: data.content_type_id,
      };

      var updateFieldData = function () {
          var match = $(this).attr('name').match(/-\d+-(.+)$/);
          if (match && fieldData[match[1]]) {
              var fieldName = match[1];
              $(this).attr('value', fieldData[fieldName]);
          }
      };

      $itemFields.find('input').each(updateFieldData);
    },

    /**
     * Prepare a new relation form and return it.
     */
    _getTemplate: function (prefix) {
      var $template = this.$element.find('.generic-relation-list-field__item.template').clone();
      $template.removeClass('template');

      $template.find('input').each(function () {
          var replacePrefix = function (index, attrValue) {
              return attrValue.replace(/__prefix__/, prefix);
          };

          $(this).attr('name', replacePrefix);
          $(this).attr('id', replacePrefix);
      });

      return $template;
    },

    /**
     * Add a new item to the formset.
     */
    addItem: function (data) {
      // Clone template, fill it with data and attach it to the
      // current region.
      var formPrefix = this._getTotalFormsInput().val();
      var $template = this._getTemplate(formPrefix);

      this._updateFields($template, data);

      $template.find('.content').append(data.preview);
      var $formset = this.$element.find('.generic-relation-list-field__list')
      $formset.append($template);

      this.options.pageContext.inherit().init($formset);

      // Increase TOTAL_FORMS field by one.
      // This must come last to not influence the formPrefix from above.
      this._getTotalFormsInput().val(function (index, value) {
          return parseInt(value) + 1;
      });

      this.emit('add update');
      this.emit('add_form');
      // Also trigger the formset's add_form.
      $formset.trigger('add_form');
    },

    /**
     * Update an already existing item in the formset. First
     * parameter is the DOM element of the item that shall be updated. Second
     * argument is the items response data.
     */
    updateItem: function ($relationItem, data) {
      this._updateFields($relationItem, data);
      var $content = $relationItem.find('.content').empty().append(data.preview);
      this.options.pageContext.inherit().init($content);

      this.emit('update');
      this.emit('update_form');
    }
  });

  return GenericRelationListField;

});