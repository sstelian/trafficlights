/* Traffic lights with Javascript and Espruino
   author : Stelian Saracut <stelian@saracut.ro>
   created on : 23.02.2016
*/

function onInit() //contains all the code
{
  
var state  = 1;
var //LED pins
 ped_green = B3,
 ped_red   = B4,
 car_red   = B5,
 car_yellow= B6,
 car_green = B7;

var //buttons
 ped_button   = A8,
 onoff_button = A5;

var
 idle_int = 0, //id of interval used in idle
 main_int = 0; //id of interval that changes lights on pedestrian's request

var
 block = 0; //multiple requests block
 

//state functions

function idle() //blinking yellow light
{
  var lstate = 0;
  ped_green.write(0);
  ped_red.write(0);
  car_red.write(0);
  car_yellow.write(0);
  car_green.write(0);
  function blink()
  {
    car_yellow.write(lstate);
    lstate = !lstate;
  }
  idle_int = setInterval(blink,500);
}

function greenForCars() 
{
  ped_green.write(0);
  ped_red.write(1); //red for pedestrians
  car_red.write(0);
  car_yellow.write(0);
  car_green.write(1); //green for cars
}

function yellowForCars()
{
  ped_green.write(0);
  ped_red.write(1); //red for pedestrians
  car_red.write(0);
  car_yellow.write(1); //turned on
  car_green.write(0); 
}

function redForAll()
{
  ped_green.write(0);
  ped_red.write(1); //red for pedestrians
  car_red.write(1); //red for cars
  car_yellow.write(0);
  car_green.write(0);
}

function greenForPedestrians()
{
  ped_green.write(1); //green for pedestrians
  ped_red.write(0);
  car_red.write(1); //red for cars
  car_yellow.write(0);
  car_green.write(0);
}

//state transitions

function states()
{
  console.log(state);
  switch(state)
  {
    case 1: 
      greenForCars();
      break;
    case 2 : 
      yellowForCars();
      break;
    case 3 : 
      redForAll();
      break;
    case 4 : 
      greenForPedestrians();
      break;
    case 5 : 
      redForAll();
      break;
  }
  if (state!==0)
  {
    state++;
    if (state > 6)
    {
      state = 1;
      if (main_int!==0)
      {
        clearInterval(main_int);
        main_int=0;
      }
      greenForCars();
      block = 0;
    }
  }
}


var watch=0;
var on=0; //on or idle
idle(); //set idle state on boot
console.log('boot ok. idle.');
setWatch(function() {
  on = !on;
  if (on)
  {
    console.log('ligths on');
    state = 1;
    clearInterval(idle_int); //disable interval from idle
    greenForCars();
    watch = setWatch(function() { //request for street crossing
      if(block===0)
      {
        block = 1;
        console.log('cross request');
        state = 1;
        if (main_int===0)
           main_int = setInterval(states,3000);
      }
    }, ped_button, { repeat: true, debounce : 50, edge: "rising" });
  }
  else //switch to idle
  {
    if(main_int!==0)
      clearInterval(main_int);
    if(watch!==0)
    {
      clearWatch(watch); //disable cross button
      watch = 0;
    }
    console.log('ligths off');
    state = 0;
    idle();
  }
}, onoff_button, { repeat: true, debounce : 50, edge: "rising" });

}

onInit(); //run the above code at boot


