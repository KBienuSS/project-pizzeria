import { select, templates, settings, classNames } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";
import { utils } from "../utils.js";

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.element = element;
    thisBooking.render(thisBooking.element);
    thisBooking.initWidgets();
    thisBooking.initActions();
    thisBooking.getData();
    thisBooking.pickTable();
  }

  render(wrapper){
    const thisBooking = this;
    const codeHtml = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = wrapper;

    thisBooking.dom.wrapper.innerHTML = codeHtml;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerElem = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerElem = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.date = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisBooking.hour = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
  }
    
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerElem);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPickerElem);
    

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      thisBooking.resetPickedTable();
    });

  }

  initActions(){
    const thisBooking = this;
    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    })
  }

  pickTable(){
    const thisBooking = this;

    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){

       const tableElement = event.target;

        // [DONE] check if table isnt block       
        if(tableElement.classList.contains('booked')){
          return;
        }

        if(tableElement.classList.contains('active')){
          tableElement.classList.remove('active');
          thisBooking.pickedTable = null;
          return;
        }

        if(tableElement && tableElement.getAttribute('data-table') != null){
          thisBooking.resetPickedTable();
          // [DONE] if you click a table 
          tableElement.classList.add('active');
          thisBooking.pickedTable = tableElement.getAttribute('data-table');
        }
    })
  }

  resetPickedTable(){
    const thisBooking = this;
    // [DONE] check if other tables dont have class active 
    for(let table of thisBooking.dom.tables){
            table.classList.remove('active');
    }
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;
    const booking = {};
    booking.date = thisBooking.date;
    booking.hour = utils.numberToHour(thisBooking.hour);
    booking.table = parseInt(thisBooking.pickedTable);
    booking.duration = parseInt(thisBooking.dom.form.querySelector('input[name="hours"]').value); 
    booking.ppl = parseInt(thisBooking.dom.form.querySelector('input[name="people"]').value);
    booking.starters = [];
    booking.phone = thisBooking.dom.form.querySelector('input[name="phone"]').value;
    booking.address = thisBooking.dom.form.querySelector('input[name="address"]').value;
    
    const water = thisBooking.dom.form.querySelector('input[value="water"]');
    const bread = thisBooking.dom.form.querySelector('input[value="bread"]');

    if(water.checked){
      booking.starters.push(water.value);
    }

    if(bread.checked){
      booking.starters.push(bread.value);
    }

    const options = { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking)
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log(parsedResponse);
        thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
      }); 
  }

  getData(){
    const thisBooking = this; 

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:         settings.db.url + '/' + settings.db.bookings
                                       + '?' + params.booking.join('&'),
      eventsCurrent:   settings.db.url + '/' + settings.db.events
                                       + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:    settings.db.url + '/' + settings.db.events
                                       + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponse){
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings ,eventsCurrent ,eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      })
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
     }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock <= startHour + duration; hourBlock += 0.5){

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for( let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
}

export default Booking;