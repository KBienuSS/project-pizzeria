import { settings,select } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget= this;
    
    thisWidget.getElements();
    thisWidget.setValue(thisWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(newValue){
    return !isNaN(newValue)
    && newValue >= settings.amountWidget.defaultMin 
    && newValue <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener("change", function() {
      thisWidget.calue = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkIncrease.addEventListener("click", function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });

    thisWidget.dom.linkDecrease.addEventListener("click", function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

  }

}

export default AmountWidget;