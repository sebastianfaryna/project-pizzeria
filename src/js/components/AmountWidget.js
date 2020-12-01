import {settings, select} from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
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

export default AmountWidget;
