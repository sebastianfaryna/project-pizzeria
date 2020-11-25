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
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      // console.log('new Product: ', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      /* generate html based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickableTrigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.accordionTrigger;

      // console.log('czy był klik?', clickableTrigger);

      /* START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function(event) {

        /* prevent default action for event */
        event.preventDefault();

        /* toggle (dodanie klasy jeśli jej nie było lub odwrotnie) active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');

        /* find ALL activeProducts */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

        //* START LOOP: for each activeProduct */
        for (const activeProduct of activeProducts) {

          ///* START: if the active product isn't the element of thisProduct */
          if (activeProduct != thisProduct.element) {

            ////* remove class 'active' for the activeProduct */
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);

            ///* END: if the activeProduct isn't the element of thisProduct */
          }

          //* END LOOP: for each active product */
        }

        /* END: click event listener to trigger */
      });
    }

    /* Event listenery dla formularza */
    initOrderForm() {

      const thisProduct = this;

      // console.log('initOrderForm: ', thisProduct);

      thisProduct.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }

    /* Obliczamy cenę produktu */
    processOrder() {
      const thisProduct = this;
      // console.log('processOrder: ', thisProduct);

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData: ', formData);

      thisProduct.params = {};

      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;

      /* START LOOP: for each paramId in thisProduct.data.params */
      for (let paramId in thisProduct.data.params) {

        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];

        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options) {

          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];

          /* in const optionSelected check if there is a formData[paramId] and, if so, if this array contains a key equal to the value of the optionId */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          /* START IF: if option is selected  A N D  option is  N O T  default */
          if (optionSelected && !option.default) {

            /* add price of option to variable price */
            const addPriceOfOption = option.price;
            price += addPriceOfOption;

            // console.log('addPriceOfOption: ', addPriceOfOption);
            // console.log('price: ', price);

            /* END IF: if option is selected  A N D  option is  N O T  default */
          }

          /* START ELSE IF: if option is  N O T  selected  A N D  option is default */
          else if (!optionSelected && option.default) {

            /* deduct price of option from price */
            const deductPriceOfOption = option.price;
            price -= deductPriceOfOption;

            // console.log('deductPriceOfOption: ', deductPriceOfOption);
            // console.log('price: ', price);

            /* END ELSE IF: if option is  N O T  selected  A N D  option is default */
          }

          /* START IF: option is selected all images found in thisProduct.imageWrapper for this option should receive a class saved in classNames.menuProduct.imageVisible */
          if (optionSelected == true) {
            const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

            if (!thisProduct.params[paramId]) {
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;

            /* START LOOP add class*/
            for (let optionImage of optionImages) {

              // console.log('optionImage: ', optionImage);

              optionImage.classList.add(classNames.menuProduct.imageVisible);

              /* END LOOP */
            }

            /* END IF */
          }

          /* START ELSE: if  N O T  all images for this option should remove class saved in classNames.menuProduct.imageVisible */
          else {
            const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

            /* START LOOP remove class*/
            for (let optionImage of optionImages) {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);

              /* END LOOP */
            }

            /* END ELSE */
          }

          /* END LOOP: for each optionId in param.options */
        }

        /* END LOOP: for each paramId in thisProduct.data.params */
      }

      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

      // console.log('thisProduct.params: ', thisProduct.params);

    } // END processOrder

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });

    }

    addToCart() {
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }

  } // END class Product

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

      // console.log('amountWidget: ', thisWidget);
      // console.log('constructor arguments: ', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value); //konwersja na liczbę

      /* Validation */
      /* IF inna niż domyślna && >= defMin && <= defMax || newValue == 1 bo nie dało się odejmować poniżej 2 */
      if (newValue != settings.amountWidget.defaultValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax || newValue == 1) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;

    }

    /* EVENT LISTENERS */
    initActions() {

      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

  }

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

      thisCart.dom.productList.addEventListener('remove', function() {
        thisCart.remove(event.detail.cartProduct);

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

  } // END Class CartProduct

  const app = {
    initMenu: function() {
      const thisApp = this;
      // console.log('thisApp.data: ', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function() {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function() {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();

      thisApp.initMenu();

      thisApp.initCart();
    },
  };

  app.init();
}
