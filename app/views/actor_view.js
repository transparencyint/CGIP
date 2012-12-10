var DraggableView = require('./draggable_view');
var ActorDetailsView = require('./actor_details');

module.exports = DraggableView.extend({
  
  template : require('./templates/actor'),
  
  className : 'actor',

  events: function(){
    var parentEvents = DraggableView.prototype.events;
    // merge the parent events and the current events
    return _.defaults({
      'dblclick .name'    : 'startEditName',
      'dblclick .abbrev'  : 'startEditAbbrev',
      'blur .abbrev-input': 'stopEditAbbrev',
      'blur .name-input'  : 'stopEditName',
      'keydown input'     : 'saveOnEnter',
      'mousedown .inner'  : 'dragStart',
      'dblclick'          : 'showMetadataForm',
      'click'             : 'stopPropagation'
    }, parentEvents);
  },
  
  initialize: function(options){
    DraggableView.prototype.initialize.call(this, options);

    this.width = this.editor.radius*2;
    this.height = this.editor.radius*2;    

    this.model.on('change:abbreviation', this.updateAbbrev, this);
    this.model.on('change:name', this.updateName, this);
    this.model.on('change:role', this.drawRoleBorders, this);
    this.model.on('destroy', this.destroy, this);
  },

  showMetadataForm: function(){
    this.modal = new ActorDetailsView({ model: this.model, actor: this });
    this.editor.$el.append(this.modal.render().el);
  },

  stopPropagation: function(event){
    event.stopPropagation();
  },  

  select: function(event){
    if(!this.$el.hasClass("ui-selected")){
      this.$el.addClass("ui-selected").siblings().removeClass("ui-selected");
    }
    this.editor.actorSelected(this);
  },

  startEditName: function(event){
    if(event) event.stopPropagation();
    this.$el.addClass('editingName');
    this.dontDrag = true;
    
    var current = this.$('.name');
    var input = this.$('.name-input');
    
    this.$('.abbrev-input').hide();
    this.$('.abbrev').hide();
    this.$('.name-input').show();

    var divText = current.text();
    current.hide();
    input.val($.trim(divText));
    input.focus();
    input.select();
  },

  startEditAbbrev: function(event){
    if(event) event.stopPropagation();
    this.$el.addClass('editingName');
    this.dontDrag = true;
    
    var current = this.$('.abbrev');
    var input = this.$('.abbrev-input');
    
    this.$('.name-input').hide();
    this.$('.name').hide();
    this.$('.abbrev-input').show();

    var divText = current.text();
    current.hide();
    input.val($.trim(divText));
    input.focus();
    input.select();
  },

  stopEditAbbrev: function(event){
    this.$el.removeClass('editingName');

    this.model.save({abbreviation : this.$('.abbrev-input').val()});
    this.$('.abbrev-input').hide();
    this.showProperName();
    
    this.dontDrag = false;
  },
  
  stopEditName: function(event){
    this.$el.removeClass('editingName');

    this.model.save({name : this.$('.name-input').val()});
    this.$('.name-input').hide();
    this.showProperName();

    this.dontDrag = false;
  },

  showProperName: function(event){
    var abbrev = this.model.get('abbreviation');
    var name = this.model.get('name');
    if(abbrev.length !== 0){
      this.$('.name').hide();
      this.$('.abbrev').show();
    }else if(name.length !== 0){
      this.$('.abbrev').hide();
      this.$('.name').show();
    }else{
      this.$('.name').hide();
      this.$('.abbrev').show();
    }
  },

  updateAbbrev: function(){
    var abbrev = this.model.get('abbreviation');
    if(abbrev.length == 0){
      this.$('.abbrev').text('Unknown');
    }else
      this.$('.abbrev').text(abbrev);
    this.showProperName();
  },

  updateName: function(){
    var name = this.model.get('name');
    this.$('.name').text(name);
    this.showProperName();
  },
  
  saveOnEnter: function(event){
    if(event.keyCode === 13){
      if(this.$el.hasClass('editingName')){
        $(event.currentTarget).blur();
      }
    }
  },
  
  getRenderData : function(){
    return this.model.toJSON();
  },

  afterRender: function(){

    this.updateAbbrev();
    this.updateName();

    this.showProperName();

    this.updatePosition();

    this.$el.attr('id', this.model.id);

    this.drawRoleBorders();
  },

  drawRoleBorders: function(){
    var roles = this.model.get('role');
    var el = this.$el;

    // remove all previous paths and circles
    el.find('.svg-holder circle, .svg-holder path').remove();
    
    if(roles && roles.length > 0){
      var width =  130;
      var height = 130;
      
      el.find('.svg-holder').svg({settings:{'class': 'actor-svg'}});  
      var svg = el.find('.svg-holder').svg('get'); 

      /* if there is just one role we drwa a svg circle */
      if(roles.length == 1){
        var drawnPath = svg.circle(width/2, width/2, width/2, {
            strokeWidth: 1
          });
        $(drawnPath).attr({'class': roles[0], transform: 'translate(-5 -5)'});
      } else {
        var percent = 100 / roles.length;
        var angles = percent * 360 / 100;
        var startAngle = 0;
        var endAngle = 0;

        $.each(roles, function(role, roleValue){
          startAngle = endAngle;
          endAngle = startAngle + angles;

          x1 = parseInt(width/2 + ((width/2))*Math.cos(Math.PI*startAngle/180));
          y1 = parseInt(height/2 + ((height/2))*Math.sin(Math.PI*startAngle/180));

          x2 = parseInt(width/2 + ((width/2))*Math.cos(Math.PI*endAngle/180));
          y2 = parseInt(height/2 + ((height/2))*Math.sin(Math.PI*endAngle/180));                

          var path = svg.createPath();
          var drawnPath = svg.path(
            path.move(width/2, height/2).
            line(x1, y1).
            arc((width/2), (height/2), 0, 0, true, x2, y2).
            close(), {
              strokeWidth: 1,
              transform: 'translate(5 -5), rotate(90, 60, 60)'
            });

          $(drawnPath).attr('class', roleValue);

        });
      }
    }
  },

  destroy: function(){
    // TODO: call the proper destroy method and clean up the editor's view instances
    // TODO: call lightbox destroy as well
    DraggableView.prototype.destroy.call(this);

    if(this.modal) this.modal.destroy()

    this.editor.off('disableDraggable', this.disableDraggable, this);
    this.editor.off('enableDraggable', this.enableDraggable, this);
  }
});