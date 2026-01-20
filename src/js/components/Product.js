import { select,templates,classNames } from "../settings.js";
import { utils } from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Product{

  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.dom = {};

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu(){
    const thisProduct = this;
    /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
      thisProduct.dom.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
      thisProduct.dom.menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
      thisProduct.dom.menuContainer.appendChild(thisProduct.dom.element);
  }
  
  getElements(){
    const thisProduct = this;

    thisProduct.dom.accordionTrigger = thisProduct.dom.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.dom.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.dom.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.dom.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.dom.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.dom.element.querySelector(select.menuProduct.amountWidget);  
  }


  initAccordion(){
    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {

      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct !== thisProduct.dom.element) {
        activeProduct.classList.remove('active');
      }

      /* toggle active class on thisProduct.element */
      thisProduct.dom.element.classList.toggle('active');

    });
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        // czy obiekt formData zawiera właściwość o kluczu takim, jak klucz parametru (powinien, ale lepiej się upewnić)
        // czy w tablicy zapisanej pod tym kluczem znajduje się klucz opcji (wspomniana wcześniej metoda (includes)).
        const isOptionSelected = formData[paramId] && formData[paramId].includes(optionId);
        const isOptionDefault = option.default === true;
        const imgSelector = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        // sprawdzić czy opcja jest default i czy jest zaznaczone -> podnieść cene
        if(isOptionSelected && !isOptionDefault){
          price += option.price;
        }
        // sprawdzić czy opcja default jest odznaczona -> zmniejszyć cenę
          else if(!isOptionSelected && isOptionDefault){
          price -= option.price;
        }

        if(isOptionSelected && imgSelector){
          imgSelector.classList.add(classNames.menuProduct.imageVisible);
        } else if(!isOptionSelected && imgSelector){
          imgSelector.classList.remove(classNames.menuProduct.imageVisible);
        }

      }
    }
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    // app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles:true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      }
    });

    thisProduct.dom.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;
    const id = thisProduct.id;
    const name = thisProduct.data.name;
    const amount = thisProduct.amountWidget.value;
    const priceSingle = thisProduct.priceSingle;
    const price = priceSingle * amount;
    const productSummary = {id, name, amount, priceSingle, price};
    productSummary.params = thisProduct.prepareCartProductParams();

    return productSummary
  }

  prepareCartProductParams(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    let productParamsSummary = {};

    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];

      productParamsSummary[paramId] = {
        label: param.label,
        options: {}
      }

      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        const isOptionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(isOptionSelected){
          productParamsSummary[paramId].options[optionId] = option.label;
        }
      } 
    }

    console.log('Product parametrs:', productParamsSummary);
    return productParamsSummary;
  }
}

export default Product;