/*INIT*/
onload = function () {
  //goTo('home');
  goTo('new-expense');
};

/*ROUTER*/
function goTo (name) {
  reveal(name, 'page');
  reveal(name, 'title');
}

function reveal (name, type) {
  const oldElement = document.querySelector('.' + type + '.active');
  if (oldElement !== null) {
    oldElement.classList.remove('active');
  }
  const element = document.querySelector('.' + type + '#' + name + '-' + type);
  if (element !== null) {
    element.classList.add('active');
    if (type === 'page') {
      const mounted = onMounted()[name];
      if (mounted !== undefined) {
        mounted();
      }
    }
  }
}

function onMounted () {
  return { home: onHomeMounted, 'new-expense': onNewExpenseMounted };
}

/*HELPERS*/

function dateMask (self) {
  let value = self.value.replace(/\D/g, '').slice(0, 10);
  if (value.length >= 5) {
    self.value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
    return;
  } else if (value.length >= 3) {
    self.value = value.slice(0, 2) + '/' + value.slice(2);
    return;
  }
  self.value = value;
}

function amountMask (self) {
  let value = self.value.replace(/\D/g, '');
  if (value.slice(1, -1) === '00') {
    self.value = '0,0' + value.slice(-1);
    return;
  }
  if (value.slice(0, 2) === '00') {
    self.value = '0,' + value.slice(-2);
    return;
  }

  if (value.length === 3) {
    self.value = value.slice(0, 1) + ',' + value.slice(1);
    return;
  }

  if (value.length > 3) {
    value = value.slice(0, value.length - 2) + ',' + value.slice(-2);
    if (value.slice(0, 1) === '0') {
      value = value.slice(1);
    }
    self.value = value;
    return;
  }

  if (value === '') {
    self.value = '0,00';
    return;
  }
  self.value = value;
}

function toInt (value) {
  return Number(value.replace(/\D/g, ''))
}

function toDate (date, type) {
  if (type === 'model') {
    return date.split('/').reverse().join('-')
  }

  return date.split('-').reverse().join('/')
}

function validate (rules) {
  let valid = true;
  cleanValidation()
  for (const index in rules) {
    if (rules.hasOwnProperty(index)) {
      const validate = rules[index];
      if (validate.check === false) {
        valid = false;
        showValidateError(validate.element, validate.error, validate.nested);
      }
    }
  }

  return valid;
}

function cleanValidation () {
  document.querySelectorAll('.error').forEach(function (error) {
    error.innerHTML = ''
  })
}

function showValidateError (input, text, nested = 1) {
  let parentElement = input;
  for (let i = 0; i < nested; i++) {
    parentElement = parentElement.parentNode;
  }
  const error = parentElement.querySelector('.error')
  if (error !== null) {
    error.innerHTML = text
  }

}

function toggleMainButton (id) {
  const oldElement = document.querySelector('.main.active');
  if (oldElement !== null) {
    oldElement.classList.remove('active');
  }
  const element = document.querySelector('.main#' + id);
  if (element !== null) {
    element.classList.add('active');
  }
}

/*HOME*/
function onHomeMounted () {
  const expenses = getExpenses();
  if (expenses.length > 0) {
    return;
  }
  goTo('none-home');
}

/*NEW EXPENSE*/

function onNewExpenseMounted () {
  constructNewExpense();
}

function constructNewExpense () {
  addTypeOptions(getExpenseTypes());
  toggleMainButton('submit-expense')
}

function addTypeOptions (types) {
  const select = document.querySelector('select#expense-type');
  if (select !== null) {
    select.innerHTML = '';
    select.appendChild(new Option('Selecionar Categoria'));
    types.forEach(type => {
      select.appendChild(new Option(type.name, type.id));
    });
  }
}

function submitExpense () {
  const inputs = {
    nameInput: document.querySelector('#expense-name'),
    typeInput: document.querySelector('#expense-type'),
    dateInput: document.querySelector('#expense-date'),
    amountInput: document.querySelector('#expense-amount')
  };

  if (validate(getValidationRules(inputs))) {
    saveExpense(makeExpense(null, inputs.nameInput.value, inputs.typeInput.value, inputs.dateInput.value, inputs.amountInput.value))
  }
}

function getValidationRules (inputs) {
  return [
    { element: inputs.nameInput, check: inputs.nameInput.value !== '', error: 'Por favor preencha o nome da despesa!' },
    { element: inputs.dateInput, check: inputs.dateInput.value !== '', error: 'Por favor preencha a data que a despesa ocorreu!' },
    { element: inputs.typeInput, check: !isNaN(inputs.typeInput.value), error: 'Por favor selecione uma categoria!' },
    { element: inputs.amountInput, check: toInt(inputs.amountInput.value) > 0, error: 'A despesa deve ter o valor maior que 0!', nested: 2 }
  ];
}

/*BACKEND*/
function exists (model) {
  return model.id !== 0 && model.id !== undefined && model.id !== null
}

function getExpenses () {
  return getModels('expenses');
}

function saveExpense (expense) {
  if (exists(expense)) {
    return;
  }

  insertModel(expense, 'expenses')
}

function makeExpense (id = null, name, typeId, date, amount) {
  amount = isNaN(amount) ? toInt(amount) : amount
  date = date.match(/\d{4}-\d{2}-\d{2}/) ? date : toDate(date, 'model')
  return { id: id, name: name, typeId: typeId, date: date, amount: amount };
}

function getExpenseTypes () {
  let expenseTypes = localStorage.getItem('expenses-types') === null ? [] : localStorage.getItem('expenses-types');
  if (expenseTypes.length < 1) {
    expenseTypes = getDefaultExpenseTypes();
  }
  return expenseTypes;
}

function getDefaultExpenseTypes () {
  return [
    { id: 1, name: 'Fixas', icon: 'food-fork-drink', limit: 60000 },
    { id: 2, name: 'Variáveis', icon: 'car', limit: 30000 },
    { id: 3, name: 'Eventuais', icon: 'tag', limit: 40000 }
  ];
}

function generateId (string) {
  let hash = 0;
  if (string.length === 0) {
    return hash;
  }
  string += +new Date();
  for (let i = 0; i < string.length; i++) {
    let charCode = string.charCodeAt(i);
    hash = ((hash << 7) - hash) + charCode;
    hash = hash & hash;
  }

  return hash > 0 ? hash : hash * -1;
}

function insertModel(model, table) {
  const models =  localStorage.getItem(table) === null ? [] : localStorage.getItem(table);
  model.id = generateId(JSON.stringify(model))
  models.push(model)
  localStorage.setItem(table, JSON.stringify(models))
}

function getModels(table) {
  const models =  localStorage.getItem(table) === null ? '[]' : localStorage.getItem(table);
  return JSON.parse(models)
}
