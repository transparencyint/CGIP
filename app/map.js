var inputDown, inputMove, inputUp;

if (window.Touch) {
	inputDown = "touchstart";
	inputMove = "touchmove";
	inputUp = "touchend";
}
else {
	inputDown = "mousedown";
	inputMove = "mousemove";
	inputUp = "mouseup";
}

function normalizedX(event){
	return window.Touch ? event.originalEvent.touches[0].pageX : event.pageX;
}	

function normalizedY(event){
	return window.Touch ? event.originalEvent.touches[0].pageY : event.pageY;
}

var actors = [
  {
    id : 1,
    name : 'Actor A',
    pos : {
      x : 342,
      y : 145
    },
    connections : [
      {
        to : 2,
        direction : 'left'
      },
    ],
  },
  {
    id : 2,
    name : 'Actor B',
    pos : {
      x : 193,
      y : 389
    }
  },
];

function render(){
  for(actor in actors){
    actor = actors[actor];
    $('body').append( createActor(actor.name, actor.pos) );
  }
}

render();

function createActor(name, pos){
  return $('<div></div>')
            .addClass('actor')
            .css({ left: pos.x, top: pos.y })
            .append(
              $('<div></div>')
                .addClass('name')
                .text(name)
            )
            .append(
              $('<div></div>')
                .addClass('connectors')
                .append($('<div class="connector top"></div>'))
                .append($('<div class="connector right"></div>'))
                .append($('<div class="connector bottom"></div>'))
                .append($('<div class="connector left"></div>'))
            );
}

$('body').on(inputDown, '.actor', startToDrag);
$('body').on(inputDown, '.connector', startToConnect);

function startToConnect(event){
  event.preventDefault();
  event.stopPropagation();
  if(event.button === 2) return true; // right-click
  
  var myOffset = $(this).offset();
  startPos = { 
    x : normalizedX(event) - myOffset.left,
    y : normalizedY(event) - myOffset.top
  };
  
  $(this).addClass('selected').parents('.actor').addClass('selected');

  $('body').addClass('dragging');
  $(document).one(inputUp, function(){ 
    $('body').removeClass('dragging');
    $('.selected').removeClass('selected');
  });
  
  $(document).bind(inputMove, moveConnection);
}

function moveConnection(){
  
}

function startToDrag(event){
  event.preventDefault();
  if(event.button === 2) return true; // right-click
  selectedElement = $(event.target).parents('.actor');
  var myOffset = selectedElement.offset();
  startPos = { 
    x : normalizedX(event) - myOffset.left,
    y : normalizedY(event) - myOffset.top
  };
  $(document).bind(inputMove, moveElement);
  moveElement(event);
}

function moveElement(event){
    selectedElement.css({ 
      top : normalizedY(event) - startPos.y,
      left : normalizedX(event) - startPos.x
    });
}

$(document).bind(inputUp, function(){ $(this).unbind(inputMove); });

var connection = function(x0, y0, x1, y1, size, color){
  this.update = function(x0, y0, x1, y1, size, color){
    this.size = size;
    this.color = color;
    this.start = {
      x : x0 + this.size,
      y : y0 + this.size,
    };
    this.end = {
      x : x1 + this.size,
      y : y1 + this.size,
    };
    
    this.width = Math.abs(this.end.x - this.start.x) + this.size*2;
    this.height = Math.abs(this.end.y - this.start.y) + this.size*2;
     
    this.cp1 = {
      x : this.start.x,
      y : this.end.y,
    };
    this.cp2 = {
      x : this.end.x,
      y : this.start.y,
    };
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.margin = -this.size + "px 0 0 -" + this.size + "px";
    
    this.ctx.lineWidth = this.size;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.start.x, this.start.y);
    this.ctx.bezierCurveTo(this.cp1.x, this.cp1.y, this.cp2.x, this.cp2.y, this.end.x, this.end.y);
    this.ctx.stroke();
  };
  
  this.canvas = document.createElement('canvas');
  this.ctx = this.canvas.getContext('2d');
  
  this.update(x0, y0, x1, y1, size, color);
  
  this.render = function(){
    return this.canvas;
  }
};

//$('body').append( new connection(0, 0, 500, 500, 3, 'black'); );