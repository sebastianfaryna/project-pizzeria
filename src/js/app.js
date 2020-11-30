import {settings, select} from './settings.js';
import Cart from './components/Cart.js';
import Product from './components/Product.js';



const app = {
  initMenu: function() {
    const thisApp = this;
    // console.log('thisApp.data: ', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function() {
    const thisApp = this;

    thisApp.data = {};

    /* zapisz w stałęj url adres endpointu */
    const url = settings.db.url + '/' + settings.db.product;

    /* wysłanie zapytania AJAX za pomocą funkcji fetch pod podany adres url endpointu */
    fetch(url)
      .then(function(rawResponse) {

        /* otrzymaną odpowiedź konwertujemy z json-a na tablicę */
        return rawResponse.json();
      })
      .then(function(parsedResponse) {

        /* po otrzymaniu skonwertowanej odpowiedzi wyświetlamy ją w konsoli */
        // console.log('parsedResponse: ', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });

    // console.log('thisApp.data: ', JSON.stringify(thisApp.data));
  },

  initCart: function() {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });

  },

  init: function() {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initData();

    thisApp.initCart();
  },
};

app.init();
