import { settings,select,classNames,templates } from "../settings.js";
import { utils } from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.deliveryFee;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFeeElem = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPriceElem = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPriceElems = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumberElem = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    })

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    })

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
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
    thisCart.totalNumber = settings.cart.totalNumber;
    thisCart.subtotalPrice = settings.cart.subtotalPrice;

    if(thisCart.dom.totalNumberElem.value > 0){
      thisCart.totalNumber = thisCart.dom.totalNumberElem.value;
    }
    if(thisCart.dom.subtotalPriceElem.value > 0){
      thisCart.subtotalPrice = thisCart.dom.subtotalPriceElem.value;
    }


    for(let product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.amount * product.priceSingle;
    }

    if(thisCart.totalNumber > 0){
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      thisCart.dom.deliveryFeeElem.innerHTML = thisCart.deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      thisCart.dom.deliveryFeeElem.innerHTML = 0;
    }

    thisCart.dom.totalNumberElem.innerHTML= thisCart.totalNumber;
    thisCart.dom.subtotalPriceElem.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalPriceElems.forEach(elem => {
      elem.innerHTML = thisCart.totalPrice;
    });
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

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {};
    payload.address = thisCart.dom.form.querySelector('input[name="address"]').value;
    payload.phone = thisCart.dom.form.querySelector('input[name="phone"]').value;
    payload.totalPrice = thisCart.totalPrice;
    payload.subtotalPrice = thisCart.subtotalPrice;
    payload.totalNumber = thisCart.totalNumber;
    payload.deliveryFee = thisCart.deliveryFee;
    payload.products = [];

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}

export default Cart;