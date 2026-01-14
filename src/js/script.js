/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product', // CODE ADDED
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount', // CODE CHANGED
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
  },
  // CODE ADDED START
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
  // CODE ADDED END
};

const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  // CODE ADDED START
  cart: {
    wrapperActive: 'active',
  },
  // CODE ADDED END
};

const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  }, // CODE CHANGED
  // CODE ADDED START
  cart: {
    defaultDeliveryFee: 20,
    deliveryFee: 14,
    totalNumber: 0,
    subtotalPrice: 0,
  },
  // CODE ADDED END
};

const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  // CODE ADDED START
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
};

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

      app.cart.add(thisProduct.prepareCartProduct());
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

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFeeElem = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPriceElem = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPriceElem = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumberElem = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      })

      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      })
    }

    add(cartProduct){
      const thisCart = this;
      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(cartProduct);

      /* create element using utils.createElementFromHTML */
      const generatedDOM = thisCart.dom.element = utils.createDOMFromHTML(generatedHTML);

      /* add element to menu */
      thisCart.dom.productList.appendChild(generatedDOM);
      
      thisCart.products.push(new CartProduct(cartProduct, generatedDOM));
      thisCart.update();
    }

    update(){
      const thisCart = this;
      const deliveryFee = settings.cart.deliveryFee;
      let totalNumber = settings.cart.totalNumber;
      let subtotalPrice = settings.cart.subtotalPrice;

      if(thisCart.dom.totalNumberElem.value > 0){
        totalNumber = thisCart.dom.totalNumberElem.value;
      }
      if(thisCart.dom.subtotalPriceElem.value > 0){
        subtotalPrice = thisCart.dom.subtotalPriceElem.value;
      }


      for(let product of thisCart.products){
        totalNumber += product.amount;
        subtotalPrice += product.amount * product.priceSingle;
      }

      if(totalNumber > 0){
        thisCart.totalPrice = subtotalPrice + deliveryFee;
        thisCart.dom.deliveryFeeElem.innerHTML = deliveryFee;
      } else {
        thisCart.totalPrice = 0;
        thisCart.dom.deliveryFeeElem.innerHTML = 0;
      }

      thisCart.dom.totalNumberElem.innerHTML= totalNumber;
      thisCart.dom.subtotalPriceElem.innerHTML = subtotalPrice;
      thisCart.dom.totalPriceElem.innerHTML = thisCart.totalPrice;
    }

    remove(cartProduct){
      const thisCart = this;
      cartProduct.dom.wrapper.remove();

      //delete product from array
      const indexOfProduct = thisCart.products.indexOf(cartProduct.id);
      thisCart.products.splice(indexOfProduct,1);
      //call update
      thisCart.update();
    }
  }

  class CartProduct{

    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove); 

    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisCartProduct.updateTotalPriceOfProduct();
      })
    }
    
    updateTotalPriceOfProduct(){
      const thisCartProduct = this;

      //update thisCartProduct.amount and thisCartProduct.price
      thisCartProduct.amount = thisCartProduct.amountWidget.value;

      thisCartProduct.price = thisCartProduct.priceSingle;

      //update visible price
      const totalPrice = thisCartProduct.price * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = totalPrice; 
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail:{
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);

    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click',function(){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click',function(){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    initData: function() {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
