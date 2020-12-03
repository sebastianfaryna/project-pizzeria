import {select,settings} from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);

    /* W konstruktorze, oprócz thisWidget.dom.input, zapisujemy również thisWidget.dom.output */
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin() {
    const thisWidget = this;

    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function() {
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  /* Metoda parseValue ma przekazywać otrzymaną wartość do funkcji utils.numberToHour i zwracać wartość otrzymaną z tej funkcji. Ta funkcja zamienia liczby na zapis godzinowy, czyli np. 12 na '12:00', a 12.5 na '12:30' */
  parseValue(value) {
    return utils.numberToHour(value);
  }

  /* Metoda isValid może zawsze zwracać prawdę */
  isValid() {
    return true;
  }

  /* Metoda renderValue ma zamieniać zawartość elementu thisWidget.dom.output na wartość widgetu */
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPicker;
