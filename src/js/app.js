/*INIT*/
onload = function () {
  setUp()
  goTo('home');
};


function setUp () {
  window.params = {}
  Maska.create('.masked');
  SimpleMaskMoney.setMask('.money');
}

function setUpCharts () {
  if (window.charts === undefined) {
    window.charts = { fixed: { color: '#0c59cf' }, variable: { color: '#e61610' }, eve: { color: '#606060' } }
    Object.keys(window.charts).forEach(function (chartId) {
      const element = document.querySelector('.chart#' + chartId);
      if (element !== null) {
        const context = element.getContext('2d')
        const color = window.charts[chartId].color;
        window.charts[chartId] = new Chart(context, {
          type: 'doughnut',
          plugins: [{
            id: 'text-in-donut',
            afterDraw: function (chart, option) {
              let theCenterText = window.charts[chartId].data.datasets[0].data[0].toFixed(0) + "%";
              const canvasBounds = element.getBoundingClientRect();
              const fontSz = Math.floor( canvasBounds.height * 0.18 ) ;
              chart.ctx.textBaseline = 'middle';
              chart.ctx.textAlign = 'center';
              chart.ctx.font = 'bold ' + fontSz + 'px Arial ';
              chart.ctx.fillStyle = color;
              chart.ctx.fillText(theCenterText, canvasBounds.width/1.9, canvasBounds.height * 0.53 )
            }
          }],
          options: {
            legend: false,
            tooltips: {
              callbacks: {
                label: function (tooltipItem, data) {
                  return ' ' + data.labels[tooltipItem.index] + ': ' + data.datasets[0].data[tooltipItem.index] +'%'
                }
              }
            }
          },
          data: {
            datasets: [
              {
                data: [50, 50],
                backgroundColor: [
                  color,
                  'rgba(235, 235, 235, 1)',
                ],
              }],
            labels: ['Gasto', 'Restante']
          },
        });
      }

    })
  }
}

/*ROUTER*/

function goTo (name, loadParams = {}) {
  window.params = loadParams
  reveal(name, 'page');
  reveal(name, 'title');
}

function cleanParams () {
  window.params = { }
}

function reveal (name, type) {
  const oldElement = document.querySelector('.' + type + '.active');
  if (oldElement !== null) {
    oldElement.classList.remove('active');
    if (type === 'page') {
      const disposed = onDisposed()[oldElement.id.replace('-page', '')];
      if (disposed !== undefined) {
        disposed();
      }
    }
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
  return { home: onHomeMounted, 'new-expense': onNewExpenseMounted, expenses: onExpensesMounted, type: onTypesMounted };
}

function onDisposed () {
  return { 'new-expense': onNewExpenseDisposed };
}

/*HELPERS*/

function coolAlert (type, title, message, time, onClose = null) {
  Swal.fire({
    title: title,
    text: message,
    showConfirmButton: false,
    icon: type,
    confirmButtonText: 'Cool',
    timer: time,
    willClose: onClose !== null ? onClose : function () {}
  });
}

function successAlert (message, onClose = null) {
  coolAlert('success', 'Sucesso', message, 2000, onClose);
}

function toInt (value) {
  return Number(String(value).replace(/\D/g, ''));
}

function toReal (value) {
  value = String((toInt(value) / 100).toFixed(2)).replace('.', ',').replace('-', '');
  if (value.length > 6) {
    value = value.slice(0, value.length - 6) + '.' + value.slice(value.length - 6);
  }
  return this.toInt() < 0 ? '-' + value : value;
}

function toDate (date, type) {
  if (type === 'model') {
    return date.split('/').reverse().join('-');
  }

  return date.split('-').reverse().join('/');
}

function validate (rules) {
  let valid = true;
  cleanValidation();
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
    error.innerHTML = '';
  });
}

function showValidateError (input, text, nested = 1) {
  let parentElement = input;
  for (let i = 0; i < nested; i++) {
    parentElement = parentElement.parentNode;
  }
  const error = parentElement.querySelector('.error');
  if (error !== null) {
    error.innerHTML = text;
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

/*MENU*/
function toggleMenu (menu, self = null) {
  let parent = document;
  if (self !== null) {
    parent = self.parentNode;
  }
  menu = parent.querySelector('.menu#' + menu)
  if (menu !== null) {
    menu.classList.toggle('closed')
  }
}

/*HOME*/
function onHomeMounted () {
  const expenses = getExpenses();
  setUpCharts()
  if (expenses.length > 0) {
    constructHome(expenses, getExpenseTypes())
    return;
  }
  goTo('none-home');
}

function constructHome (expenses = null, types) {
  makeThreeBiggestExpenses(getThreeBiggestExpenses(expenses), getExpenseTypes(true));
  const budgets = calculateBudgets(expenses, types)
  makeStatus(budgets)
  applyBudgets(budgets)
}

function applyBudgets (budgets) {
  budgets.forEach(function (budget) {
    window.charts[budget.chartId].data.datasets[0].data[0] = budget.filledPercentage > 100 ? 100 : budget.filledPercentage
    window.charts[budget.chartId].data.datasets[0].data[1] = budget.filledPercentage > 100 ? 0 : 100 - budget.filledPercentage
    window.charts[budget.chartId].update()
  })
}

function makeThreeBiggestExpenses (expenses, types) {
  const template = document.querySelector('.template.expense-resume');
  const body = document.querySelector('#biggest-body-table');
  if (template !== null && body !== null) {
    body.innerHTML = ''
    expenses.forEach(function (expense) {
      const expenseElement = template.cloneNode(true)
      expenseElement.classList.remove('template');
      expenseElement.setAttribute('data-id', expense.id)
      expenseElement.querySelector('.name').innerHTML = expense.name
      expenseElement.querySelector('.amount').innerHTML = 'R$ ' + toReal(expense.amount)
      expenseElement.querySelector('.icon').src = '/src/icons/expense-types/' + types[expense.typeId].icon + '.svg'
      body.appendChild(expenseElement)
    })
  }
}

function makeStatus(budgets) {
  const hasOverflow = budgets.filter(function (budget) {
    return budget.overflow
  }).length > 0;

  revealStatus(hasOverflow ? 'negative' : 'success')
}

function revealStatus (type) {
  const oldElement = document.querySelector('.status.active');
  if (oldElement !== null) {
    oldElement.classList.remove('active');
  }
  const element = document.querySelector('.status.' + type);
  if (element !== null) {
    element.classList.add('active');
  }
}


/*EXPENSES*/

function onExpensesMounted () {
  constructExpenses();
}

function constructExpenses () {
  const expenses = getExpenses()
  if (expenses.length < 1) {
    goTo('none-home');
    return
  }
  setExpenses(getExpenses(), getExpenseTypes(true));
}

function setExpenses (expenses, types) {
  const template = document.querySelector('.expense.template');
  const list = document.querySelector('#expenses-page .list');
  if (template !== null && list !== null) {
    list.innerHTML = ''
    expenses.forEach(function (expense) {
      const expenseElement = template.cloneNode(true)
      expenseElement.classList.remove('template');
      expenseElement.setAttribute('data-id', expense.id)
      expenseElement.querySelector('.name').innerHTML = expense.name
      expenseElement.querySelector('.date').innerHTML = toDate(expense.date)
      expenseElement.querySelector('.amount').innerHTML = 'R$ ' + toReal(expense.amount)
      expenseElement.querySelector('.type-name').innerHTML = types[Number(expense.typeId)].name
      expenseElement.querySelector('.icon').src = '/src/icons/expense-types/' + types[expense.typeId].icon + '.svg'
      expenseElement.querySelector('.update').onclick = function () {
        goTo('new-expense', { expense: expense, update: true })
      }
      expenseElement.querySelector('.delete').onclick = function () {
        deleteModel(expense.id, 'expenses')
        successAlert('Despesa deletada com sucesso', function () {
          constructExpenses()
        })
      }

      list.appendChild(expenseElement)
    })
  }
}

/*NEW EXPENSE*/

function onNewExpenseMounted () {
  constructNewExpense();
}

function onNewExpenseDisposed () {
  deconstructNewExpense()
}

function constructNewExpense () {
  addTypeOptions(getExpenseTypes());
  toggleMainButton('submit-expense');
  loadSavedExpense()
}

function deconstructNewExpense () {
  cleanInputs()
  toggleMainButton('main-button');
}

function loadSavedExpense () {
  if (params.update && params.expense !== undefined) {
    setSavedExpense(params.expense)
    cleanParams()
  }
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

function setSavedExpense (expense) {
  const inputs = getInputs()
  inputs.nameInput.value = expense.name
  inputs.typeInput.value = expense.typeId
  inputs.dateInput.value = toDate(expense.date)
  inputs.amountInput.value = toReal(expense.amount)
  const form = document.querySelector('#new-expense-form')
  form.setAttribute('data-id', expense.id)
  form.setAttribute('update', 'true')
}

function cleanInputs () {
  const inputs = getInputs()
  inputs.nameInput.value = ''
  inputs.typeInput.value = ''
  inputs.dateInput.value = ''
  inputs.amountInput.value = '0,00'
}

function getInputs () {
  return {
    nameInput: document.querySelector('#expense-name'),
    typeInput: document.querySelector('#expense-type'),
    dateInput: document.querySelector('#expense-date'),
    amountInput: document.querySelector('#expense-amount')
  };
}

function submitExpense () {
  const inputs = getInputs()
  const form = document.querySelector('#new-expense-form')

  if (validate(getValidationRules(inputs))) {
    let id = null;
    if (form.getAttribute('update') === 'true') {
      id = Number(form.getAttribute('data-id'))
    }
    saveExpense(makeExpense(id, inputs.nameInput.value, inputs.typeInput.value, inputs.dateInput.value, inputs.amountInput.value));
  }
}

function getValidationRules (inputs) {
  return [
    { element: inputs.nameInput, check: inputs.nameInput.value !== '', error: 'Por favor preencha o nome da despesa!' },
    { element: inputs.dateInput, check: inputs.dateInput.value !== '', error: 'Por favor preencha a data que a despesa ocorreu!' },
    { element: inputs.dateInput, check: validateDate(inputs.dateInput.value), error: 'Por favor preencha com uma data valida e no passado!' },
    { element: inputs.typeInput, check: !isNaN(inputs.typeInput.value), error: 'Por favor selecione uma categoria!' },
    { element: inputs.amountInput, check: toInt(inputs.amountInput.value) > 0, error: 'A despesa deve ter o valor maior que 0!', nested: 2 }
  ];
}

function validateDate (date) {
  if (date !== '') {
    const inputDate = new Date(toDate(date, 'model') + ' 00:00:00')
    if (String(inputDate) === 'InvalidDate') {
      return false;
    }
    return inputDate <= new Date();
  }
  return true;
}

/*EXPENSE TYPES*/

function onTypesMounted () {
  constructTypes();
}

function constructTypes () {
  setExpensesTypes(getExpenseTypes());
}

function setExpensesTypes (types) {
  const template = document.querySelector('.expense-type.template');
  const list = document.querySelector('#type-page .list');
  if (template !== null && list !== null) {
    list.innerHTML = ''
    types.forEach(function (type) {
      const expenseElement = template.cloneNode(true)
      expenseElement.classList.remove('template');
      expenseElement.setAttribute('data-id', type.id)
      expenseElement.querySelector('.name').innerHTML = type.name
      expenseElement.querySelector('.limit').innerHTML = toReal(type.limit)
      expenseElement.querySelector('.icon').src = '/src/icons/expense-types/' + type.icon + '.svg'
      expenseElement.querySelector('.update').onclick = function () {
        openUpdateTypeLimitModal(type)
      }
      list.appendChild(expenseElement)
    })
  }
}

function openUpdateTypeLimitModal (type) {
  Swal.fire({
    title: 'Insira novo limite.',
    input: 'text',
    inputValue: toReal(type.limit),
    inputAttributes: {
      inputmode: 'numeric'
    },
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar',
    didOpen: function () {
      SimpleMaskMoney.setMask('.swal2-input');
    }
  }).then(function (result) {
    if (result.isConfirmed) {
      updateTypeLimit(type, toInt(result.value))
    }
  })
}

function updateTypeLimit(type, newLimit) {
  type.limit = newLimit
  updateModel(type, 'expense-types')
  successAlert('Limite editado com sucesso', function () {
    goTo('type')
  })
}


/*BACKEND*/

function calculateBudgets (expenses, types) {
  const budgets = []
  types.forEach(function (type) {
    const budget = createBudget(type, expenses.filter(function (expense) {
      return type.id === Number(expense.typeId)
    }))
    budgets.push(budget)
  })

  return budgets;
}

function createBudget(type, expenses) {
  const expended = expenses.reduce(function (value, expense) {
    return value + expense.amount
  }, 0)

  return {
    typeId: type.id,
    expenses: expenses,
    limit: type.limit,
    expended: expended,
    overflow: type.limit < expended,
    filledPercentage: (expended  * 100) / type.limit,
    chartId: type.chartId
  }
}

function exists (model) {
  return model.id !== 0 && model.id !== undefined && model.id !== null;
}

function getExpenses () {
  return getModels('expenses').reverse();
}

function getThreeBiggestExpenses (expenses = null) {
  let sortedExpenses = expenses === null ? getModels('expenses') : expenses
  sortedExpenses = sortedExpenses.sort(function (expenseA, expenseB) {
    return expenseA.amount > expenseB.amount ? -1 : 1
  })

  return sortedExpenses.slice(0, 3)
}

function saveExpense (expense) {
  if (exists(expense)) {
    updateModel(expense, 'expenses')
    successAlert('Despesa editada com sucesso', function () {
      goTo('expenses')
    })
    return;
  }

  insertModel(expense, 'expenses');
  successAlert('Despesa salva com sucesso!', function () {
    goTo('home')
  });
}

function makeExpense (id = null, name, typeId, date, amount) {
  amount = isNaN(amount) ? toInt(amount) : amount;
  date = date.match(/\d{4}-\d{2}-\d{2}/) ? date : toDate(date, 'model');
  return { id: id, name: name, typeId: typeId, date: date, amount: amount };
}

function getExpenseTypes (hash = false) {
  let expenseTypes = getModels('expense-types');
  if (expenseTypes.length < 1) {
    expenseTypes = getDefaultExpenseTypes();
  }
  if (hash) {
    const map = {}
    expenseTypes.forEach(function (type) {
      map[type.id] = type
    })
    return map;
  }

  return expenseTypes;
}

function getDefaultExpenseTypes () {
  const types = [
    { id: 1, name: 'Fixas', icon: 'food-fork-drink', limit: 60000, chartId: 'fixed' },
    { id: 2, name: 'Variáveis', icon: 'car', limit: 30000, chartId: 'variable' },
    { id: 3, name: 'Eventuais', icon: 'tag', limit: 40000, chartId: 'eve' }
  ];

  types.forEach(function (type) {
    insertModel(type, 'expense-types')
  })

  return types;
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

function insertModel (model, table) {
  const models = getModels(table);
  model.id = model.id !== undefined && model.id !== null ? model.id : generateId(JSON.stringify(model));
  models.push(model);
  localStorage.setItem(table, JSON.stringify(models));
}

function updateModel (model, table) {
  const models = getModels(table);
  const modelPos = models.findIndex(function (expense) {
    return expense.id === model.id
  })

  if (modelPos !== -1) {
    models[modelPos] = model
    localStorage.setItem(table, JSON.stringify(models));
  }
}

function deleteModel (id, table) {
  let models = getModels(table);
  models = models.filter(function (expense) {
    return expense.id !== id
  })

  localStorage.setItem(table, JSON.stringify(models));
}

function getModels (table) {
  return localStorage.getItem(table) === null ? [] : JSON.parse(localStorage.getItem(table));
}
