var app = {

	firstClickSet: null,
	firstElement: null,
	secondElement: null,
	neededMatch: null,
	popupActivated: null,

	init: function() {
		app.prototypes.shuffle();
		app.prototypes.contains();
		app.shuffleAndInsertDOMAttributes();
		app.events();
	},

	gameReplayed: function() {
		$.cookie("Popup", "Activated");
	},

	events: function() {
		var FF = !(window.mozInnerScreenX == null);
		if (navigator.userAgent.match(/AppleWebKit/) && !navigator.userAgent.match(/Chrome/)) {
   			$(".face.front").css("-webkit-transform", "translate3d(0px, 0px, 0px)");
		} else if (FF) {
			$(".face.front").css("-moz-transform", "translate3d(0px, 0px, 0px)");
		} else {
			if (app.isBusy !== true) {
				$('.flip').on("click", function() {
					if (app.cards.contains("Popup Activated") !== true) {
						$(this).find(".card").addClass("flipped");
					} else {
						alert("Sorry, but please hit okay first");
					}
				});
			}
		}

		$('.card').on("click", function (e) {
			app.card.click(this);
			_gaq.push(['_trackEvent', 'Game-CardClick', 'Game-TotalIndividualCardsClicked']);
		});
	},

	card: {

		click: function(currentCard) {
			var currentCardSet = $(currentCard).attr("data-card-set");

			if (app.firstClickSet == null) {
				if (app.cards.contains("Popup Activated") !== true) {
					if (app.isBusy !== true) {

						app.isBusy = true;
						app.card.initializeLeftHeart();

						$(currentCard).find(".back").css("z-index", "-1");
						$(currentCard).find(".front").css("z-index", "1");

						app.firstElement = $("div").find("[data-card-set='" + currentCardSet + "']");

						app.firstClickSet = currentCardSet;


						var i = 0;
						for (i; i < app.cards.length; i++) {
							if (app.firstClickSet == app.cards[i].set) {
								app.card.initializeImageOnClickEvent(i)
								app.card.grabAndPlaceLeftNameOnClickEvent(i);
								app.card.grabAndPlaceLeftShowNameOnClickEvent(i);
								app.neededMatch = app.cards[i].match;

								app.isBusy = false;
							};
						continue;
						};
					}

				}
			}
			else if (app.firstClickSet !== null && app.neededMatch !== null) {

				var secondClickSet = $(currentCard).attr("data-card-set");
				app.secondElement = $(currentCard);

				$(currentCard).find(".back").css("z-index", "-1");
				$(currentCard).find(".front").css("z-index", "10");

				app.card.initializeRightHeart();

				for (i = 0; i < app.cards.length; i++) {
					if (secondClickSet == app.cards[i].set) {
						app.card.initializeImageOnClickEvent(i);
						app.card.grabAndPlaceRightNameOnClickEvent(i);
						app.card.grabAndPlacRightShowNameOnClickEvent(i);
						app.card.checkForMatch(secondClickSet);
					}
					continue;
				}
				app.firstClickSet = null;
				app.neededMatch = null;
			}

		},

		checkForMatch: function(_secondClickSet) {
			if (app.isBusy !== true) {
				app.isBusy = true;

				if (_secondClickSet == app.neededMatch) {
					$(".click-to-flip-heart").hide();
					$(".correct-match-heart").show();
					_gaq.push(['_trackEvent', 'Game-Logic', 'Game-SuccessfulMatch']);

					setTimeout(function(){
						$(".correct-match-heart").hide();
						$(".click-to-flip-heart").show();
						app.card.hideCardsAfterMatch();
						app.card.initializeTextReset();
						app.card.initializeActiveHeartsOnMatchSuccess();
						app.isBusy = false;
					}, 700);

					app.cards.push(true);
					app.card.checkForWin();

					return;
				}	else {
					$(".click-to-flip-heart").hide();
					$(".incorrect-match-heart").show();
					_gaq.push(['_trackEvent', 'Game-Logic', 'Game-IncorrectMatch']);

					setTimeout(function(){
						$(".incorrect-match-heart").hide();
						$(".click-to-flip-heart").show();
						$(".card").removeClass("flipped");
						app.card.initializeTextReset();
						$(app.firstElement).find(".face.front").css("z-index", "-1");
						$(app.secondElement).find(".face.front").css("z-index", "-1");
						app.isBusy = false;
					}, 1150);
				}
			}
		},

		checkForWin: function() {
			if (app.cards.length == 24) {
				setTimeout(function(){
					_gaq.push(['_trackEvent', 'Game-Logic', 'Game-Wins']);
					$("#cards").hide();
					if (app.popupActivated == true) {
						$("#thank-you-wrapper.post-popup").show();
					} else if (app.popupActivated == null && $.cookie("Popup") == "Activated") {
						$("#thank-you-wrapper.post-popup").show();
					} else if (app.popupActivated === null) {
						$("#thank-you-wrapper.no-popup").show();
					}
				}, 500);
			}
		},

		readSweepstakesCookie: function(cookieName) {
		 	return $.cookie("hallmark_sweepstakes_entry");
		},

		initializeWinningAnimation: function() {
			app.popupActivated = true;

			app.cards.push("Popup Activated");
			setTimeout(function(){
				var winnerPopup =
				"<div class='js-popup-wrapper'>" +
					"<div class='js-popup-text'>" +
						"Congratulations!  You have earned a bonus entry in " +
						"Hallmark Channel's Heart of Valentine's Sweepstakes." +
					"</div>" +
					"<div class='js-popup-button'>" +
						"<a href='#'>OK</a>" +
					"</div>" +
				"</div>"

				$(".js-popup-incomming").append(winnerPopup).animate({
					position: "absolute",
					top: "290px",
					right: "393px"
				}, 200);
			 }, 700);

				$(".js-popup-button").live("click", function() {
					_gaq.push(['_trackEvent', 'Game-Logic', 'Game-BonusPopupActivated']);
					var $this = $(".js-popup-incomming");
					app.cards.pop();
					$this.fadeOut();
				});
		},

		initializeThankYouScreen: function() {
			$("#thank-you-wrapper").css("style", "display: block;").animate({
				top: "40px;"
			});
		},

		initializeTextReset: function() {
			$(".name-left").text("");
			$(".name-right").text("");
			$(".show-name-left").text("");
			$(".show-name-right").text("");
		},

		initializeActiveHeartsOnMatchSuccess: function() {
			if (app.cards.length == 17) {
				_gaq.push(['_trackEvent', 'Game-MatchCount', '1 match']);
				var leftHeart = $(".left-small-hearts-wrapper > .heart:nth-child(8)")
				var rightHeart = $(".right-small-hearts-wrapper > .heart:nth-child(1)")

				var user_email = app.card.readSweepstakesCookie("hallmark_sweepstakes_entry");
				if(user_email){
					$.post(site_url + 'enter', 'email='+user_email+'&bonus_entry=1', function(response)
					{
						if(response == "true"){
							app.card.initializeWinningAnimation();
						}
					});
				}

				$(".left-small-hearts-wrapper > .heart.left-8 > .js-glow").addClass("heart-glow");
				$(".right-small-hearts-wrapper > .heart.right-1 > .js-glow").addClass("heart-glow");
				setTimeout(function() {
					$(".left-small-hearts-wrapper > .heart.left-8 > .js-glow").removeClass("heart-glow")
					$(".right-small-hearts-wrapper > .heart.right-1 > .js-glow").removeClass("heart-glow");
					app.card.initializeLeftHeart(leftHeart);
					app.card.initializeRightHeart(rightHeart);

				}, 200);
			}
			if (app.cards.length == 18) {
				_gaq.push(['_trackEvent', 'Game-MatchCount', '2 matches']);
				var leftHeart = $(".left-small-hearts-wrapper > .heart:nth-child(7)")
				var rightHeart = $(".right-small-hearts-wrapper > .heart:nth-child(2)")
				$(".left-small-hearts-wrapper > .heart.left-7 > .js-glow").addClass("heart-glow");
				$(".right-small-hearts-wrapper > .heart.right-2 > .js-glow").addClass("heart-glow");
				setTimeout(function() {
					$(".left-small-hearts-wrapper > .heart.left-7 > .js-glow").removeClass("heart-glow");
					$(".right-small-hearts-wrapper > .heart.right-2 > .js-glow").removeClass("heart-glow");
					app.card.initializeLeftHeart(leftHeart);
					app.card.initializeRightHeart(rightHeart);
				}, 200);
			}
			if (app.cards.length == 19) {
				_gaq.push(['_trackEvent', 'Game-MatchCount', '3 matches']);
				var leftHeart = $(".left-small-hearts-wrapper > .heart:nth-child(6)")
				var rightHeart = $(".right-small-hearts-wrapper > .heart:nth-child(3)")
				$(".left-small-hearts-wrapper > .heart.left-6 > .js-glow").addClass("heart-glow");
				$(".right-small-hearts-wrapper > .heart.right-3 > .js-glow").addClass("heart-glow");
				setTimeout(function() {
					$(".left-small-hearts-wrapper > .heart.left-6 > .js-glow").removeClass("heart-glow")
					$(".right-small-hearts-wrapper > .heart.right-3 > .js-glow").removeClass("heart-glow");
					app.card.initializeLeftHeart(leftHeart);
					app.card.initializeRightHeart(rightHeart);
				}, 200);
			}
			if (app.cards.length == 20) {
				_gaq.push(['_trackEvent', 'Game-MatchCount', '4 matches']);
				var leftHeart = $(".left-small-hearts-wrapper > .heart:nth-child(5)")
				var rightHeart = $(".right-small-hearts-wrapper > .heart:nth-child(4)")
				$(".left-small-hearts-wrapper > .heart.left-5 > .js-glow").addClass("heart-glow");
				$(".right-small-hearts-wrapper > .heart.right-4 > .js-glow").addClass("heart-glow");
				setTimeout(function() {
					$(".left-small-hearts-wrapper > .heart.left-5 > .js-glow").removeClass("heart-glow");
					$(".right-small-hearts-wrapper > .heart.right-4 > .js-glow").removeClass("heart-glow");
					app.card.initializeLeftHeart(leftHeart);
					app.card.initializeRightHeart(rightHeart);
				}, 200);
			}
			if (app.cards.length == 21) {
				_gaq.push(['_trackEvent', 'Game-MatchCount', '5 matches']);
				var leftHeart = $(".left-small-hearts-wrapper > .heart:nth-child(4)")
				var rightHeart = $(".right-small-hearts-wrapper > .heart:nth-child(5)")
				$(".left-small-hearts-wrapper > .heart.left-4 > .js-glow").addClass("heart-glow");
				$(".right-small-hearts-wrapper > .heart.right-5 > .js-glow").addClass("heart-glow");
				setTimeout(function() {
					$(".left-small-hearts-wrapper > .heart.left-4 > .js-glow").removeClass("heart-glow");
					$(".right-small-hearts-wrapper > .heart.right-5 > .js-glow").removeClass("heart-glow");
					app.card.initializeLeftHeart(leftHeart);
					app.card.initializeRightHeart(rightHeart);
				}, 200);
			}
			if (app.cards.length == 22) {
				_gaq.push(['_trackEvent', 'Game-MatchCount', '6 matches']);
				var leftHeart = $(".left-small-hearts-wrapper > .heart:nth-child(3)")
				var rightHeart = $(".right-small-hearts-wrapper > .heart:nth-child(6)")
				$(".left-small-hearts-wrapper > .heart.left-3 > .js-glow").addClass("heart-glow");
				$(".right-small-hearts-wrapper > .heart.right-6 > .js-glow").addClass("heart-glow");
				setTimeout(function() {
					$(".left-small-hearts-wrapper > .heart.left-3 > .js-glow").removeClass("heart-glow");
					$(".right-small-hearts-wrapper > .heart.right-6 > .js-glow").removeClass("heart-glow");
					app.card.initializeLeftHeart(leftHeart);
					app.card.initializeRightHeart(rightHeart);
				}, 200);
			}
			if (app.cards.length == 23) {
				_gaq.push(['_trackEvent', 'Game-MatchCount', '7 matches']);
				var leftHeart = $(".left-small-hearts-wrapper > .heart:nth-child(2)")
				var rightHeart = $(".right-small-hearts-wrapper > .heart:nth-child(7)")
				$(".left-small-hearts-wrapper > .heart.left-2 > .js-glow").addClass("heart-glow");
				$(".left-small-hearts-wrapper > .heart.right-7 > .js-glow").addClass("heart-glow");
				setTimeout(function() {
					$(".left-small-hearts-wrapper > .heart.left-2 > .js-glow").removeClass("heart-glow");
					$(".left-small-hearts-wrapper > .heart.right-7 > .js-glow").removeClass("heart-glow");
					app.card.initializeLeftHeart(leftHeart);
					app.card.initializeRightHeart(rightHeart);
				}, 200);
			}
			if (app.cards.length == 24) {
				_gaq.push(['_trackEvent', 'Game-MatchCount', '8 matches']);
				var leftHeart = $(".left-small-hearts-wrapper > .heart:nth-child(1)")
				var rightHeart = $(".right-small-hearts-wrapper > .heart:nth-child(8)")
				$(".left-small-hearts-wrapper > .heart.left-1 > .js-glow").addClass("heart-glow");
				$(".left-small-hearts-wrapper > .heart.right-8 > .js-glow").addClass("heart-glow");
				setTimeout(function() {
					$(".left-small-hearts-wrapper > .heart.left-1 > .js-glow").removeClass("heart-glow");
					$(".left-small-hearts-wrapper > .heart.right-8 > .js-glow").removeClass("heart-glow");
					app.card.initializeLeftHeart(leftHeart);
					app.card.initializeRightHeart(rightHeart);
				}, 200);
			}
		},

		initializeLeftHeart: function(leftHeart) {
			$(leftHeart).removeClass("heart").addClass("heart-active");
		},

		initializeRightHeart: function(rightHeart) {
			$(rightHeart).removeClass("heart").addClass("heart-active");
		},

		hideCardsAfterMatch: function() {
			$(app.firstElement).hide();
			$(app.secondElement).hide();
		},

		initializeImageOnClickEvent: function(i) {
			var image = app.cards[i].imgID;
			var currentFrontFace = $($(".face.front").get(i));
			$(currentFrontFace).css({
				"background": "url('images/cards/" + image + ".png')",
				"z-index": "0"
			});
		},

		grabAndPlaceLeftNameOnClickEvent: function(context) {
			var firstName = app.cards[context].name;
			$(".name-left").text(app.cards[context].name);
		},

		grabAndPlaceRightNameOnClickEvent: function(context) {
			var secondName = app.cards[context].name;
			$(".name-right").text(app.cards[context].name);
		},

		grabAndPlaceLeftShowNameOnClickEvent: function(context) {
			var leftShowName = app.cards[context].showTitle;
			if(leftShowName !== null) {
				var setShowNameLeft = $(".show-name-left").text(leftShowName);
				$(setShowNameLeft).animate({ left: "-31px" })
			}
		},

		grabAndPlacRightShowNameOnClickEvent: function(context) {
			var rightShowName = app.cards[context].showTitle;
			if (rightShowName !== null) {
				var setShowNameRight = $(".show-name-right").text(rightShowName);
				$(setShowNameRight).stop().animate({ left: "0" })
			}
		} },

	cards: [
		{ name: "Dan", match: "a2", set: "a1", imgID: "be-my-valentine-Dan", showTitle: "Be My Valentine" },
		{ name: "Kate", match: "a1", set: "a2", imgID: "be-my-valentine-Kate", showTitle: "Be My Valentine" },

		{ name: "Daphne", match: "a4", set: "a3", imgID: "frasier-Daphne", showTitle: "Frasier" },
		{ name: "Niles", match: "a3", set: "a4", imgID: "frasier-Niles", showTitle: "Frasier" },

		{ name: "Carol", match: "b2", set: "b1", imgID: "brady-bunch-Carol", showTitle: "Brady Bunch" },
		{ name: "Mike", match: "b1", set: "b2", imgID: "brady-bunch-Mike", showTitle: "Brady Bunch" },

		{ name: "Howard", match: "b4", set: "b3", imgID: "happy-days-Dad", showTitle: "Happy Days" },
		{ name: "Marion", match: "b3", set: "b4", imgID: "happy-days-Mom", showTitle: "Happy Days" },

		{ name: "Caroline", match: "c2", set: "c1", imgID: "little-house-Caroline", showTitle: "Little House" },
		{ name: "Charles", match: "c1", set: "c2", imgID: "little-house-Charles", showTitle: "Little House" },

		{ name: "Lucy", match: "c4", set: "c3", imgID: "i-love-lucy-Lucy", showTitle: "I Love Lucy" },
		{ name: "Ricky", match: "c3", set: "c4", imgID: "i-love-lucy-Ricky", showTitle: "I Love Lucy" },

		{ name: "John", match: "d2", set: "d1", imgID: "the-waltons-John", showTitle: "The Waltons" },
		{ name: "Olivia", match: "d1", set: "d2", imgID: "the-waltons-Olivia", showTitle: "The Waltons" },

		{ name: "Eddie", match: "d4", set: "d3", imgID: "accidentally-in-love-Eddit", showTitle: "Accidentally In Love" },
		{ name: "Annie", match: "d3", set: "d4", imgID: "accidentally-in-love-Annie", showTitle: "Accidentally In Love" }
	],

	shuffleAndInsertDOMAttributes: function() {
		app.cards.shuffle();
		for (var i = 0; i < app.cards.length; i++) {
			$($(".card").get(i)).attr("data-card-set", app.cards[i].set);
		}
	},

	prototypes: {
		shuffle: function() {
			Array.prototype.shuffle = function() {
			    for(var i = this.length - 1; i > 0; i--) {
        			var j = Math.floor(Math.random()*i);
        			var swap = this[i];
        			this[i]  = this[j];
        			this[j]  = swap;
    			}
    		return this;
			}
		},

		// Used for checking if an Array contains a value/string/or object.
		contains: function() {
			Array.prototype.contains = function(obj) {
			    var i = this.length;
			    while (i--) {
			        if (this[i] === obj) {
			            return true;
			        }
			    }
			    return false;
			}
		}
	},

	// HELPER FUNCTIONS //
	fixIEConsole: function() {
		if (!window.console) (function() {

		    var __console, Console;

		    Console = function() {
		        var check = setInterval(function() {
		            var f;
		            if (window.console && console.log && !console.__buffer) {
		                clearInterval(check);
		                f = (Function.prototype.bind) ? Function.prototype.bind.call(console.log, console) : console.log;
		                for (var i = 0; i < __console.__buffer.length; i++) f.apply(console, __console.__buffer[i]);
		            }
		        }, 1000);

		        function log() {
		            this.__buffer.push(arguments);
		        }

		        this.log = log;
		        this.error = log;
		        this.warn = log;
		        this.info = log;
		        this.__buffer = [];
		    };

		    __console = window.console = new Console();
		})();
	},

	clearConsole: function() {
		console.log = function() {};
		console.warn = function() {};
	}

};

$(document).ready(function() {

	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-25069926-9']);
	  _gaq.push(['_trackPageview']);

	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();

	app.fixIEConsole();
	app.clearConsole();

	app.init();

});