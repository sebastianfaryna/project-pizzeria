import {settings, select, classNames} from './settings.js';
import Cart from './components/Cart.js';
import Product from './components/Product.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function() { // metoda jest uruchamiana przy odświeżaniu strony
    const thisApp = this;

    /* znajdujemy wszystkie containery i linki do podstron */
    thisApp.pages = document.querySelector(select.containerOf.pages).children; // children --> we właściwości pages znajdą się wszystkie dzieci container'a stron <section> o id order i booking

    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    /* z hasha w url podstrony uzyskujemy id strony, która zostanie otwarta jako domyślna */
    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id; // [0] to pierwsza, domyślna podstrona. Tą zmienna jest przed pętlą, bo będziemy z niej korzystać poza blokiem kodu pętli

    /* sprawdzamy czy któraś z podstron pasuje do tej, tkóą uzyskaliśmy z adresu url strony */
    for (let page of thisApp.pages) { //pętla iteruje po wszystkich podstronach i sprawdza czy id strony jest równe id z adresu url
      if (page.id == idFromHash) {
        pageMatchingHash = page.id; // jeśli warunek jest spełniony
        break; /*nie zostaną wykonane kolejne iteracje pętli i zostanie otwarta  */
      }
    }

    /* aktywacja odpowiedniej podstony */
    thisApp.activatePage(pageMatchingHash);

    /* dodanie evenListenerów do wszystkich linków, któe odsyłąją do podstron */
    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', ''); //w stałej id zapisz atrybut href kilkniętego elementu w którym zaminiemy znak hash na pusty ciąg znaków, wtedy pozostanie nam tekst po hashu (czyli order lub booking)

        /* run thisApp.activePage with that id */
        thisApp.activatePage(id);

        /* change url hash */
        window.location.hash = '#/' + id;

      });
    }

  },

  activatePage: function(pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMenu: function() {
    const thisApp = this;

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

  initBooking: function() {
    const thisApp = this;

    /* znajduje kontener widgetu do rezerwacji stron, którego selektor mamy zapisany w select.containerOf.booking */
    const bookingWidgetContainer = document.querySelector(select.containerOf.booking);

    /* tworzy nową instancję klasy Booking, przekazując jej konstruktorowi znaleziony kontener widgetu */
    thisApp.bookingWidgetContainer = new Booking(bookingWidgetContainer);
  },

  init: function() {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();

    thisApp.initData();

    thisApp.initCart();

    thisApp.initBooking();
  },
};

app.init();
