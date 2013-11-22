$(function(){
window['Walla'] = window['walla'] || {};

Walla.Slider = function(elem) {
	var t = this;
	
	this.elem				= elem;
	this.itemsMoved			= 0;
	this.totalItems			= 0; // set in reset method
	this.wrapperWidth		= 0; // set in reset method
	this.itemWidth			= 0; // set in reset method
	this.inSlide			= 0;
	this.itemsWrapper		= $('.slider-items-wrapper', elem);
	this.items				= this.resetItems();
	this.directionModifier	= this.calculateDirectionModifier();
	this.reset();
	
	var plugin = new Walla.Slider.Carousel(this);
//	var plugin = new Walla.Slider.CarouselFallback(this);

};

Walla.Slider.prototype = {
	reset: function() {
		this.resetTotalItems();
		this.resetWrapperWidth();
		this.resetItemWidth();
	},
	
	resetItems: function() {
		this.items = $('.slider-item', this.itemsWrapper);
		return this.items;
	},
	calculateDirectionModifier : function() {
		var items = this.items;
		return (items[0].offsetLeft > items[items.length-1].offsetLeft) ? 1 : 0-1;
	},
	getDirectionModifier : function() {
		return this.directionModifier;
	},
	getTotalItems: function() {
		return this.totalItems;
	},
	resetTotalItems: function() {
		this.totalItems = this.items.length;
	},
	getWrapperWidth: function() {
		return this.wrapperWidth;
	},
	resetWrapperWidth: function() {
		this.wrapperWidth = this.totalItems * this.items.outerWidth() * 3;
		//this.itemsWrapper.width(this.wrapperWidth);
	},
	getItemWidth: function() {
		return this.itemWidth;
	},
	resetItemWidth: function() {
		this.itemWidth = $('.slider-item',this.itemsWrapper).outerWidth();
	},
	getItemsMoved : function() {
		return this.itemsMoved;
	},
	setItemsMoved : function(itemsMoved) {
		this.itemsMoved = itemsMoved;
	},

	slideForward: function() {
		if (!this.inSlide) {
			this.inSlide = 1;
			this.itemsMoved = this.itemsMoved + 5;
			this.slide();
		}
	},
	
	slideBackward: function() {
		if (!this.inSlide) {
			this.inSlide = 1;
			this.itemsMoved = this.itemsMoved - 5;
			this.slide();
		}
	},
	slideEnd : function() {
		this.itemsWrapper.removeClass('sliding');
		$(this).trigger('pluginSlideEnd');
		this.inSlide = 0;
	},
	slide: function() {
		var t = this;
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
		slider.itemsWrapper.on(this.transitionEndEventName, function(event) {
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
		slider.setItemsMoved(slider.getTotalItems());
		slider.items.clone().prependTo(slider.itemsWrapper);
		slider.items.clone().appendTo(slider.itemsWrapper);
		this.fixPosition();
	},
	fixPosition: function() {
		var slider = this.slider;
		slider.itemsWrapper.css(this.transformCssStyle,'translatex('+(slider.getDirectionModifier()*slider.getItemWidth()*slider.getTotalItems())+'px)');
	},
	slide: function() {
		var slider = this.slider;
		slider.itemsWrapper.addClass('sliding').css(this.transformCssStyle,'translatex('+(slider.getDirectionModifier()*slider.getItemWidth()*slider.itemsMoved)+'px)');
	},
	slideEnd: function() {
		var slider = this.slider;

		var itemsToReposition = slider.getItemsMoved()-slider.getTotalItems();
		var items = $.makeArray(slider.items);
		if (itemsToReposition>=0) {
			for(var i=0;l=itemsToReposition,i<l;i++) {
				items.push(items.shift());
			}
		}
		else {
			for(var i=0;l=((0-1)*itemsToReposition),i<l;i++) {
				items.unshift(items.pop());
			}
		}
		slider.itemsWrapper.html(items)
	},
};

Walla.Slider.CarouselFallback = function(slider) {
	if(slider) {// check if slider is passed to make it safer for inheritance
		this.slider						= slider;
		var t							= this;
		this.fallbackAnimationProperty	= slider.getDirectionModifier() < 0 ? 'margin-left' : 'margin-right';
		this.wrapperOriginalMargin		= parseInt(slider.itemsWrapper.css(this.fallbackAnimationProperty));
		this.reset();
		this.bind();
	}
};

Walla.Slider.CarouselFallback.prototype = $.extend(new Walla.Slider.Carousel, {

	fixPosition: function() {
		var slider = this.slider;
		slider.itemsWrapper.css(this.fallbackAnimationProperty, this.wrapperOriginalMargin+(0-1)*slider.getItemWidth()*slider.getTotalItems());
	},

	slide: function() {
		var slider = this.slider;
		var animateObj = {};
		animateObj[this.fallbackAnimationProperty] = this.wrapperOriginalMargin+(0-1)*slider.getItemWidth()*slider.itemsMoved;
		slider.itemsWrapper.animate(animateObj, {duration:1500, complete: function(event){slider.slideEnd();}});
	}
});

Walla.Slider.init($('.slider')[0]);

});
