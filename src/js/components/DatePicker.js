import {select,settings} from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    // console.log('thisWidget.minDate: ', thisWidget.minDate);

    // thisWidget.maxDate = thisWidget.minDate + settings.datePicker.maxDaysInFuture;
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    /* zainicjuj plugin flatpickr */
    flatpickr(thisWidget.dom.input, {

      dateFormat: 'd-m-Y',

      /* chcemy, aby domyślna data była ustawiona na wartość thisWidget.minDate */
      defaultDate: thisWidget.minDate,

      /* najwcześniejsza data, którą można wybrać, ma być również równa thisWidget.minDate */
      minDate: thisWidget.minDate,

      /* najpóźniejsza data do wybrania ma być równa thisWidget.maxDate */
      maxDate: thisWidget.maxDate,

      /* poniedziałek pierwszym dniem tygodnia */
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },

      /* nasza restauracja jest nieczynna w poniedziałki */
      'disable': [
        function(date) {
          // return true to disable
          return (date.getDay() === 1);
        }
      ],

      /* w momencie wykrycia zmiany wartości przez plugin, chcemy ustawiać wartość właściwości thisWidget.value na dateStr widoczne w dokumentacji pluginu */
      onChange: function(selectedDates, dateStr) {
        thisWidget.value = dateStr;
        console.log('dateStr:', thisWidget.value);
      },
    }); // END of FLATPICKR's OPTIONS
  } //END of INITPLUGIN

  parseValue(value) {
    return value;
  }

  isValid() {
    return true;
  }

  renderValue() {
  }

}

export default DatePicker;
