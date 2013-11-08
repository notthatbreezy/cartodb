cdb.admin.mod.TorqueWizard = cdb.admin.mod.SimpleWizard.extend({

  MODULES: [],
  events: {
    'click .to_the_top': 'moveToFront'
  },

  LAYER_PROPS: ['property', 
    'torque-duration',
    'torque-steps',
    'torque-blend-mode',
    'torque-trails',
    'torque-is-time'
  ],

  error_msg: {
    NO_CONTENT_MSG: _t('There are no numeric or date columns on your table to make an animated visualization.<br/>If you have numbers on your table, but you don\'t see them here is likely they are set as String.'),
    LAYER_ON_TOP: _t('animated layers should be on top of the other ones.'),
    ONLY_ONE_TORQUE_LAYER: _t('only one Torque layer is allowed per visualization')
  },

  initialize: function() {
    this.options.form = cdb.admin.forms.get('torque');
    cdb.admin.mod.SimpleWizard.prototype.initialize.call(this);

    this.type = 'torque';
    this.layer_type = 'torque';

    this.options.table.bind('change:schema', function() {
      if(!this.options.table.containsColumn(this.cartoProperties.get('property'))) {
        var columns = this.validColumns();
        if(columns.length) {
          this.cartoProperties.set({ 
            'property': columns[0] 
          }, {
            silent:true
          });
        }
      }
      this.setFormProperties();
      this.render();
    }, this);

  },

  validColumns: function() {
    return this.options.table.columnNamesByType('number').concat(
      this.options.table.columnNamesByType('date')
    );
  },

  isLayerOnTop: function() {
    var collection = this.options.layer.collection;
    return collection.last().cid === this.options.layer.cid;
  },

  moveToFront: function() {
    this.options.layer.moveToFront();
    this.applyWizard();
  },

  torqueLayersCount: function() {
    return this.options.layer.collection.getLayersByType('torque').length;
  },

  getTorqueLayer: function() {
    return this.options.layer.collection.getLayersByType('torque')[0];
  },

  isValid: function() {
    // check if the layer is on top and there are numeric columns
    return this.validColumns().length > 0 && 
           this.isLayerOnTop() && 
           (this.torqueLayersCount() === 0 || (
              this.torqueLayersCount() === 1 && this.getTorqueLayer().cid === this.options.layer.cid)
           )
  },

  render: function() {
    if(this.isValid()) {
      cdb.admin.mod.SimpleWizard.prototype.render.call(this);
    } else {
      if (this.torqueLayersCount() !== 0) {
        this.renderError(this.error_msg.ONLY_ONE_TORQUE_LAYER);
      }
      else if (!this.isLayerOnTop()) {
        this.renderError(this.error_msg.LAYER_ON_TOP);
        $(this.$('.wrapper .no_content')[0]).append('<a href="#" class="to_the_top">move to the top</a>');
      } else {
        this.renderError(this.error_msg.NO_CONTENT_MSG);
      }
    }
    return this;
  },

  setFormProperties: function() {
    // If the table doesn't have any kind of geometry,
    // we avoid rendering the choroplethas
    if(this.options && this.options.form && this.options.form.length > 0) {
      //TODO: user numeric columns too
      var b = this.options.form[0].form.property.extra = this.validColumns();
      this.options.form[0].form.property.value = b[0];
    }
    this.setTextProperties();
  }

});

