/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      });

    }

    /* Obliczamy cenę produktu */
    processOrder() {
      const thisProduct = this;
      // console.log('processOrder: ', thisProduct);

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData: ', formData);

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

      /* multiply proce by amount */
      price *= thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = price;

    } // END processOrder

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });

    }

  } // END class Product

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);

      console.log('amountWidget" ', thisWidget);
      console.log('constructor arguments: ', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelectorAll(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelectorAll(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value); //konwersja na liczbę

      /* TODO Add validation */
      thisWidget.value = newValue;
      thisWidget.announce();
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }

  const app = {
    initMenu: function() {
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function() {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();

      thisApp.initMenu();
    },
  };

  app.init();
}
