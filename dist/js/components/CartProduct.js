import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class CartProduct{

  constructor(menuProduct, element){
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.params = menuProduct.params;
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

  getData(){
    const thisCartProduct = this;
    let productData = {};
    productData.id = thisCartProduct.id;
    productData.amount = thisCartProduct.amount;
    productData.price = thisCartProduct.price;
    productData.priceSingle = thisCartProduct.priceSingle;
    productData.name = thisCartProduct.name;
    productData.params = thisCartProduct.params;

    return productData;
  }
}

export default CartProduct;