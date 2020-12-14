class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value() { // get value jest getterem, czyli metodą wykonywaną przy każdej próbie odczytania wartości włąściwości value
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) { // set value jest setterem, czyli metodą wykonanywaną przy każdej próbie ustawienia wartości włąściwości value
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); //konwersja na liczbę

    /* Validation */
    /* IF inna niż domyślna && >= defMin && <= defMax || newValue == 1 bo nie dało się odejmować poniżej 2 */
    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value) { // konwersja pożądanej wartości na dany typ
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value); //!isNaN sprawdza czy dana wartość NIE jest liczbą Nan - Not A Number
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;

    console.log('VALUE:', thisWidget.value);
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }

}

export default BaseWidget;
