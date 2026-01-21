import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.element = element;
    thisBooking.render(thisBooking.element);
    thisBooking.initWidgets();
  }

  render(wrapper){
    const thisBooking = this;
    const codeHtml = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrapper;
    thisBooking.dom.wrapper.innerHTML = codeHtml;
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePickerElem = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerElem = document.querySelector(select.widgets.hourPicker.wrapper);
  }
    
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerElem);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPickerElem);
    

    thisBooking.dom.peopleAmount.addEventListener('updated', function(){
      
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function(){
      
    });
  }
}

export default Booking;