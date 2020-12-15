/* eslint-disable indent */
import {
  select,
  settings,
  templates,
  classNames
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor() {
    const thisBooking = this;

    thisBooking.render();
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.selectTable();

    // console.log('thisBooking: ', thisBooking);

  }

  /* pobiera dane z API używając adresów z parametrami filtrującymi wyniki */
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    // w tablicach będzie łatwiej zapisać parametry, kiedy każdy z endpointów ma inną liczbę parametrów
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params: ', params);

    const urls = {
      // zawiera adres endpointu API, który zwróci listę rezerwacji. JOIN łączy poszczególne parametry symbolem ampersand
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),

      // zawiera adres endpointu API, który zwróci listę wydarzeń jednorazowych
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),

      // zawiera adres endpointu API, który zwróci listę cyklicznych wydarzeń
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('getData urls: ', urls);

    Promise.all([
        fetch(urls.booking),
        fetch(urls.eventsCurrent),
        fetch(urls.eventsRepeat),
      ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        // console.log('bookings: ', bookings);
        // console.log('eventsCurrent: ', eventsCurrent);
        // console.log('eventsRepeat: ', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);
    // console.log('eventsRepeat: ', eventsRepeat);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
      /* w obiekcie thisBooking.booked znajdujemy klucz [date] będący datą przekazaną metodzie makeBooked w pierwszym argumencie. Wyrażenie "thisBooking.booked[date]" jest obiektem, w któym znajdujemy klucz [hour] równy wartości drugiego argumentu przekazanego metodzie makeBooked. Całe to wyrażenie "thisBooking.booked[date][hour]" jest tablicą, chcemy do niej dodać nowy element, który jest wartością argumentu table za pomocą metody push */
    }

  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId); //konwersja tekstu na liczbę
      }

      if ( //sprawdz czy któryś stolik jest zajęty
        !allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) //includes sprawdza czy ten element "(tableId)" znajduje się w tablicy "thisBooking.booked[thisBooking.date][thisBooking.hour]" jeśli tak, to stolik jest zajęty i dostaniej klasę zapisaną w "classNames.booking.tableBooked"
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked); //usuń klasę oznaczającą zajętość stolika
      }
    }
  }

  /* klikanie w stolik */
  selectTable() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function(event) {
        event.preventDefault();

        if (!table.classList.contains(classNames.booking.tableBooked)) {
          if (table.classList.contains(classNames.booking.tableChose)) {
            thisBooking.removeSelectedTable(); //patrz metoda poniżej
          } else {
            thisBooking.removeSelectedTable();
            table.classList.add(classNames.booking.tableChose);
            thisBooking.selectTable = table.getAttribute(settings.booking.tableIdAttribute);

            thisBooking.tableBooked = parseInt(thisBooking.selectTable); //parsowanie numeru zabookowanego stolika
          }
        }
      });
    }
  }

  removeSelectedTable() {
    const thisBooking = this;

    const activeTables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables + '.' + classNames.booking.tableChose);

    for (let table of activeTables) {
      table.classList.remove(classNames.booking.tableChose);
    }

  }

  /* analogicznie do wysłania zamówienia z Cart.js */
  sendOrder() {
    const thisBooking = this;

    /* w stałej url umieszczamy adres endpointu */
    const url = settings.db.url + '/' + settings.db.order;

    /* 'payload' czyli ładunek - dane, które będą wysłane do serwera */
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.tableBooked, //patrz linia 188.
      ppl: thisBooking.peopleAmount.value,
      duration: thisBooking.hoursAmount.value,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      starters: [],
    };

    const starters = thisBooking.dom.wrapper.querySelectorAll('input[name="starter"]:checked');
    for (let checkbox of starters) {
      payload.starters.push(checkbox.value);
    }

    /* opcje konfigurujące zapytania. POST służy do wysyłąnia nowych danych do API. Ustawiamy header json zrozumiały dla serwera. Body to treść, którą wysyłamy. Tutaj używamy metody JSON.stringify aby przekonwertować obiekt payload na string w formacie JSON */
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      }).then(function(parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
      });
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

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);

    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
  }

  initWidgets() {
    const thisBooking = this;

    /* we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom */
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    /* nasłuchiwanie kliknięcia w przycisk */
    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisBooking.sendOrder();
    });
  }

}

export default Booking;
