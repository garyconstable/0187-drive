
/*******************************************************************************
Hello :)
*******************************************************************************/
$(function(){
  console.log("----> Hello ..");
});

/*******************************************************************************
Scroll Reveal
*******************************************************************************/
window.sr = ScrollReveal({ duration: 300, reset: true });
sr.reveal('.project-item', 300);

/*******************************************************************************
Wallop Slider
*******************************************************************************/
var wallopEl = document.querySelector('.Wallop');
var slider = new Wallop(wallopEl);

var count = $('.Wallop-list .Wallop-item').length;
var start = 0;
var end = count;
var index = start;

$(function(){
  setInterval(function() {
    slider.goTo(index);
    ++index;
    if (index == end) {index=start}
  },5000);
});


/*******************************************************************************
Nav
*******************************************************************************/
var MQL = 1170;

//primary navigation slide-in effect
if($(window).width() > MQL) {
  var headerHeight = $('.cd-header').height();
  $(window).on('scroll',
  {
    previousTop: 0
  },
  function () {
    var currentTop = $(window).scrollTop();
    //check if user is scrolling up
    if (currentTop < this.previousTop ) {
      //if scrolling up...
      if (currentTop > 0 && $('.cd-header').hasClass('is-fixed')) {
        $('.cd-header').addClass('is-visible');
      } else {
        $('.cd-header').removeClass('is-visible is-fixed');
      }
    } else {
      //if scrolling down...
      $('.cd-header').removeClass('is-visible');
      if( currentTop > headerHeight && !$('.cd-header').hasClass('is-fixed'))
      $('.cd-header').addClass('is-fixed');
    }
    this.previousTop = currentTop;
  });
}

//open/close primary navigation
$('.cd-primary-nav-trigger').on('click', function(){
  $('.cd-menu-icon').toggleClass('is-clicked');
  $('.cd-header').toggleClass('menu-is-open');

  //in firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
  if( $('.cd-primary-nav').hasClass('is-visible') ) {
    $('.cd-primary-nav').removeClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
      $('body').removeClass('overflow-hidden');
    });
  } else {
    $('.cd-primary-nav').addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
      $('body').addClass('overflow-hidden');
    });
  }
});

/*******************************************************************************
More project items
*******************************************************************************/
var row = false;
$('.more-projects').click(function(e){
  e.preventDefault();
  start = 0;
  end = 4;
  if(!row){
    row = true;
    start = 0;
    end = 4;
  }else{
    row = false;
    start = 4;
    end = 8;
  }

  var addItem = function(i){
    var tmp = $('.projects-container > div').eq(i).clone();
    $(tmp).find('.project-item').removeAttr('style').removeAttr('data-sr-id');
    $(tmp).appendTo('.projects-container');
    sr.sync();
  }

  var i = start, howManyTimes = end;
  function f() {
    addItem(i)
    i++;
    if( i < howManyTimes ){
      setTimeout( f, 300 );
    }
  }
  f()
});
