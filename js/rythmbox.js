window.rythmBox = window.rythmBox || {}

window.rythmBox.controller = (function(element) {

  var button = null
  var pusher = null
  var selectedInstrument = 0;
  var curNote = 1;
  var prevTime = 0;
  var pressTime = 0;
  var pressNote = 1;
  var pressed = false;
  var elapsed = 0;
  var beatLength = 960/8;
  var lineLength = beatLength * 16;
  var logThis = true;

  var connectToPusher = function(pusherAPIId) {
    pusher = new Pusher(pusherAPIId, {
      cluster: 'eu'
    });
  };

  var startListening = function(buttonId){
    var button = pusher.subscribe(buttonId);

    // button press
    button.bind('press', window.rythmBox.controller.onPressed);

    // button release:
    button.bind('release', window.rythmBox.controller.onReleased);

    pusher.connection.bind('connected', window.rythmBox.controller.onConnected);

  };

  var setup = function(pusherAPIId, buttonId) {
    connectToPusher('57cad681aa44cad36271');
    startListening('button-143');
    $("#rythmBoxTable tr." + selectedInstrument).addClass("selected");
    prevTime = new Date().getTime();
    requestAnimationFrame(simulationFrame);
  };

  var onPressed = function(data) {
    pressTime = new Date().getTime();
    pressed = true;
    $('#pressedStatus').addClass('enabled');
  };

  var onReleased = function(data) {
    pressed = false;
    curTime = new Date().getTime();
    if (curTime - pressTime > 1000) {
      console.log("long press");
      var newInstrument = (selectedInstrument + 1) % 4
      $("#rythmBoxTable tr." + newInstrument).toggleClass("selected");
      $("#rythmBoxTable tr." + selectedInstrument).toggleClass("selected");
      selectedInstrument = newInstrument;
    } else {
      console.log("short press");
      milisForPressTime = (curTime - prevTime) + elapsed
      pressNote = Math.round((milisForPressTime / beatLength) +1)
      $("tr.instrument.selected .beat." + pressNote).toggleClass("sound");
    }
    $('#pressedStatus').removeClass('enabled');
  };

  var onConnected = function(data) {
    $('#pressedStatus').addClass('connected');
  };

  var simulationFrame = function() {
    var curTime = new Date().getTime();
    milisSinceLastFrame = curTime - prevTime;
    elapsed = elapsed + milisSinceLastFrame;
    if(elapsed >= lineLength) {
      elapsed = elapsed - lineLength;
    }
    var newNote = Math.round(((elapsed / beatLength) +1))
    if(newNote != curNote) {
        $('.beat.' + newNote).addClass("active");
        $('.beat.' + curNote).removeClass("active");
        curNote = newNote;
        elements = $('.beat.active.sound audio').each(function() {
            this.play()
        });
    }
    prevTime = curTime;
    requestAnimationFrame(simulationFrame);
  }

  return {
    setup : setup,
    onPressed: onPressed,
    onReleased: onReleased,
    onConnected: onConnected
  }
}) ();
