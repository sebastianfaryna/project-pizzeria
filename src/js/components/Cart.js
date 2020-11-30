import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);

    thisCart.initActions();

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    // console.log('new Cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {}; //tu bedziemy przechowywac wszystkie elementy DOM wyszukane w komponencie koszyka. ma to ulatwic ich nazywanie

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    /* find cart container */
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    /* Tworzymy tutaj tablicę, która zawiera cztery stringi (ciągi znaków). Każdy z nich jest kluczem w obiekcie select.cart. Wykorzystamy tę tablicę, aby szybko stworzyć cztery właściwości obiektu thisCart.dom o tych samych kluczach. Każda z nich będzie zawierać kolekcję elementów znalezionych za pomocą odpowiedniego selektora. */
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }

    /* dodaj właściwość thisCart.dom.form i przypisz jej element znaleziony we wrapperze koszyka za pomocą selektora zapisanego w select.cart.form */
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    /* właściwości dla inputów na numer telefonu i adres. */
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); //handler listenera ma toggle'ować klasę zapisaną w classNames.cart.wrapperActive na elemencie thisCart.dom.wrapper
    });

    /* Nasłuchujemy tutaj na liście produktów, w której umieszczamy produkty, w których znajduje się widget liczby sztuk, który generuje ten event. */
    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  sendOrder() {
    const thisCart = this;

    /* w stałej url umieszczamy adres endpointu */
    const url = settings.db.url + '/' + settings.db.order;

    /* 'payload' czyli ładunek - dane, któe będą wysłane do serwera */
    const payload = {
      phone: thisCart.dom.phone.value, // musi być .VALUE bo nie wyświetla wartości
      address: thisCart.dom.address.value, //musi być .VALUE bo nie wyświetla zawartości inputu
      totalNumber: thisCart.totalNumber,
      products: [], // patrz pętla poniżej
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
    };

    console.log('sendOrder PAYLOAD: ', payload);

    /* dodaj pętlę iterującą po wszystkich thisCart.products */
    for (let product of thisCart.products) {

      /* PUSH dodaje do tablicy */
      payload.products.push(product.getData());

      // console.log('product.getData:', product.getData());
    }

    /* opcje konfigurujące zapytania. POST służy do wysyłąnia nowych danych do API. Ustawiamy header json zrozumiały dla serwera. Body to treść, którą wysyłamy. Tutaj używamy metody JSON.stringify aby przekonwertować obiekt payload na string w formacie JSON */
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      }).then(function(parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
      });
  }

  remove(cartProduct) {
    const thisCart = this;

    /* zadeklarować stałą index, której wartością będzie indeks cartProduct w tablicy thisCart.products */
    const index = thisCart.products.indexOf(cartProduct);

    /* użyć metody splice do usunięcia elementu o tym indeksie z tablicy thisCart.products */
    thisCart.products.splice(index);

    /* usunąć z DOM element cartProduct.dom.wrapper */
    cartProduct.dom.wrapper.remove();

    /* wywołać metodę update w celu przeliczenia sum po usunięciu produktu */
    thisCart.update();
  }

  add(menuProduct) {
    const thisCart = this; //zakomentowane by ESLint nie zgłaszał błędu, że ta stała nie została nigdzie wykorzystana

    /*generate HTML base on template*/
    const generatedHTML = templates.cartProduct(menuProduct);

    // console.log('generated HTML', generatedHTML);

    /* create element using utils.createElementFromHTML*/
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    // console.log('generated DOM', generatedDOM);

    /* add DOM element to thisCart.dom.productList */
    thisCart.dom.productList.appendChild(generatedDOM);

    // console.log('adding productMenu', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products', thisCart.products);

    thisCart.update();

  }

  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    console.log('totalNumber: ', thisCart.totalNumber, 'subtotalPrice: ', thisCart.subtotalPrice, 'thisCart.totalPrice: ', thisCart.totalPrice);

    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }

  }

}

export default Cart;
