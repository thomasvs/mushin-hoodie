angular.module('mushin')
  .directive('thingCell', function ($animate) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        var hammerConfig = {
          drag: true,
          dragBlockHorizontal: true,
          dragLockMinDistance: 20,
          dragLockToAxis: true,
        }

        if (scope.thing.end) {
          return
        }

        var $bg, $text, width, firstTreshold, secondTreshold, dragging
        var $scroll = element.parents('[bp-scroll]')

        var preventDefault = function(event) {
          event.preventDefault();
        }

        var onDragStart = function() {
          dragging = true

          $bg = angular.element(this)
          $text = $bg.children().first()

          width = $bg.width();
          firstTreshold = 40;
          secondTreshold = width * 0.6

          $text.css('transition', '')
          $bg.removeClass('left right first second')

          $bg.hammer(hammerConfig)
            .on('touchmove', preventDefault)
            .on('drag', onDrag)
            .on('dragend', onDragEnd)
        }

        var onDrag = function(event) {
          if (!dragging) return
          $text.css('transform', 'translateX(' + event.gesture.deltaX + 'px)');

          var class1, class2

          if (event.gesture.deltaX < 0) {
            class1 = 'right'
          } else if (event.gesture.deltaX > 0) {
            class1 = 'left'
          }

          if (Math.abs(event.gesture.deltaX) > secondTreshold) {
            class2 = ' second'
          } else if (Math.abs(event.gesture.deltaX) > firstTreshold) {
            class2 = ' first'
          }

          $bg
            .removeClass('right left first second'.replace(class1, '').replace(class2,''))
            .addClass((class1 || '') + ' ' + (class2 || ''))
        }

        var onDragEnd = function(event) {
          $bg.hammer(hammerConfig)
            .off('touchmove', preventDefault)
            .off('drag', onDrag)
            .off('dragend', onDragEnd)

          if (!dragging) return

          var action, move

          if (event.gesture.deltaX > secondTreshold) {
            action = attrs.swipeLongRight
            move = 'thing-cell-inner-right'
          } else if (-event.gesture.deltaX > secondTreshold) {
            action = attrs.swipeLongLeft
            move = 'thing-cell-inner-left'
          } else if (event.gesture.deltaX > firstTreshold) {
            action = attrs.swipeRight
            move = 'thing-cell-inner-right'
          } else if (-event.gesture.deltaX > firstTreshold) {
            action = attrs.swipeLeft
            move = 'thing-cell-inner-left'
          } else {
            move = 'thing-cell-inner-back'
          }

          $animate.addClass($text, move, function() {
            if (!action) {
              $text
                .removeClass(move)
                .css('transform', '')
              return
            }
            $animate.leave(element, function() {
              scope.$apply(action)

              if (angular.element.contains(document.documentElement, $text[0])) {
                $text
                  .removeClass(move)
                  .css('transform','')
              }
            })
            scope.$digest()
          })
        }

        element.hammer(hammerConfig)
          .on('dragstart', onDragStart)

        $scroll.on('scroll', function() {
          dragging = false

          if ($text) $text.css('transform', '')
        })

      }
    };
  });

