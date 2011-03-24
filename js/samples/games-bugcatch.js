BUGCATCH = (function() {
    
    /* bug definition */
    
    var Bug = function(params) {
        // initialise the heading
        this.heading = Math.random() * Math.PI * 2 | 0;
        this.frameIndex = 0;
        
        // initialise the scale factor and speed
        this.speed = MIN_SPEED;
        this.scaleFactor = Math.max(Math.random(), 0.5);
        
        // flag as transformable
        params.transformable = true;
        T5.ImageDrawable.call(this, params);
        
        this.scale(this.scaleFactor);
        this.rotate(this.heading);
    };
    
    Bug.prototype = COG.extend(T5.ImageDrawable.prototype, {
        constructor: Bug,
        
        changeHeading: function(centerX, centerY) {
            var x = this.xy.x,
                y = this.xy.y, 
                distX = x - centerX,
                distY = y - centerY,
                distance = Math.sqrt(distX * distX + distY * distY),
                theta,
                targetHeading;

            // determine the angle between here and the center of the view
            theta = Math.asin((y - centerY) / distance);
            theta = x > centerX ? theta : Math.PI - theta;

            targetHeading = (distance > 500 ? theta : this.heading) + (Math.random() * MAX_TURN) - (MAX_TURN/2);
            
            this.animate('rotate', [this.heading], [targetHeading], {
                easing: 'sine.out',
                duration: TURN_DURATION,
                progress: function(complete, updatedHeading) {
                    this.heading = updatedHeading;
                    if (complete) {
                        this.changeHeading(centerX, centerY);
                    } // if
                }
            });
        },
        
        move: function() {
            this.changeImage('/img/bugcatch/bug_' + this.bugType + '_' + this.frameIndex + '.png');
            this.frameIndex = (this.frameIndex + 1) % FRAME_COUNT;
            
            // calculate a speed change
            this.speed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, this.speed + (Math.random() * 4) - 2)) | 0;
            
            // update the xy position of the bug
            this.xy = T5.XY.extendBy(this.xy, this.heading, this.speed);
        }
    });
    
    var CaptureLayer = function(params) {
        params = COG.extend({
            zindex: 100
        }, params);
        
        /* internals */
        
        var drawXY,
            pointerUp = false,
            movePoints = [];
        
        /* exports */
        
        function draw(context, viewRect, state, view, tickCount, hitData) {
            context.fillStyle = 'rgba(30, 30, 30, 0.5)';
            context.strokeStyle = 'rgba(30, 30, 30, 0.7)';
            
            if (movePoints.length) {
                var lastPoint = movePoints[movePoints.length - 1];
                
                // move to the last point
                context.beginPath();
                context.moveTo(lastPoint.x, lastPoint.y);
                
                // now draw some lines
                for (var ii = movePoints.length; ii--; ) {
                    context.lineTo(movePoints[ii].x, movePoints[ii].y);
                } // for
                
                // stroke the path
                context.stroke();
            } // if
            
            // if the pointer up has been fired, fire the on check path event
            if (pointerUp) {
                _this.trigger('captureFinished', context);
                movePoints = [];
                pointerUp = false;
            } // if

            if (drawXY) {
                context.beginPath();
                context.arc(
                    drawXY.x,
                    drawXY.y,
                    5,
                    0, 
                    Math.PI * 2,
                    false
                );
                context.fill();
            } // if
        } // draw
        
        function hover(evt, absXY, relXY) {
            drawXY = relXY;
        } // hover
        
        function move(evt, absXY, relXY) {
            drawXY = relXY;
            movePoints.push(relXY);
        } // move
        
        function up(evt, absXY, relXY) {
            pointerUp = true;
        } // up
        
        var _this = COG.extend(new T5.ViewLayer(params), {
            draw: draw,
            hover: hover,
            move: move,
            up: up
        });
        
        return _this;
    };
    
    /* internals */
    
    var MAX_TURN = Math.PI / 2,
        COUNT_BUGTYPES = 2,
        MOVE_REFRESH = 50,
        FRAME_COUNT = 5,
        TURN_DURATION = 1000,
        MIN_SPEED = 5,
        MAX_SPEED = 10,
        bugs = [],
        lastMoveCheck = 0,
        view,
        sprites,
        events,
        capture,
        plane;
        
    function catchBugs(evt, context) {
        // iterate through teh bugs and check for points in path
        for (var ii = bugs.length; ii--; ) {
            var bugXY = bugs[ii].xy;
            
            if (context.isPointInPath(bugXY.x, bugXY.y)) {
                bugs[ii].bugType = bugs[ii].bugType ^ 1;
            } // if
        } // for
    } // catchBugs
        
    function createBugs(bugCount) {
        var viewport = view.getViewport(),
            viewWidth = viewport.width,
            viewHeight = viewport.height;
            
        // create some bugs
        for (var ii = bugCount; ii--; ) {
            var bugTypeIdx = Math.random() * COUNT_BUGTYPES | 0,
                randomX = Math.random() * viewWidth | 0,
                randomY = Math.random() * viewHeight | 0,
                bug = bugs[bugs.length] = new Bug({
                    bugType: bugTypeIdx,
                    xy: T5.XY.init(randomX, randomY)
                });
                
            COG.info('created bug @ x = ' + randomX + ', y = ' + randomY);
            
            // change the bug heading
            bug.changeHeading(
                viewport.x1 + (viewWidth >> 1),
                viewport.y1 + (viewHeight >> 1)
            );
            
            // add the bug to the sprites layer
            sprites.add(bug);
        } // for
        
        $('#bug_count').html(bugs.length);
    } // createBugs
    
    function moveBugs() {
        // iterate through the bugs and move
        for (var ii = bugs.length; ii--; ) {
            bugs[ii].move.call(bugs[ii]);
        } // for

        view.redraw = true;
    } // moveBugs
        
    function handleTap(evt, elements, absXY, relXY, offsetXY) {
    } // handleTap
    
    /* initialization */
    
    view = new T5.View({
        container: 'mapContainer'
    });
    
    // handle the draw complete event
    view.bind('tapHit', handleTap);
    view.bind('enterFrame', moveBugs);
    
    // add a shape layer for our sprites
    view.setLayer('sprites', sprites = new T5.ShapeLayer());
    
    // add the capture layer
    view.setLayer('capture', capture = new CaptureLayer());
    
    // bind to the capture finished event of the capture layer
    capture.bind('captureFinished', catchBugs);
    
    createBugs(10);
    
    // watch for events
    events = INTERACT.watch(document.getElementById('mapContainer'));
    events.bind('pointerHover', capture.hover);
    events.bind('pointerMove', capture.move);
    events.bind('pointerUp', capture.up);
    
    return {
        createBugs: createBugs
    };
})();