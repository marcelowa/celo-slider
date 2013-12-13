(function($){
	window['Walla'] = window['walla'] || {};

	Walla.Slider = function(elem, options) {
		this.elem				= elem;
		this.options			= $.extend(
			{
				'loopMode'			: true,
				'easing'			: 'ease',
				'duration'			: 1250,
				'itemSelector'		: '.slider-item',
				'maskSelector'		: '.slider-mask',
				'slidableSelector'	: '.slider-items-slidable'
			},
			options||{}
		);

		this.position			= 0;
		this.inSlide			= 0;
		this.slidable			= $(this.options.slidableSelector, elem);
		this.mask 				= $(this.options.maskSelector, elem);
		this.items				= this.resetItems();
		this.directionModifier	= this.calculateDirectionModifier();
		this.reset();

		if (Modernizr.csstransforms) {
			var plugin = new Walla.Slider.Carousel(this);
		}
		else {
			var plugin = new Walla.Slider.CarouselFallback(this);
		}

	};

	Walla.Slider.prototype = {
		reset: function() {
		},
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
		calculateDirectionModifier : function() {
			var items = this.getItems();
			return (items[0].offsetLeft > items[items.length-1].offsetLeft) ? 1 : 0-1;
		},
		getDirectionModifier : function() {
			return this.directionModifier;
		},
		getSlidableWidth: function() {
			return this.slidable.width();
		},
		getItemWidth: function() {
			return $('.slider-item',this.slidable).outerWidth();
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
	Walla.Slider.init = function(elem) {
		var jElem = $(elem);
		var slider = new Walla.Slider(elem);
		$('.slider-forward', jElem).on('click', function() {
			slider.slideForward();
		});

		$('.slider-backward', jElem).on('click', function() {
			slider.slideBackward();
		});
	};

	Walla.Slider.Carousel = function(slider) {
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

	Walla.Slider.Carousel.prototype = {
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

	Walla.Slider.CarouselFallback = function(slider) {
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

	Walla.Slider.CarouselFallback.prototype = $.extend(new Walla.Slider.Carousel, {

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

	$(function(){
		Walla.Slider.init($('.slider')[0]);
	});

})(jQuery);


