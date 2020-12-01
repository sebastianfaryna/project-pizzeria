import {select,templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor() {
    const thisBooking = this;

    thisBooking.render();
    thisBooking.initWidgets();
  }

  render() {
    const thisBooking = this;

    /* generować kod HTML za pomocą szablonu templates.bookingWidget bez podawania mu jakiegokolwiek argumentu*/
    const generateHTML = templates.bookingWidget();

    /* tworzyć pusty obiekt thisBooking.dom */
    thisBooking.dom = {};

    /* zapisywać do tego obiektu właściwość wrapper równą otrzymanemu argumentowi */
    thisBooking.dom.wrapper = document.querySelector(select.containerOf.booking);

    /* zawartość wrappera zamieniać na kod HTML wygenerowany z szablonu, we właściwości thisBooking.dom. */
    thisBooking.dom.wrapper.innerHTML = generateHTML;

    /* peopleAmount zapisywać pojedynczy element znaleziony we wrapperze i pasujący do selektora select.booking.peopleAmount */
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    /* analogicznie do peopleAmount znaleźć i zapisać element dla hoursAmount */
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    /* we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom */
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;
