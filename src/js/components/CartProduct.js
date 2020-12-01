import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    /* zdefiniuj stałą thisCartProduct i zapisz w niej obiekt this */
    const thisCartProduct = this;

    /* zapisz właściwości thisCartProduct czerpiąc wartości z menuProduct dla tych właściwości: id, name, price, priceSingle, amount, */
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;

    /* zapisz właściwość thisCartProduct.params nadając jej wartość JSON.parse(JSON.stringify(menuProduct.params)) */
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    /* wykonaj metodę getElements przekazując jej argument element, */
    thisCartProduct.getElements(element);

    /* dodaj console.log wyświetlający thisCartProduct */
    // console.log('new CartProduct: ', thisCartProduct);
    // console.log('productData: ', menuProduct);

    /* wykonanie metody */
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

  }

  /* stwórz metodę getElements przyjmującą argument element */
  getElements(element) {

    /* a w tej metodzie: */
    /* zdefiniuj stałą thisCartProduct i zapisz w niej obiekt this, */
    const thisCartProduct = this;

    /* stwórz pusty obiekt thisCartProduct.dom */
    thisCartProduct.dom = {};

    /* stwórz właściwość thisCartProduct.dom.wrapper i przypisz jej wartość argumentu element */
    thisCartProduct.dom.wrapper = element;

    /* stwórz kolejnych kilka właściwości obiektu thisCartProduct.dom i przypisz im elementy znalezione we wrapperze; te właściwości to: amountWidget, price, edit, remove (ich selektory znajdziesz w select.cartProduct) */
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

    thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });

  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      /* właściwość detail: Możemy w niej przekazać dowolne informacje do handlera eventu. W tym przypadku przekazujemy odwołanie do tej instancji, dla której kliknięto guzik usuwania. */
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);

  }

  initActions() {
    const thisCartProduct = this;

    /* dwa listenery eventów 'click': jeden dla guzika thisCartProduct.dom.edit, a drugi dla thisCartProduct.dom.remove. Oba mają blokować domyślną akcję dla tego eventu. Guzik edycji na razie nie będzie niczego robił, ale w handlerze guzika usuwania możemy dodać wywołanie metody remove. */

    thisCartProduct.dom.edit.addEventListener('click', function(event) {
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function(event) {
      event.preventDefault();
      thisCartProduct.remove();
      console.log('REMOVE?', thisCartProduct.remove);
    });

  }

  getData() {
    const thisCartProduct = this;
    const productInfo = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      params: thisCartProduct.params,
    };

    return productInfo;
  }

}

export default CartProduct;
