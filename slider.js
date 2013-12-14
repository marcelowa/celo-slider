(function($){
	window['Celo'] = window['Celo'] || {};

	Celo.Slider = function(elem, options) {
		var t = this;
		this.elem = elem;
		this.options = $.extend(
			{
				// 'loopMode'			: true,
				'easing'			: 'ease',
				'duration'			: 1250,
				'itemSelector'		: '.slider-item',
				'maskSelector'		: '.slider-mask',
				'slidableSelector'	: '.slider-items-slidable',
				'sliderItemSelector' : '.slider-item',
				'forwardSelector'	: '.slider-forward',
				'backwardSelector'	: '.slider-backward'
			},
			options || {}
		);

		$(this.options.forwardSelector, elem).on('click', function() {
			t.slideForward();
		});

		$(this.options.backwardSelector, elem).on('click', function() {
			t.slideBackward();
		});

		this.position			= 0;
		this.inSlide			= 0;
		this.slidable			= $(this.options.slidableSelector, elem);
		this.mask 				= $(this.options.maskSelector, elem);
		this.items				= this.resetItems();

		if (Modernizr.csstransforms) {
			var plugin = new Celo.Slider.CarouselLoop(this);
		}
		else {
			var plugin = new Celo.Slider.CarouselLoopFallback(this);
		}

	};

	Celo.Slider.prototype = {
		getItems: function() {
			return this.items;
		},
		resetItems: function() {
			this.items = $(this.options.itemSelector, this.slidable);
			return this.items;
		},
		getTotalVisibleItems: function() {
			var items=0, width=0, mask=this.mask;
			this.items.each(function(){
				if (width < $(mask).width()) {
					items++;
				}
				width+=$(this).outerWidth(true);
			});
			return items;
		},
		getDirectionModifier : function() {
			var items = this.getItems();
			return (items[0].offsetLeft > items[items.length-1].offsetLeft) ? 1 : 0-1;
		},
		getSlidableWidth: function() {
			return this.slidable.width();
		},
		getItemWidth: function() {
			return $(this.options.sliderItemSelector,this.slidable).outerWidth();
		},
		getPosition : function() {
			return this.position;
		},
		setPosition : function(position) {
			this.position = position;
		},

		slideForward: function() {
			if (!this.inSlide) {
				this.inSlide = 1;
				this.setPosition(this.getPosition()+100);
				this.slide();
			}
		},

		slideBackward: function() {
			if (!this.inSlide) {
				this.inSlide = 1;
				this.setPosition(this.getPosition()-100);
				this.slide();
			}
		},
		slideEnd : function() {
			$(this).trigger('pluginSlideEnd');
			this.inSlide = 0;
		},
		slide: function() {
			$(this).trigger('pluginSlide');
		}
	};

	Celo.Slider.CarouselLoop = function(slider) {
		if(slider) { // check if slider is passed to make it safer for inheritance
			var transEndEventNames = {
				'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
				'MozTransition'    : 'transitionend',      // only for FF < 15
				'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
			};

			$(('<style>' +
				'.sliding {' +
					'-webkit-transition:-webkit-transform {duration} {easing};' +
					'-moz-transition:-moz-transform {duration} {easing};' +
					'-o-transition:-o-transform {duration} {easing};' +
					'-ie-transition:-ie-transform {duration} {easing}' +
					'transition:transform {duration} {easing}' +
				'}' +
				'</style>').replace(/{duration}/g, slider.options.duration/1000+'s').replace(/{easing}/g, slider.options.easing)
			).appendTo('head');

			this.slider					= slider;
			this.transformCssStyle		= Modernizr.prefixed('transform');
			this.transitionEndEventName	= transEndEventNames[Modernizr.prefixed('transition')];
			this.reset();
			this.bind();
		}
	};

	Celo.Slider.CarouselLoop.prototype = {
		bind: function() {
			var slider = this.slider;
			var t = this;
			slider.slidable.on(this.transitionEndEventName, function() {
				slider.slideEnd();
			});
			$(slider).on('pluginSlide', function(){
				t.slide();
			}).on('pluginSlideEnd', function(){
				t.slideEnd();
				t.reset();
			});

		},

		reset: function() {
			var slider = this.slider;
			slider.resetItems();
			slider.setPosition(100);
			slider.slidable.prepend(slider.getItems().slice((0-1)*slider.getTotalVisibleItems()).clone());
			slider.slidable.append(slider.getItems().slice(0,slider.getTotalVisibleItems()).clone());
			this.jumpToPosition();
		},

		jumpToPosition: function() {
			var slider = this.slider;
			slider.slidable.css(this.transformCssStyle,'translatex('+slider.getDirectionModifier()*slider.getPosition()+'%)');
		},

		slide: function() {
			var slider = this.slider;
			slider.slidable
				.addClass('sliding')
				.css(this.transformCssStyle,'translatex('+(slider.getDirectionModifier()*slider.getPosition())+'%)');
		},

		slideEnd: function() {
			var slider = this.slider;
			var itemsMoved = Math.ceil(slider.getSlidableWidth()/slider.getItemWidth());
			var items = $.makeArray(slider.getItems());
			var i,l;
			if (slider.getPosition()>0) {
				for(i=0,l=itemsMoved;i<l;i++) {
					items.push(items.shift());
				}
			}
			else {
				for(i=0,l=itemsMoved;i<l;i++) {
					items.unshift(items.pop());
				}
			}
			slider.slidable
				.removeClass('sliding')
				.html(items);
		}
	};

	Celo.Slider.CarouselLoopFallback = function(slider) {
		if(slider) {// check if slider is passed to make it safer for inheritance
			this.slider		= slider;
			this.easing		= {}[slider.options.easing]||'swing';
			this.duration	= slider.options.duration;
			this.reset();
			slider.slidable.css('position', 'relative');
			slider.mask.css('position', 'relative');
			this.bind();
		}
	};

	Celo.Slider.CarouselLoopFallback.prototype = $.extend(new Celo.Slider.CarouselLoop, {

		jumpToPosition: function() {
			var slider = this.slider;
			slider.slidable.css('left',slider.getDirectionModifier()*slider.getPosition()+'%');
		},

		slide: function() {
			var slider = this.slider;
			slider.slidable.animate(
				{'left': slider.getPosition()+'%'},
				{
					duration: this.duration,
					easing: this.easing,
					complete: function() {slider.slideEnd();}
				}
			);
		}
	});

	$.fn.celoSlider = function(options) {
	    return this.each(function() {
	    	var elem = $(this);
	    	var slider = new Celo.Slider(elem, options);
	    });
	};

})(jQuery);
