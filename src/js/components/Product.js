import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


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

    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct
      },
    });

    thisProduct.element.dispatchEvent(event);

  }

} // END class Product

export default Product;
