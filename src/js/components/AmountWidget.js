import { settings,select } from "../settings.js";

class AmountWidget{
  constructor(element){
    const thisWidget= this;
    
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.defaultMin = settings.amountWidget.defaultMin;
    thisWidget.defaultMax = settings.amountWidget.defaultMax;
    if(thisWidget.input.value){
      thisWidget.defaultValue = thisWidget.input.value;  
    } else {
      thisWidget.defaultValue = settings.amountWidget.defaultValue;
    }
  }

  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value);
    

    /*Dodaj walidacje*/
    if(thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue >= thisWidget.defaultMin &&
      newValue <= thisWidget.defaultMax
    ){
      thisWidget.value = newValue;
      thisWidget.annouce();
    }
    
    thisWidget.input.value = thisWidget.value;

  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener("change", function() {
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkIncrease.addEventListener("click", function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });

    thisWidget.linkDecrease.addEventListener("click", function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

  }

  annouce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }

}

export default AmountWidget;