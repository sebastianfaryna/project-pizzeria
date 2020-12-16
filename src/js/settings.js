export const select = {
  templateOf: {
    menuProduct: '#template-menu-product',
    cartProduct: '#template-cart-product',
    bookingWidget: '#template-booking-widget',
  },
  containerOf: {
    menu: '#product-list',
    cart: '#cart',
    pages: '#pages',
    booking: '.booking-wrapper',
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
      input: 'input.amount',
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
    datePicker: {
      wrapper: '.date-picker',
      input: `input[name="date"]`,
    },
    hourPicker: {
      wrapper: '.hour-picker',
      input: 'input[type="range"]',
      output: '.output',
    },
  },
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
  booking: {
    peopleAmount: '.people-amount',
    hoursAmount: '.hours-amount',
    tables: '.floor-plan .table',
    form: '.booking-form',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  nav: {
    links: 'a.main-link',
  },
};

export const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  cart: {
    wrapperActive: 'active',
  },
  booking: {
    loading: 'loading',
    tableBooked: 'booked',
    tableChose: 'selected',
  },
  nav: {
    active: 'active',
  },
  pages: {
    active: 'active',
  },
};

export const settings = {
  hours: {
    open: 12,
    close: 24,
  },
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  },
  datePicker: {
    maxDaysInFuture: 14,
  },
  cart: {
    defaultDeliveryFee: 20,
  },
  booking: {
    tableIdAttribute: 'data-table',
  },
  /* konfiguracja parametrów, które będą nam potrzebne do łączenia się z API: */
  db: {
    url: '//localhost:3131',
    product: 'product',
    order: 'order',
    booking: 'booking',
    event: 'event',
    dateStartParamKey: 'date_gte', // Greater Then or Equal
    dateEndParamKey: 'date_lte', // Lesser Then or Equal
    notRepeatParam: 'repeat=false',
    repeatParam: 'repeat_ne=false', // ne = not equal
  },
};

export const templates = {
  // eslint-disable-next-line no-undef
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  // eslint-disable-next-line no-undef
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // eslint-disable-next-line no-undef
  bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML),
};
